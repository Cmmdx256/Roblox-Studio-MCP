import { GameGenre } from './types.js';

export class PolishBrain {
    /**
     * Synthesizes audio-visual polish, sensory feedback, and retention hooks for any genre and theme.
     */
    public designPolish(genre: GameGenre, theme: string): {
        feedbackSensoryChecklist: string[];
        retentionHooks: string[];
        soundPalette: string[];
    } {
        const lowerTheme = theme.toLowerCase();
        const isFishing = lowerTheme.includes('fish');

        if (isFishing) {
            return {
                feedbackSensoryChecklist: [
                    'Bobber creates concentric expanding water splash rings on cast touchdown',
                    'Rod tip bends dynamically using TweenService or Spring constraint during fish tension',
                    'Catch splash particle burst with glowing water droplets upon fish reel completion',
                    'Golden coin shower and soft sparkle popup over player head on NPC sell transaction',
                    'UI button scale bounce (0.95 -> 1.05 -> 1.0) on all HUD clicks via TweenService'
                ],
                retentionHooks: [
                    'Rarity bestiary collection catalog with shadow silhouettes for uncompleted fish',
                    'Daily bonus catch with 2x coin multiplier',
                    'Equippable rods with distinct cosmetic particle trails',
                    'Leaderboard for heaviest catch of the server'
                ],
                soundPalette: [
                    'Ambient: Gentle ocean shoreline waves and distant seagulls (Volume 0.25, Looped)',
                    'Action: Realistic wooden rod cast swoosh + water splash plop (Pitch 1.0)',
                    'Tension: Rapid ticking reel ratchet sound (Pitch 1.2)',
                    'Reward: Crisp metallic gold coin jingle + triumphant brass fanfare for rare catches'
                ]
            };
        }

        if (genre === 'Obby') {
            return {
                feedbackSensoryChecklist: [
                    'Checkpoint beam emits vertical green light column and plays ascending chime',
                    'Falling off platform triggers gentle fade-to-black transition before checkpoint respawn',
                    'Speed lines overlay at screen edges during sprint / high velocity',
                    'Stage clear confetti explosion at course finish'
                ],
                retentionHooks: [
                    'Personal best stage timer with ghost runner replay',
                    'Unlockable particle trails for completing hard stages',
                    'Global speedrun leaderboard'
                ],
                soundPalette: [
                    'Ambient: Upbeat electronic synth background music',
                    'Action: Crisp jump pop and landing tap',
                    'Reward: Ascending triple-tone chime on checkpoint'
                ]
            };
        }

        return {
            feedbackSensoryChecklist: [
                'Interactive objects highlight with subtle neon outline on player proximity',
                'UI feedback toasts with smooth slide-in and fade-out animations',
                'Audio confirmation on every successful state change'
            ],
            retentionHooks: [
                'Structured milestone progression tiers with visible upcoming rewards',
                'Daily objective rewards and streak tracker'
            ],
            soundPalette: [
                `Ambient: Immersive ${theme} atmospheric loop`,
                'UI: Modern soft click and menu open swish',
                'Success: Uplifting chime chord'
            ]
        };
    }
}

export const polishBrain = new PolishBrain();
