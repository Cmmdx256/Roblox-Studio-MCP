import { ExecutionResult, Evidence } from '../providers/types.js';
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
export type PlaytestInputCapability = 'REAL_INPUT_AVAILABLE' | 'SIMULATED_INPUT_ONLY' | 'INPUT_UNAVAILABLE';
/**
 * Detect what input capability is available in the current environment.
 * Truthful: standard Roblox/MCP environments return SIMULATED_INPUT_ONLY or INPUT_UNAVAILABLE.
 */
export declare function detectInputCapability(): PlaytestInputCapability;
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
export declare class PlaytestEngine {
    /**
     * Starts the Studio simulation in Play or Run mode.
     */
    startSimulation(mode?: 'Play' | 'Run'): Promise<ExecutionResult>;
    /**
     * Stops the active simulation.
     */
    stopSimulation(): Promise<ExecutionResult>;
    /**
     * Simulates player input.
     * Respects Roblox platform security boundary — routes to Official MCP if available,
     * otherwise returns BLOCKED_BY_PLATFORM.
     */
    simulateInput(input: {
        keyboard?: Array<{
            key: string;
            durationMs?: number;
        }>;
        mouse?: {
            x: number;
            y: number;
            click?: boolean;
        };
        navigation?: {
            targetPosition: [number, number, number];
        };
    }): Promise<ExecutionResult>;
    /**
     * Captures a screenshot of the simulation via Official MCP screen capture.
     * Returns UNAVAILABLE if no vision provider is connected.
     */
    captureScreen(): Promise<{
        screenshotUrl?: string;
        base64?: string;
        timestamp: number;
        status: 'CAPTURED' | 'UNAVAILABLE';
    }>;
    /**
     * Runs a complex automated scenario with evidence collection and error checking.
     */
    runScenario(scenario: PlaytestScenarioSpec): Promise<PlaytestScenarioReport>;
}
export declare const playtestEngine: PlaytestEngine;
//# sourceMappingURL=PlaytestEngine.d.ts.map