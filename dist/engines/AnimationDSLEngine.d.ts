export interface AnimationDSLPhase {
    name: string;
    duration: number;
    easing: 'Linear' | 'QuadIn' | 'QuadOut' | 'QuadInOut' | 'BackOut' | 'BounceOut';
    jointAnglesDeg: Record<string, [number, number, number]>;
}
export interface AnimationDSLSpec {
    name: string;
    rigType: 'R15' | 'R6' | 'Custom';
    targetModelPath?: string;
    duration: number;
    looped: boolean;
    priority: 'Core' | 'Idle' | 'Movement' | 'Action' | 'Action4';
    phases: AnimationDSLPhase[];
    constraints?: {
        rightHandAttachment?: string;
        leftHandAttachment?: string;
        preserveBalance?: boolean;
    };
}
export declare class AnimationDSLEngine {
    /**
     * Synthesizes native Luau animation state machine or procedural CFrame tweening controller
     * from an intermediate Animation DSL specification.
     */
    compileAnimationDSL(spec: AnimationDSLSpec): {
        luauControllerCode: string;
        keyframeSequenceData: any;
    };
    /**
     * Standard Fishing Cast & Reel Animation DSL Preset
     */
    getFishingAnimationPreset(): AnimationDSLSpec;
    /**
     * Melee Sword Slash Preset
     */
    getMeleeSlashPreset(): AnimationDSLSpec;
    /**
     * Interact / Pickup Item Preset
     */
    getPickupInteractPreset(): AnimationDSLSpec;
    /**
     * Breathing Idle Preset
     */
    getLocomotionIdlePreset(): AnimationDSLSpec;
    /**
     * Get any registered animation preset by name
     */
    getPreset(presetName: string): AnimationDSLSpec | undefined;
    /**
     * List all available animation presets
     */
    listPresets(): string[];
}
export declare const animationDSLEngine: AnimationDSLEngine;
//# sourceMappingURL=AnimationDSLEngine.d.ts.map