export interface LevelDesignAnalysis {
    theme: string;
    pacing: 'Relaxed' | 'Moderate' | 'FastPaced';
    spatialRhythmScore: number;
    playerJourneySummary: string;
    focalPoints: string[];
    sightlines: string[];
    atmosphereRecommendations: string[];
}
export declare class DesignerBrain {
    /**
     * Synthesizes design principles (composition, player flow, landmarks, sightlines, atmosphere)
     * into actionable rules for world and level building.
     */
    analyzeDesignIntent(theme: string, genre?: string): LevelDesignAnalysis;
}
export declare const designerBrain: DesignerBrain;
//# sourceMappingURL=DesignerBrain.d.ts.map