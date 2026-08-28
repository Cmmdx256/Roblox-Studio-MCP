export type CameraModePreset = 'FISHING_CATCH' | 'NPC_INTERACTION' | 'SHOP_INSPECTION' | 'CINEMATIC_ORBIT' | 'CAMERA_SHAKE' | 'DEFAULT_FOLLOW' | 'ACTION_FOCUS' | 'CUTSCENE' | 'TOP_DOWN' | 'FIRST_PERSON' | 'THIRD_PERSON_SHOULDER' | (string & {});
export interface CameraTransitionSpec {
    mode: CameraModePreset;
    targetInstancePath?: string;
    offsetCFrame?: [number, number, number];
    fov?: number;
    duration?: number;
    shakeIntensity?: number;
}
export declare class CameraEngine {
    /**
     * Synthesizes client-side Luau Camera Controller for cinematic focus, NPC dialogues, and gameplay events.
     */
    generateCameraController(spec: CameraTransitionSpec): string;
}
export declare const cameraEngine: CameraEngine;
//# sourceMappingURL=CameraEngine.d.ts.map