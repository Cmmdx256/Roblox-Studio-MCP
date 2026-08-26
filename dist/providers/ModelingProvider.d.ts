import { ExecutionResult, HealthStatus, ProviderCapability, ProviderToolDefinition, ProviderType } from './types.js';
import { IProvider } from './IProvider.js';
export declare class ModelingProvider implements IProvider {
    readonly name = "modeling-provider";
    readonly type = ProviderType.MODELING;
    private cachedCapabilities;
    discover(): Promise<ProviderCapability[]>;
    initialize(): Promise<void>;
    healthCheck(): Promise<HealthStatus>;
    listTools(): Promise<ProviderToolDefinition[]>;
    getCapabilities(): Promise<ProviderCapability[]>;
    execute(action: string, params: Record<string, any>): Promise<ExecutionResult>;
    generateModel(prompt: string, options?: {
        category?: string;
        parent?: string;
        position?: [number, number, number];
        scale?: [number, number, number];
        anchored?: boolean;
    }): Promise<ExecutionResult>;
    generateMaterial(prompt: string, baseMaterial?: string): Promise<ExecutionResult>;
    inspectQuality(targetInstancePath: string): Promise<{
        passed: boolean;
        score: number;
        issues: string[];
        recommendations: string[];
    }>;
    shutdown(): Promise<void>;
}
export declare const modelingProvider: ModelingProvider;
//# sourceMappingURL=ModelingProvider.d.ts.map