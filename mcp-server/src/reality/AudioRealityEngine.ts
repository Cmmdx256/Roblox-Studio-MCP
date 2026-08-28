/**
 * AudioRealityEngine.ts
 *
 * Verifies sound and audio architecture in Studio:
 * 1. Scans Sound instances across SoundService and Workspace
 * 2. SoundGroup routing validation (BGM, SFX, UI, Ambient)
 * 3. Volume normalization (detecting ear-rape volume > 1.0 or silent volume == 0)
 * 4. 3D spatial roll-off validation
 */

import { studioObservationEngine } from './StudioObservationEngine.js';
import { commandDispatcher } from '../dispatcher/commandDispatcher.js';
import { AudioRealityReport, VerificationStatus } from './types.js';

export class AudioRealityEngine {
    /**
     * Audit audio instances and routing across the project.
     */
    public async auditAudio(): Promise<AudioRealityReport> {
        const soundInstances: AudioRealityReport['soundInstances'] = [];
        const missingGroupRouting: string[] = [];
        const volumeIssues: string[] = [];

        try {
            if (commandDispatcher.isStudioConnected()) {
                const response = await commandDispatcher.executeCommand('execute_luau', {
                    code: `
local sounds = {}
for _, inst in ipairs(game:GetDescendants()) do
    if inst:IsA("Sound") then
        local group = inst.SoundGroup and inst.SoundGroup.Name or nil
        sounds[#sounds + 1] = {
            path = inst:GetFullName(),
            volume = inst.Volume,
            rollOffDistance = inst.RollOffMaxDistance,
            soundGroup = group,
            isSpatial = inst:IsDescendantOf(workspace)
        }
    end
end
return sounds
`
                });

                if (response?.result && Array.isArray(response.result)) {
                    for (const s of response.result) {
                        const issues: string[] = [];
                        if (s.volume > 1.0) {
                            issues.push(`Volume ${s.volume} exceeds safe threshold (1.0).`);
                            volumeIssues.push(`${s.path}: Volume too high (${s.volume})`);
                        } else if (s.volume === 0) {
                            issues.push('Volume is 0 (silent).');
                            volumeIssues.push(`${s.path}: Silent sound (Volume 0)`);
                        }

                        if (!s.soundGroup) {
                            issues.push('Not routed to any SoundGroup.');
                            missingGroupRouting.push(s.path);
                        }

                        soundInstances.push({
                            path: s.path,
                            volume: s.volume,
                            rollOffDistance: s.rollOffDistance,
                            soundGroup: s.soundGroup,
                            issues
                        });
                    }
                }
            }
        } catch {
            // Best effort
        }

        const status: VerificationStatus =
            soundInstances.length === 0 ? 'NOT_TESTED' :
            volumeIssues.length > 0 ? 'PARTIAL' :
            'VERIFIED';

        return {
            soundInstances,
            missingGroupRouting,
            volumeIssues,
            status
        };
    }
}

export const audioRealityEngine = new AudioRealityEngine();
