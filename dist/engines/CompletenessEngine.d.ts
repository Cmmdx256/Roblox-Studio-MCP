export interface CompletenessAuditResult {
    completenessScore: number;
    covered: string[];
    missing: string[];
    details: {
        totalRequirements: number;
        verifiedCount: number;
        missingCount: number;
        isComplete: boolean;
        evaluatedSystems: string[];
    };
}
export interface FinalValidationResult {
    architectureValid: boolean;
    scriptsValid: boolean;
    visualValid: boolean | 'UNAVAILABLE';
    playtestPassed: boolean;
    readyForPublish: boolean;
    completionReport: string;
    details: {
        studioConnected: boolean;
        recentErrorsCount: number;
        registeredSystemsCount: number;
    };
}
/**
 * CompletenessEngine performs requirement tracking, feature validation, and final acceptance verification.
 * Strictly prevents false success reporting if required elements are missing.
 */
export declare class CompletenessEngine {
    /**
     * Audits the current project state against requested features using the Knowledge Graph and Studio state.
     */
    auditCompleteness(requestedFeatures: string[], projectState?: any): Promise<CompletenessAuditResult>;
    /**
     * Runs final multi-layer validation checks before publishing.
     * Respects actual state and avoids fake positive results.
     */
    runFinalValidation(): Promise<FinalValidationResult>;
}
export declare const completenessEngine: CompletenessEngine;
//# sourceMappingURL=CompletenessEngine.d.ts.map