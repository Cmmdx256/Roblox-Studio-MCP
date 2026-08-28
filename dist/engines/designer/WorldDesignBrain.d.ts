import { GameGenre, WorldZoneSpec } from './types.js';
export interface WorldLayoutPlan {
    setting: string;
    zones: WorldZoneSpec[];
    spatialPacing: 'Relaxed' | 'Moderate' | 'Intense';
    atmosphere: {
        timeOfDay: string;
        brightness: number;
        fogDensity: number;
        outdoorAmbient: [number, number, number];
    };
    focalPoints: string[];
    sightlines: string[];
}
export declare class WorldDesignBrain {
    /**
     * Generates a spatial layout, zoning plan, landmark placements, and atmosphere rules for any genre and theme.
     */
    designWorld(genre: GameGenre, theme: string): WorldLayoutPlan;
}
export declare const worldDesignBrain: WorldDesignBrain;
//# sourceMappingURL=WorldDesignBrain.d.ts.map