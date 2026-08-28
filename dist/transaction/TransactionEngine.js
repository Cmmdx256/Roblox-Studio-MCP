import { v4 as uuidv4 } from 'uuid';
import { commandDispatcher } from '../dispatcher/commandDispatcher.js';
import { verificationEngine } from '../verification/VerificationEngine.js';
export class TransactionEngine {
    transactions = new Map();
    /**
     * Begins a new transaction and registers an undo waypoint/recording in Studio.
     */
    async beginTransaction(name, description) {
        const id = uuidv4();
        let recordingId;
        try {
            const res = await commandDispatcher.executeCommand('transaction_begin', { name });
            recordingId = res?.recordingId || res;
        }
        catch {
            // Non-fatal if plugin bridge handles it via ChangeHistoryService fallback
        }
        const tx = {
            id,
            name,
            description,
            state: 'RUNNING',
            recordingId,
            steps: [],
            createdAt: Date.now(),
            manifest: { operationList: [], rollbackActions: [], affectedInstances: [], affectedScripts: [], verificationStatus: commandDispatcher.isStudioConnected() ? 'UNVERIFIED' : 'BLOCKED' }
        };
        this.transactions.set(id, tx);
        console.error(`[TransactionEngine] Started transaction ${id}: "${name}"`);
        return tx;
    }
    /**
     * Executes a step within a transaction with optional verification and inverse action recording.
     */
    async executeStep(transactionId, action, params, options = {}) {
        const tx = this.transactions.get(transactionId);
        if (!tx) {
            return { success: false, result: null, error: `Transaction ${transactionId} not found` };
        }
        if (tx.state !== 'RUNNING') {
            return { success: false, result: null, error: `Transaction ${transactionId} is in invalid state: ${tx.state}` };
        }
        const stepId = `step_${tx.steps.length + 1}`;
        const step = {
            stepId,
            action,
            params,
            inverseAction: options.inverseAction,
            inverseParams: options.inverseParams,
            status: 'PENDING',
            timestamp: Date.now()
        };
        tx.steps.push(step);
        tx.manifest.operationList.push(action);
        if (options.inverseAction)
            tx.manifest.rollbackActions.push(options.inverseAction);
        const target = String(params.path ?? params.parent ?? '');
        if (target) {
            if (action.includes('script'))
                tx.manifest.affectedScripts.push(target);
            else
                tx.manifest.affectedInstances.push(target);
        }
        if (!commandDispatcher.isStudioConnected()) {
            step.status = 'FAILED';
            tx.state = 'FAILED';
            tx.error = 'BLOCKED_BY_PLATFORM: A transaction step requires a live Roblox Studio session.';
            tx.manifest.verificationStatus = 'BLOCKED';
            return { success: false, result: null, error: tx.error };
        }
        // Precondition check
        if (options.preconditions && options.preconditions.length > 0) {
            const preReport = await verificationEngine.verifyConditions(options.preconditions);
            if (!preReport.verified) {
                step.status = 'FAILED';
                step.verification = preReport;
                tx.state = 'FAILED';
                tx.error = `Precondition failed for step ${stepId}: ${preReport.mismatches.map(m => m.reason).join(', ')}`;
                return { success: false, result: null, verification: preReport, error: tx.error };
            }
        }
        // Action Execution
        try {
            const result = await commandDispatcher.executeCommand(action, params);
            step.result = result;
            step.status = 'EXECUTED';
            // Postcondition Verification
            if (options.postconditions && options.postconditions.length > 0) {
                const postReport = await verificationEngine.verifyConditions(options.postconditions);
                step.verification = postReport;
                if (!postReport.verified) {
                    step.status = 'FAILED';
                    tx.state = 'FAILED';
                    tx.error = `Postcondition verification failed for step ${stepId}`;
                    return { success: false, result, verification: postReport, error: tx.error };
                }
                step.status = 'VERIFIED';
            }
            return { success: true, result, verification: step.verification };
        }
        catch (err) {
            step.status = 'FAILED';
            tx.state = 'FAILED';
            tx.error = err.message || String(err);
            return { success: false, result: null, error: tx.error };
        }
    }
    /**
     * Commits the transaction and locks in the Studio ChangeHistoryService recording.
     */
    async commitTransaction(transactionId) {
        const tx = this.transactions.get(transactionId);
        if (!tx)
            throw new Error(`Transaction ${transactionId} not found`);
        if (!commandDispatcher.isStudioConnected()) {
            tx.state = 'FAILED';
            tx.error = 'BLOCKED_BY_PLATFORM: Transaction commit requires a live Roblox Studio session.';
            tx.manifest.verificationStatus = 'BLOCKED';
            return { success: false, transaction: tx };
        }
        tx.state = 'VERIFYING';
        if (commandDispatcher.isStudioConnected()) {
            try {
                await commandDispatcher.executeCommand('transaction_commit', {
                    name: tx.name,
                    recordingId: tx.recordingId
                });
            }
            catch (err) {
                tx.state = 'FAILED';
                tx.error = `Commit failed: ${err.message || err}`;
                return { success: false, transaction: tx };
            }
        }
        tx.state = 'COMMITTED';
        tx.completedAt = Date.now();
        tx.manifest.verificationStatus = tx.steps.every(s => s.status === 'VERIFIED') ? 'VERIFIED' : 'UNVERIFIED';
        console.error(`[TransactionEngine] Committed transaction ${transactionId}`);
        return { success: true, transaction: tx };
    }
    /**
     * Rolls back all executed steps in reverse order or cancels ChangeHistory recording.
     */
    async rollbackTransaction(transactionId, reason) {
        const tx = this.transactions.get(transactionId);
        if (!tx)
            throw new Error(`Transaction ${transactionId} not found`);
        tx.state = 'ROLLING_BACK';
        let rolledBackCount = 0;
        let anyFailed = false;
        // 1. Try Studio native ChangeHistoryService cancellation if connected
        if (commandDispatcher.isStudioConnected()) {
            try {
                await commandDispatcher.executeCommand('transaction_cancel', {
                    recordingId: tx.recordingId
                });
                tx.state = 'ROLLED_BACK';
                tx.completedAt = Date.now();
                return { success: true, rolledBackStepsCount: tx.steps.length };
            }
            catch { }
        }
        // 2. Fallback: Execute inverse steps in reverse order
        const executedSteps = [...tx.steps].filter(s => s.status === 'EXECUTED' || s.status === 'VERIFIED').reverse();
        for (const step of executedSteps) {
            if (step.inverseAction && step.inverseParams && commandDispatcher.isStudioConnected()) {
                try {
                    await commandDispatcher.executeCommand(step.inverseAction, step.inverseParams);
                    step.status = 'ROLLED_BACK';
                    rolledBackCount++;
                }
                catch {
                    anyFailed = true;
                }
            }
        }
        tx.state = anyFailed ? 'PARTIALLY_ROLLED_BACK' : 'ROLLED_BACK';
        tx.completedAt = Date.now();
        tx.error = reason || tx.error;
        console.error(`[TransactionEngine] Rollback finished for ${transactionId} with state ${tx.state}`);
        return {
            success: !anyFailed,
            rolledBackStepsCount: rolledBackCount
        };
    }
    getTransaction(id) {
        return this.transactions.get(id);
    }
}
export const transactionEngine = new TransactionEngine();
//# sourceMappingURL=TransactionEngine.js.map