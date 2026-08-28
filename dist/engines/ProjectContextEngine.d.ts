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
    relatedErrors: Array<{
        message: string;
        traceback?: string;
        source?: string;
    }>;
    simulationState: string;
    estimatedTokens: number;
}
/**
 * ProjectContextEngine
 * Discovers and builds high-relevance, low-token context for AI agents.
 * Strictly avoids full DataModel dumping unless explicitly requested.
 */
export declare class ProjectContextEngine {
    /**
     * Builds focused, task-relevant context based on user intent.
     */
    buildFocusedContext(intent: string, maxInstances?: number, maxScripts?: number): Promise<FocusedProjectContext>;
    private extractKeywords;
    private calculateRelevance;
    private extractScriptFromTraceback;
}
export declare const projectContextEngine: ProjectContextEngine;
//# sourceMappingURL=ProjectContextEngine.d.ts.map