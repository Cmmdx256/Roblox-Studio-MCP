import { AvailabilityStatus, ExecutionContext, ProviderState, ProviderType, RiskLevel, SecurityLevel, VerificationMethod, } from './types.js';
import { commandDispatcher } from '../dispatcher/commandDispatcher.js';
import { allTools } from '../tools/index.js';
import { zodToJsonSchema } from 'zod-to-json-schema';
export class EmbeddedPluginProvider {
    name = 'embedded-plugin';
    type = ProviderType.EMBEDDED_PLUGIN;
    cachedCapabilities = [];
    async discover() {
        const isConnected = commandDispatcher.isStudioConnected();
        const availability = isConnected ? AvailabilityStatus.AVAILABLE : AvailabilityStatus.CONTEXT_DEPENDENT;
        this.cachedCapabilities = allTools.map((tool) => {
            const isReadOnly = tool.name.includes('get') ||
                tool.name.includes('inspect') ||
                tool.name.includes('search') ||
                tool.name.includes('info') ||
                tool.name.includes('analyze') ||
                tool.name.includes('map');
            const isHighRisk = tool.name.includes('delete') ||
                tool.name.includes('clear') ||
                tool.name.includes('set_source') ||
                tool.name.includes('remove');
            let riskLevel = RiskLevel.MEDIUM;
            if (isReadOnly)
                riskLevel = RiskLevel.READ_ONLY;
            else if (isHighRisk)
                riskLevel = RiskLevel.HIGH;
            const rawJsonSchema = zodToJsonSchema(tool.inputSchema, {
                target: 'jsonSchema7',
                $refStrategy: 'none',
            });
            return {
                name: tool.name,
                description: tool.description,
                category: tool.name.split('_')[0] || 'general',
                provider: ProviderType.EMBEDDED_PLUGIN,
                availability,
                securityLevel: SecurityLevel.PLUGIN_SECURITY,
                executionContext: ExecutionContext.EDIT,
                riskLevel,
                verificationMethod: isReadOnly ? VerificationMethod.NONE : VerificationMethod.READ_BACK,
                schema: {
                    type: 'object',
                    properties: rawJsonSchema.properties || {},
                    required: rawJsonSchema.required || [],
                },
                inputSchema: {
                    type: 'object',
                    properties: rawJsonSchema.properties || {},
                    required: rawJsonSchema.required || [],
                },
                aliases: [
                    tool.name.replace(/_/g, '.'),
                    tool.name.replace(/\./g, '_'),
                ],
            };
        });
        return this.cachedCapabilities;
    }
    async initialize() {
        console.error(`[EmbeddedPluginProvider] Initializing Embedded Plugin Provider...`);
        await this.discover();
    }
    async healthCheck() {
        const isConnected = commandDispatcher.isStudioConnected();
        const session = commandDispatcher.getActiveSession();
        if (isConnected && session) {
            return {
                status: AvailabilityStatus.AVAILABLE,
                state: ProviderState.READY,
                message: `Roblox Studio connected (Place: "${session.placeName || 'Unknown'}", Session: ${session.sessionId.slice(0, 8)}...)`,
                details: { session, capabilitiesCount: this.cachedCapabilities.length },
            };
        }
        return {
            status: AvailabilityStatus.DEGRADED,
            state: ProviderState.DEGRADED,
            message: 'No active Roblox Studio session connected. Open Roblox Studio with the Universal MCP plugin enabled.',
            details: { capabilitiesCount: this.cachedCapabilities.length },
        };
    }
    async listTools() {
        return allTools.map((tool) => {
            const rawJsonSchema = zodToJsonSchema(tool.inputSchema, {
                target: 'jsonSchema7',
                $refStrategy: 'none',
            });
            const isReadOnly = tool.name.includes('get') ||
                tool.name.includes('inspect') ||
                tool.name.includes('search') ||
                tool.name.includes('info');
            return {
                name: tool.name,
                description: tool.description,
                category: tool.name.split('_')[0] || 'general',
                provider: this.name,
                schema: {
                    type: 'object',
                    properties: rawJsonSchema.properties || {},
                    required: rawJsonSchema.required || [],
                },
                inputSchema: {
                    type: 'object',
                    properties: rawJsonSchema.properties || {},
                    required: rawJsonSchema.required || [],
                },
                riskLevel: isReadOnly ? RiskLevel.READ_ONLY : RiskLevel.MEDIUM,
                verificationMethod: isReadOnly ? VerificationMethod.NONE : VerificationMethod.READ_BACK,
            };
        });
    }
    async getCapabilities() {
        if (this.cachedCapabilities.length === 0) {
            await this.discover();
        }
        return this.cachedCapabilities;
    }
    async execute(action, params) {
        const startTime = Date.now();
        try {
            const result = await commandDispatcher.executeCommand(action, params);
            const duration = Date.now() - startTime;
            return {
                status: 'SUCCESS',
                // A bridge response confirms transport execution only.  The caller's
                // verification layer must independently inspect Studio before it can
                // promote this operation to VERIFIED.
                verified: false,
                data: result,
                changes: [],
                evidence: [
                    {
                        type: 'custom',
                        content: JSON.stringify({ action, params, duration }),
                        label: 'execution_response',
                    },
                ],
                duration,
            };
        }
        catch (err) {
            const duration = Date.now() - startTime;
            return {
                status: 'ERROR',
                verified: false,
                code: err?.code || 'EXECUTION_FAILED',
                message: err?.message || String(err),
                changes: [],
                evidence: [],
                duration,
            };
        }
    }
    async shutdown() {
        console.error(`[EmbeddedPluginProvider] Shutting down...`);
    }
}
export const embeddedPluginProvider = new EmbeddedPluginProvider();
//# sourceMappingURL=EmbeddedPluginProvider.js.map