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

export type BuildFinalStatus =
    | 'VERIFIED_COMMIT'
    | 'FAILED'
    | 'BLOCKED'
    | 'UNVERIFIED'
    | 'PENDING';

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

const GATE_DEFINITIONS: Omit<QualityGate, 'status' | 'details' | 'evidence' | 'checkedAt'>[] = [
    { gateId: 'G01', name: 'Plan Validity',          description: 'Change plan is structurally valid and all operations are well-formed.', required: true },
    { gateId: 'G02', name: 'Security',                description: 'No security vulnerabilities detected in generated scripts or assets.', required: true },
    { gateId: 'G03', name: 'Dependency Completeness', description: 'All required dependencies (RemoteEvents, Modules, Assets) are present.', required: true },
    { gateId: 'G04', name: 'Execution',               description: 'All planned operations were dispatched and received execution responses.', required: true },
    { gateId: 'G05', name: 'DataModel Verification',  description: 'Expected instances exist in the Studio DataModel (real observation).', required: true },
    { gateId: 'G06', name: 'Script Verification',     description: 'Generated scripts exist in Studio with expected source content.', required: true },
    { gateId: 'G07', name: 'Runtime Verification',    description: 'No script errors detected in Play mode output.', required: false },
    { gateId: 'G08', name: 'Gameplay Verification',   description: 'Core gameplay state transitions verified via GameplayStateObserver.', required: false },
    { gateId: 'G09', name: 'Visual Verification',     description: 'UI layout passes geometric QA across required device profiles.', required: false },
    { gateId: 'G10', name: 'Regression Verification', description: 'No regressions in previously passing tests.', required: true },
    { gateId: 'G11', name: 'Performance Sanity',      description: 'Instance and part counts within acceptable thresholds.', required: false },
    { gateId: 'G12', name: 'Final Acceptance',        description: 'All required acceptance criteria have passed status.', required: true },
];

export class BuildQualityGateEngine {
    /**
     * Calculate the final build status from gate results.
     * This is the ONLY way a build can become VERIFIED_COMMIT.
     */
    public evaluate(buildId: string, gateResults: Partial<Record<string, GateStatus>>, details: Partial<Record<string, string>> = {}): BuildQualityReport {
        const now = Date.now();

        const gates: QualityGate[] = GATE_DEFINITIONS.map(def => ({
            ...def,
            status: gateResults[def.gateId] ?? 'UNVERIFIED',
            details: details[def.gateId],
            checkedAt: now,
        }));

        let passed = 0;
        let failed = 0;
        let blocked = 0;
        let unverified = 0;
        let notRequired = 0;

        for (const gate of gates) {
            switch (gate.status) {
                case 'PASS':         passed++;      break;
                case 'FAIL':         failed++;      break;
                case 'BLOCKED':      blocked++;     break;
                case 'UNVERIFIED':   unverified++;  break;
                case 'NOT_REQUIRED': notRequired++; break;
            }
        }

        // Calculate final status — never manually assigned
        const requiredGates = gates.filter(g => g.required);
        const anyRequiredFailed  = requiredGates.some(g => g.status === 'FAIL');
        const anyRequiredBlocked = requiredGates.some(g => g.status === 'BLOCKED');
        const anyRequiredUnverified = requiredGates.some(g => g.status === 'UNVERIFIED');
        const allRequiredPassed  = requiredGates.every(g => g.status === 'PASS');

        let finalStatus: BuildFinalStatus;
        let summary: string;

        if (anyRequiredFailed) {
            finalStatus = 'FAILED';
            const failedNames = requiredGates.filter(g => g.status === 'FAIL').map(g => g.name).join(', ');
            summary = `Build FAILED: Required gate(s) failed — ${failedNames}.`;
        } else if (anyRequiredBlocked) {
            finalStatus = 'BLOCKED';
            const blockedNames = requiredGates.filter(g => g.status === 'BLOCKED').map(g => g.name).join(', ');
            summary = `Build BLOCKED: Required gate(s) could not be evaluated — ${blockedNames}. Roblox Studio may be offline.`;
        } else if (anyRequiredUnverified) {
            finalStatus = 'UNVERIFIED';
            const unverifiedNames = requiredGates.filter(g => g.status === 'UNVERIFIED').map(g => g.name).join(', ');
            summary = `Build UNVERIFIED: Required gate(s) not yet evaluated — ${unverifiedNames}.`;
        } else if (allRequiredPassed) {
            finalStatus = 'VERIFIED_COMMIT';
            summary = `Build VERIFIED_COMMIT: All ${requiredGates.length} required gates passed.`;
        } else {
            finalStatus = 'PENDING';
            summary = `Build PENDING: Not all gates have been evaluated.`;
        }

        return {
            buildId,
            evaluatedAt: now,
            gates,
            finalStatus,
            summary,
            passedGates: passed,
            failedGates: failed,
            blockedGates: blocked,
            unverifiedGates: unverified,
            notRequiredGates: notRequired,
        };
    }

    /**
     * Create initial gate report with all gates UNVERIFIED.
     */
    public createInitial(buildId: string): BuildQualityReport {
        return this.evaluate(buildId, {});
    }

    /**
     * Quick check: would this build qualify as VERIFIED_COMMIT?
     */
    public wouldVerify(gateResults: Partial<Record<string, GateStatus>>): boolean {
        const report = this.evaluate('check', gateResults);
        return report.finalStatus === 'VERIFIED_COMMIT';
    }

    public getGateDefinitions(): typeof GATE_DEFINITIONS {
        return GATE_DEFINITIONS;
    }
}

export const buildQualityGateEngine = new BuildQualityGateEngine();
