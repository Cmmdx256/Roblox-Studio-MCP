import { providerRegistry } from './ProviderRegistry.js';
import { commandDispatcher } from '../dispatcher/commandDispatcher.js';
import { ProviderState, HealthStatus } from './types.js';

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
export class HealthMonitor {
    private cache: Map<string, ProviderHealthRecord> = new Map();
    private lastSystemCheck = 0;

    /**
     * Actively checks health of all registered providers and Studio bridge.
     */
    public async checkAllProviders(): Promise<SystemHealthOverview> {
        const providers = providerRegistry.getAll();
        const records: Record<string, ProviderHealthRecord> = {};
        const studioConnected = commandDispatcher.isStudioConnected();
        let onlineCount = 0;
        let totalCaps = 0;

        for (const provider of providers) {
            const start = Date.now();
            try {
                const health = await provider.healthCheck();
                const latency = Date.now() - start;
                let caps = 0;
                try {
                    const rawCaps = await provider.getCapabilities();
                    caps = Array.isArray(rawCaps) ? rawCaps.length : 0;
                } catch {}
                totalCaps += caps;

                let unifiedState: UnifiedHealthState = 'ONLINE';
                if (health.state === ProviderState.DEGRADED || (!studioConnected && provider.name === 'embedded-plugin')) {
                    unifiedState = 'DEGRADED';
                } else if (health.state === ProviderState.UNHEALTHY || health.state === ProviderState.FAILED || health.state === ProviderState.ERROR) {
                    unifiedState = 'OFFLINE';
                }

                if (unifiedState === 'ONLINE') onlineCount++;

                const record: ProviderHealthRecord = {
                    providerName: provider.name,
                    health: unifiedState,
                    state: health.state ?? ProviderState.READY,
                    latencyMs: latency,
                    capabilitiesCount: caps,
                    message: health.message,
                    lastChecked: Date.now()
                };

                records[provider.name] = record;
                this.cache.set(provider.name, record);
            } catch (err: any) {
                const record: ProviderHealthRecord = {
                    providerName: provider.name,
                    health: 'OFFLINE',
                    state: ProviderState.FAILED,
                    latencyMs: Date.now() - start,
                    capabilitiesCount: 0,
                    message: err.message || String(err),
                    lastChecked: Date.now()
                };
                records[provider.name] = record;
                this.cache.set(provider.name, record);
            }
        }

        const session = commandDispatcher.getSessionInfo();
        const overallHealth: UnifiedHealthState =
            onlineCount === providers.length ? 'ONLINE' : (onlineCount > 0 ? 'DEGRADED' : 'OFFLINE');

        this.lastSystemCheck = Date.now();

        return {
            overallHealth,
            studioConnected,
            activeSessionId: session?.sessionId,
            providers: records,
            totalCapabilities: totalCaps,
            timestamp: this.lastSystemCheck
        };
    }

    public getCachedHealth(providerName: string): ProviderHealthRecord | undefined {
        return this.cache.get(providerName);
    }
}

export const healthMonitor = new HealthMonitor();
