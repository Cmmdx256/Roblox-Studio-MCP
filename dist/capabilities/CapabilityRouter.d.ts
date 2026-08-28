import { ExecutionResult } from '../providers/types.js';
import { IProvider } from '../providers/IProvider.js';
import { RestrictedCapabilityDescriptor } from './RestrictedCapabilityRegistry.js';
export declare class CapabilityRouter {
    private routes;
    private providers;
    private toolAliases;
    constructor();
    /**
     * Register a provider instance.
     */
    registerProvider(provider: IProvider): void;
    /**
     * Map a capability to a list of provider names in priority order.
     */
    registerRoute(capabilityName: string, providerNames: string[]): void;
    /**
     * Get the ordered list of providers for a capability.
     */
    getRoute(capabilityName: string): string[] | undefined;
    /**
     * Get all routing maps.
     */
    getAllRoutes(): Map<string, string[]>;
    /**
     * Returns list of restricted capabilities routed to Official MCP.
     */
    getRestrictedCapabilities(): RestrictedCapabilityDescriptor[];
    /**
     * Returns the 12-category hierarchical taxonomy tree of restricted capabilities.
     */
    getRestrictedHierarchyTree(): Record<string, RestrictedCapabilityDescriptor[]>;
    /**
     * Route a request to the best available provider based on health and priority.
     */
    route(action: string, params: Record<string, any>): Promise<ExecutionResult>;
    private isRetryableError;
}
export declare const capabilityRouter: CapabilityRouter;
//# sourceMappingURL=CapabilityRouter.d.ts.map