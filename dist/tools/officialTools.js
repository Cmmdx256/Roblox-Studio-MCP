import { z } from 'zod';
import { capabilityRouter } from '../capabilities/CapabilityRouter.js';
/**
 * Official Roblox Studio MCP Tools
 * These tools represent capabilities restricted in 3rd-party HTTP / plugin sandbox
 * and are routed directly to Roblox's official native StudioMCP proxy binary (StudioMCP.exe).
 */
export const officialTools = [
    // 1. 3D Generative AI (Roblox Official AI Pipeline)
    {
        name: 'generate_mesh',
        description: 'Official Roblox Generative AI: Generates a 3D mesh model from a natural-language text prompt using Roblox official AI mesh generator.',
        inputSchema: z.object({
            prompt: z.string().describe('Text description of the 3D model/mesh to generate'),
            parent: z.string().optional().describe('Target parent instance path in DataModel (default: Workspace)'),
            position: z.array(z.number()).length(3).optional().describe('Target placement Vector3 [x, y, z]'),
            scale: z.array(z.number()).length(3).optional().describe('Target scale Vector3 [x, y, z]'),
            anchored: z.boolean().optional().describe('Whether generated parts should be anchored'),
        }),
        handler: async (args) => {
            return await capabilityRouter.route('generate_mesh', args);
        },
    },
    {
        name: 'generate_material',
        description: 'Official Roblox Generative AI: Generates seamless PBR texture and material from prompt using official Roblox AI material generator.',
        inputSchema: z.object({
            prompt: z.string().describe('Text description of the material/texture to generate'),
            baseMaterial: z.string().optional().describe('Base Roblox material type e.g. SmoothPlastic, Wood, Metal'),
            targetPart: z.string().optional().describe('Optional target instance path to apply material to'),
        }),
        handler: async (args) => {
            return await capabilityRouter.route('generate_material', args);
        },
    },
    {
        name: 'generate_procedural_model',
        description: 'Official Roblox Generative AI: Generates a procedural model assembly using official Roblox MCP generator.',
        inputSchema: z.object({
            prompt: z.string().describe('Description of the procedural model to assemble'),
            category: z.string().optional().describe('Category e.g. building, vehicle, prop, nature'),
            position: z.array(z.number()).length(3).optional().describe('Placement position [x, y, z]'),
        }),
        handler: async (args) => {
            return await capabilityRouter.route('generate_procedural_model', args);
        },
    },
    {
        name: 'wait_job_finished',
        description: 'Official Roblox MCP: Waits for an asynchronous AI generation job to finish and returns the generated asset identifier.',
        inputSchema: z.object({
            jobId: z.string().describe('The async generation job ID returned by generate_mesh/generate_material'),
            timeoutSeconds: z.number().optional().describe('Maximum timeout in seconds (default: 60)'),
        }),
        handler: async (args) => {
            return await capabilityRouter.route('wait_job_finished', args);
        },
    },
    // 2. Marketplace & Asset Insertion (Official Roblox Cloud / Auth APIs)
    {
        name: 'search_asset',
        description: 'Official Roblox Asset API: Searches Roblox Creator Store / Marketplace for models, audios, decals, plugins using official authenticated APIs.',
        inputSchema: z.object({
            keyword: z.string().describe('Search query for the asset'),
            assetType: z.string().optional().describe('Asset type e.g. Model, Decal, Audio, MeshPart, Animation'),
            limit: z.number().optional().describe('Maximum number of results to return (default: 10)'),
        }),
        handler: async (args) => {
            return await capabilityRouter.route('search_asset', args);
        },
    },
    {
        name: 'insert_asset',
        description: 'Official Roblox Asset API: Inserts an asset from the Roblox Creator Store directly into Studio by Asset ID.',
        inputSchema: z.object({
            assetId: z.union([z.number(), z.string()]).describe('The numeric or string AssetId to insert'),
            parent: z.string().optional().describe('Parent instance path (default: Workspace)'),
            position: z.array(z.number()).length(3).optional().describe('Placement position [x, y, z]'),
        }),
        handler: async (args) => {
            return await capabilityRouter.route('insert_asset', args);
        },
    },
    {
        name: 'upload_image',
        description: 'Official Roblox Asset API: Uploads a local or base64 image to Roblox Cloud as a Decal/Texture asset.',
        inputSchema: z.object({
            imagePath: z.string().optional().describe('Local file path of the image to upload'),
            base64Data: z.string().optional().describe('Base64-encoded image data'),
            assetName: z.string().describe('Name for the uploaded asset'),
        }),
        handler: async (args) => {
            return await capabilityRouter.route('upload_image', args);
        },
    },
    {
        name: 'store_image',
        description: 'Official Roblox Asset API: Stores an image asset in the Studio project.',
        inputSchema: z.object({
            assetId: z.string().describe('Image AssetId or URI'),
            targetName: z.string().optional().describe('Target asset name'),
        }),
        handler: async (args) => {
            return await capabilityRouter.route('store_image', args);
        },
    },
    // 3. Native Viewport Observation
    {
        name: 'screen_capture',
        description: 'Official Roblox Studio: Captures a clean native high-resolution screenshot of the Studio 3D viewport framebuffer.',
        inputSchema: z.object({
            cameraPosition: z.array(z.number()).length(3).optional().describe('Optional camera position [x, y, z]'),
            cameraFocus: z.array(z.number()).length(3).optional().describe('Optional camera lookAt focus [x, y, z]'),
        }),
        handler: async (args) => {
            return await capabilityRouter.route('screen_capture', args);
        },
    },
    // 4. Studio Simulation Lifecycle & State
    {
        name: 'start_stop_play',
        description: 'Official Roblox Studio: Starts or stops Studio playtest simulation.',
        inputSchema: z.object({
            is_start: z.boolean().optional().describe('true to start the game, false to stop the game and return to edit mode'),
            mode: z.enum(['Play', 'Run', 'Stop', 'Pause', 'Resume']).optional().describe('Simulation mode'),
            action: z.enum(['start', 'stop', 'pause', 'resume']).optional().describe('Action name'),
            studio_id: z.string().optional().describe('Target Studio instance ID'),
        }),
        handler: async (args) => {
            return await capabilityRouter.route('start_stop_play', args);
        },
    },
    {
        name: 'get_studio_state',
        description: 'Official Roblox Studio: Retrieves active Studio session information, current place ID, edit/play simulation status, and open documents.',
        inputSchema: z.object({
            studio_id: z.string().optional().describe('Target Studio instance ID'),
        }),
        handler: async (args) => {
            return await capabilityRouter.route('get_studio_state', args || {});
        },
    },
    {
        name: 'list_roblox_studios',
        description: 'Official Roblox Studio: Lists all running Roblox Studio processes and open places.',
        inputSchema: z.object({}),
        handler: async (args) => {
            return await capabilityRouter.route('list_roblox_studios', args);
        },
    },
    {
        name: 'set_active_studio',
        description: 'Official Roblox Studio: Switches active MCP focus to a specific running Studio instance by ProcessId or PlaceId.',
        inputSchema: z.object({
            studioId: z.string().describe('Process ID or unique identifier of the target Studio instance'),
        }),
        handler: async (args) => {
            return await capabilityRouter.route('set_active_studio', args);
        },
    },
    // 5. Hardware & Player Input Simulation
    {
        name: 'character_navigation',
        description: 'Official Roblox Studio: Navigates the playtest character to a target 3D coordinate in the world.',
        inputSchema: z.object({
            targetPosition: z.array(z.number()).length(3).describe('Target destination Vector3 [x, y, z]'),
            speed: z.number().optional().describe('Walk speed modifier'),
        }),
        handler: async (args) => {
            return await capabilityRouter.route('character_navigation', args);
        },
    },
    {
        name: 'user_keyboard_input',
        description: 'Official Roblox Studio: Injects keyboard key press/release events into the active Studio playtest simulation.',
        inputSchema: z.object({
            keys: z.array(z.object({
                key: z.string().describe('Key name e.g. W, A, S, D, Space, E'),
                durationMs: z.number().optional().describe('Hold duration in milliseconds (default: 100)'),
            })).describe('Array of key press actions to simulate'),
        }),
        handler: async (args) => {
            return await capabilityRouter.route('user_keyboard_input', args);
        },
    },
    {
        name: 'user_mouse_input',
        description: 'Official Roblox Studio: Injects virtual mouse move and click events into the active Studio viewport.',
        inputSchema: z.object({
            x: z.number().describe('Viewport X coordinate in pixels'),
            y: z.number().describe('Viewport Y coordinate in pixels'),
            click: z.boolean().optional().describe('Whether to perform a click (default: true)'),
            button: z.enum(['Left', 'Right', 'Middle']).optional().describe('Mouse button (default: Left)'),
        }),
        handler: async (args) => {
            return await capabilityRouter.route('user_mouse_input', args);
        },
    },
    // 6. Native Studio IDE Script Editing & Search
    {
        name: 'script_read',
        description: 'Official Roblox Studio: Reads Luau script source directly from Studio Script Editor buffer.',
        inputSchema: z.object({
            scriptPath: z.string().describe('DataModel instance path of the script'),
        }),
        handler: async (args) => {
            return await capabilityRouter.route('script_read', args);
        },
    },
    {
        name: 'multi_edit',
        description: 'Official Roblox Studio: Atomically applies multiple script edits across one or more Luau scripts.',
        inputSchema: z.object({
            edits: z.array(z.object({
                scriptPath: z.string().describe('Path to target script'),
                search: z.string().describe('Target text chunk to replace'),
                replacement: z.string().describe('Replacement text chunk'),
            })).describe('List of edits to apply atomically'),
        }),
        handler: async (args) => {
            return await capabilityRouter.route('multi_edit', args);
        },
    },
    {
        name: 'script_search',
        description: 'Official Roblox Studio: Performs fast regex or literal text search across all Luau scripts in the DataModel.',
        inputSchema: z.object({
            query: z.string().describe('Search pattern or text'),
            caseSensitive: z.boolean().optional().describe('Whether search is case-sensitive'),
            isRegex: z.boolean().optional().describe('Whether query is a regular expression'),
        }),
        handler: async (args) => {
            return await capabilityRouter.route('script_search', args);
        },
    },
    {
        name: 'script_grep',
        description: 'Official Roblox Studio: Searches for symbols, function definitions, or patterns with line number snippets across all scripts.',
        inputSchema: z.object({
            pattern: z.string().describe('Search pattern'),
            scope: z.string().optional().describe('Scope service or folder (default: entire game)'),
        }),
        handler: async (args) => {
            return await capabilityRouter.route('script_grep', args);
        },
    },
    // 7. Subagents & Luau Execution
    {
        name: 'subagent',
        description: 'Official Roblox MCP: Delegates a complex sub-task to Roblox native subagent engine.',
        inputSchema: z.object({
            task: z.string().describe('Subagent task instructions'),
            context: z.record(z.any()).optional().describe('Optional context parameters'),
        }),
        handler: async (args) => {
            return await capabilityRouter.route('subagent', args);
        },
    },
    {
        name: 'execute_luau',
        description: 'Official Roblox MCP: Executes Luau code in Roblox Studio environment and returns evaluation results.',
        inputSchema: z.object({
            code: z.string().describe('Luau source code to execute'),
            targetContext: z.enum(['Edit', 'PlayClient', 'PlayServer']).optional().describe('Target execution context'),
        }),
        handler: async (args) => {
            return await capabilityRouter.route('execute_luau', args);
        },
    },
];
//# sourceMappingURL=officialTools.js.map