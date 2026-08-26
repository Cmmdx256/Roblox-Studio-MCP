import { IProvider } from './IProvider.js';
import { ExecutionResult, HealthStatus, ProviderCapability, ProviderToolDefinition, ProviderType } from './types.js';
export declare class ObservationProvider implements IProvider {
    readonly name = "observation-provider";
    readonly type = ProviderType.OBSERVATION;
    initialize(): Promise<void>;
    discover(): Promise<ProviderCapability[]>;
    healthCheck(): Promise<HealthStatus>;
    listTools(): Promise<ProviderToolDefinition[]>;
    getCapabilities(): Promise<ProviderCapability[]>;
    execute(action: string, params: Record<string, any>): Promise<ExecutionResult>;
    shutdown(): Promise<void>;
}
export declare const observationProvider: ObservationProvider;
//# sourceMappingURL=ObservationProvider.d.ts.map