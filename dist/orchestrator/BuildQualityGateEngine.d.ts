/**
 * BuildQualityGateEngine.ts  (P4 — Phase 18)
 *
 * 12 formal build quality gates.
 * Final build status is CALCULATED from gate results — never manually assigned.
 *
 * RULE 0: A build may only become VERIFIED_COMMIT when ALL required gates PASS.
 * BLOCKED or FAILED gates prevent VERIFIED_COMMIT unconditionally.
 */
export type GateStatus = 'PASS' | 'FAIL' | 'BLOCKED' | 'NOT_REQUIRED' | 'UNVERIFIED';
export interface QualityGate {
    gateId: string;
    name: string;
    description: string;
    required: boolean;
    status: GateStatus;
    details?: string;
    evidence?: string[];
    checkedAt?: number;
}
export type BuildFinalStatus = 'VERIFIED_COMMIT' | 'FAILED' | 'BLOCKED' | 'UNVERIFIED' | 'PENDING';
export interface BuildQualityReport {
    buildId: string;
    evaluatedAt: number;
    gates: QualityGate[];
    finalStatus: BuildFinalStatus;
    summary: string;
    passedGates: number;
    failedGates: number;
    blockedGates: number;
    unverifiedGates: number;
    notRequiredGates: number;
}
declare const GATE_DEFINITIONS: Omit<QualityGate, 'status' | 'details' | 'evidence' | 'checkedAt'>[];
export declare class BuildQualityGateEngine {
    /**
     * Calculate the final build status from gate results.
     * This is the ONLY way a build can become VERIFIED_COMMIT.
     */
    evaluate(buildId: string, gateResults: Partial<Record<string, GateStatus>>, details?: Partial<Record<string, string>>): BuildQualityReport;
    /**
     * Create initial gate report with all gates UNVERIFIED.
     */
    createInitial(buildId: string): BuildQualityReport;
    /**
     * Quick check: would this build qualify as VERIFIED_COMMIT?
     */
    wouldVerify(gateResults: Partial<Record<string, GateStatus>>): boolean;
    getGateDefinitions(): typeof GATE_DEFINITIONS;
}
export declare const buildQualityGateEngine: BuildQualityGateEngine;
export {};
//# sourceMappingURL=BuildQualityGateEngine.d.ts.map