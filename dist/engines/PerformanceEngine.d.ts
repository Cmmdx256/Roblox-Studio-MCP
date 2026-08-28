export interface PerformanceAuditReport {
    score: number;
    measuredLive: boolean;
    instanceCount: number;
    unanchoredPartsCount: number;
    heavyConnectionsCount: number;
    physicsBudgetValid: boolean;
    renderingBudgetValid: boolean;
    warnings: string[];
    recommendations: string[];
}
export declare class PerformanceEngine {
    /**
     * Evaluates game runtime performance budget from live Studio DataModel or cached Knowledge Graph.
     */
    evaluatePerformance(explicitStats?: {
        totalInstances?: number;
        unanchoredParts?: number;
        renderSteppedCount?: number;
    }): Promise<PerformanceAuditReport>;
}
export declare const performanceEngine: PerformanceEngine;
//# sourceMappingURL=PerformanceEngine.d.ts.map