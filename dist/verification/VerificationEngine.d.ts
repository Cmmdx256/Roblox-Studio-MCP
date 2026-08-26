export interface PreconditionSpec {
    target: string;
    expectedClassName?: string;
    expectedParent?: string;
    expectedProperties?: Record<string, any>;
    expectedAttributes?: Record<string, any>;
    shouldExist?: boolean;
}
export interface PostconditionSpec {
    target: string;
    shouldExist?: boolean;
    expectedParent?: string;
    expectedProperties?: Record<string, any>;
    expectedAttributes?: Record<string, any>;
    timeoutMs?: number;
}
export interface VerificationMismatch {
    field: string;
    expected: any;
    actual: any;
    reason: string;
}
export interface VerificationReport {
    verified: boolean;
    status: 'VERIFIED' | 'FAILED_VERIFICATION';
    mismatches: VerificationMismatch[];
    durationMs: number;
}
/**
 * Server-side pre- and post-condition verification framework.
 */
export declare class VerificationEngine {
    private checkInstanceProperties;
    /**
     * Queries instance / properties / attributes via commandDispatcher.
     * Checks existence, className, parent, property values.
     */
    checkPreconditions(spec: PreconditionSpec): Promise<VerificationReport>;
    /**
     * Queries instance after mutation and validates properties.
     * If property doesn't match immediately, retries up to 3 times with 50ms delay.
     */
    verifyPostconditions(spec: PostconditionSpec): Promise<VerificationReport>;
    /**
     * Wraps an action execution with pre- and post-condition checks.
     */
    wrapWithVerification<T>(action: string, params: Record<string, any>, preSpec?: PreconditionSpec, postSpec?: PostconditionSpec): Promise<{
        result: T | null;
        verification: VerificationReport;
    }>;
}
export declare const verificationEngine: VerificationEngine;
//# sourceMappingURL=VerificationEngine.d.ts.map