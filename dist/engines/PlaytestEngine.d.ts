import { ExecutionResult, Evidence } from '../providers/types.js';
/**
 * PlaytestEngine handles automated gameplay scenario testing and simulation.
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
     * Captures a screenshot of the simulation.
     */
    captureScreen(): Promise<{
        screenshotUrl?: string;
        base64?: string;
        timestamp: number;
    }>;
    /**
     * Runs a complex automated scenario.
     */
    runScenario(scenario: {
        name: string;
        steps: Array<{
            action: string;
            params: any;
            waitSeconds?: number;
            expectLog?: string;
            expectNoError?: boolean;
        }>;
    }): Promise<{
        scenario: string;
        passed: boolean;
        stepResults: any[];
        evidence: Evidence[];
        errors: string[];
    }>;
}
export declare const playtestEngine: PlaytestEngine;
//# sourceMappingURL=PlaytestEngine.d.ts.map