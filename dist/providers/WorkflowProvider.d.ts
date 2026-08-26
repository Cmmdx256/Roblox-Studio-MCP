import { IProvider } from './IProvider.js';
import { ExecutionResult, HealthStatus, ProviderCapability, ProviderToolDefinition, ProviderType } from './types.js';
export declare class WorkflowProvider implements IProvider {
    readonly name = "workflow-provider";
    readonly type = ProviderType.WORKFLOW;
    initialize(): Promise<void>;
    discover(): Promise<ProviderCapability[]>;
    healthCheck(): Promise<HealthStatus>;
    listTools(): Promise<ProviderToolDefinition[]>;
    getCapabilities(): Promise<ProviderCapability[]>;
    execute(action: string, params: Record<string, any>): Promise<ExecutionResult>;
    shutdown(): Promise<void>;
}
export declare const workflowProvider: WorkflowProvider;
//# sourceMappingURL=WorkflowProvider.d.ts.map