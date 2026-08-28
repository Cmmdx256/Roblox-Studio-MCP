/**
 * StudioSessionManager.ts
 *
 * Maintains real Studio session state with strict granularity.
 *
 * Distinguishes ALL 9 states explicitly:
 *   Studio Installed -> Studio Running -> Plugin Loaded -> Plugin Connected ->
 *   Bridge Connected -> DataModel Accessible -> Playtest Available ->
 *   Playtest Running -> Playtest Evidence Available
 *
 * RULE 0: Never conflate "bridge connected" with "Studio executing the operation".
 */
import { v4 as uuidv4 } from 'uuid';
import { commandDispatcher } from '../dispatcher/commandDispatcher.js';
import { eventBus } from '../events/EventBus.js';
// StudioSessionManager
export class StudioSessionManager {
    session;
    constructor() {
        this.session = this.createFreshSession();
    }
    createFreshSession() {
        return {
            sessionId: uuidv4(),
            studioProcessState: 'UNKNOWN',
            pluginConnected: false,
            bridgeConnected: false,
            officialMCPConnected: false,
            dataModelAvailable: false,
            playtestAvailable: false,
            playtestRunning: false,
            playtestEvidenceAvailable: false,
            capabilities: {
                canReadDataModel: false,
                canWriteDataModel: false,
                canExecuteLuau: false,
                canRunPlaytest: false,
                canCaptureScreenshot: false,
                canInjectInput: false,
                officialMCPAvailable: false,
                pluginHttpAvailable: false,
            },
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
    }
    /**
     * Probe real Studio and bridge status.
     * Never fabricates success.
     */
    async probe() {
        const now = Date.now();
        // 1. Check bridge connectivity
        try {
            const sessionInfo = await commandDispatcher.refreshSessionInfo();
            if (sessionInfo) {
                this.session.bridgeConnected = true;
                this.session.studioProcessState = 'RUNNING_NO_PLUGIN';
                this.session.studioPlaceId = String(sessionInfo.placeId ?? '');
                this.session.universeId = String(sessionInfo.universeId ?? '');
                this.session.placeId = String(sessionInfo.placeId ?? '');
            }
        }
        catch {
            this.session.bridgeConnected = false;
            this.session.studioProcessState = 'NOT_RUNNING';
        }
        // 2. Check plugin connectivity via cheap DataModel read
        if (this.session.bridgeConnected) {
            try {
                const result = await commandDispatcher.executeCommand('property_get', {
                    target: 'Workspace',
                    property: 'Name'
                });
                if (result) {
                    this.session.pluginConnected = true;
                    this.session.dataModelAvailable = true;
                    this.session.studioProcessState = 'READY';
                    this.session.lastHeartbeat = Date.now();
                    this.session.capabilities.canReadDataModel = true;
                    this.session.capabilities.canWriteDataModel = true;
                    this.session.capabilities.canExecuteLuau = true;
                    this.session.capabilities.pluginHttpAvailable = true;
                }
            }
            catch {
                this.session.pluginConnected = false;
                this.session.dataModelAvailable = false;
            }
        }
        // 3. Detect playtest availability
        if (this.session.dataModelAvailable) {
            try {
                const result = await commandDispatcher.executeCommand('execute_luau', {
                    code: 'return game:GetService("RunService"):IsRunning()'
                });
                if (result?.result !== undefined) {
                    this.session.playtestAvailable = true;
                    this.session.playtestRunning = result.result === true;
                    this.session.capabilities.canRunPlaytest = true;
                }
            }
            catch {
                this.session.playtestAvailable = false;
            }
        }
        this.session.updatedAt = now;
        return { ...this.session };
    }
    updateFromHeartbeat(payload) {
        this.session.lastHeartbeat = Date.now();
        this.session.pluginConnected = true;
        this.session.bridgeConnected = true;
        // A poll proves that the authenticated plugin is alive. It does not
        // prove that the DataModel can be read or that a playtest is usable.
        // Those stronger flags are set only by their corresponding command
        // read-backs in probe().
        this.session.studioProcessState = 'RUNNING_PLUGIN_LOADING';
        if (payload.placeId)
            this.session.studioPlaceId = payload.placeId;
        if (payload.universeId)
            this.session.universeId = payload.universeId;
        if (payload.treeHash)
            this.session.lastObservedTreeHash = payload.treeHash;
        if (payload.selection)
            this.session.lastObservedSelection = payload.selection;
        if (payload.errors)
            this.session.lastObservedErrors = payload.errors;
        if (payload.screenshotAvailable) {
            this.session.capabilities.canCaptureScreenshot = payload.screenshotAvailable;
        }
        this.session.capabilities.pluginHttpAvailable = true;
        this.session.updatedAt = Date.now();
        eventBus.emit('ObservationCaptured', { sessionId: this.session.sessionId }, 'StudioSessionManager');
    }
    markPlaytestRunning(running) {
        this.session.playtestRunning = running;
        this.session.playtestAvailable = true;
        if (running)
            this.session.capabilities.canRunPlaytest = true;
        this.session.updatedAt = Date.now();
    }
    markPlaytestEvidenceAvailable() {
        this.session.playtestEvidenceAvailable = true;
        this.session.updatedAt = Date.now();
    }
    getAvailabilityLevel() {
        const s = this.session;
        if (!s.bridgeConnected && !s.pluginConnected)
            return 'NONE';
        if (s.bridgeConnected && !s.dataModelAvailable)
            return 'BRIDGE_ONLY';
        if (s.dataModelAvailable && !s.playtestAvailable)
            return 'STUDIO_DATAMODEL';
        if (s.playtestAvailable && !s.playtestRunning)
            return 'STUDIO_PLAYTEST';
        if (s.playtestRunning && s.playtestEvidenceAvailable)
            return 'STUDIO_FULL';
        return 'STUDIO_DATAMODEL';
    }
    isStudioConnected() {
        return this.session.dataModelAvailable && this.session.bridgeConnected;
    }
    isAlive() {
        if (!this.session.lastHeartbeat)
            return false;
        return (Date.now() - this.session.lastHeartbeat) < 30_000;
    }
    getSession() {
        return { ...this.session };
    }
    reset() {
        this.session = this.createFreshSession();
    }
}
export const studioSessionManager = new StudioSessionManager();
//# sourceMappingURL=StudioSessionManager.js.map