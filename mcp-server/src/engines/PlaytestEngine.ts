import { ExecutionResult, Evidence } from '../providers/types.js';
import { commandDispatcher } from '../dispatcher/commandDispatcher.js';
import { capabilityRouter } from '../capabilities/CapabilityRouter.js';
import { evidenceEngine } from '../verification/EvidenceEngine.js';

/**
 * PlaytestInputCapability (P4 — Phase 9)
 *
 * RULE 0: Never claim "player pressed E" unless Roblox actually processed the input.
 * Roblox does NOT expose a public API for programmatic input injection in production.
 * The PlaytestEngine must declare which level of input it can provide.
 *
 * REAL_INPUT_AVAILABLE:    Official Roblox API or plugin supports input injection (currently UNAVAILABLE in standard Roblox).
 * SIMULATED_INPUT_ONLY:    Internal state mutations only — not real player input.
 * INPUT_UNAVAILABLE:       No input mechanism available in this environment.
 */
export type PlaytestInputCapability =
    | 'REAL_INPUT_AVAILABLE'
    | 'SIMULATED_INPUT_ONLY'
    | 'INPUT_UNAVAILABLE';

/**
 * Detect what input capability is available in the current environment.
 * Truthful: standard Roblox/MCP environments return SIMULATED_INPUT_ONLY or INPUT_UNAVAILABLE.
 */
export function detectInputCapability(): PlaytestInputCapability {
    // Roblox Studio MCP does not expose UserInputService injection
    // No official API exists for programmatic input in production environments
    // This must return an honest value — not REAL_INPUT_AVAILABLE
    return 'INPUT_UNAVAILABLE';
}


export interface PlaytestStepSpec {
    action: string;
    params?: any;
    waitSeconds?: number;
    expectLog?: string;
    expectNoError?: boolean;
    expectedCondition?: string;
}

export interface PlaytestScenarioSpec {
    name: string;
    description?: string;
    mode?: 'Play' | 'Run';
    steps: PlaytestStepSpec[];
}

export interface PlaytestScenarioReport {
    scenario: string;
    passed: boolean;
    durationMs: number;
    stepsCompleted: number;
    totalSteps: number;
    stepResults: Array<{
        stepIndex: number;
        action: string;
        success: boolean;
        observedLog?: string;
        evidence?: Evidence;
        error?: string;
    }>;
    evidence: Evidence[];
    errors: string[];
    logsCollected: number;
    status: 'PASS' | 'FAIL' | 'BLOCKED' | 'UNVERIFIED';
    blockedReason?: string;
}

/**
 * PlaytestEngine handles automated gameplay scenario testing and simulation.
 * Manages simulation lifecycle, scenario execution, telemetry, and evidence collection.
 */
export class PlaytestEngine {
    /**
     * Starts the Studio simulation in Play or Run mode.
     */
    public async startSimulation(mode: 'Play' | 'Run' = 'Play'): Promise<ExecutionResult> {
        console.error(`[PlaytestEngine] Starting simulation in ${mode} mode`);
        const startTime = Date.now();

        try {
            if (commandDispatcher.isStudioConnected()) {
                const res = await capabilityRouter.route('playtest.start', { mode });
                return res;
            }

            return {
                status: 'PARTIAL',
                verified: false,
                code: 'BLOCKED_BY_PLATFORM',
                provider: 'playtest-engine',
                tool: 'playtest.start',
                changes: [],
                evidence: [],
                warnings: ['CAPABILITY_STATUS: BLOCKED_BY_PLATFORM'],
                errors: ['No live Studio session is available; playtest was not queued or simulated.'],
                duration: Date.now() - startTime
            };
        } catch (err: any) {
            return {
                status: 'ERROR',
                verified: false,
                provider: 'playtest-engine',
                tool: 'playtest.start',
                changes: [],
                evidence: [],
                warnings: [],
                errors: [err.message || 'Failed to start simulation'],
                duration: Date.now() - startTime
            };
        }
    }

