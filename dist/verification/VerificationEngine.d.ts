import { ConditionSpec } from '../capabilities/CapabilityContract.js';
export type VerificationStatus = 'VERIFIED' | 'PARTIALLY_VERIFIED' | 'FAILED' | 'NOT_VERIFIABLE' | 'UNKNOWN';
export interface VerificationMismatch {
    field: string;
    expected: any;
    actual: any;
    reason: string;
}
export interface VerificationEvidenceItem {
    target: string;
    field: string;
    expected: any;
    actual: any;
    matched: boolean;
    confidence: number;
    reason?: string;
    timestamp: number;
}
export interface VerificationReport {
    status: VerificationStatus;
    verified: boolean;
    confidence: number;
    evidence: VerificationEvidenceItem[];
    mismatches: VerificationMismatch[];
    durationMs: number;
    checkedConditionsCount: number;
    passedConditionsCount: number;
}
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
    expectedTags?: string[];
    expectedSourceContains?: string;
    timeoutMs?: number;
}
/**
 * Real VerificationEngine 2.0
 * Deep, evidence-based post-condition and pre-condition inspection of Studio state.
 * Never conflates command execution with verified state.
 */
export declare class VerificationEngine {
    /**
     * Verifies an array of formal ConditionSpecs against live Studio DataModel.
     */
    verifyConditions(conditions: ConditionSpec[], options?: {
        tolerance?: number;
    }): Promise<VerificationReport>;
    /**
     * Backward-compatible Precondition Spec Checker
     */
    checkPreconditions(spec: PreconditionSpec): Promise<VerificationReport>;
    /**
     * Backward-compatible Postcondition Spec Checker with retries for Studio replication.
     */
    verifyPostconditions(spec: PostconditionSpec, maxRetries?: number, delayMs?: number): Promise<VerificationReport>;
    /**
     * Wraps execution with pre-checks, execution, and real post-condition verification.
     */
    wrapWithVerification<T>(action: string, params: Record<string, any>, preSpec?: PreconditionSpec | ConditionSpec[], postSpec?: PostconditionSpec | ConditionSpec[]): Promise<{
        result: T | null;
        verification: VerificationReport;
    }>;
    private queryInstanceExistence;
    private queryInstanceMeta;
    private queryProperty;
    private queryAttribute;
    private queryHasTag;
    private queryScriptSource;
    private compareValues;
}
export declare const verificationEngine: VerificationEngine;
//# sourceMappingURL=VerificationEngine.d.ts.map