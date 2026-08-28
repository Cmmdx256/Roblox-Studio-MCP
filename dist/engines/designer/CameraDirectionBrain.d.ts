import { GameGenre, CameraCue } from './types.js';
export declare class CameraDirectionBrain {
    /**
     * Synthesizes dynamic camera framing, transitions, and shake triggers according to gameplay context.
     */
    designCamera(genre: GameGenre, theme: string): CameraCue[];
}
export declare const cameraDirectionBrain: CameraDirectionBrain;
//# sourceMappingURL=CameraDirectionBrain.d.ts.map