/**
 * AnimationRealityEngine.ts
 *
 * Verifies animation reality in Studio:
 * 1. Rig compatibility audit (R6 vs R15 joint hierarchies)
 * 2. Tool attachment and Grip CFrame validation
 * 3. Runtime playback verification
 * 4. Transparent reporting of platform constraints (Keyframe authoring / Asset uploading)
 */
import { AnimationRealityReport, AnimationRigCompatibility } from './types.js';
export declare class AnimationRealityEngine {
    /**
     * Audit a character rig for animation compatibility.
     */
    checkRigCompatibility(characterPath?: string): Promise<AnimationRigCompatibility>;
    /**
     * Verify complete animation reality for an animation asset or tool.
     */
    verifyAnimation(animationId: string, description: string, toolPath?: string): Promise<AnimationRealityReport>;
}
export declare const animationRealityEngine: AnimationRealityEngine;
//# sourceMappingURL=AnimationRealityEngine.d.ts.map