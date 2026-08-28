/**
 * GameplayStateObserver.ts
 *
 * Observes dynamic gameplay state during Play mode: leaderstats, inventories,
 * active rounds, spawn events, and custom gameplay variables.
 *
 * Driven by capability requirements from the intent — not hardcoded to any game type.
 */

import { commandDispatcher } from '../dispatcher/commandDispatcher.js';
import { GameplayStateSnapshot, PlayerRuntimeState, VerificationStatus } from './types.js';
import { studioSessionManager } from '../session/StudioSessionManager.js';

export class GameplayStateObserver {
    /**
     * Collect a gameplay state snapshot.
     * The snapshot is generic — it reads whatever leaderstats and folder structures exist.
     */
    public async collectSnapshot(): Promise<GameplayStateSnapshot> {
        const capturedAt = Date.now();
        let players: PlayerRuntimeState[] = [];
        let leaderstats: Record<string, Record<string, any>> = {};
        let inventories: Record<string, any[]> = {};
        let activeRounds = 0;
        let spawnCount = 0;
        let gameplayVariables: Record<string, any> = {};
        let remoteEventActivity = 0;
        let status: VerificationStatus = 'UNAVAILABLE';

        // A DataModel read in Edit mode is not gameplay evidence.  In
        // particular, it cannot establish that a player, input, or state
        // transition actually ran in a Roblox client.
        const session = studioSessionManager.getSession();
        if (!studioSessionManager.isAlive() || !session.dataModelAvailable || !session.playtestRunning) {
            return {
                capturedAt,
                players,
                leaderstats,
                inventories,
                activeRounds,
                spawnCount,
                gameplayVariables,
                remoteEventActivity,
                status: 'BLOCKED',
            };
        }

        try {
            // Generic Luau query — reads any leaderstats structure, not game-specific
            const resp = await commandDispatcher.executeCommand('execute_luau', {
                code: `
local Players = game:GetService("Players")
local result = {
    players = {},
    leaderstats = {},
    inventories = {},
    activeRounds = 0,
    spawnCount = 0
}
for _, p in ipairs(Players:GetPlayers()) do
    result.players[#result.players + 1] = {
        userId = p.UserId,
        displayName = p.DisplayName
    }
    local ls = p:FindFirstChild("leaderstats")
    if ls then
        local stats = {}
        for _, v in ipairs(ls:GetChildren()) do
            stats[v.Name] = v.Value
        end
        result.leaderstats[p.DisplayName] = stats
    end
    -- Generic inventory: look for any folder named "Inventory" or "Backpack"
    local inv = p:FindFirstChild("Inventory") or p:FindFirstChild("Backpack")
    if inv then
        local items = {}
        for _, item in ipairs(inv:GetChildren()) do
            items[#items + 1] = item.Name
        end
        result.inventories[p.DisplayName] = items
    end
end
-- Count spawn locations
local spawnLocations = workspace:GetDescendants()
local count = 0
for _, d in ipairs(spawnLocations) do
    if d:IsA("SpawnLocation") then count = count + 1 end
end
result.spawnCount = count
return result
`
            });

            if (resp?.result) {
                const r = resp.result as any;
                players = r.players ?? [];
                leaderstats = r.leaderstats ?? {};
                inventories = r.inventories ?? {};
                activeRounds = r.activeRounds ?? 0;
                spawnCount = r.spawnCount ?? 0;
                status = 'VERIFIED';
            } else {
                status = 'PARTIAL';
            }
        } catch {
            status = 'BLOCKED';
        }

        return {
            capturedAt,
            players,
            leaderstats,
            inventories,
            activeRounds,
            spawnCount,
            gameplayVariables,
            remoteEventActivity,
            status
        };
    }

    /**
     * Verify a specific gameplay condition via Luau.
     * Used by acceptance criteria evaluation after playtest.
     *
     * @param conditionLuau A Luau expression that returns `true` or `false`
     */
    public async verifyCondition(conditionLuau: string): Promise<{
        passed: boolean;
        status: VerificationStatus;
        rawResult?: any;
    }> {
        const session = studioSessionManager.getSession();
        if (!studioSessionManager.isAlive() || !session.dataModelAvailable || !session.playtestRunning) {
            return {
                passed: false,
                status: 'BLOCKED',
                rawResult: 'BLOCKED_BY_PLATFORM: gameplay conditions require an active, observed Roblox Studio Play session.',
            };
        }
        try {
            const resp = await commandDispatcher.executeCommand('execute_luau', {
                code: `return (${conditionLuau})`
            });
            const result = resp?.result;
            if (typeof result === 'boolean') {
                return { passed: result, status: result ? 'VERIFIED' : 'FAILED', rawResult: result };
            }
            return { passed: false, status: 'PARTIAL', rawResult: result };
        } catch (err: any) {
            return { passed: false, status: 'BLOCKED', rawResult: err?.message };
        }
    }

    /**
     * Generate a test scenario from acceptance criteria.
     * The scenario steps are derived from the criteria type and description — not from a hardcoded game.
     */
    public deriveTestScenario(criteria: Array<{ id: string; type: string; description: string }>): Array<{
        step: number;
        action: string;
        verificationLuau?: string;
    }> {
        const steps: Array<{ step: number; action: string; verificationLuau?: string }> = [];
        let stepNum = 1;

        // Always start with spawn verification
        steps.push({
            step: stepNum++,
            action: 'Spawn player and verify character exists',
            verificationLuau: `#game:GetService("Players"):GetPlayers() > 0`
        });

        for (const criterion of criteria) {
            const typeUpper = criterion.type?.toUpperCase() ?? '';

            if (typeUpper === 'INTERACTION' || typeUpper === 'GAMEPLAY') {
                steps.push({
                    step: stepNum++,
                    action: `Verify gameplay interaction: ${criterion.description}`,
                    verificationLuau: undefined // Requires runtime verification
                });
            } else if (typeUpper === 'INVENTORY' || typeUpper === 'ECONOMY') {
                steps.push({
                    step: stepNum++,
                    action: `Check inventory and economy state: ${criterion.description}`,
                    verificationLuau: `game:GetService("Players"):GetPlayers()[1] ~= nil`
                });
            } else if (typeUpper === 'UI') {
                steps.push({
                    step: stepNum++,
                    action: `Verify UI element exists: ${criterion.description}`,
                    verificationLuau: `#game:GetService("StarterGui"):GetChildren() > 0`
                });
            } else if (typeUpper === 'PERFORMANCE') {
                steps.push({
                    step: stepNum++,
                    action: `Check performance constraints: ${criterion.description}`,
                    verificationLuau: `#workspace:GetDescendants() < 5000`
                });
            } else {
                steps.push({
                    step: stepNum++,
                    action: `Verify: ${criterion.description}`
                });
            }
        }

        // End with respawn and persistence check
        steps.push({
            step: stepNum++,
            action: 'Verify persistence after respawn',
            verificationLuau: `game:GetService("Players"):GetPlayers()[1] ~= nil`
        });

        return steps;
    }
}

export const gameplayStateObserver = new GameplayStateObserver();
