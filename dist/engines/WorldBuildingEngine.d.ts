import { ExecutionResult } from '../providers/types.js';
/**
 * WorldBuildingEngine handles high-level autonomous world layout and zone generation.
 */
export declare class WorldBuildingEngine {
    /**
     * Plans a world layout based on a specification.
     */
    planWorld(spec: {
        theme: string;
        zones: Array<{
            name: string;
            purpose: string;
            size?: [number, number, number];
            position?: [number, number, number];
        }>;
        terrainSettings?: any;
    }): Promise<any>;
    /**
     * Builds a specific zone.
     */
    buildZone(zone: {
        name: string;
        position: [number, number, number];
        bounds: [number, number, number];
        props?: string[];
        materials?: string[];
    }): Promise<any>;
    /**
     * Sets up environmental lighting.
     */
    setupEnvironment(lighting: {
        atmosphere?: string;
        timeOfDay?: string;
        brightness?: number;
        outdoorAmbient?: [number, number, number];
    }): Promise<any>;
    /**
     * Generates roads and paths given waypoints.
     */
    generateRoadsAndPaths(waypoints: Array<[number, number, number]>, width?: number, material?: string): Promise<any>;
    /**
     * Atomically creates terrain, zones, spawn points, lighting, props, and interaction anchors.
     */
    buildFullWorld(worldSpec: any): Promise<ExecutionResult>;
}
export declare const worldBuildingEngine: WorldBuildingEngine;
//# sourceMappingURL=WorldBuildingEngine.d.ts.map