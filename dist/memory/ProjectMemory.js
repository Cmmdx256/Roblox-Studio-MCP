export class ProjectMemory {
    memory;
    constructor() {
        this.memory = this.createDefaultMemory(0, 'Uninitialized');
    }
    createDefaultMemory(placeId, placeName) {
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
            systems: new Map(),
            errorMemory: new Map(),
            assetReferences: new Map(),
            decisions: [],
            recentMutations: []
        };
    }
    getMemory() {
        return this.memory;
    }
    registerSystem(system) {
        this.memory.systems.set(system.name.toLowerCase(), {
            ...system,
            lastModified: Date.now()
        });
        console.error(`[ProjectMemory] Registered system: ${system.name} at ${system.rootPath}`);
    }
    findSystem(name) {
        return this.memory.systems.get(name.toLowerCase());
    }
    hasSystem(name) {
        return this.memory.systems.has(name.toLowerCase());
    }
    recordErrorResolution(errorClass, messagePattern, rootCause, verifiedRepair) {
        const key = errorClass.toLowerCase();
        const existing = this.memory.errorMemory.get(key);
        if (existing) {
            existing.successCount++;
            existing.lastRepaired = Date.now();
        }
        else {
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
    findKnownRepair(errorMessage) {
        for (const entry of this.memory.errorMemory.values()) {
            if (errorMessage.includes(entry.messagePattern) || errorMessage.toLowerCase().includes(entry.errorClass.toLowerCase())) {
                return entry;
            }
        }
        return undefined;
    }
    recordDecision(topic, decision, rationale) {
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
    recordMutation(target, action) {
        this.memory.recentMutations.push({ target, action, timestamp: Date.now() });
        if (this.memory.recentMutations.length > 100) {
            this.memory.recentMutations.shift();
        }
    }
    getCompactSummary() {
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
    resetForPlace(placeId, placeName) {
        this.memory = this.createDefaultMemory(placeId, placeName);
    }
}
export const projectMemory = new ProjectMemory();
//# sourceMappingURL=ProjectMemory.js.map