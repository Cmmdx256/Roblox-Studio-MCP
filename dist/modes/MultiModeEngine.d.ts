import { AutonomousLoopState, AutonomousPhase, ModePermissions, OperatingMode } from './types.js';
export declare class MultiModeEngine {
    private currentMode;
    private transitionHistory;
    private autonomousState;
    private permissionsMap;
    getMode(): OperatingMode;
    getPermissions(): ModePermissions;
    setMode(newMode: OperatingMode, reason?: string, initiatedBy?: 'user' | 'autonomous_loop' | 'system'): void;
    startAutonomousLoop(goal: string, maxIterations?: number): void;
    advanceAutonomousPhase(outcome?: string): AutonomousPhase;
    pauseAutonomous(): void;
    resumeAutonomous(): void;
    stopAutonomous(): void;
    getAutonomousState(): AutonomousLoopState;
}
export declare const multiModeEngine: MultiModeEngine;
//# sourceMappingURL=MultiModeEngine.d.ts.map