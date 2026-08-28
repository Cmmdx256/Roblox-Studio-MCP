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

export class WorldDesignBrain {
    /**
     * Generates a spatial layout, zoning plan, landmark placements, and atmosphere rules for any genre and theme.
     */
    public designWorld(genre: GameGenre, theme: string): WorldLayoutPlan {
        const lowerTheme = theme.toLowerCase();
        const isFishing = lowerTheme.includes('fish');

        if (isFishing || (genre === 'Simulator' && lowerTheme.includes('water'))) {
            return {
                setting: 'Cozy Coastal Fishing Village & Deep Archipelago',
                spatialPacing: 'Relaxed',
                atmosphere: {
                    timeOfDay: '17.5', // Warm Golden Hour Sunset
                    brightness: 2.2,
                    fogDensity: 0.15,
                    outdoorAmbient: [140, 110, 85]
                },
                focalPoints: [
                    'Lighthouse Landmark with sweeping rotating spotlight beam',
                    'Main Wooden Fishing Pier stretching over turquoise water',
                    'Village Center Merchant Plaza with rustic market stalls',
                    'Distant Mystic Coral Trench'
                ],
                sightlines: [
                    'Unobstructed direct line of sight from Spawn Village directly toward the Central Pier',
                    'Elevated Lighthouse visible from any aquatic coordinate serving as a natural compass',
                    'Illuminated shoreline lantern path guiding players from docks to the Sell NPC'
                ],
                zones: [
                    {
                        id: 'ZONE-01',
                        name: 'Cozy Village Hub',
                        purpose: 'Player spawn point, merchant marketplace, and upgrade stalls',
                        relativePosition: [0, 5, 0],
                        size: [120, 20, 120],
                        terrainType: 'Grass / Cobblestone',
                        lightingPreset: 'WarmVillage',
                        props: ['Market Stalls', 'Lantern Posts', 'Fountain', 'Wooden Benches'],
                        focalPoints: ['Merchant NPC Stall', 'Spawn Fountain'],
                        sightlines: ['View of Shoreline Pier']
                    },
                    {
                        id: 'ZONE-02',
                        name: 'Main Fishing Pier & Shallows',
                        purpose: 'Primary common fishing zone with peaceful water ripples',
                        relativePosition: [0, 2, 90],
                        size: [160, 10, 80],
                        terrainType: 'Water / Sand',
                        lightingPreset: 'GoldenShoreline',
                        props: ['Wooden Docks', 'Moored Rowboats', 'Rope Railings', 'Bait Barrels'],
                        focalPoints: ['Pier Tip Viewing Platform'],
                        sightlines: ['Lighthouse Island', 'Deep Trench']
                    },
                    {
                        id: 'ZONE-03',
                        name: 'Deep Sea & Lighthouse Reef',
                        purpose: 'Higher-tier fishing zone unlocking rare and legendary catches',
                        relativePosition: [120, 2, 220],
                        size: [240, 40, 240],
                        terrainType: 'DeepWater / CoralRock',
                        lightingPreset: 'OceanAtmosphere',
                        props: ['Lighthouse Tower', 'Coral Outcroppings', 'Sunken Shipwreck'],
                        focalPoints: ['Lighthouse Peak'],
                        sightlines: ['Village Skyline in Distance']
                    }
                ]
            };
        }

        if (genre === 'Obby') {
            return {
                setting: 'Floating Cloud Citadel Obstacle Course',
                spatialPacing: 'Moderate',
                atmosphere: {
                    timeOfDay: '14.0', // Crisp Daytime Sky
                    brightness: 2.8,
                    fogDensity: 0.05,
                    outdoorAmbient: [128, 140, 160]
                },
                focalPoints: ['Towering Golden Victory Arch', 'Checkpoint Beacon Towers'],
                sightlines: ['Upward ascending course visible from spawn to establish sense of height'],
                zones: [
                    {
                        id: 'ZONE-OBBY-01',
                        name: 'Stage 1-5 Cloud Grasslands',
                        purpose: 'Introductory platforming stages teaching jump timing and hazard avoidance',
                        relativePosition: [0, 10, 0],
                        size: [200, 50, 60],
                        terrainType: 'Air / NeonBlocks',
                        lightingPreset: 'CrispDaylight',
                        props: ['Cloud Platforms', 'Rotating Beams', 'Checkpoints'],
                        focalPoints: ['Stage 5 Pinnacle Platform'],
                        sightlines: ['Next Stage Tower']
                    }
                ]
            };
        }

        // Generic RPG / Adventure / Horror World
        return {
            setting: `${theme} Realm`,
            spatialPacing: genre === 'Horror' ? 'Intense' : 'Moderate',
            atmosphere: {
                timeOfDay: genre === 'Horror' ? '0.0' : '12.0',
                brightness: genre === 'Horror' ? 0.4 : 2.0,
                fogDensity: genre === 'Horror' ? 0.45 : 0.1,
                outdoorAmbient: genre === 'Horror' ? [20, 20, 30] : [120, 120, 120]
            },
            focalPoints: ['Central Landmark Citadel', 'Quest Beacon'],
            sightlines: ['High-contrast silhouette guiding movement direction'],
            zones: [
                {
                    id: 'ZONE-GEN-01',
                    name: `${theme} Gateway Hub`,
                    purpose: 'Initial exploration area and safe zone',
                    relativePosition: [0, 0, 0],
                    size: [150, 30, 150],
                    terrainType: 'TerrainCustom',
                    lightingPreset: 'Standard',
                    props: ['Focal Monument', 'Guidance Beacons', 'Interactable Chests'],
                    focalPoints: ['Central Monument'],
                    sightlines: ['Open Frontier']
                }
            ]
        };
    }
}

export const worldDesignBrain = new WorldDesignBrain();
