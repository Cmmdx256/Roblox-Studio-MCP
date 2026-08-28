import { GameGenre, AnimationCue } from './types.js';

export class AnimationDirectionBrain {
    /**
     * Synthesizes animation requirements, keyframe sequences, joint sequences, and priority choreography from gameplay mechanics.
     */
    public designAnimations(genre: GameGenre, mechanicsList: string[], theme: string): AnimationCue[] {
        const lowerTheme = theme.toLowerCase();
        const isFishing = lowerTheme.includes('fish') || mechanicsList.some(m => m.toLowerCase().includes('cast') || m.toLowerCase().includes('fish'));

        const cues: AnimationCue[] = [];

        // Baseline locomotion & idle
        cues.push({
            name: 'LocomotionIdle',
            trigger: 'Player Stationary',
            characterAction: 'Breathing idle with natural shoulder sway and tool held ready in right hand',
            jointSequence: ['RightUpperArm', 'RightLowerArm', 'UpperTorso'],
            durationSec: 2.0,
            priority: 'Idle',
            looping: true
        });

        if (isFishing) {
            cues.push({
                name: 'FishingCast',
                trigger: 'Player activates fishing rod tool',
                characterAction: 'Windup rod backward -> Snap forward forcefully into casting release -> Return to resting stance',
                jointSequence: ['RightUpperArm', 'RightLowerArm', 'RightHand', 'UpperTorso', 'Head'],
                durationSec: 1.2,
                priority: 'Action',
                looping: false
            });

            cues.push({
                name: 'FishingReelLoop',
                trigger: 'Fish bite detected / reeling minigame active',
                characterAction: 'Right hand braces rod while left hand rapidly cranks reel mechanism in circular motion',
                jointSequence: ['LeftUpperArm', 'LeftLowerArm', 'LeftHand', 'RightUpperArm', 'UpperTorso'],
                durationSec: 0.6,
                priority: 'Action',
                looping: true
            });

            cues.push({
                name: 'CatchSuccessShowcase',
                trigger: 'Fish catch completed successfully',
                characterAction: 'Raises caught fish triumphantly overhead with two hands and smiles at camera',
                jointSequence: ['RightUpperArm', 'LeftUpperArm', 'RightHand', 'LeftHand', 'Head'],
                durationSec: 1.8,
                priority: 'ActionPriority',
                looping: false
            });
        }

        if (genre === 'Combat') {
            cues.push({
                name: 'SlashLight',
                trigger: 'Tool Activated',
                characterAction: 'Horizontal diagonal sword swing across torso',
                jointSequence: ['RightUpperArm', 'RightLowerArm', 'UpperTorso', 'LowerTorso'],
                durationSec: 0.45,
                priority: 'Action',
                looping: false
            });
        }

        if (genre === 'Obby') {
            cues.push({
                name: 'DoubleJumpFlip',
                trigger: 'Second jump in air',
                characterAction: 'Front flip rotation before touchdown',
                jointSequence: ['HumanoidRootPart', 'UpperTorso', 'LeftUpperLeg', 'RightUpperLeg'],
                durationSec: 0.5,
                priority: 'ActionPriority',
                looping: false
            });
        }

        // Generic interaction cue
        cues.push({
            name: 'InteractPickup',
            trigger: 'ProximityPrompt activated on item or NPC',
            characterAction: 'Reaches down with right hand, grasps target, and brings to chest before stowing',
            jointSequence: ['RightUpperArm', 'RightLowerArm', 'RightHand', 'UpperTorso'],
            durationSec: 0.8,
            priority: 'Action',
            looping: false
        });

        return cues;
    }
}

export const animationDirectionBrain = new AnimationDirectionBrain();
