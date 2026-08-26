import { z } from 'zod';
import { commandDispatcher } from '../dispatcher/commandDispatcher.js';

export const scriptTools = [
  {
    name: 'script_get_source',
    description: 'Read the complete source code of any Script, LocalScript, or ModuleScript in the Roblox project.',
    inputSchema: z.object({
      target: z.string().describe('Full path or UUID of the Script, LocalScript, or ModuleScript (e.g. "ReplicatedStorage.Modules.FishingService").'),
    }),
    handler: async (args: { target: string }) => {
      return await commandDispatcher.executeCommand('script_get_source', args);
    },
  },
  {
    name: 'script_set_source',
    description: 'Overwrite the full source code of a Script, LocalScript, or ModuleScript.',
    inputSchema: z.object({
      target: z.string().describe('Full path or UUID of the script.'),
      source: z.string().describe('The complete new Luau source code to write.'),
    }),
    handler: async (args: { target: string; source: string }) => {
      return await commandDispatcher.executeCommand('script_set_source', args);
    },
  },
  {
    name: 'script_patch_source',
    description: 'Apply an incremental patch or replacement to a script without rewriting the entire file. Supports exact target replacement, line range replacement, or regex replacement.',
    inputSchema: z.object({
      target: z.string().describe('Full path or UUID of the script.'),
      search: z.string().describe('The exact string or regex pattern to locate in the script source.'),
      replacement: z.string().describe('The replacement string.'),
      isRegex: z.boolean().default(false).describe('Whether search is a regular expression. Default false.'),
      allowMultiple: z.boolean().default(false).describe('Whether to replace multiple occurrences if found. Default false.'),
    }),
    handler: async (args: { target: string; search: string; replacement: string; isRegex?: boolean; allowMultiple?: boolean }) => {
      return await commandDispatcher.executeCommand('script_patch_source', args);
    },
  },
  {
    name: 'script_search_code',
    description: 'Perform a project-wide code search across all Scripts, LocalScripts, and ModuleScripts. Returns matching script paths, line numbers, and code snippets.',
    inputSchema: z.object({
      query: z.string().describe('Text or pattern to search for across all project scripts.'),
      caseSensitive: z.boolean().default(false).describe('Whether search should be case-sensitive. Default false.'),
      isRegex: z.boolean().default(false).describe('Whether query is a regular expression. Default false.'),
      scope: z.string().default('game').describe('Root scope to search within (e.g. "ReplicatedStorage", "ServerScriptService", "StarterPlayer", "game").'),
      maxResults: z.number().min(1).max(200).default(50).describe('Maximum matching snippets to return. Default 50.'),
    }),
    handler: async (args: any) => {
      return await commandDispatcher.executeCommand('script_search_code', args);
    },
  },
];
