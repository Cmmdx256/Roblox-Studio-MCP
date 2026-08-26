export class MemoryManager {
    globalCapabilities = new Map();
    projectMemory = {
        placeId: 0,
        placeName: 'Unassigned',
        architectureSummary: 'Uninitialized',
        conventions: {
            scriptingStyle: 'Standard',
            replicatedStorageStructure: ['Events', 'Shared', 'Config'],
            serverStorageStructure: ['Services', 'Data'],
            namingConvention: 'PascalCase'
        },
        activeSystems: [],
        recentMutations: [],
        knownErrors: []
    };
    taskMemory = null;
    sessionMemory = {
        studioInstanceId: 'default',
        sessionId: 'none',
        placeId: 0,
        connectedAt: Date.now(),
        lastHeartbeat: Date.now()
    };
    checkpoints = [];
    // Global Capability Memory
    recordCapabilitySuccess(intent, compiledId, providerChain) {
        const key = intent.toLowerCase().trim();
        const existing = this.globalCapabilities.get(key);
        if (existing) {
            existing.usageCount++;
            existing.lastUsed = Date.now();
            existing.successRate = (existing.successRate * 0.8) + 0.2;
        }
        else {
            this.globalCapabilities.set(key, {
                id: `global:${Date.now()}`,
                intent,
                compiledCapabilityId: compiledId,
                successRate: 1.0,
                usageCount: 1,
                lastUsed: Date.now(),
                preferredProviderChain: providerChain
            });
        }
    }
    getGlobalCapability(intent) {
        return this.globalCapabilities.get(intent.toLowerCase().trim());
    }
    // Project Memory
    updateProject(info) {
        this.projectMemory = { ...this.projectMemory, ...info };
    }
    getProject() {
        return { ...this.projectMemory };
    }
    recordMutation(target, action) {
        this.projectMemory.recentMutations.push({ target, action, timestamp: Date.now() });
        if (this.projectMemory.recentMutations.length > 50) {
            this.projectMemory.recentMutations.shift();
        }
    }
    // Task Memory
    startTask(taskId, goal, steps = []) {
        this.taskMemory = {
            taskId,
            goal,
            currentStepIndex: 0,
            steps: steps.map((desc, i) => ({ id: `step_${i}`, description: desc, status: 'PENDING' })),
            completedRequirements: [],
            pendingRequirements: [goal],
            startedAt: Date.now(),
            updatedAt: Date.now()
        };
        return this.taskMemory;
    }
    getTask() {
        return this.taskMemory;
    }
    completeStep(stepIndex, evidence) {
        if (this.taskMemory && this.taskMemory.steps[stepIndex]) {
            this.taskMemory.steps[stepIndex].status = 'COMPLETED';
            this.taskMemory.steps[stepIndex].evidence = evidence;
            this.taskMemory.currentStepIndex = stepIndex + 1;
            this.taskMemory.updatedAt = Date.now();
        }
    }
    // Checkpointing & Rollback
    createCheckpoint(id, snapshot) {
        this.checkpoints.push({ id, timestamp: Date.now(), snapshot });
        if (this.checkpoints.length > 10) {
            this.checkpoints.shift();
        }
    }
    getCheckpoint(id) {
        return this.checkpoints.find(c => c.id === id)?.snapshot;
    }
    // Invalidation on place change
    invalidateForNewPlace(placeId, placeName) {
        this.projectMemory = {
            placeId,
            placeName,
            architectureSummary: `Active place: ${placeName} (${placeId})`,
            conventions: {
                scriptingStyle: 'Standard',
                replicatedStorageStructure: [],
                serverStorageStructure: [],
                namingConvention: 'PascalCase'
            },
            activeSystems: [],
            recentMutations: [],
            knownErrors: []
        };
        this.taskMemory = null;
        this.checkpoints = [];
        console.error(`[MemoryManager] Project memory invalidated for new place: ${placeName} (${placeId})`);
    }
}
export const memoryManager = new MemoryManager();
//# sourceMappingURL=MemoryManager.js.map