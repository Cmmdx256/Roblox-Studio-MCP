import { StructuredIntent } from './IntentEngine.js';
export interface AcceptanceCriterion {
    id: string;
    requirementId: string;
    description: string;
    verificationType: 'STATIC_ANALYSIS' | 'DATAMODEL_INSPECTION' | 'RUNTIME_ASSERTION' | 'SECURITY_CHECK';
    targetPath?: string;
    expectedCondition: string;
    status: 'PENDING' | 'PASSED' | 'FAILED' | 'BLOCKED' | 'UNAVAILABLE';
    evidence?: string;
}
export interface AcceptanceSuite {
    intentSummary: string;
    criteria: AcceptanceCriterion[];
    passedCount: number;
    failedCount: number;
    blockedCount: number;
    allPassed: boolean;
}
export interface ExecutionEvidenceItem {
    target?: string;
    operationId?: string;
    success: boolean;
    verified?: boolean;
    data?: any;
    errors?: string[];
    sourceCode?: string;
}
export declare class AcceptanceCriteriaEngine {
    /**
     * Generates machine-checkable acceptance criteria from structured intent requirements.
     * Generalizes to any game requirement, domain, or subsystem.
     */
    generateCriteria(intent: StructuredIntent): AcceptanceSuite;
    /**
     * Evaluates acceptance criteria strictly against real verification evidence.
     * Never falsely reports success when evidence is missing or failed.
     */
    evaluateSuite(suite: AcceptanceSuite, executedEvidence: ExecutionEvidenceItem[]): AcceptanceSuite;
}
export declare const acceptanceCriteriaEngine: AcceptanceCriteriaEngine;
//# sourceMappingURL=AcceptanceCriteriaEngine.d.ts.map