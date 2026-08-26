export interface LevelDesignAnalysis {
    theme: string;
    pacing: 'Relaxed' | 'Moderate' | 'FastPaced';
    spatialRhythmScore: number;
    playerJourneySummary: string;
    focalPoints: string[];
    sightlines: string[];
    atmosphereRecommendations: string[];
}

export class DesignerBrain {
    /**
     * Synthesizes design principles (composition, player flow, landmarks, sightlines, atmosphere)
     * into actionable rules for world and level building.
     */
    public analyzeDesignIntent(theme: string, genre = 'RPG'): LevelDesignAnalysis {
        const lowerTheme = theme.toLowerCase();

        if (lowerTheme.includes('fish') || lowerTheme.includes('relax') || lowerTheme.includes('village')) {
            return {
                theme,
                pacing: 'Relaxed',
                spatialRhythmScore: 92,
                playerJourneySummary: 'Spawns in cozy village -> Guided by shoreline lighting toward docks -> Engages in relaxing fishing loop -> Returns to village shop',
                focalPoints: ['Village Center Fountain / Tree', 'Main Fishing Pier', 'Lighthouse Landmark'],
                sightlines: [
                    'Clear line of sight from Spawn Point directly to the Central Lake',
                    'Visible Lighthouse across the water serving as a primary visual compass'
                ],
                atmosphereRecommendations: [
                    'Warm golden hour lighting (ClockTime 17.5)',
                    'Soft ambient blue/orange horizon haze (Atmosphere Density 0.35)',
                    'Gentle water wave frequency and calm reflections'
                ]
            };
        }

        return {
            theme,
            pacing: 'Moderate',
            spatialRhythmScore: 85,
            playerJourneySummary: `Player explores ${theme} zone following structured progression points`,
            focalPoints: ['Central Hub', 'Primary Gameplay Arena'],
            sightlines: ['Open visual corridor between major landmarks'],
            atmosphereRecommendations: ['Balanced ambient lighting and neutral outdoor sky']
        };
    }
}

export const designerBrain = new DesignerBrain();
