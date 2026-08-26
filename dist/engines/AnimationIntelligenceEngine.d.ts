export interface AnimationPlan {
    animationName: string;
    targetRig: 'R15' | 'R6' | 'Custom';
    priority: 'Core' | 'Idle' | 'Movement' | 'Action' | 'Action4';
    looping: boolean;
    fadeTime: number;
    keyframeMarkers: Array<{
        name: string;
        time: number;
    }>;
    playbackScriptSnippet: string;
}
export declare class AnimationIntelligenceEngine {
    /**
     * Synthesizes animation structure, track properties, and Luau playback handlers.
     */
    planAnimation(intent: string, rigType?: 'R15' | 'R6'): AnimationPlan;
}
export declare const animationIntelligenceEngine: AnimationIntelligenceEngine;
//# sourceMappingURL=AnimationIntelligenceEngine.d.ts.map