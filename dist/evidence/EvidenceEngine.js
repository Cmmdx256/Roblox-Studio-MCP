/**
 * EvidenceEngine.ts  (P4 — Phase 5)
 *
 * Every constructive or destructive operation must produce an EvidenceRecord.
 * Internal assertions are NEVER accepted as evidence.
 *
 * Bad:  { uiCreated: true }
 * Good: { type: DATAMODEL_OBSERVATION, target: "StarterGui.HUD", result: { descendants: 18, ... } }
 */
import { v4 as uuidv4 } from 'uuid';
import { studioSessionManager } from '../session/StudioSessionManager.js';
export class EvidenceEngine {
    records = [];
    maxRecords = 2000;
    /**
     * Record real Studio observation evidence.
     */
    recordObservation(params) {
        const session = studioSessionManager.getSession();
        // The observation must come from a fresh, connected session and contain an
        // actual observation payload.  A caller cannot turn an in-memory assertion
        // into evidence just by calling this method.
        const hasObservation = Boolean((params.observations && Object.keys(params.observations).length > 0) ||
            params.beforeState !== undefined ||
            params.afterState !== undefined ||
            (params.outputMessages && params.outputMessages.length > 0) ||
            (params.errors && params.errors.length > 0));
        const sessionAlive = session.lastHeartbeat !== undefined && (Date.now() - session.lastHeartbeat) < 30_000;
        const record = {
            evidenceId: uuidv4(),
            operationId: params.operationId,
            timestamp: Date.now(),
            studioSessionId: session.sessionId,
            targetPath: params.targetPath,
            action: params.action,
            evidenceType: params.evidenceType,
            observations: params.observations,
            beforeState: params.beforeState,
            afterState: params.afterState,
            outputMessages: params.outputMessages,
            errors: params.errors,
            verificationChecks: params.verificationChecks,
            confidence: params.confidence ?? (sessionAlive ? 'HIGH' : 'NONE'),
            isRealStudioEvidence: sessionAlive && session.dataModelAvailable && session.pluginConnected && hasObservation,
        };
        this.push(record);
        return record;
    }
    /**
     * Record a BLOCKED evidence record — Studio not available.
     * Truthfully marks isRealStudioEvidence = false.
     */
    recordBlocked(params) {
        const session = studioSessionManager.getSession();
        const record = {
            evidenceId: uuidv4(),
            operationId: params.operationId,
            timestamp: Date.now(),
            studioSessionId: session.sessionId,
            targetPath: params.targetPath,
            action: params.action,
            evidenceType: 'DATAMODEL_OBSERVATION',
            confidence: 'NONE',
            isRealStudioEvidence: false,
            blockedReason: params.reason,
        };
        this.push(record);
        return record;
    }
    /**
     * Validate that a record is real Studio evidence before using it for VERIFIED status.
     * RULE 0: Never accept internal assertions.
     */
    isValidForVerification(record) {
        return (record.isRealStudioEvidence === true &&
            record.confidence !== 'NONE' &&
            !record.blockedReason &&
            Boolean((record.observations && Object.keys(record.observations).length > 0) ||
                record.beforeState !== undefined ||
                record.afterState !== undefined ||
                (record.outputMessages && record.outputMessages.length > 0) ||
                (record.errors && record.errors.length > 0)));
    }
    getRecordsForOperation(operationId) {
        return this.records.filter(r => r.operationId === operationId);
    }
    getRecentRecords(limit = 50) {
        return this.records.slice(-limit);
    }
    getSummary() {
        const byType = {};
        let realStudio = 0;
        let blocked = 0;
        for (const r of this.records) {
            byType[r.evidenceType] = (byType[r.evidenceType] ?? 0) + 1;
            if (r.isRealStudioEvidence)
                realStudio++;
            if (r.blockedReason)
                blocked++;
        }
        return { total: this.records.length, realStudio, blocked, byType };
    }
    clear() {
        this.records = [];
    }
    push(record) {
        this.records.push(record);
        if (this.records.length > this.maxRecords) {
            this.records.shift();
        }
    }
}
export const evidenceEngine = new EvidenceEngine();
//# sourceMappingURL=EvidenceEngine.js.map