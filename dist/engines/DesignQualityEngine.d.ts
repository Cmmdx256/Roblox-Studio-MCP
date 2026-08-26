export interface QualityScoreReport {
    compositeScore: number;
    metrics: {
        composition: number;
        readability: number;
        navigation: number;
        gameplayClarity: number;
        visualHierarchy: number;
        consistency: number;
        atmosphere: number;
        performance: number;
    };
    weaknesses: string[];
    recommendations: string[];
    changesRequired: boolean;
}
export declare class DesignQualityEngine {
    /**
     * Evaluates visual and gameplay quality against production design thresholds.
     */
    scoreDesign(context: {
        instanceCount?: number;
        hasLightingAtmosphere?: boolean;
        pathClarity?: boolean;
    }): QualityScoreReport;
}
export declare const designQualityEngine: DesignQualityEngine;
//# sourceMappingURL=DesignQualityEngine.d.ts.map