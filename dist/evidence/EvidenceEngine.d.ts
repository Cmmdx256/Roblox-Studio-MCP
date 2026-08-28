/**
 * EvidenceEngine.ts  (P4 — Phase 5)
 *
 * Every constructive or destructive operation must produce an EvidenceRecord.
 * Internal assertions are NEVER accepted as evidence.
 *
 * Bad:  { uiCreated: true }
 * Good: { type: DATAMODEL_OBSERVATION, target: "StarterGui.HUD", result: { descendants: 18, ... } }
 */
export type EvidenceType = 'DATAMODEL_OBSERVATION' | 'SCRIPT_SOURCE_OBSERVATION' | 'PROPERTY_OBSERVATION' | 'OUTPUT_OBSERVATION' | 'PLAYTEST_OBSERVATION' | 'SCREENSHOT_OBSERVATION' | 'INSTANCE_COUNT_OBSERVATION' | 'ERROR_OBSERVATION' | 'DIFF_OBSERVATION';
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
export interface BlockedEvidenceRecord extends EvidenceRecord {
    evidenceType: 'DATAMODEL_OBSERVATION';
    isRealStudioEvidence: false;
    blockedReason: string;
    confidence: 'NONE';
}
export declare class EvidenceEngine {
    private records;
    private maxRecords;
    /**
     * Record real Studio observation evidence.
     */
    recordObservation(params: {
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
    }): EvidenceRecord;
    /**
     * Record a BLOCKED evidence record — Studio not available.
     * Truthfully marks isRealStudioEvidence = false.
     */
    recordBlocked(params: {
        operationId: string;
        targetPath: string;
        action: string;
        reason: string;
    }): BlockedEvidenceRecord;
    /**
     * Validate that a record is real Studio evidence before using it for VERIFIED status.
     * RULE 0: Never accept internal assertions.
     */
    isValidForVerification(record: EvidenceRecord): boolean;
    getRecordsForOperation(operationId: string): EvidenceRecord[];
    getRecentRecords(limit?: number): EvidenceRecord[];
    getSummary(): {
        total: number;
        realStudio: number;
        blocked: number;
        byType: Record<string, number>;
    };
    clear(): void;
    private push;
}
export declare const evidenceEngine: EvidenceEngine;
//# sourceMappingURL=EvidenceEngine.d.ts.map