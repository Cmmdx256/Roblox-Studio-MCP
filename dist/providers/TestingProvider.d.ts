import { IProvider } from './IProvider.js';
import { ExecutionResult, HealthStatus, ProviderCapability, ProviderToolDefinition, ProviderType } from './types.js';
export declare class TestingProvider implements IProvider {
    readonly name = "testing-provider";
    readonly type = ProviderType.TESTING;
    initialize(): Promise<void>;
    discover(): Promise<ProviderCapability[]>;
    healthCheck(): Promise<HealthStatus>;
    listTools(): Promise<ProviderToolDefinition[]>;
    getCapabilities(): Promise<ProviderCapability[]>;
    execute(action: string, params: Record<string, any>): Promise<ExecutionResult>;
    shutdown(): Promise<void>;
}
export declare const testingProvider: TestingProvider;
//# sourceMappingURL=TestingProvider.d.ts.map