/**
 * StudioAvailabilityGuard.ts
 *
 * 7-step prerequisite chain before any Studio operation.
 * Returns BLOCKED_BY_PLATFORM + specific reason at each failed step.
 *
 * RULE 0: If any prerequisite fails, the BLOCKED status must propagate
 * through ExecutionPipeline -> EvidenceEngine -> AcceptanceCriteriaEngine
 * -> BuildHistory -> ProjectMemory.
 */
import { SessionAvailabilityLevel } from './StudioSessionManager.js';
export interface GuardResult {
    allowed: boolean;
    status: 'ALLOWED' | 'BLOCKED_BY_PLATFORM';
    failedStep?: number;
    reason?: string;
    availabilityLevel: SessionAvailabilityLevel;
    requiredLevel: SessionAvailabilityLevel;
    sessionId?: string;
}
export type RequiredCapability = 'READ_DATAMODEL' | 'WRITE_DATAMODEL' | 'EXECUTE_LUAU' | 'RUN_PLAYTEST' | 'CAPTURE_SCREENSHOT' | 'INJECT_INPUT';
export declare class StudioAvailabilityGuard {
    /**
     * Run all 7 prerequisite checks for a given capability.
     * Returns BLOCKED_BY_PLATFORM with specific reason at first failure.
     */
    check(capability: RequiredCapability, operationDescription?: string): Promise<GuardResult>;
    private hasCapability;
    private getCapabilityHint;
    /**
     * Convenience — check and throw a structured error if blocked.
     */
    require(capability: RequiredCapability, operationDescription?: string): Promise<void>;
}
export declare class StudioBlockedError extends Error {
    readonly guardResult: GuardResult;
    constructor(result: GuardResult);
}
export declare const studioAvailabilityGuard: StudioAvailabilityGuard;
//# sourceMappingURL=StudioAvailabilityGuard.d.ts.map