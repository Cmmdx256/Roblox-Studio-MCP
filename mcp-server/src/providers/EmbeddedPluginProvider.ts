import { IProvider } from './IProvider.js';
import {
  AvailabilityStatus,
  ExecutionContext,
  ExecutionResult,
  HealthStatus,
  ProviderCapability,
  ProviderState,
  ProviderToolDefinition,
  ProviderType,
  RiskLevel,
  SecurityLevel,
  VerificationMethod,
} from './types.js';
import { commandDispatcher } from '../dispatcher/commandDispatcher.js';
import { allTools } from '../tools/index.js';
import { zodToJsonSchema } from 'zod-to-json-schema';

export class EmbeddedPluginProvider implements IProvider {
  public readonly name = 'embedded-plugin';
  public readonly type = ProviderType.EMBEDDED_PLUGIN;
  private cachedCapabilities: ProviderCapability[] = [];

  public async discover(): Promise<ProviderCapability[]> {
    const isConnected = commandDispatcher.isStudioConnected();
    const availability = isConnected ? AvailabilityStatus.AVAILABLE : AvailabilityStatus.CONTEXT_DEPENDENT;

    this.cachedCapabilities = allTools.map((tool) => {
      const isReadOnly =
        tool.name.includes('get') ||
        tool.name.includes('inspect') ||
        tool.name.includes('search') ||
        tool.name.includes('info') ||
        tool.name.includes('analyze') ||
        tool.name.includes('map');

      const isHighRisk =
        tool.name.includes('delete') ||
        tool.name.includes('clear') ||
        tool.name.includes('set_source') ||
        tool.name.includes('remove');

      let riskLevel = RiskLevel.MEDIUM;
      if (isReadOnly) riskLevel = RiskLevel.READ_ONLY;
      else if (isHighRisk) riskLevel = RiskLevel.HIGH;

      const rawJsonSchema: any = zodToJsonSchema(tool.inputSchema, {
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

  public async initialize(): Promise<void> {
    console.error(`[EmbeddedPluginProvider] Initializing Embedded Plugin Provider...`);
    await this.discover();
  }

  public async healthCheck(): Promise<HealthStatus> {
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

  public async listTools(): Promise<ProviderToolDefinition[]> {
    return allTools.map((tool) => {
      const rawJsonSchema: any = zodToJsonSchema(tool.inputSchema, {
        target: 'jsonSchema7',
        $refStrategy: 'none',
      });

      const isReadOnly =
        tool.name.includes('get') ||
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

  public async getCapabilities(): Promise<ProviderCapability[]> {
    if (this.cachedCapabilities.length === 0) {
      await this.discover();
    }
    return this.cachedCapabilities;
  }

  public async execute(action: string, params: Record<string, any>): Promise<ExecutionResult> {
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
    } catch (err: any) {
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

  public async shutdown(): Promise<void> {
    console.error(`[EmbeddedPluginProvider] Shutting down...`);
  }
}

export const embeddedPluginProvider = new EmbeddedPluginProvider();
