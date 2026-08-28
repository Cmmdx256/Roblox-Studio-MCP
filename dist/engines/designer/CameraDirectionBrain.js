export class CameraDirectionBrain {
    /**
     * Synthesizes dynamic camera framing, transitions, and shake triggers according to gameplay context.
     */
    designCamera(genre, theme) {
        const lowerTheme = theme.toLowerCase();
        const isFishing = lowerTheme.includes('fish');
        const cues = [
            {
                mode: 'DEFAULT_FOLLOW',
                trigger: 'Default exploration mode',
                fov: 70,
                transitionTimeSec: 0.5
            }
        ];
        if (isFishing) {
            cues.push({
                mode: 'FISHING_CATCH',
                trigger: 'Fish hooked / tension minigame active',
                targetEntity: 'WaterBobber / FishCatchPoint',
                fov: 62,
                transitionTimeSec: 0.6,
                shakeIntensity: 0.8
            });
            cues.push({
                mode: 'NPC_INTERACTION',
                trigger: 'Merchant dialogue / Sell transaction opened',
                targetEntity: 'MerchantNPC.Head',
                fov: 55,
                transitionTimeSec: 0.75
            });
            cues.push({
                mode: 'CINEMATIC_ORBIT',
                trigger: 'Legendary catch reveal celebration',
                targetEntity: 'Character.Head',
                fov: 50,
                transitionTimeSec: 1.5
            });
        }
        else if (genre === 'Combat') {
            cues.push({
                mode: 'CAMERA_SHAKE',
                trigger: 'Heavy attack impact or explosion',
                fov: 68,
                transitionTimeSec: 0.1,
                shakeIntensity: 2.2
            });
        }
        else if (genre === 'Horror') {
            cues.push({
                mode: 'DEFAULT_FOLLOW',
                trigger: 'Dark corridor traversal',
                fov: 60,
                transitionTimeSec: 1.0,
                shakeIntensity: 0.2
            });
        }
        return cues;
    }
}
export const cameraDirectionBrain = new CameraDirectionBrain();
//# sourceMappingURL=CameraDirectionBrain.js.map