import {
    ExecutionResult,
    AvailabilityStatus,
    ProviderState
} from '../providers/types.js';
import { IProvider } from '../providers/IProvider.js';
import { providerRegistry } from '../providers/ProviderRegistry.js';
import {
    restrictedCapabilityRegistry,
    RestrictedCapabilityDescriptor
} from './RestrictedCapabilityRegistry.js';

export class CapabilityRouter {
    private routes: Map<string, string[]> = new Map();
    private providers: Map<string, IProvider> = new Map();

    private toolAliases: Record<string, string> = {
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
    public registerProvider(provider: IProvider): void {
        this.providers.set(provider.name, provider);
    }

    /**
     * Map a capability to a list of provider names in priority order.
     */
    public registerRoute(capabilityName: string, providerNames: string[]): void {
        this.routes.set(capabilityName, providerNames);
    }

    /**
     * Get the ordered list of providers for a capability.
     */
    public getRoute(capabilityName: string): string[] | undefined {
        return this.routes.get(capabilityName);
    }

    /**
     * Get all routing maps.
     */
    public getAllRoutes(): Map<string, string[]> {
        return this.routes;
    }

    /**
     * Returns list of restricted capabilities routed to Official MCP.
     */
    public getRestrictedCapabilities(): RestrictedCapabilityDescriptor[] {
        return restrictedCapabilityRegistry.getAllRestrictedCapabilities();
    }

    /**
     * Returns the 12-category hierarchical taxonomy tree of restricted capabilities.
     */
    public getRestrictedHierarchyTree(): Record<string, RestrictedCapabilityDescriptor[]> {
        return restrictedCapabilityRegistry.getHierarchyTree();
    }

    /**
     * Route a request to the best available provider based on health and priority.
     */
    public async route(action: string, params: Record<string, any>): Promise<ExecutionResult> {
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
            if (!provider) continue;

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

    private isRetryableError(code?: string): boolean {
        return code === 'PROVIDER_UNAVAILABLE' || code === 'TIMEOUT' || code === 'HTTP_RESTRICTED';
    }
}

export const capabilityRouter = new CapabilityRouter();

