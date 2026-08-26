import { ProviderToolDefinition, ProviderCapability } from '../providers/types.js';
export declare class CapabilityAdapterGenerator {
    /**
     * Generates a unified ProviderCapability from a discovered ProviderToolDefinition.
     */
    generateAdapter(toolDef: ProviderToolDefinition): ProviderCapability;
    /**
     * Validates a tool definition schema and registers it.
     */
    validateAndRegister(toolDef: ProviderToolDefinition): boolean;
}
export declare const capabilityAdapterGenerator: CapabilityAdapterGenerator;
//# sourceMappingURL=CapabilityAdapterGenerator.d.ts.map