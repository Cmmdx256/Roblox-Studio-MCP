import { GameGenre, AnimationCue } from './types.js';
export declare class AnimationDirectionBrain {
    /**
     * Synthesizes animation requirements, keyframe sequences, joint sequences, and priority choreography from gameplay mechanics.
     */
    designAnimations(genre: GameGenre, mechanicsList: string[], theme: string): AnimationCue[];
}
export declare const animationDirectionBrain: AnimationDirectionBrain;
//# sourceMappingURL=AnimationDirectionBrain.d.ts.map