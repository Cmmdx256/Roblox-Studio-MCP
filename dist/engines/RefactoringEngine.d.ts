export interface RefactoringOpportunity {
    type: 'GIANT_SCRIPT' | 'DEPRECATED_CALLS' | 'DUPLICATE_REMOTES' | 'CLIENT_AUTHORITATIVE_RISK';
    scriptPath: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    proposedRefactor: {
        strategy: string;
        targetModulesToExtract: string[];
        patchDiff?: {
            search: string;
            replacement: string;
        };
    };
}
export interface RefactoringPlan {
    scriptPath: string;
    opportunities: RefactoringOpportunity[];
    recommendedNewModules: Array<{
        name: string;
        parent: string;
        purpose: string;
    }>;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}
export declare class RefactoringEngine {
    /**
     * Analyzes script source code for modularization and refactoring opportunities.
     */
    analyzeScriptForRefactoring(scriptPath: string, source: string): RefactoringPlan;
}
export declare const refactoringEngine: RefactoringEngine;
//# sourceMappingURL=RefactoringEngine.d.ts.map