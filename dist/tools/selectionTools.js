import { z } from 'zod';
import { commandDispatcher } from '../dispatcher/commandDispatcher.js';
export const selectionTools = [
    {
        name: 'selection_get',
        description: 'Get the list of Instances currently selected by the developer in Roblox Studio.',
        inputSchema: z.object({}),
        handler: async () => {
            return await commandDispatcher.executeCommand('selection_get', {});
        },
    },
    {
        name: 'selection_set',
        description: 'Programmatically select specific Instances in Roblox Studio.',
        inputSchema: z.object({
            targets: z.array(z.string()).describe('Array of Instance paths or UUIDs to select.'),
        }),
        handler: async (args) => {
            return await commandDispatcher.executeCommand('selection_set', args);
        },
    },
    {
        name: 'selection_add',
        description: 'Add Instances to the current Roblox Studio selection without deselecting currently selected objects.',
        inputSchema: z.object({
            targets: z.array(z.string()).describe('Array of Instance paths or UUIDs to add to selection.'),
        }),
        handler: async (args) => {
            return await commandDispatcher.executeCommand('selection_add', args);
        },
    },
    {
        name: 'selection_clear',
        description: 'Clear the active selection in Roblox Studio (deselect all).',
        inputSchema: z.object({}),
        handler: async () => {
            return await commandDispatcher.executeCommand('selection_clear', {});
        },
    },
];
//# sourceMappingURL=selectionTools.js.map