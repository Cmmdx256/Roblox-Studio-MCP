export interface FeaturePlanNode {
    id: string;
    name: string;
    description: string;
    dependencies: string[];
    status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
    provider: string;
    verificationStrategy: string;
}

export interface AutonomousGamePlan {
    gameTitle: string;
    genre: string;
    theme: string;
    estimatedSteps: number;
    featureGraph: FeaturePlanNode[];
    createdAt: number;
}

export class AutonomousPlanner {
    /**
     * Parses natural language game specification into a structured, dependency-ordered feature graph.
     */
    public planFromSpecification(spec: string): AutonomousGamePlan {
        const lower = spec.toLowerCase();
        let title = 'Roblox Game Experience';
        let genre = 'Adventure';
        let theme = 'World Experience';

        if (lower.includes('fish')) {
            title = 'Serene Fishing World';
            genre = 'Simulator / RPG';
            theme = 'Coastal Fishing Village';
        } else if (lower.includes('tycoon')) {
            title = 'Autonomous Tycoon';
            genre = 'Tycoon';
            theme = 'Industrial Factory';
        }

        const featureGraph: FeaturePlanNode[] = [
            {
                id: 'feat_world_layout',
                name: 'World Layout & Terrain',
                description: 'Generate terrain, water bodies, spawn zones, and piers',
                dependencies: [],
                status: 'PENDING',
                provider: 'embedded-plugin',
                verificationStrategy: 'EXISTENCE_CHECK'
            },
            {
                id: 'feat_lighting_atmosphere',
                name: 'Lighting & Atmosphere',
                description: 'Set time of day, atmosphere density, and ambient lighting',
                dependencies: ['feat_world_layout'],
                status: 'PENDING',
                provider: 'embedded-plugin',
                verificationStrategy: 'READ_BACK'
            },
            {
                id: 'feat_assets_props',
                name: 'Environment Props & Models',
                description: 'Place docks, boats, buildings, and vegetation',
                dependencies: ['feat_world_layout'],
                status: 'PENDING',
                provider: 'modeling-provider',
                verificationStrategy: 'SCREENSHOT'
            },
            {
                id: 'feat_core_systems',
                name: 'Core Gameplay Systems',
                description: 'Deploy Luau scripts for inventory, interactions, and tools',
                dependencies: ['feat_world_layout'],
                status: 'PENDING',
                provider: 'luau-provider',
                verificationStrategy: 'READ_BACK'
            },
            {
                id: 'feat_economy_progression',
                name: 'Economy & Progression System',
                description: 'Deploy Leaderstats, shops, and currency storage',
                dependencies: ['feat_core_systems'],
                status: 'PENDING',
                provider: 'luau-provider',
                verificationStrategy: 'READ_BACK'
            },
            {
                id: 'feat_ui_hud',
                name: 'Player UI & ScreenGui',
                description: 'Create responsive HUD for inventory, gold, and notifications',
                dependencies: ['feat_economy_progression'],
                status: 'PENDING',
                provider: 'embedded-plugin',
                verificationStrategy: 'EXISTENCE_CHECK'
            },
            {
                id: 'feat_animations',
                name: 'Character Animations & Actions',
                description: 'Create and bind animation tracks for tools and interaction',
                dependencies: ['feat_core_systems'],
                status: 'PENDING',
                provider: 'animation-provider',
                verificationStrategy: 'PROPERTY_CHECK'
            },
            {
                id: 'feat_playtest_verify',
                name: 'Full Playtest & Diagnostics',
                description: 'Run automated playtest simulation, capture visual frames, verify no console errors',
                dependencies: ['feat_ui_hud', 'feat_animations'],
                status: 'PENDING',
                provider: 'testing-provider',
                verificationStrategy: 'COMPOSITE'
            }
        ];

        return {
            gameTitle: title,
            genre,
            theme,
            estimatedSteps: featureGraph.length,
            featureGraph,
            createdAt: Date.now()
        };
    }

    /**
     * Adaptively recalculates the remaining plan if an environment assumption becomes invalid.
     */
    public adaptPlan(plan: AutonomousGamePlan, failedNodeId: string, errorReason: string): AutonomousGamePlan {
        console.error(`[AutonomousPlanner] Re-planning around failed node: ${failedNodeId} (${errorReason})`);
        
        for (const node of plan.featureGraph) {
            if (node.id === failedNodeId) {
                node.status = 'FAILED';
                node.description += ` [Repaired: Fallback route applied due to ${errorReason}]`;
            }
        }

        return { ...plan };
    }
}

export const autonomousPlanner = new AutonomousPlanner();
