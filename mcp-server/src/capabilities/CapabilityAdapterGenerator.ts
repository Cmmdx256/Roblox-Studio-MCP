import {
    ProviderToolDefinition,
    ProviderCapability,
    ProviderType,
    AvailabilityStatus,
    SecurityLevel,
    ExecutionContext,
    RiskLevel,
    VerificationMethod
} from '../providers/types.js';

export class CapabilityAdapterGenerator {
    /**
     * Generates a unified ProviderCapability from a discovered ProviderToolDefinition.
     */
    public generateAdapter(toolDef: ProviderToolDefinition): ProviderCapability {
        // Very basic heuristics to determine security and risk based on tool description or name
        let secLevel = SecurityLevel.SAFE;
        let risk = RiskLevel.LOW;
        let context = ExecutionContext.EDIT;

        const nameLower = toolDef.name.toLowerCase();
        if (nameLower.includes('delete') || nameLower.includes('execute') || nameLower.includes('write')) {
            secLevel = SecurityLevel.ELEVATED;
            risk = RiskLevel.MEDIUM;
        }

        if (nameLower.includes('playtest') || nameLower.includes('run')) {
            context = ExecutionContext.PLAYTEST;
        }

        return {
            name: toolDef.name,
            description: toolDef.description,
            category: toolDef.category || 'misc',
            provider: ProviderType.OFFICIAL_ROBLOX_MCP,
            availability: AvailabilityStatus.AVAILABLE,
            securityLevel: secLevel,
            executionContext: context,
            riskLevel: risk,
            verificationMethod: VerificationMethod.NONE,
            schema: toolDef.schema
        };
    }

    /**
     * Validates a tool definition schema and registers it.
     */
    public validateAndRegister(toolDef: ProviderToolDefinition): boolean {
        if (!toolDef.name || !toolDef.schema) {
            console.error('[CapabilityAdapterGenerator] Invalid tool definition:', toolDef);
            return false;
        }
        
        // Dynamic adapter creation could inject Zod schemas here in the future
        return true;
    }
}

export const capabilityAdapterGenerator = new CapabilityAdapterGenerator();
