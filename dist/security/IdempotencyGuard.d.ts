import { IdempotencyMode } from '../capabilities/CapabilityContract.js';
export interface IdempotencyCheckResult {
    isAlreadySatisfied: boolean;
    mode: IdempotencyMode;
    existingInstancePath?: string;
    actionAdvice: 'EXECUTE' | 'REUSE_EXISTING' | 'SAFE_UPDATE' | 'SKIP';
    reason: string;
}
/**
 * IdempotencyGuard
 * Guarantees that repeating an operation in an autonomous loop does not duplicate entities
 * or corrupt script sources.
 */
export declare class IdempotencyGuard {
    /**
     * Checks whether an action (like instance creation or script patching) is already satisfied in DataModel.
     */
    evaluateAction(action: string, params: Record<string, any>): Promise<IdempotencyCheckResult>;
}
export declare const idempotencyGuard: IdempotencyGuard;
//# sourceMappingURL=IdempotencyGuard.d.ts.map