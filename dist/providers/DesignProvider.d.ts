import { IProvider } from './IProvider.js';
import { ExecutionResult, HealthStatus, ProviderCapability, ProviderToolDefinition, ProviderType } from './types.js';
export declare class DesignProvider implements IProvider {
    readonly name = "design-provider";
    readonly type = ProviderType.DESIGN;
    initialize(): Promise<void>;
    discover(): Promise<ProviderCapability[]>;
    healthCheck(): Promise<HealthStatus>;
    listTools(): Promise<ProviderToolDefinition[]>;
    getCapabilities(): Promise<ProviderCapability[]>;
    execute(action: string, params: Record<string, any>): Promise<ExecutionResult>;
    shutdown(): Promise<void>;
}
export declare const designProvider: DesignProvider;
//# sourceMappingURL=DesignProvider.d.ts.map