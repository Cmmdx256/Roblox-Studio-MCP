/**
 * GameplayStateObserver.ts
 *
 * Observes dynamic gameplay state during Play mode: leaderstats, inventories,
 * active rounds, spawn events, and custom gameplay variables.
 *
 * Driven by capability requirements from the intent — not hardcoded to any game type.
 */
import { GameplayStateSnapshot, VerificationStatus } from './types.js';
export declare class GameplayStateObserver {
    /**
     * Collect a gameplay state snapshot.
     * The snapshot is generic — it reads whatever leaderstats and folder structures exist.
     */
    collectSnapshot(): Promise<GameplayStateSnapshot>;
    /**
     * Verify a specific gameplay condition via Luau.
     * Used by acceptance criteria evaluation after playtest.
     *
     * @param conditionLuau A Luau expression that returns `true` or `false`
     */
    verifyCondition(conditionLuau: string): Promise<{
        passed: boolean;
        status: VerificationStatus;
        rawResult?: any;
    }>;
    /**
     * Generate a test scenario from acceptance criteria.
     * The scenario steps are derived from the criteria type and description — not from a hardcoded game.
     */
    deriveTestScenario(criteria: Array<{
        id: string;
        type: string;
        description: string;
    }>): Array<{
        step: number;
        action: string;
        verificationLuau?: string;
    }>;
}
export declare const gameplayStateObserver: GameplayStateObserver;
//# sourceMappingURL=GameplayStateObserver.d.ts.map