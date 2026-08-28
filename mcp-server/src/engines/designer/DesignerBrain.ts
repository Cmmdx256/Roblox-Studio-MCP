import { GameDesignSpec, GameGenre } from './types.js';
import { gameDesignBrain } from './GameDesignBrain.js';
import { uxBrain } from './UXBrain.js';
import { worldDesignBrain } from './WorldDesignBrain.js';
import { animationDirectionBrain } from './AnimationDirectionBrain.js';
import { cameraDirectionBrain } from './CameraDirectionBrain.js';
import { polishBrain } from './PolishBrain.js';

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
     * Synthesizes a complete, production-grade GameDesignSpec from a user prompt.
     * Integrates game design, UX flow, world building, animations, camera cues, and sensory polish.
     */
    public createGameDesignSpec(prompt: string, themeOverride?: string): GameDesignSpec {
        const genre = gameDesignBrain.inferGenre(prompt);
        const theme = themeOverride || this.extractTheme(prompt, genre);

        const core = gameDesignBrain.synthesizeCoreLoop(genre, prompt, theme);
        const ux = uxBrain.designUXFlow(genre, theme, core.coreLoop.summary);
        const world = worldDesignBrain.designWorld(genre, theme);
        const mechanicsNames = core.mechanics.map(m => m.name);
        const animationCues = animationDirectionBrain.designAnimations(genre, mechanicsNames, theme);
        const cameraCues = cameraDirectionBrain.designCamera(genre, theme);
        const polish = polishBrain.designPolish(genre, theme);

        const systems = this.deriveSystemsArchitecture(genre, core.mechanics);

        const spec: GameDesignSpec = {
            identity: {
                title: this.generateGameTitle(prompt, genre, theme),
                genre,
                theme,
                targetAudience: 'All Ages / Roblox Core Gamers',
                tone: genre === 'Horror' ? 'Suspenseful & Atmospheric' : 'Polished, Engaging & Rewarding'
            },
            playerFantasy: core.fantasy,
            coreLoop: core.coreLoop,
            secondaryLoop: core.secondaryLoop,
            mechanics: core.mechanics,
            systems,
            progression: core.progression,
            economy: core.economy,
            world: {
                setting: world.setting,
                zones: world.zones,
                spatialPacing: world.spatialPacing,
                atmosphere: world.atmosphere
            },
            ui: {
                themeId: theme.toLowerCase().includes('fish') ? 'fishing_casual' : (genre === 'Horror' ? 'dark_fantasy' : 'modern_minimal'),
                screens: ux.screens
            },
            animation: {
                cues: animationCues
            },
            camera: {
                cues: cameraCues
            },
            polish
        };

        return spec;
    }

    /**
     * Backward-compatible design intent analyzer returning level design rules.
     */
    public analyzeDesignIntent(theme: string, genre: string = 'RPG'): LevelDesignAnalysis {
        const inferredGenre = gameDesignBrain.inferGenre(`${theme} ${genre}`);
        const world = worldDesignBrain.designWorld(inferredGenre, theme);
        const core = gameDesignBrain.synthesizeCoreLoop(inferredGenre, theme, theme);

        return {
            theme,
            pacing: world.spatialPacing === 'Intense' ? 'FastPaced' : (world.spatialPacing === 'Relaxed' ? 'Relaxed' : 'Moderate'),
            spatialRhythmScore: 92,
            playerJourneySummary: core.coreLoop.summary,
            focalPoints: world.focalPoints,
            sightlines: world.sightlines,
            atmosphereRecommendations: [
                `Time of day: ClockTime ${world.atmosphere.timeOfDay}`,
                `Lighting Brightness: ${world.atmosphere.brightness}, OutdoorAmbient: rgb(${world.atmosphere.outdoorAmbient.join(',')})`,
                `Atmosphere Fog Density: ${world.atmosphere.fogDensity}`
            ]
        };
    }

    private extractTheme(prompt: string, genre: GameGenre): string {
        const lower = prompt.toLowerCase();
        if (lower.includes('fish')) return 'Fishing';
        if (lower.includes('medieval') || lower.includes('fantasy')) return 'Medieval Fantasy';
        if (lower.includes('sci-fi') || lower.includes('space') || lower.includes('cyberpunk')) return 'Sci-Fi';
        if (lower.includes('cartoon') || lower.includes('anime')) return 'Stylized Cartoon';
        if (lower.includes('horror') || lower.includes('dark')) return 'Dark Atmosphere';
        if (lower.includes('island') || lower.includes('tropical')) return 'Tropical Island';
        return `${genre} Experience`;
    }

    private generateGameTitle(prompt: string, genre: GameGenre, theme: string): string {
        const lower = prompt.toLowerCase();
        if (lower.includes('fish')) return 'Fishing Simulator: Catch & Trade';
        if (genre === 'Obby') return 'Cloud Citadel: Towering Obby';
        if (genre === 'Tycoon') return 'Industrial Empire Tycoon';
        if (genre === 'Combat') return 'Gladiator Arena Championship';
        return genre === 'Custom' ? `${theme} Experience` : `${theme} ${genre}`;
    }

    private deriveSystemsArchitecture(genre: GameGenre, mechanics: GameDesignSpec['mechanics']): GameDesignSpec['systems'] {
        const systems: GameDesignSpec['systems'] = [
            {
                name: 'GameConfig',
                type: 'ModuleScript',
                path: 'ReplicatedStorage.Shared.GameConfig',
                responsibilities: [`Authoritative configuration for the ${genre} experience`, 'Shared mechanic, tuning, and content definitions'],
                dependencies: []
            },
            {
                name: 'GameLifecycleService',
                type: 'ServerScript',
                path: 'ServerScriptService.GameLifecycleService',
                responsibilities: ['Server-side player lifecycle and session orchestration', 'Composition root for generated gameplay services'],
                dependencies: ['ReplicatedStorage.Shared.GameConfig']
            }
        ];

        const usedNames = new Set<string>();
        for (const mechanic of mechanics) {
            const stem = mechanic.name.replace(/[^A-Za-z0-9]+/g, ' ').trim().split(/\s+/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('') || 'CustomMechanic';
            if (usedNames.has(stem)) continue;
            usedNames.add(stem);

            const eventPath = `ReplicatedStorage.Events.${stem}Request`;
            systems.push({
                name: `${stem}Request`,
                type: 'RemoteEvent',
                path: eventPath,
                responsibilities: [`Client request channel for ${mechanic.name}`, 'Payload is validated server-side before state changes'],
                dependencies: []
            });
            systems.push({
                name: `${stem}Service`,
                type: 'ServerScript',
                path: `ServerScriptService.${stem}Service`,
                responsibilities: [mechanic.description, `Authoritative ${mechanic.category.toLowerCase()} state transitions`, 'Rate limiting and server-side validation'],
                dependencies: ['ReplicatedStorage.Shared.GameConfig', eventPath]
            });
        }

        if (mechanics.some(mechanic => ['Progression', 'Economy', 'Inventory'].includes(mechanic.category))) {
            systems.push({
                name: 'PlayerProgressionService',
                type: 'ServerScript',
                path: 'ServerScriptService.PlayerProgressionService',
                responsibilities: ['Server-authoritative player progression and persistence boundary', 'Validates rewards, unlocks, and currency mutations'],
                dependencies: ['ReplicatedStorage.Shared.GameConfig']
            });
        }

        return systems;
    }
}

export const designerBrain = new DesignerBrain();
