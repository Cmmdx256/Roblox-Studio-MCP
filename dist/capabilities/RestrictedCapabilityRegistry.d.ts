import { RestrictedCategory, RobloxSecurityContext, SandboxCapability, SecurityLevel } from '../providers/types.js';
export interface RestrictedCapabilityDescriptor {
    name: string;
    category: RestrictedCategory;
    securityLevel: SecurityLevel;
    robloxSecurityContext: RobloxSecurityContext;
    requiredSandboxCapability?: SandboxCapability;
    description: string;
    primaryProvider: string;
    fallbackProviders: string[];
    officialToolName?: string;
}
/**
 * Master Registry for Restricted / Official-Only Capabilities
 * Categorizes all APIs and capabilities that are restricted in 3rd-party HTTP / plugin sandbox
 * and maps them directly to the Official Roblox Studio MCP (StudioMCP.exe) with fallback paths.
 */
export declare class RestrictedCapabilityRegistry {
    private descriptors;
    constructor();
    private initializeRegistry;
    isRestricted(name: string): boolean;
    getDescriptor(name: string): RestrictedCapabilityDescriptor | undefined;
    getRoute(name: string): string[];
    getAllRestrictedCapabilities(): RestrictedCapabilityDescriptor[];
    getHierarchyTree(): Record<string, RestrictedCapabilityDescriptor[]>;
}
export declare const restrictedCapabilityRegistry: RestrictedCapabilityRegistry;
//# sourceMappingURL=RestrictedCapabilityRegistry.d.ts.map