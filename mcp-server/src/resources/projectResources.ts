import { commandDispatcher } from '../dispatcher/commandDispatcher.js';

export interface MCPResourceDefinition {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
  read: (uri: string) => Promise<string>;
}

export const projectResources: MCPResourceDefinition[] = [
  {
    uri: 'roblox://project/info',
    name: 'Roblox Project Information',
    description: 'Current place name, place ID, game ID, mode, and Studio session status.',
    mimeType: 'application/json',
    read: async () => {
      const session = commandDispatcher.getSessionInfo();
      return JSON.stringify(session || { connected: false }, null, 2);
    },
  },
  {
    uri: 'roblox://project/summary',
    name: 'Roblox Project Architecture Summary',
    description: 'High-level architectural overview of services, folders, scripts, and remotes.',
    mimeType: 'application/json',
    read: async () => {
      if (!commandDispatcher.isStudioConnected()) {
        return JSON.stringify({ error: 'No active Roblox Studio session connected' }, null, 2);
      }
      try {
        const summary = await commandDispatcher.executeCommand('context_build', { maxDepth: 3 });
        return JSON.stringify(summary, null, 2);
      } catch (err: any) {
        return JSON.stringify({ error: err?.message || 'Failed to build context summary' }, null, 2);
      }
    },
  },
  {
    uri: 'roblox://selection',
    name: 'Roblox Studio Selection',
    description: 'List of currently selected instances in the active Roblox Studio session.',
    mimeType: 'application/json',
    read: async () => {
      if (!commandDispatcher.isStudioConnected()) {
        return JSON.stringify({ error: 'No active Roblox Studio session connected' }, null, 2);
      }
      try {
        const selection = await commandDispatcher.executeCommand('selection_get', {});
        return JSON.stringify(selection, null, 2);
      } catch (err: any) {
        return JSON.stringify({ error: err?.message || 'Failed to get selection' }, null, 2);
      }
    },
  },
  {
    uri: 'roblox://output/recent',
    name: 'Roblox Studio Output Logs',
    description: 'Most recent prints, warnings, and errors captured from Roblox Studio Output window.',
    mimeType: 'application/json',
    read: async () => {
      const logs = commandDispatcher.getRecentLogs(100);
      return JSON.stringify(logs, null, 2);
    },
  },
  {
    uri: 'roblox://output/errors',
    name: 'Roblox Studio Runtime Errors',
    description: 'Most recent runtime exceptions with stack traces captured from Roblox Studio.',
    mimeType: 'application/json',
    read: async () => {
      const errors = commandDispatcher.getRecentErrors(50);
      return JSON.stringify(errors, null, 2);
    },
  },
];

export async function readResourceByUri(uri: string): Promise<{ contents: Array<{ uri: string; mimeType: string; text: string }> }> {
  // Check static resources
  for (const res of projectResources) {
    if (res.uri === uri) {
      const text = await res.read(uri);
      return {
        contents: [{ uri, mimeType: res.mimeType, text }],
      };
    }
  }

  // Check dynamic script resource: roblox://scripts/<path>
  if (uri.startsWith('roblox://scripts/')) {
    const targetPath = decodeURIComponent(uri.replace('roblox://scripts/', ''));
    if (!commandDispatcher.isStudioConnected()) {
      return {
        contents: [{ uri, mimeType: 'text/x-luau', text: '-- Error: No active Roblox Studio session connected' }],
      };
    }
    try {
      const result = await commandDispatcher.executeCommand('script_get_source', { target: targetPath });
      return {
        contents: [{ uri, mimeType: 'text/x-luau', text: result.source || '' }],
      };
    } catch (err: any) {
      return {
        contents: [{ uri, mimeType: 'text/plain', text: `Error reading script at ${targetPath}: ${err?.message || 'Unknown error'}` }],
      };
    }
  }

  throw new Error(`Resource not found: ${uri}`);
}
