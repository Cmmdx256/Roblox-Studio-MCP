import { IProvider } from './IProvider.js';
import { HealthStatus, ProviderCapability, ProviderType } from './types.js';
export declare class ProviderRegistry {
    private providers;
    private providerStates;
    register(provider: IProvider): void;
    unregister(name: string): boolean;
    get(name: string): IProvider | undefined;
    getAll(): IProvider[];
    getByType(type: ProviderType): IProvider[];
    initializeAll(): Promise<void>;
    healthCheckAll(): Promise<Map<string, HealthStatus>>;
    getAllCapabilities(): Promise<ProviderCapability[]>;
    shutdownAll(): Promise<void>;
}
export declare const providerRegistry: ProviderRegistry;
//# sourceMappingURL=ProviderRegistry.d.ts.map