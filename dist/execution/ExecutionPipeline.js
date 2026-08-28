import { v4 as uuidv4 } from 'uuid';
import { capabilityRouter } from '../capabilities/CapabilityRouter.js';
import { verificationEngine } from '../verification/VerificationEngine.js';
import { idempotencyGuard } from '../security/IdempotencyGuard.js';
import { securityEngine } from '../engines/SecurityEngine.js';
import { recoveryEngine } from '../engines/RecoveryEngine.js';
import { studioAvailabilityGuard } from '../session/StudioAvailabilityGuard.js';
import { evidenceEngine } from '../evidence/EvidenceEngine.js';
const TERMINAL_NEGATIVE_STATES = new Set([
    'FAILED', 'BLOCKED', 'UNVERIFIED', 'ROLLED_BACK'
]);
const VALID_TRANSITIONS = {
    PLANNED: ['QUEUED', 'FAILED', 'BLOCKED'],
    QUEUED: ['EXECUTING', 'FAILED', 'BLOCKED'],
    EXECUTING: ['EXECUTED', 'FAILED', 'BLOCKED'],
    EXECUTED: ['OBSERVED', 'UNVERIFIED', 'FAILED'],
    OBSERVED: ['VERIFIED', 'UNVERIFIED', 'FAILED'],
    VERIFIED: ['COMMITTED', 'FAILED'],
    COMMITTED: [],
    FAILED: ['ROLLED_BACK'],
    BLOCKED: ['ROLLED_BACK'],
    UNVERIFIED: ['ROLLED_BACK'],
    ROLLED_BACK: [],
};
/**
 * Validate and enforce state transition rules.
 * Throws on RULE 0 violations (BLOCKED/FAILED/UNVERIFIED → VERIFIED).
 */
export function assertValidTransition(from, to, context = '') {
    if (TERMINAL_NEGATIVE_STATES.has(from) && to === 'VERIFIED') {
        throw new Error(`[RULE 0 VIOLATION] Illegal state transition: ${from} → VERIFIED. ` +
            `A ${from} operation cannot become VERIFIED without new real evidence. ${context}`);
    }
    const allowed = VALID_TRANSITIONS[from];
    if (!allowed.includes(to)) {
        throw new Error(`[ExecutionPipeline] Invalid transition: ${from} → ${to}. ` +
            `Allowed from ${from}: [${allowed.join(', ')}]. ${context}`);
    }
}
/**
 * Verifiable Execution Pipeline
 * Bridges AI intent with guaranteed, evidence-backed Studio mutation.
 *
 * Sequence:
 * 1. Security Policy & Risk Evaluation
 * 2. Idempotency Evaluation
 * 3. Precondition Verification
 * 4. Provider Routing & Execution
 * 5. Postcondition Verification (5 States)
 * 6. Autonomous Recovery (if failed)
 * 7. Structured Audit Telemetry
 */
