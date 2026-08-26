import { z } from 'zod';
import { visualConstructionEngine } from '../engines/VisualConstructionEngine.js';
import { animationAuthoringEngine } from '../engines/AnimationAuthoringEngine.js';
export const componentTools = [
    {
        name: 'component_compose',
        description: 'Visual Construction: Composes a complete, structured Roblox game component (Interactive Door, Collectible Coin, Weapon Tool, Chest, NPC, Teleporter, Light Fixture) into Studio hierarchy with correct nested parts, materials, constraints, lights, sounds, proximity prompts, and decoupled behavior script without manual boilerplate.',
        inputSchema: z.object({
            templateId: z.enum([
                'interactive_door',
                'collectible_coin',
                'equippable_weapon',
                'interactive_chest',
                'streetlamp_fixture',
                'teleporter_pad',
                'dialogue_npc'
            ]).describe('The component template ID to construct'),
            name: z.string().describe('Name for the component Model / Instance'),
            parentPath: z.string().optional().describe('Target DataModel parent path (default: Workspace)'),
            position: z.array(z.number()).length(3).optional().describe('World position [x, y, z] for the component'),
            attributes: z.record(z.any()).optional().describe('Custom attributes to set on the component (e.g. IsLocked, Value, PromptActionText)'),
            includeBehaviorScript: z.boolean().optional().describe('Whether to include clean decoupled behavior script (default: true)'),
        }),
        handler: async (args) => {
            return await visualConstructionEngine.composeComponent(args);
        },
    },
    {
        name: 'component_template_list',
        description: 'Visual Construction: Lists all available component construction templates with their hierarchy trees, default attributes, and required Roblox instances.',
        inputSchema: z.object({}),
        handler: async () => {
            const templates = visualConstructionEngine.listTemplates();
            return {
                status: 'SUCCESS',
                totalTemplates: templates.length,
                templates,
            };
        },
    },
    {
        name: 'hierarchy_scaffold',
        description: 'Spatial Organization: Automatically scaffolds clean, industry-standard professional project structure in Roblox Studio (Workspace.World, ReplicatedStorage.Shared, ReplicatedStorage.Assets, ServerStorage.Templates, ServerScriptService.Systems).',
        inputSchema: z.object({}),
        handler: async () => {
            return await visualConstructionEngine.scaffoldHierarchy();
        },
    },
    {
        name: 'tool_grip_calibrate',
        description: 'Animation & Gear: Calibrates Tool.Grip and RightGripAttachment for weapons and equippable tools to ensure correct in-hand orientation (Sword upright, Gun aim forward, Shield forearm, Lantern carry).',
        inputSchema: z.object({
            toolPath: z.string().describe('Instance path of the target Tool (e.g. StarterPack.Sword or Workspace.WeaponTool)'),
            gripPreset: z.enum(['Sword_Upright', 'Gun_Aim_Forward', 'Shield_Forearm', 'Lantern_Carry', 'Staff_TwoHanded', 'Custom']).describe('Grip orientation preset'),
            offset: z.array(z.number()).length(3).optional().describe('Custom position offset [x, y, z] (only for Custom preset)'),
            anglesDeg: z.array(z.number()).length(3).optional().describe('Custom Euler angles [pitch, yaw, roll] in degrees (only for Custom preset)'),
        }),
        handler: async (args) => {
            return await animationAuthoringEngine.calibrateToolGrip(args);
        },
    },
    {
        name: 'rig_pose_and_animate',
        description: 'Animation & Posing: Safely transforms R15/R6 rig joints (Motor6D C0) to set static poses, weapon hold stances, or dialogue stances without breaking rig hierarchy or throwing read-only Motor6D errors.',
        inputSchema: z.object({
            targetRigPath: z.string().describe('Instance path of the character rig (e.g. Workspace.NPC or Workspace.Dummy)'),
            rigType: z.enum(['R15', 'R6']).optional().describe('Rig type (default: R15)'),
            poses: z.record(z.object({
                cframeAnglesDeg: z.array(z.number()).length(3).optional().describe('Euler rotation angles in degrees [x, y, z]'),
                x: z.number().optional(),
                y: z.number().optional(),
                z: z.number().optional(),
            })).describe('Map of joint names (e.g. "RightShoulder", "LeftShoulder", "Waist", "Neck") to rotation angles'),
        }),
        handler: async (args) => {
            return await animationAuthoringEngine.poseRig(args);
        },
    },
];
//# sourceMappingURL=componentTools.js.map