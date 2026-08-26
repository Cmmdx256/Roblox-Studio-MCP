import { OperatingMode } from '../providers/types.js';

export { OperatingMode };

export type AutonomousPhase = 
    | 'OBSERVE'
    | 'PLAN'
    | 'BUILD'
    | 'PLAYTEST'
    | 'VISUAL'
    | 'DEBUG'
    | 'OPTIMIZE'
    | 'VERIFY'
    | 'COMPLETE';

export interface ModeTransitionEvent {
    fromMode: OperatingMode;
    toMode: OperatingMode;
    timestamp: number;
    reason?: string;
    initiatedBy: 'user' | 'autonomous_loop' | 'system';
}

export interface ModePermissions {
    canMutateDataModel: boolean;
    canRunScripts: boolean;
    canStartPlaytest: boolean;
    canSpawnSubagents: boolean;
    canWriteFiles: boolean;
    requiresExplicitApproval: boolean;
}

export interface AutonomousLoopState {
    goal: string;
    currentPhase: AutonomousPhase;
    iteration: number;
    maxIterations: number;
    history: Array<{ phase: AutonomousPhase; timestamp: number; outcome?: string }>;
    isRunning: boolean;
    isPaused: boolean;
    lastError?: string;
}
