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
export declare class StudioStateGraph {
    private sessionInfo;
    private dataModelCache;
    private activeSelection;
    private simulationMode;
    private subsystemHealth;
    updateSession(info: any): void;
    updateSelection(paths: string[]): void;
    updateSimulationMode(mode: 'Edit' | 'Run' | 'Play'): void;
    ingestHierarchy(rootPath: string, nodes: Array<any>): void;
    getNode(path: string): NodeMetadata | undefined;
    isStale(path: string, expectedClassName?: string): boolean;
    getStateSnapshot(): Record<string, any>;
    clear(): void;
}
export declare const studioStateGraph: StudioStateGraph;
//# sourceMappingURL=StudioStateGraph.d.ts.map