export class AnimationDSLEngine {
    /**
     * Synthesizes native Luau animation state machine or procedural CFrame tweening controller
     * from an intermediate Animation DSL specification.
     */
    compileAnimationDSL(spec) {
        const totalDuration = spec.phases.reduce((acc, p) => acc + p.duration, 0);
        const phasesCode = spec.phases.map((p, idx) => {
            const jointTransforms = Object.entries(p.jointAnglesDeg).map(([joint, angles]) => {
                return `        ["${joint}"] = CFrame.Angles(math.rad(${angles[0]}), math.rad(${angles[1]}), math.rad(${angles[2]}))`;
            }).join(',\n');
            return `    {
        Name = "${p.name}",
        Duration = ${p.duration},
        Easing = Enum.EasingStyle.${p.easing.replace(/In|Out|InOut/g, '') || 'Quad'},
        EasingDirection = Enum.EasingDirection.${p.easing.includes('In') ? 'In' : 'Out'},
        Joints = {
${jointTransforms}
        }
    }`;
        }).join(',\n');
        const luauController = `local TweenService = game:GetService("TweenService")
local player = game.Players.LocalPlayer
local character = player.Character or player.CharacterAdded:Wait()
local humanoid = character:WaitForChild("Humanoid")

local ${spec.name}AnimationController = {}
local phases = {
${phasesCode}
}

function ${spec.name}AnimationController.Play(onComplete)
    task.spawn(function()
        for _, phase in ipairs(phases) do
            local tweenInfo = TweenInfo.new(phase.Duration, phase.Easing, phase.EasingDirection)
            for jointName, targetCFrame in pairs(phase.Joints) do
                local motor = character:FindFirstChild(jointName, true)
                if motor and motor:IsA("Motor6D") then
                    TweenService:Create(motor, tweenInfo, { Transform = targetCFrame }):Play()
                end
            end
            task.wait(phase.Duration)
        end
        if onComplete then onComplete() end
    end)
end

return ${spec.name}AnimationController
`;
        return {
            luauControllerCode: luauController,
            keyframeSequenceData: {
                name: spec.name,
                rigType: spec.rigType,
                totalDuration,
                loop: spec.looped,
                priority: spec.priority,
                phasesCount: spec.phases.length
            }
        };
    }
    /**
     * Standard Fishing Cast & Reel Animation DSL Preset
     */
    getFishingAnimationPreset() {
        return {
            name: 'FishingCastAndReel',
            rigType: 'R15',
            duration: 2.2,
            looped: false,
            priority: 'Action',
            phases: [
                {
                    name: 'WindUp',
                    duration: 0.4,
                    easing: 'QuadOut',
                    jointAnglesDeg: {
                        RightShoulder: [110, -20, 15],
                        RightElbow: [70, 0, 0],
                        Waist: [-10, 15, 0]
                    }
                },
                {
                    name: 'CastForward',
                    duration: 0.35,
                    easing: 'BackOut',
                    jointAnglesDeg: {
                        RightShoulder: [-45, 10, -10],
                        RightElbow: [15, 0, 0],
                        Waist: [15, -10, 0]
                    }
                },
                {
                    name: 'WaitBite',
                    duration: 1.0,
                    easing: 'Linear',
                    jointAnglesDeg: {
                        RightShoulder: [-25, 0, 0],
                        RightElbow: [30, 0, 0],
                        Waist: [0, 0, 0]
                    }
                },
                {
                    name: 'ReelIn',
                    duration: 0.45,
                    easing: 'BounceOut',
                    jointAnglesDeg: {
                        RightShoulder: [45, 0, 0],
                        RightElbow: [80, 0, 0],
                        LeftShoulder: [30, 20, 0]
                    }
                }
            ],
            constraints: {
                rightHandAttachment: 'RightGripAttachment',
                preserveBalance: true
            }
        };
    }
    /**
     * Melee Sword Slash Preset
     */
    getMeleeSlashPreset() {
        return {
            name: 'MeleeSwordSlash',
            rigType: 'R15',
            duration: 0.6,
            looped: false,
            priority: 'Action',
            phases: [
                {
                    name: 'Anticipation',
                    duration: 0.15,
                    easing: 'QuadOut',
                    jointAnglesDeg: {
                        RightShoulder: [80, 45, 0],
                        RightElbow: [60, 0, 0],
                        Waist: [0, -30, 0]
                    }
                },
                {
                    name: 'Strike',
                    duration: 0.2,
                    easing: 'BackOut',
                    jointAnglesDeg: {
                        RightShoulder: [-40, -60, 0],
                        RightElbow: [10, 0, 0],
                        Waist: [0, 45, 0]
                    }
                },
                {
                    name: 'Recovery',
                    duration: 0.25,
                    easing: 'QuadInOut',
                    jointAnglesDeg: {
                        RightShoulder: [0, 0, 0],
                        RightElbow: [0, 0, 0],
                        Waist: [0, 0, 0]
                    }
                }
            ]
        };
    }
    /**
     * Interact / Pickup Item Preset
     */
    getPickupInteractPreset() {
        return {
            name: 'InteractPickup',
            rigType: 'R15',
            duration: 0.7,
            looped: false,
            priority: 'Action',
            phases: [
                {
                    name: 'ReachDown',
                    duration: 0.35,
                    easing: 'QuadOut',
                    jointAnglesDeg: {
                        RightShoulder: [-60, 0, 0],
                        RightElbow: [20, 0, 0],
                        Waist: [25, 0, 0]
                    }
                },
                {
                    name: 'Retrieve',
                    duration: 0.35,
                    easing: 'QuadInOut',
                    jointAnglesDeg: {
                        RightShoulder: [20, 0, 0],
                        RightElbow: [90, 0, 0],
                        Waist: [0, 0, 0]
                    }
                }
            ]
        };
    }
    /**
     * Breathing Idle Preset
     */
    getLocomotionIdlePreset() {
        return {
            name: 'LocomotionBreathingIdle',
            rigType: 'R15',
            duration: 2.0,
            looped: true,
            priority: 'Idle',
            phases: [
                {
                    name: 'Inhale',
                    duration: 1.0,
                    easing: 'QuadInOut',
                    jointAnglesDeg: {
                        Waist: [3, 0, 0],
                        RightShoulder: [5, 0, 5],
                        LeftShoulder: [5, 0, -5]
                    }
                },
                {
                    name: 'Exhale',
                    duration: 1.0,
                    easing: 'QuadInOut',
                    jointAnglesDeg: {
                        Waist: [0, 0, 0],
                        RightShoulder: [0, 0, 0],
                        LeftShoulder: [0, 0, 0]
                    }
                }
            ]
        };
    }
    /**
     * Get any registered animation preset by name
     */
    getPreset(presetName) {
        const lower = (presetName || '').toLowerCase().replace(/[^a-z0-9]/g, '_');
        if (lower.includes('fish'))
            return this.getFishingAnimationPreset();
        if (lower.includes('melee') || lower.includes('sword') || lower.includes('slash') || lower.includes('attack'))
            return this.getMeleeSlashPreset();
        if (lower.includes('pickup') || lower.includes('interact') || lower.includes('grab'))
            return this.getPickupInteractPreset();
        if (lower.includes('idle') || lower.includes('breath') || lower.includes('stand'))
            return this.getLocomotionIdlePreset();
        return undefined;
    }
    /**
     * List all available animation presets
     */
    listPresets() {
        return ['fishing_cast', 'melee_slash', 'interact_pickup', 'locomotion_idle'];
    }
}
export const animationDSLEngine = new AnimationDSLEngine();
//# sourceMappingURL=AnimationDSLEngine.js.map