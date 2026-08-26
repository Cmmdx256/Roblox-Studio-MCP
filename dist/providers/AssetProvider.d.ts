import { IProvider } from './IProvider.js';
import { ExecutionResult, HealthStatus, ProviderCapability, ProviderToolDefinition, ProviderType } from './types.js';
export declare class AssetProvider implements IProvider {
    readonly name = "asset-provider";
    readonly type = ProviderType.ASSET;
    initialize(): Promise<void>;
    discover(): Promise<ProviderCapability[]>;
    healthCheck(): Promise<HealthStatus>;
    listTools(): Promise<ProviderToolDefinition[]>;
    getCapabilities(): Promise<ProviderCapability[]>;
    execute(action: string, params: Record<string, any>): Promise<ExecutionResult>;
    shutdown(): Promise<void>;
}
export declare const assetProvider: AssetProvider;
//# sourceMappingURL=AssetProvider.d.ts.map