import { IProvider } from './IProvider.js';
import { ExecutionResult, HealthStatus, ProviderCapability, ProviderToolDefinition, ProviderType } from './types.js';
export declare class EmbeddedPluginProvider implements IProvider {
    readonly name = "embedded-plugin";
    readonly type = ProviderType.EMBEDDED_PLUGIN;
    private cachedCapabilities;
    discover(): Promise<ProviderCapability[]>;
    initialize(): Promise<void>;
    healthCheck(): Promise<HealthStatus>;
    listTools(): Promise<ProviderToolDefinition[]>;
    getCapabilities(): Promise<ProviderCapability[]>;
    execute(action: string, params: Record<string, any>): Promise<ExecutionResult>;
    shutdown(): Promise<void>;
}
export declare const embeddedPluginProvider: EmbeddedPluginProvider;
//# sourceMappingURL=EmbeddedPluginProvider.d.ts.map