export class ExecutionPipeline {
    executionHistory = [];
    async execute(action, params, options = {}) {
        const operationId = uuidv4();
        const startedAt = Date.now();
        // 1. Security Policy & Risk Classification
        const policy = securityEngine.evaluatePolicy(action, params);
        if (!policy.allowed) {
            const blockedReport = {
                status: 'FAILED',
                verified: false,
                confidence: 0,
                evidence: [],
                mismatches: [{ field: 'security_policy', expected: 'allowed', actual: 'blocked', reason: policy.reason || 'Blocked by security policy.' }],
                durationMs: Date.now() - startedAt,
                checkedConditionsCount: 1,
                passedConditionsCount: 0
            };
            const record = {
                operationId,
                action,
                params,
                riskLevel: policy.riskLevel,
                idempotencyStatus: 'NOT_EVALUATED',
                startedAt,
                completedAt: Date.now(),
                durationMs: Date.now() - startedAt,
                executed: false,
                verified: false,
                state: 'BLOCKED',
                verificationReport: blockedReport,
                result: {
                    status: 'ERROR',
                    success: false,
                    message: policy.reason,
                    errors: [policy.reason || 'Security policy violation']
                }
            };
            this.executionHistory.push(record);
            return record;
        }
        // 2. Dry run is planning only.  It must never claim live execution or verification.
        if (options.dryRun) {
            const dryRunReport = {
                status: 'NOT_VERIFIABLE',
                verified: false,
                confidence: 0,
                evidence: [{ target: action, field: 'dry_run', expected: 'live Studio observation', actual: 'not executed', matched: false, confidence: 0, timestamp: Date.now(), reason: 'Dry run is not Studio evidence.' }],
                mismatches: [],
                durationMs: Date.now() - startedAt,
                checkedConditionsCount: 1,
                passedConditionsCount: 1
            };
            const record = {
                operationId,
                action,
                params,
                riskLevel: policy.riskLevel,
                idempotencyStatus: 'DRY_RUN',
                startedAt,
                completedAt: Date.now(),
                durationMs: Date.now() - startedAt,
                executed: false,
                verified: false,
                state: 'PLANNED',
                verificationReport: dryRunReport,
                result: {
                    status: 'PARTIAL',
                    success: false,
                    code: 'UNVERIFIED',
                    message: `[Dry Run] Action '${action}' was planned only; no Studio mutation or verification occurred.`,
                    data: { dryRun: true, policy }
                }
            };
            this.executionHistory.push(record);
            return record;
        }
        // 3. Idempotency Check.  A local/inferred match is useful for safety, but never evidence.
        const idempotency = await idempotencyGuard.evaluateAction(action, params);
        if (idempotency.isAlreadySatisfied && (idempotency.actionAdvice === 'SKIP' || idempotency.actionAdvice === 'REUSE_EXISTING')) {
            const skippedReport = {
                status: 'NOT_VERIFIABLE',
                verified: false,
                confidence: 0,
                evidence: [{ target: idempotency.existingInstancePath || action, field: 'idempotency', expected: 'live observation', actual: 'inferred duplicate', matched: false, confidence: 0, timestamp: Date.now(), reason: 'Idempotency inference is not live Studio evidence.' }],
                mismatches: [],
                durationMs: Date.now() - startedAt,
                checkedConditionsCount: 1,
                passedConditionsCount: 1
            };
            const record = {
                operationId,
                action,
                params,
                riskLevel: policy.riskLevel,
                idempotencyStatus: idempotency.actionAdvice,
                startedAt,
                completedAt: Date.now(),
                durationMs: Date.now() - startedAt,
                executed: false,
                verified: false,
                state: 'UNVERIFIED',
                verificationReport: skippedReport,
                result: {
                    status: 'PARTIAL',
                    success: false,
                    code: 'UNVERIFIED',
                    message: `${idempotency.reason} Live read-back is required before this can be verified.`,
                    data: { reusedInstance: idempotency.existingInstancePath, idempotent: true }
                }
            };
            this.executionHistory.push(record);
            return record;
        }
        // 4. Studio Availability Guard.  Every routed capability touches Studio and must
        // pass the real session/handshake/DataModel prerequisite chain before dispatch.
        const requiredCapability = this.requiredCapabilityFor(action);
        const guard = await studioAvailabilityGuard.check(requiredCapability, action);
        if (!guard.allowed) {
            const verificationReport = {
                status: 'NOT_VERIFIABLE', verified: false, confidence: 0, evidence: [],
                mismatches: [{ field: 'studio_availability', expected: requiredCapability, actual: guard.availabilityLevel, reason: guard.reason || 'BLOCKED_BY_PLATFORM' }],
                durationMs: Date.now() - startedAt, checkedConditionsCount: 1, passedConditionsCount: 0,
            };
            evidenceEngine.recordBlocked({ operationId, targetPath: String(params.path ?? params.parent ?? action), action, reason: guard.reason || 'BLOCKED_BY_PLATFORM' });
            const record = {
                operationId, action, params, riskLevel: policy.riskLevel, idempotencyStatus: 'NOT_EXECUTED',
                startedAt, completedAt: Date.now(), durationMs: Date.now() - startedAt,
                executed: false, verified: false, state: 'BLOCKED', verificationReport,
                result: { status: 'PARTIAL', success: false, code: 'BLOCKED_BY_PLATFORM', message: guard.reason, errors: [guard.reason || 'BLOCKED_BY_PLATFORM'] },
            };
            this.executionHistory.push(record);
            return record;
        }
        // 5. Precondition Verification
        if (options.preconditions && options.preconditions.length > 0) {
            const preReport = await verificationEngine.verifyConditions(options.preconditions);
            if (!preReport.verified) {
                const record = {
                    operationId,
                    action,
                    params,
                    riskLevel: policy.riskLevel,
                    idempotencyStatus: 'MUTATION_REQUIRED',
                    startedAt,
                    completedAt: Date.now(),
                    durationMs: Date.now() - startedAt,
                    executed: false,
                    verified: false,
                    state: 'FAILED',
                    verificationReport: preReport,
                    result: {
                        status: 'FAILED_VERIFICATION',
                        success: false,
                        message: `Precondition failed: ${preReport.mismatches.map(m => m.reason).join(', ')}`,
                        errors: preReport.mismatches.map(m => m.reason)
                    }
                };
                this.executionHistory.push(record);
                return record;
            }
        }
        // 6. Provider Routing & Execution
        let execResult;
        try {
            execResult = await capabilityRouter.route(action, params);
        }
        catch (err) {
            execResult = {
                status: 'ERROR',
                success: false,
                message: err.message || String(err),
                errors: [err.message || String(err)]
            };
        }
        // 7. Postcondition Verification
        let verificationReport;
        if (options.postconditions && options.postconditions.length > 0) {
            verificationReport = await verificationEngine.verifyConditions(options.postconditions);
        }
        else {
            // A transport/provider acknowledgement establishes only EXECUTED.  It is not
            // evidence that Studio produced the requested state.
            const isSuccess = execResult.status === 'SUCCESS' || execResult.success === true;
            verificationReport = {
                status: isSuccess ? 'NOT_VERIFIABLE' : 'FAILED',
                verified: false,
                confidence: 0,
                evidence: [{ target: action, field: 'execution_result', expected: 'independent Studio read-back', actual: execResult.status || 'ERROR', matched: false, confidence: 0, timestamp: Date.now(), reason: 'Execution acknowledgement is not verification evidence.' }],
                mismatches: isSuccess ? [{ field: 'read_back', expected: 'real Studio observation', actual: 'not requested', reason: 'Postconditions are required for verification.' }] : [{ field: 'execution', expected: 'SUCCESS', actual: execResult.status, reason: execResult.message || 'Execution error' }],
                durationMs: Date.now() - startedAt,
                checkedConditionsCount: 1,
                passedConditionsCount: isSuccess ? 1 : 0
            };
        }
        // 8. Autonomous Recovery on Failure (if enabled). A repair result remains
        // UNVERIFIED until the original postconditions are observed in Studio.
        let recoveryAttempted = false;
        let recoveryResult = undefined;
        if (!verificationReport.verified && options.autoRecover !== false) {
            const errorMsg = execResult.message || verificationReport.mismatches.map(m => m.reason).join('; ');
            recoveryAttempted = true;
            recoveryResult = await recoveryEngine.attemptRecovery(errorMsg, options.sourceContext);
            if (recoveryResult.success && options.postconditions?.length) {
                verificationReport = await verificationEngine.verifyConditions(options.postconditions);
                execResult.message = `Recovery attempted: ${recoveryResult.rootCause}. ${verificationReport.verified ? 'Live conditions rechecked.' : 'Live conditions remain unverified.'}`;
            }
        }
        const completedAt = Date.now();
        const durationMs = completedAt - startedAt;
        const record = {
            operationId,
            action,
            params,
            riskLevel: policy.riskLevel,
            idempotencyStatus: 'EXECUTED',
            startedAt,
            completedAt,
            durationMs,
            executed: true,
            verified: verificationReport.verified,
            state: verificationReport.verified ? 'VERIFIED' : (execResult.success || execResult.status === 'SUCCESS' ? 'UNVERIFIED' : 'FAILED'),
            verificationReport,
            recoveryAttempted,
            recoveryResult,
            result: execResult
        };
        this.executionHistory.push(record);
        if (this.executionHistory.length > 100)
            this.executionHistory.shift();
        return record;
    }
    getRecentExecutions(limit = 20) {
        return this.executionHistory.slice(-limit);
    }
    requiredCapabilityFor(action) {
        const lower = action.toLowerCase();
        if (lower.includes('playtest'))
            return 'RUN_PLAYTEST';
        if (lower.includes('screenshot') || lower.includes('screen_capture'))
            return 'CAPTURE_SCREENSHOT';
        if (lower.includes('input') || lower.includes('keyboard') || lower.includes('mouse'))
            return 'INJECT_INPUT';
        if (lower.endsWith('_get') || lower.includes('inspect') || lower.includes('search') || lower.includes('output'))
            return 'READ_DATAMODEL';
        return 'WRITE_DATAMODEL';
    }
}
export const executionPipeline = new ExecutionPipeline();
//# sourceMappingURL=ExecutionPipeline.js.map