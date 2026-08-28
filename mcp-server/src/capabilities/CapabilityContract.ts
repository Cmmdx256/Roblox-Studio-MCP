import {
    ExecutionContext,
    RiskLevel,
    SecurityLevel,
    VerificationMethod,
    ProviderType
} from '../providers/types.js';

export type CapabilityCategory =
    | 'datamodel'
    | 'instances'
    | 'properties'
    | 'attributes'
    | 'scripts'
    | 'selection'
    | 'playtest'
    | 'output'
    | 'terrain'
    | 'modeling'
    | 'animation'
    | 'assets'
    | 'workflow'
    | 'diagnostics'
    | 'observation'
    | 'security'
    | 'system';

export type IdempotencyMode = 'SAFE' | 'REPEATABLE' | 'NON_IDEMPOTENT' | 'UNKNOWN';

export type ConditionType =
    | 'EXISTENCE'
    | 'CLASS_NAME'
    | 'PARENT'
    | 'PROPERTY'
    | 'ATTRIBUTE'
    | 'TAG'
    | 'SCRIPT_PATTERN'
    | 'SCRIPT_EXACT'
    | 'SELECTION'
    | 'PLAYTEST_STATE'
    | 'OUTPUT_CLEAN'
    | 'CUSTOM';

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
    priority: number; // 1 = Highest
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
    
    // Providers & Execution
    providers: ProviderCandidate[];
    fallbackChain?: string[];
    
    // Lifecycle Conditions & Verification
    preconditions: ConditionSpec[];
    postconditions: ConditionSpec[];
    verification: VerificationStrategy;
    rollback?: RollbackStrategy;
    
    // Operational Policies
    idempotency: IdempotencyMode;
    timeoutMs: number;
    retryPolicy?: RetryPolicy;
    dependencies?: string[];
    aliases?: string[];
    
    // Schema
    inputSchema?: any;
    outputSchema?: any;
    
    // Meta
    isPrimitiveTool?: boolean;
    isCompositeWorkflow?: boolean;
}

/**
 * Helper to build a standard contract with sensible defaults.
 */
export function defineCapabilityContract(contract: Partial<CapabilityContract> & { name: string; description: string; category: CapabilityCategory }): CapabilityContract {
    return {
        name: contract.name,
        description: contract.description,
        category: contract.category,
        risk: contract.risk ?? RiskLevel.LOW,
        security: contract.security ?? SecurityLevel.SAFE,
        context: contract.context ?? [ExecutionContext.STUDIO, ExecutionContext.EDIT],
        providers: contract.providers ?? [],
        fallbackChain: contract.fallbackChain ?? [],
        preconditions: contract.preconditions ?? [],
        postconditions: contract.postconditions ?? [],
        verification: contract.verification ?? {
            method: VerificationMethod.READ_BACK,
            postconditions: contract.postconditions ?? []
        },
        rollback: contract.rollback ?? {
            supported: true,
            method: 'CHANGE_HISTORY'
        },
        idempotency: contract.idempotency ?? 'REPEATABLE',
        timeoutMs: contract.timeoutMs ?? 10000,
        retryPolicy: contract.retryPolicy ?? {
            maxRetries: 2,
            initialBackoffMs: 100,
            backoffMultiplier: 2
        },
        dependencies: contract.dependencies ?? [],
        aliases: contract.aliases ?? [],
        inputSchema: contract.inputSchema,
        outputSchema: contract.outputSchema,
        isPrimitiveTool: contract.isPrimitiveTool ?? true,
        isCompositeWorkflow: contract.isCompositeWorkflow ?? false
    };
}
