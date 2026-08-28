import { VerificationReport } from '../verification/VerificationEngine.js';
export type ErrorClassification = 'PROPERTY_RESTRICTION' | 'NIL_INDEXING' | 'SECURITY_RESTRICTION' | 'HTTP_RESTRICTION' | 'SYNTAX_ERROR' | 'TIMEOUT' | 'STUDIO_DISCONNECTED' | 'UNKNOWN';
export interface RecoveryOption {
    id: string;
    strategy: 'PATCH_SOURCE' | 'REPARENT_INSTANCE' | 'CREATE_FALLBACK_INSTANCE' | 'ROUTE_OFFICIAL_MCP' | 'RETRY_WITH_BACKOFF';
    description: string;
    targetScript?: string;
    patchSearch?: string;
    patchReplacement?: string;
    action?: string;
    params?: Record<string, any>;
    confidence: number;
}
export interface AutonomousRecoveryResult {
    error: string;
    classification: ErrorClassification;
    diagnosisType: 'AUTONOMOUS_RECOVERY' | 'RULE_BASED_DIAGNOSTIC';
    rootCause: string;
    appliedStrategy?: string;
    success: boolean;
    verification: VerificationReport;
    remainingErrors: string[];
}
/**
 * RecoveryEngine
 * Real autonomous recovery and self-healing engine.
 * Synthesizes repairs, executes them against Studio, and re-verifies state.
 */
export declare class RecoveryEngine {
    /**
     * Analyzes an error and attempts autonomous self-healing recovery.
     */
    attemptRecovery(errorStr: string, sourceContext?: {
        scriptPath?: string;
        sourceCode?: string;
    }): Promise<AutonomousRecoveryResult>;
    private classifyError;
    private determineRootCause;
    private generateRecoveryOptions;
    private notVerifiableReport;
}
export declare const recoveryEngine: RecoveryEngine;
//# sourceMappingURL=RecoveryEngine.d.ts.map