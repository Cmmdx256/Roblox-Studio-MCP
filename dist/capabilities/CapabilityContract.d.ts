import { ExecutionContext, RiskLevel, SecurityLevel, VerificationMethod, ProviderType } from '../providers/types.js';
export type CapabilityCategory = 'datamodel' | 'instances' | 'properties' | 'attributes' | 'scripts' | 'selection' | 'playtest' | 'output' | 'terrain' | 'modeling' | 'animation' | 'assets' | 'workflow' | 'diagnostics' | 'observation' | 'security' | 'system';
export type IdempotencyMode = 'SAFE' | 'REPEATABLE' | 'NON_IDEMPOTENT' | 'UNKNOWN';
export type ConditionType = 'EXISTENCE' | 'CLASS_NAME' | 'PARENT' | 'PROPERTY' | 'ATTRIBUTE' | 'TAG' | 'SCRIPT_PATTERN' | 'SCRIPT_EXACT' | 'SELECTION' | 'PLAYTEST_STATE' | 'OUTPUT_CLEAN' | 'CUSTOM';
export interface ConditionSpec {
    type: ConditionType;
    target: string;
    expected?: any;
    property?: string;
    attribute?: string;
    tag?: string;
    pattern?: string;
    tolerance?: number;
    description?: string;
    optional?: boolean;
}
export interface VerificationStrategy {
    method: VerificationMethod;
    postconditions: ConditionSpec[];
    retryCount?: number;
    delayBetweenRetriesMs?: number;
    tolerance?: number;
    expectedEvidenceTypes?: string[];
    customValidator?: (stateSnapshot: any) => boolean | Promise<boolean>;
}
export interface RollbackStrategy {
    supported: boolean;
    method: 'CHANGE_HISTORY' | 'INVERSE_OPERATION' | 'MANUAL_RESTORE' | 'NONE';
    inverseAction?: string;
    inverseParamsGenerator?: (params: Record<string, any>, preState: any) => Record<string, any>;
    customRollback?: (context: any) => Promise<boolean>;
}
export interface RetryPolicy {
    maxRetries: number;
    initialBackoffMs: number;
    backoffMultiplier: number;
    retryableErrorPatterns?: string[];
}
export interface ProviderCandidate {
    providerName: string;
    providerType: ProviderType | string;
    priority: number;
    requiredHealth?: 'ONLINE' | 'DEGRADED';
    supportsVerification: boolean;
}
/**
 * CapabilityContract - Core specification contract that formalizes
 * preconditions, postconditions, verification, idempotency, risk, and rollback.
 */
export interface CapabilityContract {
    name: string;
    description: string;
    category: CapabilityCategory;
    risk: RiskLevel;
    security: SecurityLevel;
    context: ExecutionContext[];
    providers: ProviderCandidate[];
    fallbackChain?: string[];
    preconditions: ConditionSpec[];
    postconditions: ConditionSpec[];
    verification: VerificationStrategy;
    rollback?: RollbackStrategy;
    idempotency: IdempotencyMode;
    timeoutMs: number;
    retryPolicy?: RetryPolicy;
    dependencies?: string[];
    aliases?: string[];
    inputSchema?: any;
    outputSchema?: any;
    isPrimitiveTool?: boolean;
    isCompositeWorkflow?: boolean;
}
/**
 * Helper to build a standard contract with sensible defaults.
 */
export declare function defineCapabilityContract(contract: Partial<CapabilityContract> & {
    name: string;
    description: string;
    category: CapabilityCategory;
}): CapabilityContract;
//# sourceMappingURL=CapabilityContract.d.ts.map