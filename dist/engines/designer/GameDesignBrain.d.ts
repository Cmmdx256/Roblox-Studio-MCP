import { GameGenre, GameDesignSpec, MechanicDefinition } from './types.js';
export declare class GameDesignBrain {
    /**
     * Determines the game genre from natural language keywords and context.
     */
    inferGenre(prompt: string): GameGenre;
    /**
     * Synthesizes player fantasy, core gameplay loop, and secondary loops for a given genre and prompt.
     */
    synthesizeCoreLoop(genre: GameGenre, prompt: string, theme: string): {
        fantasy: string;
        coreLoop: GameDesignSpec['coreLoop'];
        secondaryLoop?: GameDesignSpec['secondaryLoop'];
        mechanics: MechanicDefinition[];
        progression: GameDesignSpec['progression'];
        economy?: GameDesignSpec['economy'];
    };
}
export declare const gameDesignBrain: GameDesignBrain;
//# sourceMappingURL=GameDesignBrain.d.ts.map