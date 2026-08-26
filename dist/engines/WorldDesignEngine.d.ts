export interface WorldZone {
    id: string;
    name: string;
    purpose: string;
    position: [number, number, number];
    size: [number, number, number];
    landmarks: string[];
    paths: Array<{
        toZoneId: string;
        pathType: 'Cobblestone' | 'Dirt' | 'WoodenDock';
    }>;
}
export interface WorldDesignPlan {
    theme: string;
    genre: string;
    totalZones: number;
    zones: WorldZone[];
    lightingProfile: {
        timeOfDay: string;
        brightness: number;
        atmosphereHaze: number;
    };
}
export declare class WorldDesignEngine {
    /**
     * Synthesizes full world spatial architecture, zones, paths, and points of interest.
     */
    generateWorldPlan(theme: string, genre?: string): WorldDesignPlan;
}
export declare const worldDesignEngine: WorldDesignEngine;
//# sourceMappingURL=WorldDesignEngine.d.ts.map