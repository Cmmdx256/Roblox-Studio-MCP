export interface LuauAnalysisResult {
    totalLines: number;
    functionsFound: string[];
    requiredModules: string[];
    remotesReferenced: string[];
    securityRisks: string[];
    performanceWarnings: string[];
    isStrictTypechecking: boolean;
}
export declare class LuauIntelligenceEngine {
    /**
     * Deep static analysis of Luau source code.
     */
    analyzeSource(source: string): LuauAnalysisResult;
    /**
     * Synthesizes a minimal unified diff patch for a source string.
     */
    generateMinimalPatch(originalSource: string, targetLineOrPattern: string, replacement: string): string;
}
export declare const luauIntelligenceEngine: LuauIntelligenceEngine;
//# sourceMappingURL=LuauIntelligenceEngine.d.ts.map