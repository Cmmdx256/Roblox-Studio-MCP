import { VerificationReport } from '../verification/VerificationEngine.js';
import { ConditionSpec } from '../capabilities/CapabilityContract.js';
import { ExecutionResult, RiskLevel } from '../providers/types.js';
/**
 * Formal Execution State Model (P4 — Phase 1)
 *
 * Legal forward transitions:
 *   PLANNED → QUEUED → EXECUTING → EXECUTED → OBSERVED → VERIFIED → COMMITTED
 *   Any state → FAILED | BLOCKED | UNVERIFIED | ROLLED_BACK
 *
 * RULE 0 — ILLEGAL transitions:
 *   FAILED     → VERIFIED
 *   BLOCKED    → VERIFIED
 *   UNVERIFIED → VERIFIED
 */
export type ExecutionState = 'PLANNED' | 'QUEUED' | 'EXECUTING' | 'EXECUTED' | 'OBSERVED' | 'VERIFIED' | 'COMMITTED' | 'FAILED' | 'BLOCKED' | 'UNVERIFIED' | 'ROLLED_BACK';
/**
 * Validate and enforce state transition rules.
 * Throws on RULE 0 violations (BLOCKED/FAILED/UNVERIFIED → VERIFIED).
 */
export declare function assertValidTransition(from: ExecutionState, to: ExecutionState, context?: string): void;
export interface PipelineExecutionOptions {
    preconditions?: ConditionSpec[];
    postconditions?: ConditionSpec[];
    autoRecover?: boolean;
    dryRun?: boolean;
    sourceContext?: {
        scriptPath?: string;
        sourceCode?: string;
    };
}
export interface PipelineExecutionRecord {
    operationId: string;
    action: string;
    params: Record<string, any>;
    riskLevel: RiskLevel;
    idempotencyStatus: string;
    startedAt: number;
    completedAt: number;
    durationMs: number;
    executed: boolean;
    verified: boolean;
    /** Formal reality state.  A successful transport response is EXECUTED, never VERIFIED by itself. */
    state: ExecutionState;
    verificationReport: VerificationReport;
    recoveryAttempted?: boolean;
    recoveryResult?: any;
    result: ExecutionResult;
}
/**
 * Verifiable Execution Pipeline
 * Bridges AI intent with guaranteed, evidence-backed Studio mutation.
 *
 * Sequence:
 * 1. Security Policy & Risk Evaluation
 * 2. Idempotency Evaluation
 * 3. Precondition Verification
 * 4. Provider Routing & Execution
 * 5. Postcondition Verification (5 States)
 * 6. Autonomous Recovery (if failed)
 * 7. Structured Audit Telemetry
 */
export declare class ExecutionPipeline {
    private executionHistory;
    execute(action: string, params: Record<string, any>, options?: PipelineExecutionOptions): Promise<PipelineExecutionRecord>;
    getRecentExecutions(limit?: number): PipelineExecutionRecord[];
    private requiredCapabilityFor;
}
export declare const executionPipeline: ExecutionPipeline;
//# sourceMappingURL=ExecutionPipeline.d.ts.map