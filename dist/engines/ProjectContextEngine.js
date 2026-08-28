import { commandDispatcher } from '../dispatcher/commandDispatcher.js';
import { contextCompressor } from '../memory/ContextCompressor.js';
/**
 * ProjectContextEngine
 * Discovers and builds high-relevance, low-token context for AI agents.
 * Strictly avoids full DataModel dumping unless explicitly requested.
 */
export class ProjectContextEngine {
    /**
     * Builds focused, task-relevant context based on user intent.
     */
    async buildFocusedContext(intent, maxInstances = 8, maxScripts = 3) {
        const keywords = this.extractKeywords(intent);
        const relatedErrors = [];
        const relevantInstances = [];
        const relevantScripts = [];
        // 1. Gather active errors matching intent keywords
        const recentErrors = commandDispatcher.getRecentErrors(10);
        for (const err of recentErrors) {
            const errLower = (err.message + ' ' + (err.traceback || '')).toLowerCase();
            const matches = keywords.some(k => errLower.includes(k));
            if (matches || recentErrors.length <= 2) {
                relatedErrors.push({
                    message: err.message,
                    traceback: err.traceback,
                    source: this.extractScriptFromTraceback(err.traceback)
                });
            }
        }
        // 2. Search for relevant instances in DataModel
        if (commandDispatcher.isStudioConnected()) {
            for (const kw of keywords) {
                try {
                    const searchRes = await commandDispatcher.executeCommand('studio_search', { query: kw, maxResults: 5 });
                    const items = Array.isArray(searchRes) ? searchRes : (searchRes?.results || []);
                    for (const item of items) {
                        if (!relevantInstances.some(i => i.path === item.path)) {
                            relevantInstances.push({
                                path: item.path || item.name,
                                className: item.className || 'Instance',
                                relevanceScore: this.calculateRelevance(item.name, keywords),
                                parent: item.parent
                            });
                        }
                    }
                }
                catch { }
            }
        }
        // Sort by relevance score
        relevantInstances.sort((a, b) => b.relevanceScore - a.relevanceScore);
        const topInstances = relevantInstances.slice(0, maxInstances);
        // 3. Extract focused script contexts for relevant script objects
        if (commandDispatcher.isStudioConnected()) {
            for (const inst of topInstances) {
                if (inst.className.includes('Script') && relevantScripts.length < maxScripts) {
                    try {
                        const srcRes = await commandDispatcher.executeCommand('script_get_source', { path: inst.path, target: inst.path });
                        const src = typeof srcRes === 'string' ? srcRes : (srcRes?.source || '');
                        if (src) {
                            const targetKw = keywords.find(k => src.toLowerCase().includes(k));
                            const compressed = contextCompressor.extractFocusedScriptContext(src, targetKw, inst.path, 35);
                            const hasErr = relatedErrors.some(e => e.source === inst.path || e.message.includes(inst.path));
                            relevantScripts.push({
                                path: inst.path,
                                snippet: compressed.snippet,
                                startLine: compressed.startLine,
                                endLine: compressed.endLine,
                                totalLines: compressed.totalLines,
                                relevanceScore: inst.relevanceScore,
                                hasErrors: hasErr
                            });
                        }
                    }
                    catch { }
                }
            }
        }
        // Token estimation (~4 chars per token)
        const totalChars = JSON.stringify(topInstances).length + JSON.stringify(relevantScripts).length + JSON.stringify(relatedErrors).length;
        const estimatedTokens = Math.round(totalChars / 4);
        const sessionInfo = commandDispatcher.getSessionInfo();
        const simulationState = sessionInfo?.mode || 'Edit';
        return {
            intent,
            primarySystem: keywords[0] ? keywords[0].toUpperCase() : 'GENERAL',
            relevantInstances: topInstances,
            relevantScripts,
            relatedErrors,
            simulationState,
            estimatedTokens
        };
    }
    extractKeywords(intent) {
        const stopWords = new Set(['the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'is', 'are', 'it', 'fix', 'make', 'create', 'please', 'with', 'do']);
        return intent
            .toLowerCase()
            .replace(/[^a-z0-9_\s]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 2 && !stopWords.has(w));
    }
    calculateRelevance(name, keywords) {
        let score = 0.5;
        const lower = name.toLowerCase();
        for (const kw of keywords) {
            if (lower === kw)
                score += 0.5;
            else if (lower.includes(kw))
                score += 0.3;
        }
        return Math.min(1.0, score);
    }
    extractScriptFromTraceback(traceback) {
        if (!traceback)
            return undefined;
        const match = traceback.match(/([A-Za-z0-9_]+(\.[A-Za-z0-9_]+)+):[0-9]+/);
        return match ? match[1] : undefined;
    }
}
export const projectContextEngine = new ProjectContextEngine();
//# sourceMappingURL=ProjectContextEngine.js.map