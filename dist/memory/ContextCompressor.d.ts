import { FocusedScriptContext, TokenOptimizationMetrics } from './types.js';
import { ObservationCost } from '../providers/types.js';
export declare class ContextCompressor {
    private metrics;
    /**
     * Extracts a focused snippet of code around a target function or symbol instead of sending full 2000 lines.
     */
    extractFocusedScriptContext(source: string, targetSymbol?: string, scriptPath?: string, windowSize?: number): FocusedScriptContext;
    /**
     * Filters DataModel hierarchy according to ObservationCost level.
     */
    compressObservation(data: Record<string, any>, cost: ObservationCost): Record<string, any>;
    getMetrics(): TokenOptimizationMetrics;
}
export declare const contextCompressor: ContextCompressor;
//# sourceMappingURL=ContextCompressor.d.ts.map