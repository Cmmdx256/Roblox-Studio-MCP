/**
 * PerformanceRealityEngine.ts
 *
 * Observes live DataModel performance metrics:
 * 1. Live Instance, Part, and unanchored part counts
 * 2. Script and UI node counts
 * 3. Runtime error/warning frequency
 * 4. Truthful FPS & Memory reporting (always 'UNAVAILABLE' unless live Stats service is queried)
 */
import { PerformanceRealityReport } from './types.js';
export declare class PerformanceRealityEngine {
    /**
     * Measure performance metrics from live Studio session.
     */
    measurePerformance(): Promise<PerformanceRealityReport>;
}
export declare const performanceRealityEngine: PerformanceRealityEngine;
//# sourceMappingURL=PerformanceRealityEngine.d.ts.map