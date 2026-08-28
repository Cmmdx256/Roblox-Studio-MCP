export class GameplaySimulationEngine {
    /**
     * Runs Monte Carlo simulation of gameplay drops and economy accumulation.
     */
    simulateEconomy(config) {
        const totalWeight = config.lootTable.reduce((acc, item) => acc + item.weight, 0);
        const counts = {};
        let totalValue = 0;
        for (const item of config.lootTable) {
            counts[item.id] = 0;
        }
        // Run Monte Carlo draws
        for (let i = 0; i < config.iterations; i++) {
            let roll = Math.random() * totalWeight;
            for (const item of config.lootTable) {
                if (roll <= item.weight) {
                    counts[item.id]++;
                    totalValue += item.value;
                    break;
                }
                roll -= item.weight;
            }
        }
        const distribution = {};
        for (const item of config.lootTable) {
            const count = counts[item.id] || 0;
            distribution[item.id] = {
                count,
                empiricalPercent: Math.round((count / config.iterations) * 10000) / 100,
                theoreticalPercent: Math.round((item.weight / totalWeight) * 10000) / 100
            };
        }
        // Time to acquire calculations
        const averageValuePerDraw = totalValue / config.iterations;
        const drawsPerMinute = 60 / Math.max(1, config.actionDurationSec);
        const incomePerMinute = averageValuePerDraw * drawsPerMinute;
        const timeToTier = {};
        const warnings = [];
        let cumulativeCost = 0;
        config.upgradeCosts.forEach((cost, idx) => {
            cumulativeCost += cost;
            const minutes = incomePerMinute > 0 ? Math.max(1, Math.ceil(cumulativeCost / incomePerMinute)) : 9999;
            const sessions = Math.ceil(minutes / Math.max(1, config.playtimeMinutesPerSession));
            timeToTier[idx + 1] = {
                minutesToReach: minutes,
                sessionsRequired: sessions
            };
            if (idx === 0 && minutes > 15) {
                warnings.push('Tier 1 upgrade takes longer than 15 minutes. High initial friction risk for new players.');
            }
        });
        if (incomePerMinute > 5000 && config.upgradeCosts.length > 0 && config.upgradeCosts[config.upgradeCosts.length - 1] < 10000) {
            warnings.push('Severe inflation risk: High income rate exhausts content tier upgrades too quickly.');
        }
        let stabilityScore = 100;
        stabilityScore -= warnings.length * 20;
        return {
            totalCatchesSimulated: config.iterations,
            distribution,
            averageIncomePerMinute: Math.round(incomePerMinute * 100) / 100,
            estimatedTimeToTier: timeToTier,
            economyStabilityScore: Math.max(0, stabilityScore),
            warnings
        };
    }
}
export const gameplaySimulationEngine = new GameplaySimulationEngine();
//# sourceMappingURL=GameplaySimulationEngine.js.map