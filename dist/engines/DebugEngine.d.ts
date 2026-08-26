export interface RootCauseDiagnosis {
    errorId: string;
    errorMessage: string;
    affectedScript?: string;
    lineGuess?: number;
    rootCause: string;
    confidence: number;
    proposedFix: {
        scriptPath: string;
        targetLine: string;
        replacementCode: string;
    };
}
export declare class DebugEngine {
    /**
     * Correlates recent console outputs, runtime errors, and script changes to discover root cause.
     */
    diagnoseRuntimeIssues(): Promise<RootCauseDiagnosis[]>;
}
export declare const debugEngine: DebugEngine;
//# sourceMappingURL=DebugEngine.d.ts.map