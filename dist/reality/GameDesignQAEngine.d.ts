/**
 * GameDesignQAEngine.ts
 *
 * Evaluates game design coherence for arbitrary game designs.
 * Reports DESIGN_RISK, DESIGN_OBSERVATION, and POSSIBLE_IMPROVEMENT.
 * Never claims to measure "fun" — provides structured design analysis.
 * Fully capability-driven — not specific to any genre.
 */
import { GameDesignQAReport } from './types.js';
import { StructuredIntent } from '../engines/IntentEngine.js';
import { GameDesignSpec } from '../engines/designer/types.js';
export declare class GameDesignQAEngine {
    /**
     * Evaluate a GameDesignSpec for design coherence.
     * Works for any genre — uses capability-based design heuristics.
     */
    evaluate(spec: GameDesignSpec, intent: StructuredIntent): GameDesignQAReport;
    /**
     * Quick design QA from a natural language prompt.
     * Synthesizes a design spec then evaluates it.
     */
    evaluateFromPrompt(prompt: string, intent: StructuredIntent): GameDesignQAReport;
}
export declare const gameDesignQAEngine: GameDesignQAEngine;
//# sourceMappingURL=GameDesignQAEngine.d.ts.map