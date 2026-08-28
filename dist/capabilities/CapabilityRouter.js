import { AvailabilityStatus, ProviderState } from '../providers/types.js';
import { providerRegistry } from '../providers/ProviderRegistry.js';
import { restrictedCapabilityRegistry } from './RestrictedCapabilityRegistry.js';
export class CapabilityRouter {
    routes = new Map();
    providers = new Map();
    toolAliases = {
        'script.read': 'script_read',
        'instance.inspect': 'inspect_instance',
        'playtest.start': 'start_stop_play',
        'playtest_control': 'start_stop_play',
        'playtest.control': 'start_stop_play',
        'playtest_get_state': 'get_studio_state',
        'playtest.getState': 'get_studio_state',
    };
    constructor() {
        // Automatically populate all restricted and elevated capability routes
        for (const desc of restrictedCapabilityRegistry.getAllRestrictedCapabilities()) {
            const candidateList = [desc.primaryProvider, ...desc.fallbackProviders];
            this.routes.set(desc.name, candidateList);
            this.routes.set(desc.name.replace(/_/g, '.'), candidateList);
        }
    }
    /**
     * Register a provider instance.
     */
    registerProvider(provider) {
        this.providers.set(provider.name, provider);
    }
    /**
     * Map a capability to a list of provider names in priority order.
     */
    registerRoute(capabilityName, providerNames) {
        this.routes.set(capabilityName, providerNames);
    }
    /**
     * Get the ordered list of providers for a capability.
     */
    getRoute(capabilityName) {
        return this.routes.get(capabilityName);
    }
    /**
     * Get all routing maps.
     */
    getAllRoutes() {
        return this.routes;
    }
    /**
     * Returns list of restricted capabilities routed to Official MCP.
     */
    getRestrictedCapabilities() {
        return restrictedCapabilityRegistry.getAllRestrictedCapabilities();
    }
    /**
     * Returns the 12-category hierarchical taxonomy tree of restricted capabilities.
     */
    getRestrictedHierarchyTree() {
        return restrictedCapabilityRegistry.getHierarchyTree();
    }
    /**
     * Route a request to the best available provider based on health and priority.
     */
    async route(action, params) {
        // Resolve tool deduplication
        const resolvedAction = this.toolAliases[action] || action;
        let candidateNames = this.routes.get(resolvedAction);
        if (!candidateNames || candidateNames.length === 0) {
            candidateNames = ['embedded-plugin', 'official-roblox-mcp', 'luau-provider', 'modeling-provider'];
        }
        for (const providerName of candidateNames) {
            let provider = this.providers.get(providerName);
            if (!provider) {
                provider = providerRegistry.get(providerName);
            }
            if (!provider)
                continue;
            const health = await provider.healthCheck();
            const isHealthy = health.state === ProviderState.READY || health.status === AvailabilityStatus.AVAILABLE;
            // If provider is unhealthy, skip unless it's embedded-plugin as default
            if (!isHealthy && providerName !== 'embedded-plugin') {
                continue;
            }
            // Attempt execution
            const result = await provider.execute(resolvedAction, params);
            // Basic retry/fallback logic
            if (result.status === 'ERROR' && this.isRetryableError(result.code)) {
                console.error(`[CapabilityRouter] Provider '${providerName}' failed for '${resolvedAction}', trying fallback...`);
                continue; // Try next provider
            }
            return result;
        }
        return {
            status: 'ERROR',
            code: 'NO_PROVIDER_AVAILABLE',
            message: `No available provider found for capability: ${resolvedAction}`
        };
    }
    isRetryableError(code) {
        return code === 'PROVIDER_UNAVAILABLE' || code === 'TIMEOUT' || code === 'HTTP_RESTRICTED';
    }
}
export const capabilityRouter = new CapabilityRouter();
//# sourceMappingURL=CapabilityRouter.js.map