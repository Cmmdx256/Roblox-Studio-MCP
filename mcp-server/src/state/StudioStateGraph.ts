export interface NodeMetadata {
    name: string;
    className: string;
    path: string;
    parentPath: string | null;
    lastUpdated: number;
    properties: Record<string, any>;
}

export interface SubsystemHealth {
    DataModel: boolean;
    Selection: boolean;
    ChangeHistory: boolean;
    ScriptAPI: boolean;
    HTTP: boolean;
    OfficialMCP: boolean;
}

/**
 * Live reactive in-memory state tracking for active Roblox Studio session.
 */
export class StudioStateGraph {
    private sessionInfo: any = {};
    private dataModelCache: Map<string, NodeMetadata> = new Map();
    private activeSelection: string[] = [];
    private simulationMode: 'Edit' | 'Run' | 'Play' = 'Edit';
    private subsystemHealth: SubsystemHealth = {
        DataModel: true,
        Selection: true,
        ChangeHistory: true,
        ScriptAPI: true,
        HTTP: true,
        OfficialMCP: true
    };

    public updateSession(info: any): void {
        this.sessionInfo = { ...this.sessionInfo, ...info };
    }

    public updateSelection(paths: string[]): void {
        this.activeSelection = paths;
    }

    public updateSimulationMode(mode: 'Edit' | 'Run' | 'Play'): void {
        this.simulationMode = mode;
    }

    public ingestHierarchy(rootPath: string, nodes: Array<any>): void {
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

    public getNode(path: string): NodeMetadata | undefined {
        return this.dataModelCache.get(path);
    }

    public isStale(path: string, expectedClassName?: string): boolean {
        const node = this.dataModelCache.get(path);
        if (!node) return true;
        
        if (expectedClassName && node.className !== expectedClassName) return true;
        
        // Define staleness threshold, e.g., 5 minutes
        const stalenessThresholdMs = 5 * 60 * 1000;
        return (Date.now() - node.lastUpdated) > stalenessThresholdMs;
    }

    public getStateSnapshot(): Record<string, any> {
        return {
            sessionInfo: this.sessionInfo,
            activeSelection: this.activeSelection,
            simulationMode: this.simulationMode,
            subsystemHealth: this.subsystemHealth,
            cacheSize: this.dataModelCache.size
        };
    }

    public clear(): void {
        this.sessionInfo = {};
        this.dataModelCache.clear();
        this.activeSelection = [];
        this.simulationMode = 'Edit';
    }
}

export const studioStateGraph = new StudioStateGraph();
