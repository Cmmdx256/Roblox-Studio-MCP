import { ProviderToolDefinition } from '../providers/types.js';

export class UnifiedToolRegistry {
    private tools: Map<string, ProviderToolDefinition> = new Map();

    public register(tool: ProviderToolDefinition): void {
        this.tools.set(tool.name, tool);
    }

    public unregister(name: string): boolean {
        return this.tools.delete(name);
    }

    public get(name: string): ProviderToolDefinition | undefined {
        return this.tools.get(name);
    }

    public list(filter?: { category?: string; provider?: string; limit?: number; offset?: number }): ProviderToolDefinition[] {
        let results = Array.from(this.tools.values());

        if (filter?.category) {
            results = results.filter(t => t.category === filter.category);
        }
        if (filter?.provider) {
            results = results.filter(t => t.provider === filter.provider);
        }

        const offset = filter?.offset || 0;
        const limit = filter?.limit;

        if (limit) {
            return results.slice(offset, offset + limit);
        }
        
        return results.slice(offset);
    }

    public search(query: string, options?: { category?: string; limit?: number }): ProviderToolDefinition[] {
        const lowerQuery = query.toLowerCase();
        let results = Array.from(this.tools.values()).filter(t => 
            t.name.toLowerCase().includes(lowerQuery) || 
            t.description.toLowerCase().includes(lowerQuery)
        );

        if (options?.category) {
            results = results.filter(t => t.category === options.category);
        }

        if (options?.limit) {
            results = results.slice(0, options.limit);
        }

        return results;
    }

    public getAll(): ProviderToolDefinition[] {
        return Array.from(this.tools.values());
    }

    public size(): number {
        return this.tools.size;
    }
}

export const unifiedToolRegistry = new UnifiedToolRegistry();
