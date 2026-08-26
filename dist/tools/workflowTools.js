import { z } from 'zod';
import { commandDispatcher } from '../dispatcher/commandDispatcher.js';
export const workflowTools = [
    // 1. Project-Level Composite Tools
    {
        name: 'project_analyze',
        description: '[HIGH_LEVEL] Comprehensive project architecture analysis: maps all services, active scripts, remote events, orphan remotes, and dependency relationships.',
        inputSchema: z.object({}),
        handler: async () => {
            return await commandDispatcher.executeCommand('project.analyze', {});
        },
    },
    {
        name: 'project_map',
        description: '[HIGH_LEVEL] Builds an indexed architectural map of all game folders, systems, shared modules, and server/client script roles.',
        inputSchema: z.object({
            maxDepth: z.number().min(1).max(10).default(5).describe('Maximum depth for architectural hierarchy map.'),
        }),
        handler: async (args) => {
            return await commandDispatcher.executeCommand('project.map', args);
        },
    },
    {
        name: 'project_dependencies',
        description: '[HIGH_LEVEL] Generates the full static dependency code graph (require chains, module relationships, and remote event calls) across all scripts.',
        inputSchema: z.object({}),
        handler: async () => {
            return await commandDispatcher.executeCommand('project.dependencies', {});
        },
    },
    {
        name: 'project_health',
        description: '[HIGH_LEVEL] Runs an automated audit across scripts, instances, physics, and remotes to detect memory leaks, unanchored parts, orphan remotes, and syntax issues.',
        inputSchema: z.object({}),
        handler: async () => {
            return await commandDispatcher.executeCommand('project.health', {});
        },
    },
    {
        name: 'project_repair',
        description: '[HIGH_LEVEL] Automatically repairs common place issues (anchors loose parts, cleans orphan instances, resolves broken references).',
        inputSchema: z.object({
            fixPhysics: z.boolean().default(true).describe('Anchor unanchored workspace parts.'),
            cleanOrphans: z.boolean().default(true).describe('Remove unused or disconnected instances.'),
        }),
        handler: async (args) => {
            return await commandDispatcher.executeCommand('project.repair', args);
        },
    },
    // 2. System-Level Composite Tools
    {
        name: 'system_create',
        description: '[HIGH_LEVEL] Creates a complete multi-file Roblox modular system (ServerScript, ModuleScript, Client LocalScript, and RemoteEvents) in a single atomic verified transaction.',
        inputSchema: z.object({
            systemName: z.string().describe('The name of the system (e.g. FishingSystem, InventoryManager, PetSystem).'),
            serverCode: z.string().optional().describe('Lua source code for the ServerScript in ServerScriptService.'),
            clientCode: z.string().optional().describe('Lua source code for the LocalScript in StarterPlayerScripts.'),
            moduleCode: z.string().optional().describe('Lua source code for the shared ModuleScript in ReplicatedStorage.'),
            remotes: z.array(z.string()).optional().describe('Array of RemoteEvent names to instantiate in ReplicatedStorage.'),
        }),
        handler: async (args) => {
            return await commandDispatcher.executeCommand('system.create', args);
        },
    },
    {
        name: 'system_modify',
        description: '[HIGH_LEVEL] Safely modifies an existing system by updating its scripts, attributes, and configuration with state read-back verification.',
        inputSchema: z.object({
            systemName: z.string().describe('The name of the existing system.'),
            serverPatch: z.string().optional().describe('Updated Lua source code for the ServerScript.'),
            modulePatch: z.string().optional().describe('Updated Lua source code for the ModuleScript.'),
            clientPatch: z.string().optional().describe('Updated Lua source code for the LocalScript.'),
        }),
        handler: async (args) => {
            return await commandDispatcher.executeCommand('system.modify', args);
        },
    },
    {
        name: 'system_remove',
        description: '[HIGH_LEVEL] Safely removes a modular system and its associated folders and remotes in an atomic rollback-supported transaction.',
        inputSchema: z.object({
            systemName: z.string().describe('The name of the system to remove.'),
        }),
        handler: async (args) => {
            return await commandDispatcher.executeCommand('system.remove', args);
        },
    },
    // 3. Scene & Workspace Optimization
    {
        name: 'scene_analyze',
        description: '[HIGH_LEVEL] Analyzes Workspace geometry, parts count, physics performance, and lighting configuration.',
        inputSchema: z.object({}),
        handler: async () => {
            return await commandDispatcher.executeCommand('scene.analyze', {});
        },
    },
    {
        name: 'scene_organize',
        description: '[HIGH_LEVEL] Organizes loose BaseParts in Workspace into semantic folders (e.g. Map, Geometry, Props, Interactive).',
        inputSchema: z.object({}),
        handler: async () => {
            return await commandDispatcher.executeCommand('scene.organize', {});
        },
    },
    {
        name: 'scene_optimize',
        description: '[HIGH_LEVEL] Scans Workspace to detect unanchored parts, physics issues, and loose instances, with automatic verified anchoring.',
        inputSchema: z.object({
            fixUnanchored: z.boolean().optional().describe('Whether to automatically anchor all loose/unanchored parts in Workspace.'),
            organizeLooseParts: z.boolean().optional().describe('Whether to organize loose parts into designated folders.'),
        }),
        handler: async (args) => {
            return await commandDispatcher.executeCommand('scene.optimize', args);
        },
    },
    // 4. Debugging & Diagnostic Engines
    {
        name: 'debug_find_error',
        description: '[HIGH_LEVEL] Analyzes Studio output logs, pinpoints error stack traces, identifies candidate script files and line numbers, and prepares diagnostic contexts.',
        inputSchema: z.object({
            errorQuery: z.string().optional().describe('Optional filter text or substring to search for in Studio error logs.'),
        }),
        handler: async (args) => {
            return await commandDispatcher.executeCommand('debug.find_error', args);
        },
    },
    {
        name: 'debug_propose_fix',
        description: '[HIGH_LEVEL] Diagnoses a runtime error, reads the relevant script source around the offending line, and generates a verified fix proposal.',
        inputSchema: z.object({
            scriptPath: z.string().describe('Full DataModel path to the script with errors.'),
            errorLine: z.number().describe('Line number where the error occurred.'),
            errorMessage: z.string().describe('The error message from Studio output.'),
        }),
        handler: async (args) => {
            return await commandDispatcher.executeCommand('debug.propose_fix', args);
        },
    },
    // 5. Architecture & Refactoring Tools
    {
        name: 'architecture_analyze',
        description: '[HIGH_LEVEL] Performs architectural analysis of server-client communication boundaries, security gaps, and shared state patterns.',
        inputSchema: z.object({}),
        handler: async () => {
            return await commandDispatcher.executeCommand('architecture.analyze', {});
        },
    },
    {
        name: 'architecture_plan',
        description: '[WORKFLOW] Plans a new game architecture or major feature, returning structured steps, affected services, and verification plans.',
        inputSchema: z.object({
            goal: z.string().describe('The architectural goal or feature to plan (e.g. Leaderboard System with DataStores).'),
        }),
        handler: async (args) => {
            return await commandDispatcher.executeCommand('architecture.plan', args);
        },
    },
    // 6. Autonomous Workflow Engine (Level 5)
    {
        name: 'feature_implement',
        description: '[WORKFLOW] High-level autonomous workflow: Plans, instantiates instances, writes server/client/module scripts, sets up remotes, and verifies complete feature integration.',
        inputSchema: z.object({
            featureName: z.string().describe('Name of the feature (e.g. LeaderboardSystem, CombatSystem).'),
            description: z.string().describe('Detailed description of feature requirements and mechanics.'),
            serverScript: z.string().optional().describe('Server script Luau code.'),
            moduleScript: z.string().optional().describe('Shared module Luau code.'),
            clientScript: z.string().optional().describe('Client LocalScript Luau code.'),
            remotes: z.array(z.string()).optional().describe('RemoteEvents needed for the feature.'),
        }),
        handler: async (args) => {
            return await commandDispatcher.executeCommand('feature.implement', args);
        },
    },
    {
        name: 'feature_verify',
        description: '[WORKFLOW] Comprehensive post-implementation verification: checks that all instances exist, scripts have valid syntax, remotes are bound, and no errors occurred.',
        inputSchema: z.object({
            featureName: z.string().describe('Name of the feature to verify.'),
        }),
        handler: async (args) => {
            return await commandDispatcher.executeCommand('feature.verify', args);
        },
    },
    {
        name: 'game_build_feature',
        description: '[WORKFLOW] End-to-end composite workflow: Analyzes project -> Plans architecture -> Implements server/client modules -> Anchors geometry -> Verifies entire game state.',
        inputSchema: z.object({
            featureName: z.string().describe('Name of the feature.'),
            spec: z.record(z.any()).describe('Detailed technical specification for the feature.'),
        }),
        handler: async (args) => {
            return await commandDispatcher.executeCommand('game.build_feature', args);
        },
    },
];
//# sourceMappingURL=workflowTools.js.map