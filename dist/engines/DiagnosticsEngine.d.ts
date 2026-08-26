import { ExecutionResult } from '../providers/types.js';
export interface RobloxDiagnosticReport {
    category: 'PROPERTY_RESTRICTION' | 'NIL_INDEXING' | 'SECURITY_RESTRICTION' | 'HTTP_RESTRICTION' | 'RIG_JOINT_MISMATCH' | 'TYPE_MISMATCH' | 'GENERAL_RUNTIME_ERROR';
    summary: string;
    rootCause: string;
    actionableAdvice: string;
    suggestedFix?: string;
    affectedPropertyOrMethod?: string;
}
/**
 * DiagnosticsEngine handles root-cause error analysis and safe repair synthesis for Roblox Studio.
 */
export declare class DiagnosticsEngine {
    /**
     * Analyzes raw Roblox runtime / engine errors and produces actionable diagnostic guidance.
     */
    analyzeRobloxError(errorMessage: string, sourceCode?: string): RobloxDiagnosticReport;
    /**
     * Collects all relevant diagnostics from the environment.
     */
    collectDiagnostics(): Promise<{
        logs: any[];
        errors: any[];
        affectedScripts: string[];
        recentChanges: any[];
    }>;
    /**
     * Analyzes an error log to determine the root cause and propose a patch.
     */
    analyzeRootCause(errorLog: {
        message: string;
        traceback?: string;
    }): Promise<{
        rootCause: string;
        confidence: number;
        offendingScript?: string;
        line?: number;
        proposedPatch?: {
            search: string;
            replacement: string;
        };
    }>;
    /**
     * Synthesizes and applies a safe repair.
     */
    safeRepair(patchSpec: {
        scriptPath: string;
        search: string;
        replacement: string;
        dryRun?: boolean;
    }): Promise<ExecutionResult>;
}
export declare const diagnosticsEngine: DiagnosticsEngine;
//# sourceMappingURL=DiagnosticsEngine.d.ts.map