import { ProviderState } from './types.js';
export type UnifiedHealthState = 'ONLINE' | 'DEGRADED' | 'OFFLINE' | 'UNKNOWN';
export interface ProviderHealthRecord {
    providerName: string;
    health: UnifiedHealthState;
    state: ProviderState;
    latencyMs: number;
    capabilitiesCount: number;
    message?: string;
    lastChecked: number;
}
export interface SystemHealthOverview {
    overallHealth: UnifiedHealthState;
    studioConnected: boolean;
    activeSessionId?: string;
    providers: Record<string, ProviderHealthRecord>;
    totalCapabilities: number;
    timestamp: number;
}
/**
 * HealthMonitor
 * Unified health model monitoring the MCP server, HTTP bridge, Roblox plugin,
 * Official MCP, and specialized providers.
 */
export declare class HealthMonitor {
    private cache;
    private lastSystemCheck;
    /**
     * Actively checks health of all registered providers and Studio bridge.
     */
    checkAllProviders(): Promise<SystemHealthOverview>;
    getCachedHealth(providerName: string): ProviderHealthRecord | undefined;
}
export declare const healthMonitor: HealthMonitor;
//# sourceMappingURL=HealthMonitor.d.ts.map