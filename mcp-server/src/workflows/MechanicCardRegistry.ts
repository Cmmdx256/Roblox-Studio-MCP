export interface MechanicCard {
    id: string;
    name: string;
    category: 'Gameplay' | 'Interactions' | 'Economy' | 'Movement' | 'Environment';
    description: string;
    prerequisites: string[];
    requiredServices: string[];
    customizationParams: Record<string, { type: string; default: any; description: string }>;
    structure: {
        instances: Array<{ className: string; parent: string; name: string; properties?: Record<string, any> }>;
        scripts: Array<{ name: string; parent: string; type: 'Script' | 'LocalScript' | 'ModuleScript'; sourceTemplate: string }>;
        remotes: Array<{ name: string; parent: string; type: 'RemoteEvent' | 'RemoteFunction' }>;
    };
}

export const BUILTIN_MECHANIC_CARDS: MechanicCard[] = [
    {
        id: 'kill_brick',
        name: 'Hazard / Kill Brick',
        category: 'Environment',
        description: 'Instant hazard brick that eliminates character humanoid upon physical contact.',
        prerequisites: [],
        requiredServices: ['Workspace'],
        customizationParams: {
            damage: { type: 'number', default: 100, description: 'Damage dealt on touch (100 = instant elimination)' },
            color: { type: 'string', default: 'Bright red', description: 'Brick color' }
        },
        structure: {
            instances: [
                {
                    className: 'Part',
                    parent: 'Workspace',
                    name: 'KillBrick',
                    properties: {
                        BrickColor: 'Bright red',
                        Material: 'Neon',
                        Anchored: true,
                        Size: { _type: 'Vector3', x: 8, y: 1, z: 8 }
                    }
                }
            ],
            scripts: [
                {
                    name: 'HazardScript',
                    parent: 'Workspace.KillBrick',
                    type: 'Script',
                    sourceTemplate: `local part = script.Parent\npart.Touched:Connect(function(hit)\n    local char = hit.Parent\n    local humanoid = char and char:FindFirstChildOfClass("Humanoid")\n    if humanoid and humanoid.Health > 0 then\n        humanoid:TakeDamage({{damage}})\n    end\nend)\n`
                }
            ],
            remotes: []
        }
    },
    {
        id: 'coin_pickup',
        name: 'Collectible Coin & Leaderstats',
        category: 'Economy',
        description: 'Spinning collectible coin that increments player Coins leaderstat upon collection with respawn cooldown.',
        prerequisites: [],
        requiredServices: ['Workspace', 'ServerScriptService'],
        customizationParams: {
            value: { type: 'number', default: 10, description: 'Coins granted per pickup' },
            respawnTime: { type: 'number', default: 5, description: 'Respawn delay in seconds' }
        },
        structure: {
            instances: [
                {
                    className: 'Part',
                    parent: 'Workspace',
                    name: 'GoldCoin',
                    properties: {
                        BrickColor: 'Bright yellow',
                        Material: 'Neon',
                        Shape: 'Cylinder',
                        Anchored: true,
                        CanCollide: false,
                        Size: { _type: 'Vector3', x: 0.5, y: 3, z: 3 }
                    }
                }
            ],
            scripts: [
                {
                    name: 'CoinScript',
                    parent: 'Workspace.GoldCoin',
                    type: 'Script',
                    sourceTemplate: `local coin = script.Parent\nlocal debounce = false\n\ncoin.Touched:Connect(function(hit)\n    local char = hit.Parent\n    local player = game.Players:GetPlayerFromCharacter(char)\n    if player and not debounce then\n        debounce = true\n        local leaderstats = player:FindFirstChild("leaderstats")\n        local coins = leaderstats and leaderstats:FindFirstChild("Coins")\n        if coins then\n            coins.Value = coins.Value + {{value}}\n        end\n        coin.Transparency = 1\n        task.wait({{respawnTime}})\n        coin.Transparency = 0\n        debounce = false\n    end\nend)\n`
                }
            ],
            remotes: []
        }
    },
    {
        id: 'interactive_door',
        name: 'Proximity Prompt Interactive Door',
        category: 'Interactions',
        description: 'Hinged or sliding door opened and closed via ProximityPrompt with TweenService animation.',
        prerequisites: [],
        requiredServices: ['Workspace', 'TweenService'],
        customizationParams: {
            promptText: { type: 'string', default: 'Open Door', description: 'Proximity prompt action text' },
            openDuration: { type: 'number', default: 0.8, description: 'Tween duration in seconds' }
        },
        structure: {
            instances: [
                {
                    className: 'Model',
                    parent: 'Workspace',
                    name: 'InteractiveDoor'
                },
                {
                    className: 'Part',
                    parent: 'Workspace.InteractiveDoor',
                    name: 'DoorFrame',
                    properties: { Anchored: true, Size: { _type: 'Vector3', x: 6, y: 8, z: 1 } }
                },
                {
                    className: 'Part',
                    parent: 'Workspace.InteractiveDoor',
                    name: 'DoorHinge',
                    properties: { Anchored: true, Size: { _type: 'Vector3', x: 4, y: 7.5, z: 0.5 } }
                },
                {
                    className: 'ProximityPrompt',
                    parent: 'Workspace.InteractiveDoor.DoorHinge',
                    name: 'DoorPrompt',
                    properties: { ActionText: 'Toggle Door', ObjectText: 'Door', HoldDuration: 0 }
                }
            ],
            scripts: [
                {
                    name: 'DoorController',
                    parent: 'Workspace.InteractiveDoor',
                    type: 'Script',
                    sourceTemplate: `local TweenService = game:GetService("TweenService")\nlocal door = script.Parent\nlocal hinge = door.DoorHinge\nlocal prompt = hinge.DoorPrompt\n\nlocal isOpen = false\nlocal tweenInfo = TweenInfo.new({{openDuration}}, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)\n\nprompt.Triggered:Connect(function()\n    isOpen = not isOpen\n    local targetCFrame = isOpen and (hinge.CFrame * CFrame.Angles(0, math.rad(90), 0)) or (hinge.CFrame * CFrame.Angles(0, math.rad(-90), 0))\n    TweenService:Create(hinge, tweenInfo, { CFrame = targetCFrame }):Play()\nend)\n`
                }
            ],
            remotes: []
        }
    },
    {
        id: 'sprint_stamina',
        name: 'Sprint & Stamina Controller',
        category: 'Movement',
        description: 'Shift-to-sprint movement speed booster with dynamic stamina depletion and recovery.',
        prerequisites: [],
        requiredServices: ['StarterPlayer.StarterPlayerScripts'],
        customizationParams: {
            sprintSpeed: { type: 'number', default: 24, description: 'WalkSpeed while sprinting' },
            normalSpeed: { type: 'number', default: 16, description: 'Normal WalkSpeed' },
            maxStamina: { type: 'number', default: 100, description: 'Maximum stamina pool' }
        },
        structure: {
            instances: [],
            scripts: [
                {
                    name: 'SprintClient',
                    parent: 'StarterPlayer.StarterPlayerScripts',
                    type: 'LocalScript',
                    sourceTemplate: `local UserInputService = game:GetService("UserInputService")\nlocal player = game.Players.LocalPlayer\nlocal char = player.Character or player.CharacterAdded:Wait()\nlocal humanoid = char:WaitForChild("Humanoid")\n\nlocal isSprinting = false\nlocal stamina = {{maxStamina}}\n\nUserInputService.InputBegan:Connect(function(input, gpe)\n    if gpe then return end\n    if input.KeyCode == Enum.KeyCode.LeftShift and stamina > 10 then\n        isSprinting = true\n        humanoid.WalkSpeed = {{sprintSpeed}}\n    end\nend)\n\nUserInputService.InputEnded:Connect(function(input)\n    if input.KeyCode == Enum.KeyCode.LeftShift then\n        isSprinting = false\n        humanoid.WalkSpeed = {{normalSpeed}}\n    end\nend)\n`
                }
            ],
            remotes: []
        }
    }
];

