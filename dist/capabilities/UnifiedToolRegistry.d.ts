import { ProviderToolDefinition } from '../providers/types.js';
export declare class UnifiedToolRegistry {
    private tools;
    register(tool: ProviderToolDefinition): void;
    unregister(name: string): boolean;
    get(name: string): ProviderToolDefinition | undefined;
    list(filter?: {
        category?: string;
        provider?: string;
        limit?: number;
        offset?: number;
    }): ProviderToolDefinition[];
    search(query: string, options?: {
        category?: string;
        limit?: number;
    }): ProviderToolDefinition[];
    getAll(): ProviderToolDefinition[];
    size(): number;
}
export declare const unifiedToolRegistry: UnifiedToolRegistry;
//# sourceMappingURL=UnifiedToolRegistry.d.ts.map