    /**
     * Stops the active simulation.
     */
    public async stopSimulation(): Promise<ExecutionResult> {
        console.error(`[PlaytestEngine] Stopping simulation`);
        const startTime = Date.now();

        try {
            if (commandDispatcher.isStudioConnected()) {
                const res = await capabilityRouter.route('playtest.stop', {});
                return res;
            }

            return {
                status: 'PARTIAL',
                verified: false,
                code: 'BLOCKED_BY_PLATFORM',
                provider: 'playtest-engine',
                tool: 'playtest.stop',
                changes: [],
                evidence: [],
                warnings: ['CAPABILITY_STATUS: BLOCKED_BY_PLATFORM'],
                errors: ['No live Studio session is available; there is no running playtest to stop.'],
                duration: Date.now() - startTime
            };
        } catch (err: any) {
            return {
                status: 'ERROR',
                verified: false,
                provider: 'playtest-engine',
                tool: 'playtest.stop',
                changes: [],
                evidence: [],
                warnings: [],
                errors: [err.message || 'Failed to stop simulation'],
                duration: Date.now() - startTime
            };
        }
    }

    /**
     * Simulates player input.
     * Respects Roblox platform security boundary — routes to Official MCP if available,
     * otherwise returns BLOCKED_BY_PLATFORM.
     */
    public async simulateInput(input: { 
        keyboard?: Array<{ key: string; durationMs?: number }>; 
        mouse?: { x: number; y: number; click?: boolean }; 
        navigation?: { targetPosition: [number, number, number] };
    }): Promise<ExecutionResult> {
        console.error(`[PlaytestEngine] Requesting input simulation`);
        const startTime = Date.now();

        // Attempt routing to Official Studio MCP input tools
        try {
            if (input.keyboard && input.keyboard.length > 0) {
                const res = await capabilityRouter.route('user_keyboard_input', { keys: input.keyboard });
                if (res.status === 'SUCCESS') return res;
            }
            if (input.mouse) {
                const res = await capabilityRouter.route('user_mouse_input', input.mouse);
                if (res.status === 'SUCCESS') return res;
            }
            if (input.navigation) {
                const res = await capabilityRouter.route('character_navigation', { destination: input.navigation.targetPosition });
                if (res.status === 'SUCCESS') return res;
            }
        } catch (err) {
            // Official MCP not running
        }

        // Platform limitation explanation (never fake hardware input)
        return {
            status: 'ERROR',
            verified: false,
            provider: 'playtest-engine',
            tool: 'simulate_input',
            changes: [],
            evidence: [],
            warnings: ['CAPABILITY_STATUS: BLOCKED_BY_PLATFORM'],
            errors: ['Direct hardware input simulation requires Official Roblox Studio MCP Stdio connection. Plugin HTTP bridge does not have OS-level input synthesis permissions.'],
            duration: Date.now() - startTime
        };
    }

    /**
     * Captures a screenshot of the simulation via Official MCP screen capture.
     * Returns UNAVAILABLE if no vision provider is connected.
     */
    public async captureScreen(): Promise<{ screenshotUrl?: string; base64?: string; timestamp: number; status: 'CAPTURED' | 'UNAVAILABLE' }> {
        console.error(`[PlaytestEngine] Requesting screen capture`);
        try {
            const res = await capabilityRouter.route('screen_capture', {});
            if (res.status === 'SUCCESS' && res.data) {
                return {
                    screenshotUrl: res.data.url,
                    base64: res.data.base64,
                    timestamp: Date.now(),
                    status: 'CAPTURED'
                };
            }
        } catch (err) {
            // Screen capture not available
        }

        return {
            timestamp: Date.now(),
            status: 'UNAVAILABLE'
        };
    }

