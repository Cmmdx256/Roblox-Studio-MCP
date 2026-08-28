/**
 * Live reactive in-memory state tracking for active Roblox Studio session.
 */
export class StudioStateGraph {
    sessionInfo = {};
    dataModelCache = new Map();
    activeSelection = [];
    simulationMode = 'Edit';
    subsystemHealth = {
        DataModel: true,
        Selection: true,
        ChangeHistory: true,
        ScriptAPI: true,
        HTTP: true,
        OfficialMCP: true
    };
    updateSession(info) {
        this.sessionInfo = { ...this.sessionInfo, ...info };
    }
    updateSelection(paths) {
        this.activeSelection = paths;
    }
    updateSimulationMode(mode) {
        this.simulationMode = mode;
    }
    ingestHierarchy(rootPath, nodes) {
        for (const node of nodes) {
            this.dataModelCache.set(node.path, {
                name: node.name,
                className: node.className,
                path: node.path,
                parentPath: node.parentPath || null,
                lastUpdated: Date.now(),
                properties: node.properties || {}
            });
        }
    }
    getNode(path) {
        return this.dataModelCache.get(path);
    }
    isStale(path, expectedClassName) {
        const node = this.dataModelCache.get(path);
        if (!node)
            return true;
        if (expectedClassName && node.className !== expectedClassName)
            return true;
        // Define staleness threshold, e.g., 5 minutes
        const stalenessThresholdMs = 5 * 60 * 1000;
        return (Date.now() - node.lastUpdated) > stalenessThresholdMs;
    }
    getStateSnapshot() {
        return {
            sessionInfo: this.sessionInfo,
            activeSelection: this.activeSelection,
            simulationMode: this.simulationMode,
            subsystemHealth: this.subsystemHealth,
            cacheSize: this.dataModelCache.size
        };
    }
    getAllNodes() {
        return Array.from(this.dataModelCache.values());
    }
    getAllPaths() {
        return Array.from(this.dataModelCache.keys());
    }
    clear() {
        this.sessionInfo = {};
        this.dataModelCache.clear();
        this.activeSelection = [];
        this.simulationMode = 'Edit';
    }
}
export const studioStateGraph = new StudioStateGraph();
//# sourceMappingURL=StudioStateGraph.js.map