import { z } from 'zod';
import { capabilityRouter } from '../capabilities/CapabilityRouter.js';
export const playtestTools = [
    {
        name: 'playtest_control',
        description: 'Control playtest simulation mode in Roblox Studio (Start / Stop / Pause / Resume) routed via Official Roblox Studio MCP proxy.',
        inputSchema: z.object({
            action: z.enum(['start', 'stop', 'pause', 'resume']).optional().describe('Action to perform: "start" (begins simulation), "stop" (returns to edit mode), "pause", or "resume".'),
            is_start: z.boolean().optional().describe('true to start the game, false to stop'),
            mode: z.enum(['Play', 'Run', 'Stop', 'Pause', 'Resume']).optional().describe('Direct simulation mode'),
            studio_id: z.string().optional().describe('Target Studio ID'),
        }),
        handler: async (args) => {
            return await capabilityRouter.route('start_stop_play', args);
        },
    },
    {
        name: 'playtest_get_state',
        description: 'Get current Roblox Studio simulation state and active place status via Official Roblox Studio MCP proxy.',
        inputSchema: z.object({
            studio_id: z.string().optional().describe('Target Studio ID'),
        }),
        handler: async (args) => {
            return await capabilityRouter.route('get_studio_state', args || {});
        },
    },
];
//# sourceMappingURL=playtestTools.js.map