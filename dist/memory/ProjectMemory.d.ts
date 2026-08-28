export interface SystemRegistryEntry {
    name: string;
    description: string;
    rootPath: string;
    serverScripts: string[];
    clientScripts: string[];
    sharedModules: string[];
    remotes: string[];
    dependencies: string[];
    lastModified: number;
}
export interface ErrorMemoryEntry {
    errorClass: string;
    messagePattern: string;
    rootCause: string;
    verifiedRepair: string;
    successCount: number;
    lastRepaired: number;
}
export interface ProjectDecision {
    id: string;
    topic: string;
    decision: string;
    rationale: string;
    timestamp: number;
}
export interface StructuredProjectMemory {
    placeId: number | string;
    placeName: string;
    architectureSummary: string;
    detectedFramework: 'Knit' | 'Nevermore' | 'Flamework' | 'Vanilla' | 'Custom';
    namingConventions: {
        scripts: 'PascalCase' | 'camelCase';
        instances: 'PascalCase' | 'camelCase' | 'snake_case';
        remotes: 'PascalCase' | 'camelCase';
    };
    activeTheme: string;
    importantPaths: Record<string, string>;
    systems: Map<string, SystemRegistryEntry>;
    errorMemory: Map<string, ErrorMemoryEntry>;
    assetReferences: Map<string, {
        name: string;
        assetId: string | number;
        usage: string;
    }>;
    decisions: ProjectDecision[];
    recentMutations: Array<{
        target: string;
        action: string;
        timestamp: number;
    }>;
}
export declare class ProjectMemory {
    private memory;
    constructor();
    private createDefaultMemory;
    getMemory(): StructuredProjectMemory;
    registerSystem(system: SystemRegistryEntry): void;
    findSystem(name: string): SystemRegistryEntry | undefined;
    hasSystem(name: string): boolean;
    recordErrorResolution(errorClass: string, messagePattern: string, rootCause: string, verifiedRepair: string): void;
    findKnownRepair(errorMessage: string): ErrorMemoryEntry | undefined;
    recordDecision(topic: string, decision: string, rationale: string): void;
    recordMutation(target: string, action: string): void;
    getCompactSummary(): Record<string, any>;
    resetForPlace(placeId: number | string, placeName: string): void;
}
export declare const projectMemory: ProjectMemory;
//# sourceMappingURL=ProjectMemory.d.ts.map