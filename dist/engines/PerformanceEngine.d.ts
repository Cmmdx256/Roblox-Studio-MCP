export interface PerformanceAuditReport {
    score: number;
    instanceCountEstimate: number;
    unanchoredPartsCount: number;
    heavyConnectionsCount: number;
    warnings: string[];
    recommendations: string[];
}
export declare class PerformanceEngine {
    /**
     * Evaluates game runtime performance budget and structural complexity.
     */
    evaluatePerformance(stats: {
        totalInstances?: number;
        unanchoredParts?: number;
        renderSteppedCount?: number;
    }): PerformanceAuditReport;
}
export declare const performanceEngine: PerformanceEngine;
//# sourceMappingURL=PerformanceEngine.d.ts.map