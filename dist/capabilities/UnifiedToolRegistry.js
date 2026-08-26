export class UnifiedToolRegistry {
    tools = new Map();
    register(tool) {
        this.tools.set(tool.name, tool);
    }
    unregister(name) {
        return this.tools.delete(name);
    }
    get(name) {
        return this.tools.get(name);
    }
    list(filter) {
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
    search(query, options) {
        const lowerQuery = query.toLowerCase();
        let results = Array.from(this.tools.values()).filter(t => t.name.toLowerCase().includes(lowerQuery) ||
            t.description.toLowerCase().includes(lowerQuery));
        if (options?.category) {
            results = results.filter(t => t.category === options.category);
        }
        if (options?.limit) {
            results = results.slice(0, options.limit);
        }
        return results;
    }
    getAll() {
        return Array.from(this.tools.values());
    }
    size() {
        return this.tools.size;
    }
}
export const unifiedToolRegistry = new UnifiedToolRegistry();
//# sourceMappingURL=UnifiedToolRegistry.js.map