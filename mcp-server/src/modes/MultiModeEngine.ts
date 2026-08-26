import { AutonomousLoopState, AutonomousPhase, ModePermissions, ModeTransitionEvent, OperatingMode } from './types.js';

export class MultiModeEngine {
    private currentMode: OperatingMode = OperatingMode.CHAT;
    private transitionHistory: ModeTransitionEvent[] = [];
    private autonomousState: AutonomousLoopState = {
        goal: '',
        currentPhase: 'OBSERVE',
        iteration: 0,
        maxIterations: 10,
        history: [],
        isRunning: false,
        isPaused: false
    };

    private permissionsMap: Record<OperatingMode, ModePermissions> = {
        [OperatingMode.CHAT]: {
            canMutateDataModel: false,
            canRunScripts: false,
            canStartPlaytest: false,
            canSpawnSubagents: true,
            canWriteFiles: false,
            requiresExplicitApproval: false
        },
        [OperatingMode.OBSERVE]: {
            canMutateDataModel: false,
            canRunScripts: false,
            canStartPlaytest: false,
            canSpawnSubagents: true,
            canWriteFiles: false,
            requiresExplicitApproval: false
        },
        [OperatingMode.PLAN]: {
            canMutateDataModel: false,
            canRunScripts: false,
            canStartPlaytest: false,
            canSpawnSubagents: true,
            canWriteFiles: true,
            requiresExplicitApproval: false
        },
        [OperatingMode.BUILD]: {
            canMutateDataModel: true,
            canRunScripts: true,
            canStartPlaytest: false,
            canSpawnSubagents: true,
            canWriteFiles: true,
            requiresExplicitApproval: false
        },
        [OperatingMode.PLAYTEST]: {
            canMutateDataModel: false,
            canRunScripts: true,
            canStartPlaytest: true,
            canSpawnSubagents: true,
            canWriteFiles: false,
            requiresExplicitApproval: false
        },
        [OperatingMode.VISUAL]: {
            canMutateDataModel: false,
            canRunScripts: false,
            canStartPlaytest: false,
            canSpawnSubagents: true,
            canWriteFiles: false,
            requiresExplicitApproval: false
        },
        [OperatingMode.DEBUG]: {
            canMutateDataModel: true,
            canRunScripts: true,
            canStartPlaytest: true,
            canSpawnSubagents: true,
            canWriteFiles: true,
            requiresExplicitApproval: false
        },
        [OperatingMode.OPTIMIZE]: {
            canMutateDataModel: true,
            canRunScripts: false,
            canStartPlaytest: false,
            canSpawnSubagents: true,
            canWriteFiles: false,
            requiresExplicitApproval: false
        },
        [OperatingMode.VERIFY]: {
            canMutateDataModel: false,
            canRunScripts: true,
            canStartPlaytest: true,
            canSpawnSubagents: true,
            canWriteFiles: false,
            requiresExplicitApproval: false
        },
        [OperatingMode.AUTONOMOUS]: {
            canMutateDataModel: true,
            canRunScripts: true,
            canStartPlaytest: true,
            canSpawnSubagents: true,
            canWriteFiles: true,
            requiresExplicitApproval: false
        }
    };

    public getMode(): OperatingMode {
        return this.currentMode;
    }

    public getPermissions(): ModePermissions {
        return this.permissionsMap[this.currentMode];
    }

    public setMode(newMode: OperatingMode, reason?: string, initiatedBy: 'user' | 'autonomous_loop' | 'system' = 'user'): void {
        if (this.currentMode === newMode) return;

        const event: ModeTransitionEvent = {
            fromMode: this.currentMode,
            toMode: newMode,
            timestamp: Date.now(),
            reason,
            initiatedBy
        };

        this.transitionHistory.push(event);
        console.error(`[MultiModeEngine] Mode transitioned: ${this.currentMode} -> ${newMode} (reason: ${reason || 'unspecified'})`);
        this.currentMode = newMode;
    }

    public startAutonomousLoop(goal: string, maxIterations = 10): void {
        this.autonomousState = {
            goal,
            currentPhase: 'OBSERVE',
            iteration: 1,
            maxIterations,
            history: [{ phase: 'OBSERVE', timestamp: Date.now() }],
            isRunning: true,
            isPaused: false
        };
        this.setMode(OperatingMode.AUTONOMOUS, `Started autonomous goal: ${goal}`, 'autonomous_loop');
    }

    public advanceAutonomousPhase(outcome?: string): AutonomousPhase {
        if (!this.autonomousState.isRunning || this.autonomousState.isPaused) {
            return this.autonomousState.currentPhase;
        }

        const phaseSequence: AutonomousPhase[] = [
            'OBSERVE',
            'PLAN',
            'BUILD',
            'PLAYTEST',
            'VISUAL',
            'DEBUG',
            'BUILD',
            'VERIFY',
            'COMPLETE'
        ];

        const currentIndex = phaseSequence.indexOf(this.autonomousState.currentPhase);
        let nextPhase: AutonomousPhase = 'COMPLETE';

        if (currentIndex >= 0 && currentIndex < phaseSequence.length - 1) {
            nextPhase = phaseSequence[currentIndex + 1];
        } else if (this.autonomousState.currentPhase === 'DEBUG') {
            // Self healing loop back to BUILD
            nextPhase = 'BUILD';
        }

        this.autonomousState.currentPhase = nextPhase;
        this.autonomousState.history.push({ phase: nextPhase, timestamp: Date.now(), outcome });

        if (nextPhase === 'COMPLETE') {
            this.autonomousState.isRunning = false;
            this.setMode(OperatingMode.CHAT, 'Autonomous task completed', 'autonomous_loop');
        }

        console.error(`[MultiModeEngine] Autonomous phase advanced to: ${nextPhase}`);
        return nextPhase;
    }

    public pauseAutonomous(): void {
        this.autonomousState.isPaused = true;
    }

    public resumeAutonomous(): void {
        this.autonomousState.isPaused = false;
    }

    public stopAutonomous(): void {
        this.autonomousState.isRunning = false;
        this.setMode(OperatingMode.CHAT, 'Autonomous task cancelled by user', 'user');
    }

    public getAutonomousState(): AutonomousLoopState {
        return { ...this.autonomousState };
    }
}

export const multiModeEngine = new MultiModeEngine();
