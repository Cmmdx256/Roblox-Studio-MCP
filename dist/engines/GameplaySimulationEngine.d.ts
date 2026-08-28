export interface LootTableItem {
    id: string;
    name: string;
    weight: number;
    value: number;
}
export interface EconomySimulationConfig {
    iterations: number;
    playerCount: number;
    playtimeMinutesPerSession: number;
    lootTable: LootTableItem[];
    actionDurationSec: number;
    upgradeCosts: number[];
}
export interface EconomySimulationResult {
    totalCatchesSimulated: number;
    distribution: Record<string, {
        count: number;
        empiricalPercent: number;
        theoreticalPercent: number;
    }>;
    averageIncomePerMinute: number;
    estimatedTimeToTier: Record<number, {
        minutesToReach: number;
        sessionsRequired: number;
    }>;
    economyStabilityScore: number;
    warnings: string[];
}
export declare class GameplaySimulationEngine {
    /**
     * Runs Monte Carlo simulation of gameplay drops and economy accumulation.
     */
    simulateEconomy(config: EconomySimulationConfig): EconomySimulationResult;
}
export declare const gameplaySimulationEngine: GameplaySimulationEngine;
//# sourceMappingURL=GameplaySimulationEngine.d.ts.map