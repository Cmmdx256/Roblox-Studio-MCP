import {
    GlobalCapabilityMemoryEntry,
    ProjectMemoryState,
    SessionMemoryState,
    TaskMemoryState
} from './types.js';

export class MemoryManager {
    private globalCapabilities = new Map<string, GlobalCapabilityMemoryEntry>();
    private projectMemory: ProjectMemoryState = {
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
    private taskMemory: TaskMemoryState | null = null;
    private sessionMemory: SessionMemoryState = {
        studioInstanceId: 'default',
        sessionId: 'none',
        placeId: 0,
        connectedAt: Date.now(),
        lastHeartbeat: Date.now()
    };
    private checkpoints: Array<{ id: string; timestamp: number; snapshot: any }> = [];

    // Global Capability Memory
    public recordCapabilitySuccess(intent: string, compiledId: string, providerChain: string[]): void {
        const key = intent.toLowerCase().trim();
        const existing = this.globalCapabilities.get(key);
        if (existing) {
            existing.usageCount++;
            existing.lastUsed = Date.now();
            existing.successRate = (existing.successRate * 0.8) + 0.2;
        } else {
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

    public getGlobalCapability(intent: string): GlobalCapabilityMemoryEntry | undefined {
        return this.globalCapabilities.get(intent.toLowerCase().trim());
    }

    // Project Memory
    public updateProject(info: Partial<ProjectMemoryState>): void {
        this.projectMemory = { ...this.projectMemory, ...info };
    }

    public getProject(): ProjectMemoryState {
        return { ...this.projectMemory };
    }

    public recordMutation(target: string, action: string): void {
        this.projectMemory.recentMutations.push({ target, action, timestamp: Date.now() });
        if (this.projectMemory.recentMutations.length > 50) {
            this.projectMemory.recentMutations.shift();
        }
    }

    // Task Memory
    public startTask(taskId: string, goal: string, steps: string[] = []): TaskMemoryState {
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

    public getTask(): TaskMemoryState | null {
        return this.taskMemory;
    }

    public completeStep(stepIndex: number, evidence?: string): void {
        if (this.taskMemory && this.taskMemory.steps[stepIndex]) {
            this.taskMemory.steps[stepIndex].status = 'COMPLETED';
            this.taskMemory.steps[stepIndex].evidence = evidence;
            this.taskMemory.currentStepIndex = stepIndex + 1;
            this.taskMemory.updatedAt = Date.now();
        }
    }

    // Checkpointing & Rollback
    public createCheckpoint(id: string, snapshot: any): void {
        this.checkpoints.push({ id, timestamp: Date.now(), snapshot });
        if (this.checkpoints.length > 10) {
            this.checkpoints.shift();
        }
    }

    public getCheckpoint(id: string): any | undefined {
        return this.checkpoints.find(c => c.id === id)?.snapshot;
    }

    // Invalidation on place change
    public invalidateForNewPlace(placeId: number | string, placeName: string): void {
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
