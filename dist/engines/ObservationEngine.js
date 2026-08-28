import { commandDispatcher } from '../dispatcher/commandDispatcher.js';
import { ObservationCost } from '../providers/types.js';
/**
 * ObservationEngine 2.0
 * Unified, structured, and relevance-controlled state observation system.
 * Prevents massive context dumps by enabling focused, partial queries.
 */
export class ObservationEngine {
    /**
     * Observes a specific target instance or container with specified cost/depth.
     */
    async observeInstance(targetPath, cost = ObservationCost.NORMAL) {
        try {
            const rawMeta = await commandDispatcher.executeCommand('instance_get_details', { path: targetPath, target: targetPath });
            if (!rawMeta || rawMeta.error)
                return null;
            const obs = {
                path: targetPath,
                name: rawMeta.name || rawMeta.Name || targetPath.split('.').pop() || 'Unknown',
                className: rawMeta.className || rawMeta.ClassName || 'Instance',
                parent: rawMeta.parent || rawMeta.Parent
            };
            if (cost === ObservationCost.CHEAP) {
                obs.childCount = Array.isArray(rawMeta.children) ? rawMeta.children.length : (rawMeta.childCount || 0);
                return obs;
            }
            // Normal and higher: fetch properties & attributes
            if (cost === ObservationCost.NORMAL || cost === ObservationCost.DEEP || cost === ObservationCost.FULL) {
                try {
                    const attrs = await commandDispatcher.executeCommand('attribute_get_all', { path: targetPath, target: targetPath });
                    obs.attributes = attrs?.attributes || attrs || {};
                }
                catch { }
                try {
                    const tags = await commandDispatcher.executeCommand('tag_get_all', { path: targetPath, target: targetPath });
                    obs.tags = Array.isArray(tags) ? tags : (tags?.tags || []);
                }
                catch { }
            }
            if (cost === ObservationCost.DEEP || cost === ObservationCost.FULL) {
                try {
                    const tree = await commandDispatcher.executeCommand('studio_get_tree', { rootPath: targetPath, maxDepth: 2 });
                    if (tree && Array.isArray(tree.children)) {
                        obs.children = tree.children.map((c) => ({
                            name: c.name,
                            className: c.className,
                            path: `${targetPath}.${c.name}`
                        }));
                        obs.childCount = obs.children?.length || 0;
                    }
                }
                catch { }
            }
            return obs;
        }
        catch (err) {
            console.error(`[ObservationEngine] Error observing ${targetPath}:`, err.message || err);
            return null;
        }
    }
    /**
     * Observes script source focused around a symbol or line window.
     */
    async observeScript(scriptPath, targetSymbol, windowLines = 40) {
        try {
            const res = await commandDispatcher.executeCommand('script_get_source', { path: scriptPath, target: scriptPath });
            const source = typeof res === 'string' ? res : (res?.source || '');
            if (!source && source !== '')
                return null;
            const lines = source.split('\n');
            const totalLines = lines.length;
            if (!targetSymbol || totalLines <= windowLines) {
                return {
                    path: scriptPath,
                    className: 'Script',
                    totalLines,
                    sourceSnippet: source.slice(0, 4000),
                    startLine: 1,
                    endLine: Math.min(totalLines, windowLines)
                };
            }
            // Find matching symbol
            let matchLine = 0;
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes(targetSymbol)) {
                    matchLine = i + 1;
                    break;
                }
            }
            if (matchLine === 0)
                matchLine = 1;
            const half = Math.floor(windowLines / 2);
            const start = Math.max(1, matchLine - half);
            const end = Math.min(totalLines, matchLine + half);
            const snippet = lines.slice(start - 1, end).join('\n');
            return {
                path: scriptPath,
                className: 'Script',
                totalLines,
                targetSymbol,
                startLine: start,
                endLine: end,
                sourceSnippet: snippet
            };
        }
        catch {
            return null;
        }
    }
    /**
     * Observes current selection, output logs, and simulation state.
     */
    async observeSessionState() {
        const sessionInfo = commandDispatcher.getSessionInfo();
        const logs = commandDispatcher.getRecentLogs(20);
        const errors = commandDispatcher.getRecentErrors(10);
        let selection = [];
        try {
            const selRes = await commandDispatcher.executeCommand('selection_get', {});
            selection = Array.isArray(selRes) ? selRes : (selRes?.selection || []);
        }
        catch { }
        return {
            timestamp: Date.now(),
            cost: ObservationCost.NORMAL,
            scope: 'Session',
            selection,
            output: {
                logsCount: logs.length,
                errorsCount: errors.length,
                recentLogs: logs.map(l => ({ message: l.message, messageType: l.messageType, timestamp: l.timestamp })),
                recentErrors: errors.map(e => ({ message: e.message, traceback: e.traceback, timestamp: e.timestamp }))
            },
            simulationMode: sessionInfo?.mode || 'Edit',
            sessionInfo
        };
    }
}
export const observationEngine = new ObservationEngine();
//# sourceMappingURL=ObservationEngine.js.map