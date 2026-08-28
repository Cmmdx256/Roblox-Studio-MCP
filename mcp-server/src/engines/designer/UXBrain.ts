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

export class UXBrain {
    /**
     * Synthesizes UX flows, onboarding sequences, input mappings, and screen requirements for a given genre.
     */
    public designUXFlow(genre: GameGenre, theme: string, coreLoopSummary: string): UXFlowSpec {
        const lowerTheme = theme.toLowerCase();
        const isFishing = lowerTheme.includes('fish');

        if (genre === 'Simulator' || isFishing) {
            return {
                onboarding: {
                    firstTimeUserExperience: isFishing
                        ? 'Player spawns facing the scenic fishing pier with rod equipped automatically in StarterGear.'
                        : `Player spawns in ${theme} hub with tool prompt pointing toward initial gathering node.`,
                    initialObjective: isFishing ? 'Cast your rod into the water to catch your first fish!' : 'Gather your first resource!',
                    guidedPrompts: [
                        'Equip your tool from the backpack',
                        'Approach the interactive gathering area',
                        'Sell your inventory at the merchant NPC when full'
                    ]
                },
                inputMapping: {
                    desktop: {
                        'LeftClick / Mouse1': 'Activate Tool / Cast',
                        'E / KeyCode.E': 'Interact with NPC / Open Shop',
                        'Tab / KeyCode.Tab': 'Toggle Inventory Bucket View'
                    },
                    mobile: {
                        'Tap Screen / ActionButton': 'Cast / Activate',
                        'Tap ProximityPrompt': 'Interact with NPC',
                        'HUD Inventory Pill Tap': 'Open Bag'
                    },
                    controller: {
                        'ButtonR2': 'Activate Tool',
                        'ButtonX': 'Interact / ProximityPrompt',
                        'ButtonY': 'Toggle Inventory HUD'
                    }
                },
                screens: [
                    {
                        id: 'SCR-HUD',
                        screenName: isFishing ? 'FishingHUD' : 'MainHUD',
                        purpose: 'Persistent gameplay overlay displaying balance, capacity, and active status.',
                        layout: 'hud_overlay',
                        theme: isFishing ? 'fishing_casual' : 'modern_minimal',
                        components: [
                            { type: 'CurrencyPill', id: 'CoinBalance', label: 'Coins' },
                            { type: 'ProgressBar', id: 'CapacityMeter', label: isFishing ? 'Fish Bucket' : 'Inventory' },
                            { type: 'Button', id: 'CastActionBtn', label: isFishing ? 'Cast Rod' : 'Action' }
                        ]
                    },
                    {
                        id: 'SCR-INVENTORY',
                        screenName: isFishing ? 'FishBucketGui' : 'InventoryGui',
                        purpose: 'Itemized grid displaying caught items with individual rarity and sell values.',
                        layout: 'centered',
                        theme: isFishing ? 'fishing_casual' : 'modern_minimal',
                        components: [
                            { type: 'Header', id: 'Title', label: isFishing ? 'Caught Fish Collection' : 'Inventory' },
                            { type: 'SlotGrid', id: 'ItemGrid', purpose: 'Item slot container' },
                            { type: 'Button', id: 'SellAllBtn', label: 'Sell All to Merchant' }
                        ]
                    },
                    {
                        id: 'SCR-SHOP',
                        screenName: 'MerchantShopGui',
                        purpose: 'Merchant dialog offering upgrades, tools, and bait.',
                        layout: 'centered',
                        theme: isFishing ? 'fishing_casual' : 'dark_fantasy',
                        components: [
                            { type: 'Header', id: 'ShopTitle', label: 'Merchant Supplies' },
                            { type: 'ItemCard', id: 'UpgradeSlot1', label: 'Reinforced Bucket' },
                            { type: 'ItemCard', id: 'UpgradeSlot2', label: 'Golden Rod' }
                        ]
                    }
                ],
                notifications: [
                    { event: 'ItemAcquired', messageTemplate: 'Caught a {ItemName} ({Rarity})! Worth {Value} coins.', durationSec: 3.5, soundCue: 'SuccessChime' },
                    { event: 'InventoryFull', messageTemplate: 'Your bucket is full! Visit the merchant to sell your fish.', durationSec: 4.0, soundCue: 'AlertBuzz' },
                    { event: 'TransactionComplete', messageTemplate: 'Sold {Count} items for +{TotalValue} Gold Coins!', durationSec: 3.0, soundCue: 'CashRegister' }
                ]
            };
        }

        if (genre === 'Obby') {
            return {
                onboarding: {
                    firstTimeUserExperience: 'Player spawns on Stage 1 spawn platform facing clearly marked forward obstacle path.',
                    initialObjective: 'Jump across platforms to reach Checkpoint 1!',
                    guidedPrompts: ['Use Spacebar / Jump Button to cross hazards', 'Touch glowing green pads to save checkpoint']
                },
                inputMapping: {
                    desktop: { 'Spacebar': 'Jump', 'Shift': 'Sprint / Camera ShiftLock' },
                    mobile: { 'JumpButton': 'Jump', 'TouchZone': 'Look / Move' },
                    controller: { 'ButtonA': 'Jump', 'ButtonL3': 'Sprint' }
                },
                screens: [
                    {
                        id: 'SCR-OBBY-HUD',
                        screenName: 'StageHUD',
                        purpose: 'Displays active stage, death counter, and timer.',
                        layout: 'hud_overlay',
                        theme: 'cartoon',
                        components: [
                            { type: 'Label', id: 'StageCounter', label: 'Stage 1' },
                            { type: 'Button', id: 'ResetBtn', label: 'Respawn at Checkpoint' }
                        ]
                    }
                ],
                notifications: [
                    { event: 'CheckpointSaved', messageTemplate: 'Checkpoint {StageNumber} Saved!', durationSec: 2.0, soundCue: 'Ding' }
                ]
            };
        }

        // Generic / RPG / Adventure UX flow
        return {
            onboarding: {
                firstTimeUserExperience: `Player enters ${theme} world with immediate visual sightline to starting landmark.`,
                initialObjective: 'Explore the area and speak with the guide NPC.',
                guidedPrompts: ['Follow the illuminated path', 'Press E to interact']
            },
            inputMapping: {
                desktop: { 'E': 'Interact', 'M': 'Map / Quest Log', 'Tab': 'Inventory' },
                mobile: { 'InteractPrompt': 'Interact', 'HUDIcon': 'Menu' },
                controller: { 'ButtonX': 'Interact', 'ButtonSelect': 'Menu' }
            },
            screens: [
                {
                    id: 'SCR-GEN-HUD',
                    screenName: 'AdventureHUD',
                    purpose: 'Status overlay with health bar, mini-objective, and interaction prompts.',
                    layout: 'hud_overlay',
                    theme: 'dark_fantasy',
                    components: [
                        { type: 'ProgressBar', id: 'HealthBar', label: 'Health' },
                        { type: 'Label', id: 'ObjectiveText', label: 'Current Quest' }
                    ]
                }
            ],
            notifications: [
                { event: 'QuestUpdated', messageTemplate: 'Objective Updated: {QuestTitle}', durationSec: 4.0, soundCue: 'QuestUpdate' }
            ]
        };
    }
}

export const uxBrain = new UXBrain();
