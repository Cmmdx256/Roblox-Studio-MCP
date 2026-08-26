import { z } from 'zod';
import { commandDispatcher } from '../dispatcher/commandDispatcher.js';

export const studioTools = [
  {
    name: 'studio_info',
    description: 'Get information about the active Roblox Studio session, place ID, place name, mode (Edit/Run/Play), and plugin status.',
    inputSchema: z.object({}),
    handler: async () => {
      const session = commandDispatcher.getSessionInfo();
      if (!session) {
        return {
          connected: false,
          message: 'No active Roblox Studio session connected. Open Roblox Studio with the Universal MCP plugin enabled.',
        };
      }
      try {
        const studioData = await commandDispatcher.executeCommand('studio_info', {});
        return {
          connected: true,
          session,
          studioData,
        };
      } catch (err) {
        return {
          connected: true,
          session,
          error: err,
        };
      }
    },
  },
  {
    name: 'studio_get_tree',
    description: 'Inspect the Roblox DataModel hierarchy tree starting from a given root instance (e.g. Workspace, ReplicatedStorage, ServerScriptService) with configurable depth and filtering.',
    inputSchema: z.object({
      root: z.string().default('Workspace').describe('Path or UUID of the root instance (e.g. "Workspace", "ReplicatedStorage", "ServerScriptService", "StarterGui"). Default is "Workspace".'),
      depth: z.number().min(1).max(10).default(2).describe('Maximum depth to traverse (1 = immediate children only). Default is 2.'),
      includeProperties: z.array(z.string()).optional().describe('Optional list of properties to include for each instance (e.g. ["ClassName", "Name", "Size", "Position"]).'),
      classNameFilter: z.array(z.string()).optional().describe('Optional array of ClassNames to filter by (e.g. ["Script", "ModuleScript", "Model"]).'),
      maxItems: z.number().min(1).max(500).default(100).describe('Maximum number of items to return to prevent excessive output. Default 100.'),
    }),
    handler: async (args: { root?: string; depth?: number; includeProperties?: string[]; classNameFilter?: string[]; maxItems?: number }) => {
      return await commandDispatcher.executeCommand('studio_get_tree', args);
    },
  },
  {
    name: 'studio_search',
    description: 'Search for Instances in the DataModel matching specific criteria such as name pattern, ClassName, tag (CollectionService), or attribute values.',
    inputSchema: z.object({
      query: z.string().optional().describe('Text or pattern to search in Instance names.'),
      className: z.string().optional().describe('Filter by exact ClassName (e.g. "Part", "ModuleScript", "RemoteEvent", "Model").'),
      tag: z.string().optional().describe('Filter by CollectionService Tag.'),
      scope: z.string().default('game').describe('Root scope to search within (e.g. "Workspace", "ReplicatedStorage", "ServerScriptService", "game"). Default "game".'),
      attributeName: z.string().optional().describe('Filter by presence of an attribute name.'),
      attributeValue: z.any().optional().describe('Filter by exact attribute value (must specify attributeName).'),
      limit: z.number().min(1).max(200).default(50).describe('Maximum number of search results to return. Default 50.'),
    }),
    handler: async (args: any) => {
      return await commandDispatcher.executeCommand('studio_search', args);
    },
  },
  {
    name: 'studio_inspect',
    description: 'Perform a comprehensive inspection of a single Instance, returning all its properties, attributes, tags, child summary, script presence, and stable session UUID.',
    inputSchema: z.object({
      target: z.string().describe('Target Instance full path (e.g. "Workspace.Map.House01") or session UUID (e.g. "id://xyz123").'),
      includeChildren: z.boolean().default(true).describe('Whether to include immediate children summary.'),
      includeScriptSourceSnippet: z.boolean().default(false).describe('If target is a script, include first 20 lines preview.'),
    }),
    handler: async (args: { target: string; includeChildren?: boolean; includeScriptSourceSnippet?: boolean }) => {
      return await commandDispatcher.executeCommand('studio_inspect', args);
    },
  },
];
