import { GameGenre, GameDesignSpec, MechanicDefinition, ProgressionTier, EconomyCurrency } from './types.js';

export class GameDesignBrain {
    /**
     * Determines the game genre from natural language keywords and context.
     */
    public inferGenre(prompt: string): GameGenre {
        const lower = prompt.toLowerCase();
        if (lower.includes('hybrid') || lower.includes('genre-blending') || lower.includes('genre blending')) {
            return 'Hybrid';
        }
        if (lower.includes('tower defense') || lower.includes('tower-defence') || lower.includes('wave defense')) {
            return 'TowerDefense';
        }
        if (lower.includes('roguelike') || lower.includes('rogue-lite') || lower.includes('permadeath') || lower.includes('procedural run')) {
            return 'Roguelike';
        }
        if (lower.includes('survival') || lower.includes('crafting survival') || lower.includes('hunger') || lower.includes('base survival')) {
            return 'Survival';
        }
        if (lower.includes('pvp') || lower.includes('player versus player')) {
            return 'PvP';
        }
        if (lower.includes('pve') || lower.includes('player versus environment') || lower.includes('co-op combat')) {
            return 'PvE';
        }
        if (lower.includes('multiplayer') || lower.includes('co-op') || lower.includes('coop')) {
            return 'Multiplayer';
        }
        if (lower.includes('strategy') || lower.includes('tactical') || lower.includes('turn-based') || lower.includes('turn based')) {
            return 'Strategy';
        }
        if (lower.includes('social') || lower.includes('hangout') || lower.includes('roleplay') || lower.includes('role-play')) {
            return 'Social';
        }
        if (lower.includes('fish') || lower.includes('simulator') || lower.includes('clicker') || lower.includes('harvest') || lower.includes('mine')) {
            return 'Simulator';
        }
        if (lower.includes('obby') || lower.includes('parkour') || lower.includes('platformer') || lower.includes('jump') || lower.includes('obstacle')) {
            return 'Obby';
        }
        if (lower.includes('tycoon') || lower.includes('build factory') || lower.includes('dropper') || lower.includes('conveyor') || lower.includes('automate')) {
            return 'Tycoon';
        }
        if (lower.includes('horror') || lower.includes('scary') || lower.includes('escape') || lower.includes('monster') || lower.includes('dark')) {
            return 'Horror';
        }
        if (lower.includes('combat') || lower.includes('fight') || lower.includes('sword') || lower.includes('pvp') || lower.includes('battle') || lower.includes('arena')) {
            return 'Combat';
        }
        if (lower.includes('race') || lower.includes('racing') || lower.includes('car') || lower.includes('vehicle') || lower.includes('speed')) {
            return 'Racing';
        }
        if (lower.includes('puzzle') || lower.includes('mystery') || lower.includes('riddle') || lower.includes('maze')) {
            return 'Puzzle';
        }
        if (lower.includes('quest') || lower.includes('dungeon') || lower.includes('story') || lower.includes('class') || lower.includes('level up')) {
            return 'RPG';
        }
        // Unknown genres remain first-class design inputs rather than being
        // silently relabelled as Adventure.  Downstream brains use their
        // generic paths for Custom and Hybrid concepts.
        return 'Custom';
    }

