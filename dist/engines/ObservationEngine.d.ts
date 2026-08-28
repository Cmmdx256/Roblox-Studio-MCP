import { ObservationCost } from '../providers/types.js';
export interface InstanceObservation {
    path: string;
    name: string;
    className: string;
    parent?: string;
    properties?: Record<string, any>;
    attributes?: Record<string, any>;
    tags?: string[];
    childCount?: number;
    children?: Array<{
        name: string;
        className: string;
        path: string;
    }>;
}
export interface ScriptObservation {
    path: string;
    className: string;
    totalLines: number;
    sourceSnippet?: string;
    targetSymbol?: string;
    startLine?: number;
    endLine?: number;
    hasErrors?: boolean;
}
export interface OutputObservation {
    logsCount: number;
    errorsCount: number;
    recentLogs: Array<{
        message: string;
        messageType: string;
        timestamp: number;
    }>;
    recentErrors: Array<{
        message: string;
        traceback?: string;
        timestamp: number;
    }>;
}
export interface StateObservationSnapshot {
    timestamp: number;
    cost: ObservationCost;
    scope: string;
    instances?: InstanceObservation[];
    scripts?: ScriptObservation[];
    selection?: string[];
    output?: OutputObservation;
    simulationMode?: string;
    sessionInfo?: any;
}
/**
 * ObservationEngine 2.0
 * Unified, structured, and relevance-controlled state observation system.
 * Prevents massive context dumps by enabling focused, partial queries.
 */
export declare class ObservationEngine {
    /**
     * Observes a specific target instance or container with specified cost/depth.
     */
    observeInstance(targetPath: string, cost?: ObservationCost): Promise<InstanceObservation | null>;
    /**
     * Observes script source focused around a symbol or line window.
     */
    observeScript(scriptPath: string, targetSymbol?: string, windowLines?: number): Promise<ScriptObservation | null>;
    /**
     * Observes current selection, output logs, and simulation state.
     */
    observeSessionState(): Promise<StateObservationSnapshot>;
}
export declare const observationEngine: ObservationEngine;
//# sourceMappingURL=ObservationEngine.d.ts.map