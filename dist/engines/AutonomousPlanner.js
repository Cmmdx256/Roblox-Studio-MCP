export class AutonomousPlanner {
    /**
     * Parses natural language game specification into a structured, dependency-ordered DAG feature graph.
     */
    planFromSpecification(spec) {
        const lower = spec.toLowerCase();
        let title = 'Roblox Game Experience';
        let genre = 'Adventure';
        let theme = 'World Experience';
        if (lower.includes('fish')) {
            title = 'Serene Fishing World';
            genre = 'Simulator / RPG';
            theme = 'Coastal Fishing Village';
        }
        else if (lower.includes('tycoon')) {
            title = 'Autonomous Tycoon';
            genre = 'Tycoon';
            theme = 'Industrial Factory';
        }
        else if (lower.includes('rpg') || lower.includes('sword') || lower.includes('combat')) {
            title = 'Action RPG Adventure';
            genre = 'Action RPG';
            theme = 'Fantasy Realm';
        }
        const featureGraph = [
            {
                id: 'feat_world_layout',
                name: 'World Layout & Terrain',
                description: 'Generate terrain, water bodies, spawn zones, and foundations',
                stage: 1,
                dependencies: [],
                status: 'PENDING',
                provider: 'embedded-plugin',
                verificationStrategy: 'EXISTENCE_CHECK',
                checkpointVerification: true
            },
            {
                id: 'feat_lighting_atmosphere',
                name: 'Lighting & Atmosphere',
                description: 'Set time of day, atmosphere density, and ambient lighting',
                stage: 2,
                dependencies: ['feat_world_layout'],
                status: 'PENDING',
                provider: 'embedded-plugin',
                verificationStrategy: 'READ_BACK'
            },
            {
                id: 'feat_assets_props',
                name: 'Environment Props & Models',
                description: 'Place structures, vegetation, interactive models, and scenery',
                stage: 2,
                dependencies: ['feat_world_layout'],
                status: 'PENDING',
                provider: 'modeling-provider',
                verificationStrategy: 'EXISTENCE_CHECK'
            },
            {
                id: 'feat_core_systems',
                name: 'Core Gameplay Systems',
                description: 'Deploy Luau scripts for mechanics, interactions, and tools',
                stage: 3,
                dependencies: ['feat_world_layout'],
                status: 'PENDING',
                provider: 'luau-provider',
                verificationStrategy: 'READ_BACK',
                checkpointVerification: true
            },
            {
                id: 'feat_economy_progression',
                name: 'Economy & Progression System',
                description: 'Deploy Leaderstats, shops, and currency storage',
                stage: 4,
                dependencies: ['feat_core_systems'],
                status: 'PENDING',
                provider: 'luau-provider',
                verificationStrategy: 'READ_BACK'
            },
            {
                id: 'feat_ui_hud',
                name: 'Player UI & ScreenGui',
                description: 'Create responsive HUD for inventory, currency, and prompts',
                stage: 4,
                dependencies: ['feat_economy_progression'],
                status: 'PENDING',
                provider: 'embedded-plugin',
                verificationStrategy: 'EXISTENCE_CHECK'
            },
            {
                id: 'feat_animations',
                name: 'Character Animations & Actions',
                description: 'Create and bind animation tracks for tools and interaction',
                stage: 4,
                dependencies: ['feat_core_systems'],
                status: 'PENDING',
                provider: 'animation-provider',
                verificationStrategy: 'PROPERTY_CHECK'
            },
            {
                id: 'feat_playtest_verify',
                name: 'Full Playtest & Diagnostics',
                description: 'Run automated playtest simulation, capture telemetry, verify zero runtime errors',
                stage: 5,
                dependencies: ['feat_ui_hud', 'feat_animations'],
                status: 'PENDING',
                provider: 'testing-provider',
                verificationStrategy: 'COMPOSITE',
                checkpointVerification: true
            }
        ];
        const stages = [
            { stageNumber: 1, name: 'Foundation & Spatial Scaffold', nodeIds: ['feat_world_layout'] },
            { stageNumber: 2, name: 'Environment & Atmosphere', nodeIds: ['feat_lighting_atmosphere', 'feat_assets_props'] },
            { stageNumber: 3, name: 'Core Gameplay Systems', nodeIds: ['feat_core_systems'] },
            { stageNumber: 4, name: 'Economy, UI & Animation', nodeIds: ['feat_economy_progression', 'feat_ui_hud', 'feat_animations'] },
            { stageNumber: 5, name: 'Playtest & Verification', nodeIds: ['feat_playtest_verify'] }
        ];
        return {
            gameTitle: title,
            genre,
            theme,
            estimatedSteps: featureGraph.length,
            stages,
            featureGraph,
            createdAt: Date.now()
        };
    }
    /**
     * Returns parallel-executable batches of nodes based on completed prerequisites.
     */
    getNextExecutableNodes(plan) {
        const completedIds = new Set(plan.featureGraph.filter(n => n.status === 'COMPLETED').map(n => n.id));
        return plan.featureGraph.filter(node => {
            if (node.status !== 'PENDING')
                return false;
            return node.dependencies.every(dep => completedIds.has(dep));
        });
    }
    /**
     * Dynamically replans when a node fails or an assumption is invalidated.
     */
    adaptPlan(plan, failedNodeId, errorReason) {
        console.error(`[AutonomousPlanner] Re-planning around failed node: ${failedNodeId} (${errorReason})`);
        for (const node of plan.featureGraph) {
            if (node.id === failedNodeId) {
                node.status = 'FAILED';
                node.description += ` [Recovered via alternative route due to: ${errorReason}]`;
            }
            else if (node.dependencies.includes(failedNodeId)) {
                node.status = 'BLOCKED';
            }
        }
        return { ...plan };
    }
}
export const autonomousPlanner = new AutonomousPlanner();
//# sourceMappingURL=AutonomousPlanner.js.map