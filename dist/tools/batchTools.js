import { z } from 'zod';
import { commandDispatcher } from '../dispatcher/commandDispatcher.js';
export const batchTools = [
    {
        name: 'batch_execute',
        description: 'Execute a sequence of multiple Studio operations atomically within a single ChangeHistoryService recording (Undo/Redo transaction). If any operation fails, provides detailed breakdown of results and rollback status.',
        inputSchema: z.object({
            transactionName: z.string().default('MCP Batch Action').describe('Name for the Studio Undo/Redo waypoint.'),
            stopOnError: z.boolean().default(true).describe('Whether to stop executing subsequent operations if one fails. Default true.'),
            operations: z.array(z.object({
                action: z.string().describe('The action to run (e.g. "instance_create", "property_set", "script_set_source", "attribute_set").'),
                params: z.record(z.any()).describe('The parameters for the specified action.'),
            })).min(1).describe('Ordered array of operations to execute.'),
        }),
        handler: async (args) => {
            return await commandDispatcher.executeCommand('batch_execute', args);
        },
    },
];
//# sourceMappingURL=batchTools.js.map