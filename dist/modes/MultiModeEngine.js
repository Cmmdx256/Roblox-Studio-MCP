import { OperatingMode } from './types.js';
export class MultiModeEngine {
    currentMode = OperatingMode.CHAT;
    transitionHistory = [];
    autonomousState = {
        goal: '',
        currentPhase: 'OBSERVE',
        iteration: 0,
        maxIterations: 10,
        history: [],
        isRunning: false,
        isPaused: false
    };
    permissionsMap = {
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
    getMode() {
        return this.currentMode;
    }
    getPermissions() {
        return this.permissionsMap[this.currentMode];
    }
    setMode(newMode, reason, initiatedBy = 'user') {
        if (this.currentMode === newMode)
            return;
        const event = {
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
    startAutonomousLoop(goal, maxIterations = 10) {
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
    advanceAutonomousPhase(outcome) {
        if (!this.autonomousState.isRunning || this.autonomousState.isPaused) {
            return this.autonomousState.currentPhase;
        }
        const phaseSequence = [
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
        let nextPhase = 'COMPLETE';
        if (currentIndex >= 0 && currentIndex < phaseSequence.length - 1) {
            nextPhase = phaseSequence[currentIndex + 1];
        }
        else if (this.autonomousState.currentPhase === 'DEBUG') {
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
    pauseAutonomous() {
        this.autonomousState.isPaused = true;
    }
    resumeAutonomous() {
        this.autonomousState.isPaused = false;
    }
    stopAutonomous() {
        this.autonomousState.isRunning = false;
        this.setMode(OperatingMode.CHAT, 'Autonomous task cancelled by user', 'user');
    }
    getAutonomousState() {
        return { ...this.autonomousState };
    }
}
export const multiModeEngine = new MultiModeEngine();
//# sourceMappingURL=MultiModeEngine.js.map