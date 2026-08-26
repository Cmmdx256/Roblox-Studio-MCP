export interface AnimationPlan {
    animationName: string;
    targetRig: 'R15' | 'R6' | 'Custom';
    priority: 'Core' | 'Idle' | 'Movement' | 'Action' | 'Action4';
    looping: boolean;
    fadeTime: number;
    keyframeMarkers: Array<{ name: string; time: number }>;
    playbackScriptSnippet: string;
}

export class AnimationIntelligenceEngine {
    /**
     * Synthesizes animation structure, track properties, and Luau playback handlers.
     */
    public planAnimation(intent: string, rigType: 'R15' | 'R6' = 'R15'): AnimationPlan {
        const lower = intent.toLowerCase();
        let priority: 'Core' | 'Idle' | 'Movement' | 'Action' | 'Action4' = 'Action';
        let looping = false;
        let markers: Array<{ name: string; time: number }> = [];

        if (lower.includes('fish') && lower.includes('cast')) {
            priority = 'Action';
            looping = false;
            markers = [
                { name: 'CastStart', time: 0.1 },
                { name: 'ReleaseBait', time: 0.6 },
                { name: 'HoldRod', time: 1.2 }
            ];
        } else if (lower.includes('idle') || lower.includes('wait')) {
            priority = 'Idle';
            looping = true;
        } else if (lower.includes('walk') || lower.includes('run')) {
            priority = 'Movement';
            looping = true;
        }

        const animName = intent.replace(/\s+/g, '_');
        const playbackScriptSnippet = `
-- Playback Handler for ${animName}
local Players = game:GetService("Players")
local player = Players.LocalPlayer
local character = player.Character or player.CharacterAdded:Wait()
local humanoid = character:WaitForChild("Humanoid")
local animator = humanoid:WaitForChild("Animator")

local animInstance = script:WaitForChild("${animName}")
local track = animator:LoadAnimation(animInstance)
track.Priority = Enum.AnimationPriority.${priority}
track.Looped = ${looping}
track:Play(${0.2})
`;

        return {
            animationName: animName,
            targetRig: rigType,
            priority,
            looping,
            fadeTime: 0.2,
            keyframeMarkers: markers,
            playbackScriptSnippet: playbackScriptSnippet.trim()
        };
    }
}

export const animationIntelligenceEngine = new AnimationIntelligenceEngine();
