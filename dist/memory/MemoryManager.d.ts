import { GlobalCapabilityMemoryEntry, ProjectMemoryState, TaskMemoryState } from './types.js';
export declare class MemoryManager {
    private globalCapabilities;
    private projectMemory;
    private taskMemory;
    private sessionMemory;
    private checkpoints;
    recordCapabilitySuccess(intent: string, compiledId: string, providerChain: string[]): void;
    getGlobalCapability(intent: string): GlobalCapabilityMemoryEntry | undefined;
    updateProject(info: Partial<ProjectMemoryState>): void;
    getProject(): ProjectMemoryState;
    recordMutation(target: string, action: string): void;
    startTask(taskId: string, goal: string, steps?: string[]): TaskMemoryState;
    getTask(): TaskMemoryState | null;
    completeStep(stepIndex: number, evidence?: string): void;
    createCheckpoint(id: string, snapshot: any): void;
    getCheckpoint(id: string): any | undefined;
    invalidateForNewPlace(placeId: number | string, placeName: string): void;
}
export declare const memoryManager: MemoryManager;
//# sourceMappingURL=MemoryManager.d.ts.map