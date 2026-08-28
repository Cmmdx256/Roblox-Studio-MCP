import { ExecutionContext, RiskLevel, SecurityLevel, VerificationMethod } from '../providers/types.js';
/**
 * Helper to build a standard contract with sensible defaults.
 */
export function defineCapabilityContract(contract) {
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
//# sourceMappingURL=CapabilityContract.js.map