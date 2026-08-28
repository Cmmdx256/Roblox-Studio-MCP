import { GameDesignSpec } from './types.js';
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
     * Synthesizes a complete, production-grade GameDesignSpec from a user prompt.
     * Integrates game design, UX flow, world building, animations, camera cues, and sensory polish.
     */
    createGameDesignSpec(prompt: string, themeOverride?: string): GameDesignSpec;
    /**
     * Backward-compatible design intent analyzer returning level design rules.
     */
    analyzeDesignIntent(theme: string, genre?: string): LevelDesignAnalysis;
    private extractTheme;
    private generateGameTitle;
    private deriveSystemsArchitecture;
}
export declare const designerBrain: DesignerBrain;
//# sourceMappingURL=DesignerBrain.d.ts.map