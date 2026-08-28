/**
 * AudioRealityEngine.ts
 *
 * Verifies sound and audio architecture in Studio:
 * 1. Scans Sound instances across SoundService and Workspace
 * 2. SoundGroup routing validation (BGM, SFX, UI, Ambient)
 * 3. Volume normalization (detecting ear-rape volume > 1.0 or silent volume == 0)
 * 4. 3D spatial roll-off validation
 */
import { AudioRealityReport } from './types.js';
export declare class AudioRealityEngine {
    /**
     * Audit audio instances and routing across the project.
     */
    auditAudio(): Promise<AudioRealityReport>;
}
export declare const audioRealityEngine: AudioRealityEngine;
//# sourceMappingURL=AudioRealityEngine.d.ts.map