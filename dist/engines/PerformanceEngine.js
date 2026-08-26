export class PerformanceEngine {
    /**
     * Evaluates game runtime performance budget and structural complexity.
     */
    evaluatePerformance(stats) {
        const total = stats.totalInstances ?? 1200;
        const unanchored = stats.unanchoredParts ?? 15;
        const heavyConn = stats.renderSteppedCount ?? 2;
        const warnings = [];
        const recommendations = [];
        let score = 95;
        if (total > 15000) {
            score -= 20;
            warnings.push(`High instance count (${total}). May cause low-end mobile frame drops.`);
            recommendations.push('Use StreamingEnabled and group static geometry into Models with CastShadow disabled on small details.');
        }
        if (unanchored > 100) {
            score -= 15;
            warnings.push(`High number of unanchored physical parts (${unanchored}). Physics solver overhead.`);
            recommendations.push('Anchor all decorative parts (Anchored = true, CanCollide = false where feasible).');
        }
        if (heavyConn > 10) {
            score -= 10;
            warnings.push(`Multiple RenderStepped connections detected (${heavyConn}).`);
            recommendations.push('Throttle UI and cosmetic updates using dt accumulator or task.wait().');
        }
        return {
            score: Math.max(0, score),
            instanceCountEstimate: total,
            unanchoredPartsCount: unanchored,
            heavyConnectionsCount: heavyConn,
            warnings,
            recommendations
        };
    }
}
export const performanceEngine = new PerformanceEngine();
//# sourceMappingURL=PerformanceEngine.js.map