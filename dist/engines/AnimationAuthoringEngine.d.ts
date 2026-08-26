import { ExecutionResult } from '../providers/types.js';
export interface RigPoseSpecification {
    targetRigPath: string;
    rigType?: 'R15' | 'R6';
    poses: Record<string, {
        x?: number;
        y?: number;
        z?: number;
        cframeAnglesDeg?: [number, number, number];
    }>;
}
export interface ToolGripCalibrationSpec {
    toolPath: string;
    gripPreset: 'Sword_Upright' | 'Gun_Aim_Forward' | 'Shield_Forearm' | 'Lantern_Carry' | 'Staff_TwoHanded' | 'Custom';
    offset?: [number, number, number];
    anglesDeg?: [number, number, number];
}
export interface KeyframeSequenceSpec {
    name: string;
    parentPath?: string;
    loop: boolean;
    priority: 'Core' | 'Idle' | 'Movement' | 'Action' | 'Action4';
    keyframes: Array<{
        time: number;
        poses: Record<string, [number, number, number]>;
    }>;
}
export declare class AnimationAuthoringEngine {
    /**
     * Calibrates and sets the Grip CFrame and GripAttachment for a Tool.
     */
    calibrateToolGrip(spec: ToolGripCalibrationSpec): Promise<ExecutionResult>;
    /**
     * Safely poses an R15/R6 rig without throwing read-only Motor6D errors.
     */
    poseRig(spec: RigPoseSpecification): Promise<ExecutionResult>;
    /**
     * Synthesizes a KeyframeSequence asset in Studio.
     */
    createKeyframeSequence(spec: KeyframeSequenceSpec): Promise<ExecutionResult>;
}
export declare const animationAuthoringEngine: AnimationAuthoringEngine;
//# sourceMappingURL=AnimationAuthoringEngine.d.ts.map