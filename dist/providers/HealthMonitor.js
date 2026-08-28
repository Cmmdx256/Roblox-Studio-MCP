import { providerRegistry } from './ProviderRegistry.js';
import { commandDispatcher } from '../dispatcher/commandDispatcher.js';
import { ProviderState } from './types.js';
/**
 * HealthMonitor
 * Unified health model monitoring the MCP server, HTTP bridge, Roblox plugin,
 * Official MCP, and specialized providers.
 */
export class HealthMonitor {
    cache = new Map();
    lastSystemCheck = 0;
    /**
     * Actively checks health of all registered providers and Studio bridge.
     */
    async checkAllProviders() {
        const providers = providerRegistry.getAll();
        const records = {};
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
                }
                catch { }
                totalCaps += caps;
                let unifiedState = 'ONLINE';
                if (health.state === ProviderState.DEGRADED || (!studioConnected && provider.name === 'embedded-plugin')) {
                    unifiedState = 'DEGRADED';
                }
                else if (health.state === ProviderState.UNHEALTHY || health.state === ProviderState.FAILED || health.state === ProviderState.ERROR) {
                    unifiedState = 'OFFLINE';
                }
                if (unifiedState === 'ONLINE')
                    onlineCount++;
                const record = {
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
            }
            catch (err) {
                const record = {
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
        const overallHealth = onlineCount === providers.length ? 'ONLINE' : (onlineCount > 0 ? 'DEGRADED' : 'OFFLINE');
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
    getCachedHealth(providerName) {
        return this.cache.get(providerName);
    }
}
export const healthMonitor = new HealthMonitor();
//# sourceMappingURL=HealthMonitor.js.map