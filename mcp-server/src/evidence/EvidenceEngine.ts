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

// Evidence Types
export type EvidenceType =
    | 'DATAMODEL_OBSERVATION'
    | 'SCRIPT_SOURCE_OBSERVATION'
    | 'PROPERTY_OBSERVATION'
    | 'OUTPUT_OBSERVATION'
    | 'PLAYTEST_OBSERVATION'
    | 'SCREENSHOT_OBSERVATION'
    | 'INSTANCE_COUNT_OBSERVATION'
    | 'ERROR_OBSERVATION'
    | 'DIFF_OBSERVATION';

export type EvidenceConfidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

export interface VerificationCheck {
    description: string;
    passed: boolean;
    actual?: any;
    expected?: any;
}

export interface EvidenceRecord {
    evidenceId: string;
    operationId: string;
    timestamp: number;
    studioSessionId: string;
    targetPath: string;
    action: string;
    beforeState?: any;
    afterState?: any;
    sourceHash?: string;
    resultingStateHash?: string;
    outputMessages?: string[];
    errors?: string[];
    observations?: Record<string, any>;
    verificationChecks?: VerificationCheck[];
    evidenceType: EvidenceType;
    confidence: EvidenceConfidence;
    /** False = this is NOT real Studio evidence. Only an internal engine assertion. */
    isRealStudioEvidence: boolean;
    blockedReason?: string;
}

// Blocked placeholder evidence (honest reporting of BLOCKED state)
export interface BlockedEvidenceRecord extends EvidenceRecord {
    evidenceType: 'DATAMODEL_OBSERVATION';
    isRealStudioEvidence: false;
    blockedReason: string;
    confidence: 'NONE';
}

export class EvidenceEngine {
    private records: EvidenceRecord[] = [];
    private maxRecords = 2000;

    /**
     * Record real Studio observation evidence.
     */
    public recordObservation(params: {
        operationId: string;
        targetPath: string;
        action: string;
        evidenceType: EvidenceType;
        observations?: Record<string, any>;
        beforeState?: any;
        afterState?: any;
        outputMessages?: string[];
        errors?: string[];
        verificationChecks?: VerificationCheck[];
        confidence?: EvidenceConfidence;
    }): EvidenceRecord {
        const session = studioSessionManager.getSession();
        // The observation must come from a fresh, connected session and contain an
        // actual observation payload.  A caller cannot turn an in-memory assertion
        // into evidence just by calling this method.
        const hasObservation = Boolean(
            (params.observations && Object.keys(params.observations).length > 0) ||
            params.beforeState !== undefined ||
            params.afterState !== undefined ||
            (params.outputMessages && params.outputMessages.length > 0) ||
            (params.errors && params.errors.length > 0)
        );
        const sessionAlive = session.lastHeartbeat !== undefined && (Date.now() - session.lastHeartbeat) < 30_000;
        const record: EvidenceRecord = {
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
    public recordBlocked(params: {
        operationId: string;
        targetPath: string;
        action: string;
        reason: string;
    }): BlockedEvidenceRecord {
        const session = studioSessionManager.getSession();
        const record: BlockedEvidenceRecord = {
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
    public isValidForVerification(record: EvidenceRecord): boolean {
        return (
            record.isRealStudioEvidence === true &&
            record.confidence !== 'NONE' &&
            !record.blockedReason &&
            Boolean(
                (record.observations && Object.keys(record.observations).length > 0) ||
                record.beforeState !== undefined ||
                record.afterState !== undefined ||
                (record.outputMessages && record.outputMessages.length > 0) ||
                (record.errors && record.errors.length > 0)
            )
        );
    }

    public getRecordsForOperation(operationId: string): EvidenceRecord[] {
        return this.records.filter(r => r.operationId === operationId);
    }

    public getRecentRecords(limit = 50): EvidenceRecord[] {
        return this.records.slice(-limit);
    }

    public getSummary(): {
        total: number;
        realStudio: number;
        blocked: number;
        byType: Record<string, number>;
    } {
        const byType: Record<string, number> = {};
        let realStudio = 0;
        let blocked = 0;
        for (const r of this.records) {
            byType[r.evidenceType] = (byType[r.evidenceType] ?? 0) + 1;
            if (r.isRealStudioEvidence) realStudio++;
            if (r.blockedReason) blocked++;
        }
        return { total: this.records.length, realStudio, blocked, byType };
    }

    public clear(): void {
        this.records = [];
    }

    private push(record: EvidenceRecord): void {
        this.records.push(record);
        if (this.records.length > this.maxRecords) {
            this.records.shift();
        }
    }
}

export const evidenceEngine = new EvidenceEngine();