    /**
     * Runs a complex automated scenario with evidence collection and error checking.
     */
    public async runScenario(scenario: PlaytestScenarioSpec): Promise<PlaytestScenarioReport> {
        console.error(`[PlaytestEngine] Running scenario: ${scenario.name} (${scenario.steps.length} steps)`);
        const startTime = Date.now();
        const evidence: Evidence[] = [];
        const stepResults: PlaytestScenarioReport['stepResults'] = [];
        const scenarioErrors: string[] = [];

        if (!commandDispatcher.isStudioConnected()) {
            return {
                scenario: scenario.name,
                passed: false,
                status: 'BLOCKED',
                blockedReason: 'BLOCKED_BY_PLATFORM: Roblox Studio session is unavailable; a live playtest cannot be substituted with a local simulation.',
                durationMs: Date.now() - startTime,
                stepsCompleted: 0,
                totalSteps: scenario.steps.length,
                stepResults: scenario.steps.map((step, index) => ({ stepIndex: index + 1, action: step.action, success: false, error: 'BLOCKED_BY_PLATFORM' })),
                evidence: [],
                errors: ['BLOCKED_BY_PLATFORM: Roblox Studio session is unavailable.'],
                logsCollected: 0,
            };
        }

        // 1. Start simulation
        await this.startSimulation(scenario.mode || 'Play');

        // 2. Clear pre-existing error buffer to isolate test run
        const initialErrors = commandDispatcher.isStudioConnected() 
            ? await commandDispatcher.getRecentErrors(10) 
            : [];

        // 3. Execute scenario steps
        let stepsPassed = 0;
        for (let i = 0; i < scenario.steps.length; i++) {
            const step = scenario.steps[i];
            const stepStart = Date.now();
            let stepSuccess = true;
            let observedLog: string | undefined;
            let stepError: string | undefined;

            try {
                // If the step requests a specific action
                if (step.action && step.action !== 'WAIT' && step.action !== 'OBSERVE') {
                    const res = await commandDispatcher.executeCommand(step.action, step.params || {});
                    stepSuccess = Boolean(res && (res as any).success);
                }

                // Check logs if expected
                if (step.expectLog && commandDispatcher.isStudioConnected()) {
                    const logs = await commandDispatcher.getRecentLogs(20);
                    const found = logs.some(l => l.message.toLowerCase().includes(step.expectLog!.toLowerCase()));
                    if (!found) {
                        stepSuccess = false;
                        stepError = `Expected log '${step.expectLog}' not observed in Studio output.`;
                    } else {
                        observedLog = step.expectLog;
                    }
                }

                // Check error isolation if requested
                if (step.expectNoError && commandDispatcher.isStudioConnected()) {
                    const recentErrors = await commandDispatcher.getRecentErrors(5);
                    const newErrors = recentErrors.filter((e: any) => e.message && !initialErrors.some((ie: any) => ie.message === e.message));
                    if (newErrors.length > 0) {
                        const errMsg: string = newErrors[0].message || 'Unknown runtime error';
                        stepSuccess = false;
                        stepError = `Runtime error occurred during step: ${errMsg}`;
                        scenarioErrors.push(errMsg);
                    }
                }

                const stepEv = evidenceEngine.recordTestResult(
                    `${scenario.name}: Step ${i + 1} (${step.action})`,
                    stepSuccess,
                    { stepIndex: i, durationMs: Date.now() - stepStart, error: stepError }
                );
                evidence.push(stepEv);

                stepResults.push({
                    stepIndex: i + 1,
                    action: step.action,
                    success: stepSuccess,
                    observedLog,
                    evidence: stepEv,
                    error: stepError
                });

                if (stepSuccess) stepsPassed++;

            } catch (err: any) {
                stepSuccess = false;
                const catchErrMsg: string = err.message || 'Step execution failed';
                stepError = catchErrMsg;
                scenarioErrors.push(catchErrMsg);

                stepResults.push({
                    stepIndex: i + 1,
                    action: step.action,
                    success: false,
                    error: catchErrMsg
                });
            }
        }

        // 4. Stop simulation
        await this.stopSimulation();

        const logs = commandDispatcher.isStudioConnected() 
            ? await commandDispatcher.getRecentLogs(50) 
            : [];

        const overallPassed = stepsPassed === scenario.steps.length && scenarioErrors.length === 0;

        return {
            scenario: scenario.name,
            passed: overallPassed,
            durationMs: Date.now() - startTime,
            stepsCompleted: stepsPassed,
            totalSteps: scenario.steps.length,
            stepResults,
            evidence,
            errors: scenarioErrors,
            logsCollected: logs.length,
            status: overallPassed ? 'PASS' : 'FAIL',
        };
    }
}

export const playtestEngine = new PlaytestEngine();
