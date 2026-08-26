import { ObservationCost } from '../providers/types.js';

export interface GlobalCapabilityMemoryEntry {
    id: string;
    intent: string;
    compiledCapabilityId: string;
    successRate: number;
    usageCount: number;
    lastUsed: number;
    preferredProviderChain: string[];
}

export interface ProjectConvention {
    scriptingStyle: 'OOP' | 'Functional' | 'ComponentBased' | 'Standard';
    replicatedStorageStructure: string[];
    serverStorageStructure: string[];
    namingConvention: 'camelCase' | 'PascalCase' | 'snake_case';
    frameworkUsed?: 'Knit' | 'Flamework' | 'Custom' | 'None';
}

export interface ProjectMemoryState {
    placeId: number | string;
    placeName: string;
    architectureSummary: string;
    conventions: ProjectConvention;
    activeSystems: string[];
    recentMutations: Array<{ target: string; action: string; timestamp: number }>;
    knownErrors: Array<{ error: string; scriptPath?: string; firstSeen: number }>;
}

export interface TaskStep {
    id: string;
    description: string;
    status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
    actionName?: string;
    evidence?: string;
    error?: string;
    dependencies?: string[];
}

export interface TaskMemoryState {
    taskId: string;
    goal: string;
    currentStepIndex: number;
    steps: TaskStep[];
    completedRequirements: string[];
    pendingRequirements: string[];
    startedAt: number;
    updatedAt: number;
}

export interface SessionMemoryState {
    studioInstanceId: string;
    sessionId: string;
    placeId: number | string;
    connectedAt: number;
    lastHeartbeat: number;
    lastDataModelHash?: string;
}

export interface StateDelta {
    addedInstances: string[];
    removedInstances: string[];
    modifiedProperties: Array<{ target: string; property: string; value: any }>;
    modifiedScripts: string[];
    timestamp: number;
}

export interface FocusedScriptContext {
    scriptPath: string;
    targetSymbol?: string;
    startLine: number;
    endLine: number;
    snippet: string;
    totalLines: number;
}

export interface TokenOptimizationMetrics {
    totalTokensSavedEstimate: number;
    cacheHits: number;
    compressedObservationsCount: number;
}
