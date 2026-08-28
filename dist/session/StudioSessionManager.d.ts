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
export type StudioProcessState = 'UNKNOWN' | 'NOT_RUNNING' | 'STARTING' | 'RUNNING_NO_PLUGIN' | 'RUNNING_PLUGIN_LOADING' | 'READY';
export interface StudioCapabilities {
    canReadDataModel: boolean;
    canWriteDataModel: boolean;
    canExecuteLuau: boolean;
    canRunPlaytest: boolean;
    canCaptureScreenshot: boolean;
    canInjectInput: boolean;
    officialMCPAvailable: boolean;
    pluginHttpAvailable: boolean;
}
export interface StudioSession {
    sessionId: string;
    studioProcessState: StudioProcessState;
    /** Plugin has sent at least one heartbeat */
    pluginConnected: boolean;
    /** HTTP bridge is accepting requests */
    bridgeConnected: boolean;
    /** Official Roblox Studio MCP endpoint available */
    officialMCPConnected: boolean;
    /** DataModel can be queried */
    dataModelAvailable: boolean;
    /** A playtest can be started */
    playtestAvailable: boolean;
    /** Play mode is actively running */
    playtestRunning: boolean;
    /** Real playtest evidence has been collected this session */
    playtestEvidenceAvailable: boolean;
    studioPlaceId?: string;
    universeId?: string;
    placeId?: string;
    lastHeartbeat?: number;
    lastObservedTreeHash?: string;
    lastObservedSelection?: string[];
    lastObservedErrors?: string[];
    capabilities: StudioCapabilities;
    createdAt: number;
    updatedAt: number;
}
export type SessionAvailabilityLevel = 'NONE' | 'BRIDGE_ONLY' | 'STUDIO_NO_DATAMODEL' | 'STUDIO_DATAMODEL' | 'STUDIO_PLAYTEST' | 'STUDIO_FULL';
export declare class StudioSessionManager {
    private session;
    constructor();
    private createFreshSession;
    /**
     * Probe real Studio and bridge status.
     * Never fabricates success.
     */
    probe(): Promise<StudioSession>;
    updateFromHeartbeat(payload: {
        placeId?: string;
        universeId?: string;
        treeHash?: string;
        selection?: string[];
        errors?: string[];
        screenshotAvailable?: boolean;
    }): void;
    markPlaytestRunning(running: boolean): void;
    markPlaytestEvidenceAvailable(): void;
    getAvailabilityLevel(): SessionAvailabilityLevel;
    isStudioConnected(): boolean;
    isAlive(): boolean;
    getSession(): Readonly<StudioSession>;
    reset(): void;
}
export declare const studioSessionManager: StudioSessionManager;
//# sourceMappingURL=StudioSessionManager.d.ts.map