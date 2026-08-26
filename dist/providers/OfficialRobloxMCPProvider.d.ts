import { IProvider } from './IProvider.js';
import { ExecutionResult, HealthStatus, ProviderCapability, ProviderToolDefinition, ProviderType } from './types.js';
export interface McpCommandConfig {
    command: string;
    args: string[];
    description: string;
}
export declare function findStudioMcpCommand(): McpCommandConfig | null;
export declare function findStudioMcpExecutable(): string | null;
export declare class OfficialRobloxMCPProvider implements IProvider {
    name: string;
    type: ProviderType;
    private client;
    private transport;
    private capabilities;
    private tools;
    private isConnected;
    private connectionMessage;
    private discoveredExePath;
    private knownTools;
    initialize(): Promise<void>;
    discover(): Promise<ProviderCapability[]>;
    healthCheck(): Promise<HealthStatus>;
    private activeStudioIdCache;
    private lastStudioCheck;
    getActiveStudioId(): Promise<string | null>;
    listTools(): Promise<ProviderToolDefinition[]>;
    getCapabilities(): Promise<ProviderCapability[]>;
    execute(action: string, params: Record<string, any>): Promise<ExecutionResult>;
    shutdown(): Promise<void>;
}
export declare const officialRobloxMCPProvider: OfficialRobloxMCPProvider;
//# sourceMappingURL=OfficialRobloxMCPProvider.d.ts.map