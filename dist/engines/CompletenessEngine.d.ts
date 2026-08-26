/**
 * CompletenessEngine performs requirement tracking, feature validation, and final acceptance verification.
 * Strictly prevents false success reporting if required elements are missing.
 */
export declare class CompletenessEngine {
    /**
     * Audits the current project state against requested features.
     */
    auditCompleteness(requestedFeatures: string[], projectState?: any): Promise<{
        completenessScore: number;
        covered: string[];
        missing: string[];
        details: any;
    }>;
    /**
     * Runs final multi-layer validation checks before publishing.
     */
    runFinalValidation(): Promise<{
        architectureValid: boolean;
        scriptsValid: boolean;
        visualValid: boolean;
        playtestPassed: boolean;
        readyForPublish: boolean;
        completionReport: string;
    }>;
}
export declare const completenessEngine: CompletenessEngine;
//# sourceMappingURL=CompletenessEngine.d.ts.map