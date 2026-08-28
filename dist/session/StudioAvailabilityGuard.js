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
import { studioSessionManager } from './StudioSessionManager.js';
const CAPABILITY_REQUIREMENT_LEVELS = {
    READ_DATAMODEL: 'STUDIO_DATAMODEL',
    WRITE_DATAMODEL: 'STUDIO_DATAMODEL',
    EXECUTE_LUAU: 'STUDIO_DATAMODEL',
    RUN_PLAYTEST: 'STUDIO_PLAYTEST',
    CAPTURE_SCREENSHOT: 'STUDIO_DATAMODEL',
    INJECT_INPUT: 'STUDIO_FULL',
};
const LEVEL_ORDER = {
    NONE: 0,
    BRIDGE_ONLY: 1,
    STUDIO_NO_DATAMODEL: 2,
    STUDIO_DATAMODEL: 3,
    STUDIO_PLAYTEST: 4,
    STUDIO_FULL: 5,
};
export class StudioAvailabilityGuard {
    /**
     * Run all 7 prerequisite checks for a given capability.
     * Returns BLOCKED_BY_PLATFORM with specific reason at first failure.
     */
    async check(capability, operationDescription = 'Studio operation') {
        const session = studioSessionManager.getSession();
        const currentLevel = studioSessionManager.getAvailabilityLevel();
        const requiredLevel = CAPABILITY_REQUIREMENT_LEVELS[capability];
        // STEP 1 — Bridge health
        if (!session.bridgeConnected) {
            return {
                allowed: false,
                status: 'BLOCKED_BY_PLATFORM',
                failedStep: 1,
                reason: `[STEP 1 FAILED] HTTP bridge is not connected. Ensure roblox-studio-mcp bridge is running. Operation: "${operationDescription}"`,
                availabilityLevel: currentLevel,
                requiredLevel,
                sessionId: session.sessionId
            };
        }
        // STEP 2 — Active Studio session
        if (session.studioProcessState === 'NOT_RUNNING' || session.studioProcessState === 'UNKNOWN') {
            return {
                allowed: false,
                status: 'BLOCKED_BY_PLATFORM',
                failedStep: 2,
                reason: `[STEP 2 FAILED] Roblox Studio process is not running (state: ${session.studioProcessState}). Open Studio with the target place.`,
                availabilityLevel: currentLevel,
                requiredLevel,
                sessionId: session.sessionId
            };
        }
        // STEP 3 — Plugin handshake
        if (!session.pluginConnected) {
            return {
                allowed: false,
                status: 'BLOCKED_BY_PLATFORM',
                failedStep: 3,
                reason: `[STEP 3 FAILED] Studio plugin is not connected (no heartbeat received). Ensure the Roblox Universal MCP plugin is installed and enabled in Studio.`,
                availabilityLevel: currentLevel,
                requiredLevel,
                sessionId: session.sessionId
            };
        }
        // STEP 4 — Session identity (heartbeat freshness)
        if (!studioSessionManager.isAlive()) {
            return {
                allowed: false,
                status: 'BLOCKED_BY_PLATFORM',
                failedStep: 4,
                reason: `[STEP 4 FAILED] Studio session heartbeat is stale (last heartbeat > 30s ago). Studio may have crashed or disconnected.`,
                availabilityLevel: currentLevel,
                requiredLevel,
                sessionId: session.sessionId
            };
        }
        // STEP 5 — DataModel accessibility (for operations that need it)
        if (LEVEL_ORDER[requiredLevel] >= LEVEL_ORDER['STUDIO_DATAMODEL'] && !session.dataModelAvailable) {
            return {
                allowed: false,
                status: 'BLOCKED_BY_PLATFORM',
                failedStep: 5,
                reason: `[STEP 5 FAILED] DataModel is not accessible. Studio may be in an error state or the place has not fully loaded.`,
                availabilityLevel: currentLevel,
                requiredLevel,
                sessionId: session.sessionId
            };
        }
        // STEP 6 — Target place/project (placeId check for write operations)
        if (capability === 'WRITE_DATAMODEL' && !session.studioPlaceId) {
            return {
                allowed: false,
                status: 'BLOCKED_BY_PLATFORM',
                failedStep: 6,
                reason: `[STEP 6 FAILED] No target place identified. Open a Roblox place in Studio before writing to the DataModel.`,
                availabilityLevel: currentLevel,
                requiredLevel,
                sessionId: session.sessionId
            };
        }
        // STEP 7 — Required capability
        if (!this.hasCapability(session, capability)) {
            return {
                allowed: false,
                status: 'BLOCKED_BY_PLATFORM',
                failedStep: 7,
                reason: `[STEP 7 FAILED] Required capability "${capability}" is not available in the current Studio session. ${this.getCapabilityHint(capability)}`,
                availabilityLevel: currentLevel,
                requiredLevel,
                sessionId: session.sessionId
            };
        }
        return {
            allowed: true,
            status: 'ALLOWED',
            availabilityLevel: currentLevel,
            requiredLevel,
            sessionId: session.sessionId
        };
    }
    hasCapability(session, capability) {
        switch (capability) {
            case 'READ_DATAMODEL': return session.capabilities.canReadDataModel;
            case 'WRITE_DATAMODEL': return session.capabilities.canWriteDataModel;
            case 'EXECUTE_LUAU': return session.capabilities.canExecuteLuau;
            case 'RUN_PLAYTEST': return session.capabilities.canRunPlaytest;
            case 'CAPTURE_SCREENSHOT': return session.capabilities.canCaptureScreenshot;
            case 'INJECT_INPUT': return session.capabilities.canInjectInput;
            default: return false;
        }
    }
    getCapabilityHint(capability) {
        switch (capability) {
            case 'INJECT_INPUT':
                return 'Input injection is BLOCKED_BY_PLATFORM — Roblox does not expose a public API for programmatic input injection in production environments.';
            case 'CAPTURE_SCREENSHOT':
                return 'Screenshot capture requires the Official Roblox MCP or a plugin-level screen capture API. Neither is confirmed available.';
            case 'RUN_PLAYTEST':
                return 'Playtest requires an active Play mode session. Start Play mode in Studio first.';
            default:
                return 'Ensure Studio is running with the plugin connected.';
        }
    }
    /**
     * Convenience — check and throw a structured error if blocked.
     */
    async require(capability, operationDescription) {
        const result = await this.check(capability, operationDescription);
        if (!result.allowed) {
            throw new StudioBlockedError(result);
        }
    }
}
export class StudioBlockedError extends Error {
    guardResult;
    constructor(result) {
        super(result.reason ?? 'BLOCKED_BY_PLATFORM');
        this.name = 'StudioBlockedError';
        this.guardResult = result;
    }
}
export const studioAvailabilityGuard = new StudioAvailabilityGuard();
//# sourceMappingURL=StudioAvailabilityGuard.js.map