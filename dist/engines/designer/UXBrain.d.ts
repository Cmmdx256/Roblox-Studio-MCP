import { GameGenre, UIScreenSpecDesign } from './types.js';
export interface UXFlowSpec {
    onboarding: {
        firstTimeUserExperience: string;
        initialObjective: string;
        guidedPrompts: string[];
    };
    inputMapping: {
        desktop: Record<string, string>;
        mobile: Record<string, string>;
        controller: Record<string, string>;
    };
    screens: UIScreenSpecDesign[];
    notifications: Array<{
        event: string;
        messageTemplate: string;
        durationSec: number;
        soundCue: string;
    }>;
}
export declare class UXBrain {
    /**
     * Synthesizes UX flows, onboarding sequences, input mappings, and screen requirements for a given genre.
     */
    designUXFlow(genre: GameGenre, theme: string, coreLoopSummary: string): UXFlowSpec;
}
export declare const uxBrain: UXBrain;
//# sourceMappingURL=UXBrain.d.ts.map