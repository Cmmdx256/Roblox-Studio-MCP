import { z } from 'zod';
import { commandDispatcher } from '../dispatcher/commandDispatcher.js';

export const outputTools = [
  {
    name: 'output_get',
    description: 'Get recent output logs captured from Roblox Studio (prints, warnings, errors).',
    inputSchema: z.object({
      limit: z.number().min(1).max(200).default(50).describe('Number of recent log lines to retrieve. Default 50.'),
      filterType: z.enum(['MessageOutput', 'MessageInfo', 'MessageWarning', 'MessageError']).optional().describe('Filter by log severity type.'),
      query: z.string().optional().describe('Optional text search query within output logs.'),
    }),
    handler: async (args: { limit?: number; filterType?: string; query?: string }) => {
      let logs = commandDispatcher.getRecentLogs(args.limit || 50, args.filterType);
      if (args.query) {
        const q = args.query.toLowerCase();
        logs = logs.filter((l) => l.message.toLowerCase().includes(q) || (l.traceback && l.traceback.toLowerCase().includes(q)));
      }
      return {
        count: logs.length,
        logs,
      };
    },
  },
  {
    name: 'output_get_errors',
    description: 'Get recent runtime errors and unhandled exceptions captured from Roblox Studio with full stack traces.',
    inputSchema: z.object({
      limit: z.number().min(1).max(100).default(30).describe('Number of error entries to retrieve. Default 30.'),
    }),
    handler: async (args: { limit?: number }) => {
      const errors = commandDispatcher.getRecentErrors(args.limit || 30);
      return {
        count: errors.length,
        errors,
      };
    },
  },
  {
    name: 'output_clear',
    description: 'Clear the internal log buffer.',
    inputSchema: z.object({}),
    handler: async () => {
      commandDispatcher.clearLogs();
      return { success: true, message: 'Log buffer cleared.' };
    },
  },
];
