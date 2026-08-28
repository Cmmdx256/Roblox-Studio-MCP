import { commandDispatcher } from '../dispatcher/commandDispatcher.js';
import { studioStateGraph } from '../state/StudioStateGraph.js';
import { projectKnowledgeGraph } from '../state/ProjectKnowledgeGraph.js';
export class PerformanceEngine {
    /**
     * Evaluates game runtime performance budget from live Studio DataModel or cached Knowledge Graph.
     */
    async evaluatePerformance(explicitStats) {
        let total = 0;
        let unanchored = 0;
        let heavyConn = 0;
        let isLive = false;
        if (explicitStats && explicitStats.totalInstances !== undefined) {
            total = explicitStats.totalInstances;
            unanchored = explicitStats.unanchoredParts || 0;
            heavyConn = explicitStats.renderSteppedCount || 0;
        }
        else if (commandDispatcher.isStudioConnected()) {
            isLive = true;
            try {
                const res = await commandDispatcher.executeCommand('execute_luau', {
                    code: `
                        local total = #game:GetDescendants()
                        local unanchored = 0
                        for _, desc in ipairs(workspace:GetDescendants()) do
                            if desc:IsA("BasePart") and not desc.Anchored then
                                unanchored = unanchored + 1
                            end
                        end
                        return { total = total, unanchored = unanchored }
                    `,
                    datamodel_type: 'Edit'
                });
                if (res && res.total !== undefined) {
                    total = res.total;
                    unanchored = res.unanchored || 0;
                }
            }
            catch {
                // Fallback to state graph
            }
        }
        if (total === 0) {
            // Read from cached State Graph and Knowledge Graph
            const snapshot = studioStateGraph.getStateSnapshot();
            const graphStats = projectKnowledgeGraph.getStats();
            total = Object.keys(snapshot.cachedNodes || {}).length || graphStats.totalNodes;
        }
        const warnings = [];
        const recommendations = [];
        let score = 100;
        if (total > 15000) {
            score -= 20;
            warnings.push(`High instance count (${total}). May cause low-end mobile frame drops.`);
            recommendations.push('Enable StreamingEnabled and group static props into models with CastShadow disabled.');
        }
        else if (total === 0) {
            warnings.push('No instance telemetry available. Performance report calculated from baseline.');
        }
        if (unanchored > 50) {
            score -= 15;
            warnings.push(`High unanchored parts count (${unanchored}). Physics solver overhead.`);
            recommendations.push('Anchor all decorative parts (Anchored = true, CanCollide = false where feasible).');
        }
        if (heavyConn > 5) {
            score -= 10;
            warnings.push(`Multiple high-frequency render connections detected (${heavyConn}).`);
            recommendations.push('Throttle UI and cosmetic updates using dt accumulator or task.wait().');
        }
        return {
            score: Math.max(0, score),
            measuredLive: isLive,
            instanceCount: total,
            unanchoredPartsCount: unanchored,
            heavyConnectionsCount: heavyConn,
            physicsBudgetValid: unanchored <= 50,
            renderingBudgetValid: total <= 15000,
            warnings,
            recommendations
        };
    }
}
export const performanceEngine = new PerformanceEngine();
//# sourceMappingURL=PerformanceEngine.js.map