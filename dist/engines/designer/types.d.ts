export type GameGenre = 'RPG' | 'Obby' | 'Simulator' | 'Tycoon' | 'Horror' | 'Combat' | 'Racing' | 'Social' | 'Adventure' | 'Puzzle' | 'Sandbox' | 'TowerDefense' | 'Survival' | 'Roguelike' | 'Strategy' | 'Multiplayer' | 'PvP' | 'PvE' | 'Hybrid' | 'Custom';
export type MechanicCategory = 'Movement' | 'Interaction' | 'Progression' | 'Combat' | 'Economy' | 'Minigame' | 'Inventory' | 'Building' | 'Crafting' | 'Exploration' | 'Narrative' | 'Social' | 'Stealth' | 'Strategy' | 'Custom';
export interface MechanicDefinition {
    id: string;
    name: string;
    description: string;
    category: MechanicCategory;
    inputTrigger: string;
    serverAuthoritative: boolean;
    stateTransitions: string[];
    feedback: {
        soundCue?: string;
        visualEffect?: string;
        uiFeedback?: string;
        cameraReaction?: string;
    };
}
export interface EconomyCurrency {
    id: string;
    name: string;
    symbol: string;
    startAmount: number;
    sources: string[];
    sinks: string[];
    inflationControl: string;
}
export interface ProgressionTier {
    level: number;
    requiredXpOrCurrency: number;
    unlocks: string[];
    statMultipliers?: Record<string, number>;
}
export interface WorldZoneSpec {
    id: string;
    name: string;
    purpose: string;
    relativePosition: [number, number, number];
    size: [number, number, number];
    terrainType: string;
    lightingPreset: string;
    props: string[];
    focalPoints: string[];
    sightlines: string[];
}
export interface UIScreenSpecDesign {
    id: string;
    screenName: string;
    purpose: string;
    layout: 'centered' | 'dock_left' | 'dock_right' | 'fullscreen' | 'hud_overlay';
    theme: string;
    components: Array<{
        type: string;
        id: string;
        label?: string;
        purpose?: string;
    }>;
}
export interface AnimationCue {
    name: string;
    trigger: string;
    characterAction: string;
    jointSequence: string[];
    durationSec: number;
    priority: 'Core' | 'Idle' | 'Action' | 'ActionPriority';
    looping: boolean;
}
export interface CameraCue {
    mode: 'FISHING_CATCH' | 'NPC_INTERACTION' | 'SHOP_INSPECTION' | 'CINEMATIC_ORBIT' | 'CAMERA_SHAKE' | 'DEFAULT_FOLLOW' | 'CUSTOM_CONTEXT';
    trigger: string;
    targetEntity?: string;
    fov: number;
    transitionTimeSec: number;
    shakeIntensity?: number;
}
export interface GameDesignSpec {
    identity: {
        title: string;
        genre: GameGenre;
        theme: string;
        targetAudience: string;
        tone: string;
    };
    playerFantasy: string;
    coreLoop: {
        phases: Array<{
            name: string;
            action: string;
            rewardOrTransition: string;
        }>;
        summary: string;
    };
    secondaryLoop?: {
        summary: string;
        activities: string[];
    };
    mechanics: MechanicDefinition[];
    systems: Array<{
        name: string;
        type: 'ServerScript' | 'LocalScript' | 'ModuleScript' | 'RemoteEvent' | 'RemoteFunction';
        path: string;
        responsibilities: string[];
        dependencies: string[];
    }>;
    progression: {
        type: 'Linear' | 'Tiered' | 'SkillTree' | 'Prestige';
        tiers: ProgressionTier[];
    };
    economy?: {
        currencies: EconomyCurrency[];
        itemCatalog: Array<{
            id: string;
            name: string;
            category: string;
            price: number;
            rarity: string;
            sellValue?: number;
        }>;
    };
    world: {
        setting: string;
        zones: WorldZoneSpec[];
        spatialPacing: 'Relaxed' | 'Moderate' | 'Intense';
        atmosphere: {
            timeOfDay: string;
            brightness: number;
            fogDensity: number;
            outdoorAmbient: [number, number, number];
        };
    };
    ui: {
        themeId: string;
        screens: UIScreenSpecDesign[];
    };
    animation: {
        cues: AnimationCue[];
    };
    camera: {
        cues: CameraCue[];
    };
    polish: {
        feedbackSensoryChecklist: string[];
        retentionHooks: string[];
        soundPalette: string[];
    };
}
//# sourceMappingURL=types.d.ts.map