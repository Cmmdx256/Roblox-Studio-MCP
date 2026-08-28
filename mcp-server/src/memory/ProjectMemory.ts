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
    assetReferences: Map<string, { name: string; assetId: string | number; usage: string }>;
    decisions: ProjectDecision[];
    recentMutations: Array<{ target: string; action: string; timestamp: number }>;
}

export class ProjectMemory {
    private memory: StructuredProjectMemory;

    constructor() {
        this.memory = this.createDefaultMemory(0, 'Uninitialized');
    }

    private createDefaultMemory(placeId: number | string, placeName: string): StructuredProjectMemory {
        return {
            placeId,
            placeName,
            architectureSummary: `Active Place: ${placeName} (${placeId})`,
            detectedFramework: 'Vanilla',
            namingConventions: {
                scripts: 'PascalCase',
                instances: 'PascalCase',
                remotes: 'PascalCase'
            },
            activeTheme: 'dark_fantasy',
            importantPaths: {
                events: 'ReplicatedStorage.Events',
                shared: 'ReplicatedStorage.Shared',
                services: 'ServerScriptService.Services',
                gui: 'StarterGui'
            },
            systems: new Map<string, SystemRegistryEntry>(),
            errorMemory: new Map<string, ErrorMemoryEntry>(),
            assetReferences: new Map(),
            decisions: [],
            recentMutations: []
        };
    }

    public getMemory(): StructuredProjectMemory {
        return this.memory;
    }

    public registerSystem(system: SystemRegistryEntry): void {
        this.memory.systems.set(system.name.toLowerCase(), {
            ...system,
            lastModified: Date.now()
        });
        console.error(`[ProjectMemory] Registered system: ${system.name} at ${system.rootPath}`);
    }

    public findSystem(name: string): SystemRegistryEntry | undefined {
        return this.memory.systems.get(name.toLowerCase());
    }

    public hasSystem(name: string): boolean {
        return this.memory.systems.has(name.toLowerCase());
    }

    public recordErrorResolution(errorClass: string, messagePattern: string, rootCause: string, verifiedRepair: string): void {
        const key = errorClass.toLowerCase();
        const existing = this.memory.errorMemory.get(key);
        if (existing) {
            existing.successCount++;
            existing.lastRepaired = Date.now();
        } else {
            this.memory.errorMemory.set(key, {
                errorClass,
                messagePattern,
                rootCause,
                verifiedRepair,
                successCount: 1,
                lastRepaired: Date.now()
            });
        }
    }

    public findKnownRepair(errorMessage: string): ErrorMemoryEntry | undefined {
        for (const entry of this.memory.errorMemory.values()) {
            if (errorMessage.includes(entry.messagePattern) || errorMessage.toLowerCase().includes(entry.errorClass.toLowerCase())) {
                return entry;
            }
        }
        return undefined;
    }

    public recordDecision(topic: string, decision: string, rationale: string): void {
        this.memory.decisions.push({
            id: `dec_${Date.now()}`,
            topic,
            decision,
            rationale,
            timestamp: Date.now()
        });
        if (this.memory.decisions.length > 50) {
            this.memory.decisions.shift();
        }
    }

    public recordMutation(target: string, action: string): void {
        this.memory.recentMutations.push({ target, action, timestamp: Date.now() });
        if (this.memory.recentMutations.length > 100) {
            this.memory.recentMutations.shift();
        }
    }

    public getCompactSummary(): Record<string, any> {
        return {
            placeId: this.memory.placeId,
            placeName: this.memory.placeName,
            framework: this.memory.detectedFramework,
            activeSystems: Array.from(this.memory.systems.keys()),
            knownErrorPatterns: Array.from(this.memory.errorMemory.keys()),
            recentMutationsCount: this.memory.recentMutations.length,
            decisionsCount: this.memory.decisions.length
        };
    }

    public resetForPlace(placeId: number | string, placeName: string): void {
        this.memory = this.createDefaultMemory(placeId, placeName);
    }
}

export const projectMemory = new ProjectMemory();