export class MechanicCardRegistry {
    private cards = new Map<string, MechanicCard>();

    constructor() {
        for (const card of BUILTIN_MECHANIC_CARDS) {
            this.cards.set(card.id, card);
        }
    }

    public getCard(id: string): MechanicCard | undefined {
        return this.cards.get(id);
    }

    public listCards(category?: string): MechanicCard[] {
        const all = Array.from(this.cards.values());
        if (category) return all.filter(c => c.category === category);
        return all;
    }

    /**
     * Instantiates a mechanic card into executable instance creation and script payloads.
     */
    public instantiateCard(cardId: string, customParams: Record<string, any> = {}): { instances: any[]; scripts: any[]; remotes: any[] } {
        const card = this.cards.get(cardId);
        if (!card) throw new Error(`Mechanic card ${cardId} not found`);

        const mergedParams: Record<string, any> = {};
        for (const [k, v] of Object.entries(card.customizationParams)) {
            mergedParams[k] = customParams[k] !== undefined ? customParams[k] : v.default;
        }

        // Process scripts template
        const populatedScripts = card.structure.scripts.map(s => {
            let src = s.sourceTemplate;
            for (const [k, v] of Object.entries(mergedParams)) {
                src = src.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
            }
            return {
                name: s.name,
                parent: s.parent,
                type: s.type,
                source: src
            };
        });

        return {
            instances: card.structure.instances,
            scripts: populatedScripts,
            remotes: card.structure.remotes
        };
    }
}

export const mechanicCardRegistry = new MechanicCardRegistry();
