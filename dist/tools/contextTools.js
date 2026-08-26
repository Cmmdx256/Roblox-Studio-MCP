import { z } from 'zod';
import { commandDispatcher } from '../dispatcher/commandDispatcher.js';
export const contextTools = [
    {
        name: 'context_build',
        description: 'Generate a compact, token-efficient architectural summary of the entire Roblox project (services, folder layout, key scripts, remotes, tags, and structure). Ideal for an AI to quickly understand an unfamiliar codebase.',
        inputSchema: z.object({
            maxDepth: z.number().min(1).max(5).default(3).describe('Maximum depth for folder/module structure summary. Default 3.'),
            includeScriptSummaries: z.boolean().default(true).describe('Whether to list key scripts and their roles.'),
        }),
        handler: async (args) => {
            return await commandDispatcher.executeCommand('context_build', args);
        },
    },
    {
        name: 'context_get_architecture',
        description: 'Inspect the communication and dependency architecture (RemoteEvents, RemoteFunctions, BindableEvents, shared ModuleScripts) across the project.',
        inputSchema: z.object({}),
        handler: async () => {
            return await commandDispatcher.executeCommand('context_get_architecture', {});
        },
    },
];
//# sourceMappingURL=contextTools.js.map