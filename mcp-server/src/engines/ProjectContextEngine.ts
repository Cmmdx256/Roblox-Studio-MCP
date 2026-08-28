import { commandDispatcher } from '../dispatcher/commandDispatcher.js';
import { projectKnowledgeGraph } from '../state/ProjectKnowledgeGraph.js';
import { studioStateGraph } from '../state/StudioStateGraph.js';
import { contextCompressor } from '../memory/ContextCompressor.js';

export interface RelevantInstanceContext {
    path: string;
    className: string;
    relevanceScore: number;
    parent?: string;
    attributes?: Record<string, any>;
    tags?: string[];
}

export interface RelevantScriptContext {
    path: string;
    snippet: string;
    startLine: number;
    endLine: number;
    totalLines: number;
    relevanceScore: number;
    hasErrors: boolean;
}

export interface FocusedProjectContext {
    intent: string;
    primarySystem?: string;
    relevantInstances: RelevantInstanceContext[];
    relevantScripts: RelevantScriptContext[];
    relatedErrors: Array<{ message: string; traceback?: string; source?: string }>;
    simulationState: string;
    estimatedTokens: number;
}

/**
 * ProjectContextEngine
 * Discovers and builds high-relevance, low-token context for AI agents.
 * Strictly avoids full DataModel dumping unless explicitly requested.
 */
export class ProjectContextEngine {
    /**
     * Builds focused, task-relevant context based on user intent.
     */
    public async buildFocusedContext(intent: string, maxInstances = 8, maxScripts = 3): Promise<FocusedProjectContext> {
        const keywords = this.extractKeywords(intent);
        const relatedErrors: Array<{ message: string; traceback?: string; source?: string }> = [];
        const relevantInstances: RelevantInstanceContext[] = [];
        const relevantScripts: RelevantScriptContext[] = [];

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
                } catch {}
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
                    } catch {}
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

    private extractKeywords(intent: string): string[] {
        const stopWords = new Set(['the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'is', 'are', 'it', 'fix', 'make', 'create', 'please', 'with', 'do']);
        return intent
            .toLowerCase()
            .replace(/[^a-z0-9_\s]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 2 && !stopWords.has(w));
    }

    private calculateRelevance(name: string, keywords: string[]): number {
        let score = 0.5;
        const lower = name.toLowerCase();
        for (const kw of keywords) {
            if (lower === kw) score += 0.5;
            else if (lower.includes(kw)) score += 0.3;
        }
        return Math.min(1.0, score);
    }

    private extractScriptFromTraceback(traceback?: string): string | undefined {
        if (!traceback) return undefined;
        const match = traceback.match(/([A-Za-z0-9_]+(\.[A-Za-z0-9_]+)+):[0-9]+/);
        return match ? match[1] : undefined;
    }
}

export const projectContextEngine = new ProjectContextEngine();
