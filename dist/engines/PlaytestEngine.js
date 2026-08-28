import { commandDispatcher } from '../dispatcher/commandDispatcher.js';
import { capabilityRouter } from '../capabilities/CapabilityRouter.js';
import { evidenceEngine } from '../verification/EvidenceEngine.js';
/**
 * Detect what input capability is available in the current environment.
 * Truthful: standard Roblox/MCP environments return SIMULATED_INPUT_ONLY or INPUT_UNAVAILABLE.
 */
export function detectInputCapability() {
    // Roblox Studio MCP does not expose UserInputService injection
    // No official API exists for programmatic input in production environments
    // This must return an honest value — not REAL_INPUT_AVAILABLE
    return 'INPUT_UNAVAILABLE';
}
/**
 * PlaytestEngine handles automated gameplay scenario testing and simulation.
 * Manages simulation lifecycle, scenario execution, telemetry, and evidence collection.
 */
export class PlaytestEngine {
    /**
     * Starts the Studio simulation in Play or Run mode.
     */
    async startSimulation(mode = 'Play') {
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
        }
        catch (err) {
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
    async stopSimulation() {
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
        }
        catch (err) {
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
    async simulateInput(input) {
        console.error(`[PlaytestEngine] Requesting input simulation`);
        const startTime = Date.now();
        // Attempt routing to Official Studio MCP input tools
        try {
            if (input.keyboard && input.keyboard.length > 0) {
                const res = await capabilityRouter.route('user_keyboard_input', { keys: input.keyboard });
                if (res.status === 'SUCCESS')
                    return res;
            }
            if (input.mouse) {
                const res = await capabilityRouter.route('user_mouse_input', input.mouse);
                if (res.status === 'SUCCESS')
                    return res;
            }
            if (input.navigation) {
                const res = await capabilityRouter.route('character_navigation', { destination: input.navigation.targetPosition });
                if (res.status === 'SUCCESS')
                    return res;
            }
        }
        catch (err) {
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
    async captureScreen() {
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
        }
        catch (err) {
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
    async runScenario(scenario) {
        console.error(`[PlaytestEngine] Running scenario: ${scenario.name} (${scenario.steps.length} steps)`);
        const startTime = Date.now();
        const evidence = [];
        const stepResults = [];
        const scenarioErrors = [];
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
            let observedLog;
            let stepError;
            try {
                // If the step requests a specific action
                if (step.action && step.action !== 'WAIT' && step.action !== 'OBSERVE') {
                    const res = await commandDispatcher.executeCommand(step.action, step.params || {});
                    stepSuccess = Boolean(res && res.success);
                }
                // Check logs if expected
                if (step.expectLog && commandDispatcher.isStudioConnected()) {
                    const logs = await commandDispatcher.getRecentLogs(20);
                    const found = logs.some(l => l.message.toLowerCase().includes(step.expectLog.toLowerCase()));
                    if (!found) {
                        stepSuccess = false;
                        stepError = `Expected log '${step.expectLog}' not observed in Studio output.`;
                    }
                    else {
                        observedLog = step.expectLog;
                    }
                }
                // Check error isolation if requested
                if (step.expectNoError && commandDispatcher.isStudioConnected()) {
                    const recentErrors = await commandDispatcher.getRecentErrors(5);
                    const newErrors = recentErrors.filter((e) => e.message && !initialErrors.some((ie) => ie.message === e.message));
                    if (newErrors.length > 0) {
                        const errMsg = newErrors[0].message || 'Unknown runtime error';
                        stepSuccess = false;
                        stepError = `Runtime error occurred during step: ${errMsg}`;
                        scenarioErrors.push(errMsg);
                    }
                }
                const stepEv = evidenceEngine.recordTestResult(`${scenario.name}: Step ${i + 1} (${step.action})`, stepSuccess, { stepIndex: i, durationMs: Date.now() - stepStart, error: stepError });
                evidence.push(stepEv);
                stepResults.push({
                    stepIndex: i + 1,
                    action: step.action,
                    success: stepSuccess,
                    observedLog,
                    evidence: stepEv,
                    error: stepError
                });
                if (stepSuccess)
                    stepsPassed++;
            }
            catch (err) {
                stepSuccess = false;
                const catchErrMsg = err.message || 'Step execution failed';
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
//# sourceMappingURL=PlaytestEngine.js.map