    /**
     * Synthesizes player fantasy, core gameplay loop, and secondary loops for a given genre and prompt.
     */
    public synthesizeCoreLoop(genre: GameGenre, prompt: string, theme: string): {
        fantasy: string;
        coreLoop: GameDesignSpec['coreLoop'];
        secondaryLoop?: GameDesignSpec['secondaryLoop'];
        mechanics: MechanicDefinition[];
        progression: GameDesignSpec['progression'];
        economy?: GameDesignSpec['economy'];
    } {
        switch (genre) {
            case 'Simulator': {
                const isFishing = prompt.toLowerCase().includes('fish');
                const activity = isFishing ? 'Cast & Catch' : 'Gather / Collect';
                const item = isFishing ? 'Fish' : 'Resource';

                return {
                    fantasy: isFishing 
                        ? 'Master angler exploring scenic waters, catching rare legendary fish, and building a flourishing aquatic trade.'
                        : `Thriving entrepreneur gathering valuable ${theme} resources to build wealth and power.`,
                    coreLoop: {
                        summary: `${activity} -> Store in Inventory -> Sell at Market -> Buy Upgrades -> Unlock Richer Zones`,
                        phases: [
                            { name: 'Engage Mechanic', action: `Player interacts at resource nodes (${activity})`, rewardOrTransition: `Obtains ${item} of varying rarity` },
                            { name: 'Collect & Inventory', action: `Stores ${item} in capacity-limited container`, rewardOrTransition: 'Container fills up towards cap' },
                            { name: 'Sell & Monetize', action: 'Transports haul to merchant NPC for individual value redemption', rewardOrTransition: 'Receives Gold / Coins' },
                            { name: 'Upgrade & Expand', action: 'Spends currency on better equipment and unlocks deeper zones', rewardOrTransition: 'Increases collection efficiency and unlocks new content' }
                        ]
                    },
                    secondaryLoop: {
                        summary: 'Collection logs, cosmetic rods/tools, pet companions, and mastery quests.',
                        activities: ['Complete Rarity Bestiary', 'Equip Luck Boosters', 'Trade with Other Players']
                    },
                    mechanics: [
                        {
                            id: 'MEC-SIM-001',
                            name: isFishing ? 'Rod Casting & Reeling' : 'Resource Gathering',
                            description: 'Interactive minigame determining catch or harvest quality.',
                            category: 'Minigame',
                            inputTrigger: 'Tool Activate / Click',
                            serverAuthoritative: true,
                            stateTransitions: ['Idle', 'Active', 'Waiting', 'Success'],
                            feedback: { soundCue: 'WaterSplash', visualEffect: 'Ripples', uiFeedback: 'TensionBar' }
                        },
                        {
                            id: 'MEC-SIM-002',
                            name: 'Capacity Management',
                            description: 'Bucket or backpack inventory with weight/slot constraints.',
                            category: 'Inventory',
                            inputTrigger: 'Passive on Catch',
                            serverAuthoritative: true,
                            stateTransitions: ['Empty', 'Filling', 'Full'],
                            feedback: { uiFeedback: 'SlotCounter', soundCue: 'ItemPickup' }
                        },
                        {
                            id: 'MEC-SIM-003',
                            name: 'Authoritative Merchant Trade',
                            description: 'Safe transaction with seller NPC computing itemized item values.',
                            category: 'Economy',
                            inputTrigger: 'ProximityPrompt on NPC',
                            serverAuthoritative: true,
                            stateTransitions: ['ReviewItems', 'ConfirmSell', 'PayoutGranted'],
                            feedback: { soundCue: 'CoinJingle', visualEffect: 'GoldSparks', uiFeedback: 'SellToast' }
                        }
                    ],
                    progression: {
                        type: 'Tiered',
                        tiers: [
                            { level: 1, requiredXpOrCurrency: 0, unlocks: ['Basic Rod / Tool', 'Spawn Shore Zone'] },
                            { level: 2, requiredXpOrCurrency: 250, unlocks: ['Reinforced Bucket (x2 Capacity)', 'Coral Reef Zone'] },
                            { level: 3, requiredXpOrCurrency: 1000, unlocks: ['Pro Tool (Luck +25%)', 'Deep Sea Pier'] },
                            { level: 4, requiredXpOrCurrency: 5000, unlocks: ['Golden Rod', 'Mystic Trench Area'] }
                        ]
                    },
                    economy: {
                        currencies: [
                            { id: 'gold', name: 'Gold Coins', symbol: '🪙', startAmount: 0, sources: ['Selling Catches', 'Achievements'], sinks: ['Tool Upgrades', 'Bucket Expansion', 'Zone Passes'], inflationControl: 'Exponential upgrade pricing tiers' }
                        ],
                        itemCatalog: isFishing ? [
                            { id: 'fish_common_trout', name: 'River Trout', category: 'Common', price: 0, rarity: 'Common', sellValue: 15 },
                            { id: 'fish_uncommon_bass', name: 'Striped Bass', category: 'Uncommon', price: 0, rarity: 'Uncommon', sellValue: 45 },
                            { id: 'fish_rare_salmon', name: 'Golden Salmon', category: 'Rare', price: 0, rarity: 'Rare', sellValue: 120 },
                            { id: 'fish_epic_swordfish', name: 'Royal Swordfish', category: 'Epic', price: 0, rarity: 'Epic', sellValue: 450 },
                            { id: 'fish_legendary_kraken', name: 'Abyssal Leviathan', category: 'Legendary', price: 0, rarity: 'Legendary', sellValue: 2000 }
                        ] : [
                            { id: 'mat_copper', name: 'Copper Chunk', category: 'Common', price: 0, rarity: 'Common', sellValue: 10 },
                            { id: 'mat_iron', name: 'Iron Ingot', category: 'Uncommon', price: 0, rarity: 'Uncommon', sellValue: 35 },
                            { id: 'mat_gold', name: 'Gold Nugget', category: 'Rare', price: 0, rarity: 'Rare', sellValue: 100 },
                            { id: 'mat_diamond', name: 'Luminous Gem', category: 'Legendary', price: 0, rarity: 'Legendary', sellValue: 600 }
                        ]
                    }
                };
            }

            case 'Obby': {
                return {
                    fantasy: 'Agile runner defying gravity and mastering treacherous obstacle courses.',
                    coreLoop: {
                        summary: 'Navigate Stages -> Reach Checkpoints -> Avoid Killbricks -> Complete Course -> Unlock Badges & Trails',
                        phases: [
                            { name: 'Traverse Hazards', action: 'Jump across platforms, rotating beams, and fading tiles', rewardOrTransition: 'Maintains momentum and lives' },
                            { name: 'Checkpoint Activation', action: 'Touch checkpoint pad to update spawn coordinate', rewardOrTransition: 'Saves progress' },
                            { name: 'Stage Completion', action: 'Reach the pinnacle or goal area', rewardOrTransition: 'Awards Stage Victory and Currency' }
                        ]
                    },
                    mechanics: [
                        {
                            id: 'MEC-OBBY-001',
                            name: 'Hazard Detection',
                            description: 'Instant respawn upon touching lava or kill surfaces with safe debounce.',
                            category: 'Movement',
                            inputTrigger: 'Touched Event',
                            serverAuthoritative: true,
                            stateTransitions: ['Safe', 'Dead', 'RespawningAtCheckpoint'],
                            feedback: { soundCue: 'ExplosionSoft', visualEffect: 'RedDissolve' }
                        },
                        {
                            id: 'MEC-OBBY-002',
                            name: 'Checkpoint Progress Tracker',
                            description: 'Saves active stage in DataStore and repositions character smoothly.',
                            category: 'Progression',
                            inputTrigger: 'Touched Checkpoint Pad',
                            serverAuthoritative: true,
                            stateTransitions: ['Unreached', 'Activated'],
                            feedback: { soundCue: 'DingPositive', visualEffect: 'GreenRays', uiFeedback: 'StagePopup' }
                        }
                    ],
                    progression: {
                        type: 'Linear',
                        tiers: [
                            { level: 1, requiredXpOrCurrency: 1, unlocks: ['Stage 1-5 (Grassland)'] },
                            { level: 2, requiredXpOrCurrency: 5, unlocks: ['Stage 6-10 (Lava Caves)'] },
                            { level: 3, requiredXpOrCurrency: 10, unlocks: ['Stage 11-15 (Sky Realm)', 'Speed Trail'] }
                        ]
                    },
                    economy: {
                        currencies: [
                            { id: 'stars', name: 'Stars', symbol: '⭐', startAmount: 0, sources: ['Clearing Stages', 'Daily Run'], sinks: ['Particle Trails', 'Halo Hats'], inflationControl: 'Fixed per-stage rewards' }
                        ],
                        itemCatalog: [
                            { id: 'trail_rainbow', name: 'Rainbow Sparkle Trail', category: 'Cosmetic', price: 50, rarity: 'Rare' },
                            { id: 'trail_fire', name: 'Flame Trail', category: 'Cosmetic', price: 100, rarity: 'Epic' }
                        ]
                    }
                };
            }

            case 'Tycoon': {
                return {
                    fantasy: 'Industrial mogul constructing an automated empire from the ground up.',
                    coreLoop: {
                        summary: 'Step on Button -> Purchase Dropper -> Ore Processed -> Collect Cash -> Expand Tycoon Plot',
                        phases: [
                            { name: 'Generate Revenue', action: 'Droppers produce valuable components along conveyors', rewardOrTransition: 'Fills up plot revenue bank' },
                            { name: 'Collect Capital', action: 'Step on cash collector pad', rewardOrTransition: 'Transfers funds into player wallet' },
                            { name: 'Unlock Infrastructure', action: 'Purchase new walls, floors, upraders, and defense turrets', rewardOrTransition: 'Expands plot footprint and increases revenue rate' }
                        ]
                    },
                    mechanics: [
                        {
                            id: 'MEC-TYC-001',
                            name: 'Button Purchase System',
                            description: 'Validates player balance before spawning instances and deducting cash.',
                            category: 'Economy',
                            inputTrigger: 'Touched Purchase Button',
                            serverAuthoritative: true,
                            stateTransitions: ['Locked', 'Affordable', 'Purchased'],
                            feedback: { soundCue: 'CashRegister', visualEffect: 'SmokePuff' }
                        }
                    ],
                    progression: {
                        type: 'Prestige',
                        tiers: [
                            { level: 1, requiredXpOrCurrency: 0, unlocks: ['Foundation + Dropper 1'] },
                            { level: 2, requiredXpOrCurrency: 1500, unlocks: ['Floor 2 + Advanced Upgrader'] },
                            { level: 3, requiredXpOrCurrency: 10000, unlocks: ['Roof + Helicopter Pad', 'Prestige Option'] }
                        ]
                    }
                };
            }

            default: {
                return {
                    fantasy: `Adventurer exploring immersive ${theme} environments, completing objectives, and mastering gameplay challenges.`,
                    coreLoop: {
                        summary: 'Explore -> Interact with Environment -> Overcome Challenges -> Gain Rewards -> Advance Story',
                        phases: [
                            { name: 'Explore & Discover', action: 'Navigate spatial zones and discover landmarks', rewardOrTransition: 'Uncovers points of interest' },
                            { name: 'Interact & Resolve', action: 'Engage with NPCs, triggers, and minigames', rewardOrTransition: 'Completes objectives' },
                            { name: 'Acquire & Progress', action: 'Receive loot, stats, or keys to advance', rewardOrTransition: 'Unlocks subsequent areas' }
                        ]
                    },
                    mechanics: [
                        {
                            id: 'MEC-GEN-001',
                            name: 'Interactive Trigger System',
                            description: 'Context-sensitive ProximityPrompts for dialogue, doors, and pickups.',
                            category: 'Interaction',
                            inputTrigger: 'ProximityPrompt Triggered',
                            serverAuthoritative: true,
                            stateTransitions: ['Available', 'InUse', 'Completed'],
                            feedback: { soundCue: 'InteractChime', visualEffect: 'GlowHighlight' }
                        }
                    ],
                    progression: {
                        type: 'Linear',
                        tiers: [
                            { level: 1, requiredXpOrCurrency: 0, unlocks: ['Starting Area'] },
                            { level: 2, requiredXpOrCurrency: 100, unlocks: ['Main Zone', 'Gear Upgrade'] }
                        ]
                    }
                };
            }
        }
    }
}

export const gameDesignBrain = new GameDesignBrain();
