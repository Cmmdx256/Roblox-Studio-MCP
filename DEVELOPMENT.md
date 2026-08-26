# Developer & Extension Guide

This guide explains how to develop, extend, and contribute to the Roblox Studio Universal MCP project.

---

## 1. Project Structure

```
Stdiomcp/
├── mcp-server/           # Node.js / TypeScript MCP Server & HTTP Bridge
│   ├── src/
│   │   ├── config.ts
│   │   ├── dispatcher/   # Command queue & Promise dispatcher
│   │   ├── resources/    # roblox:// MCP resource handlers
│   │   ├── tools/        # MCP tool definitions & Zod schemas
│   │   ├── transport/    # stdio & HTTP bridge server
│   │   └── types/        # RPC interfaces & ErrorCode enums
│   └── tests/            # Test suite
└── roblox-plugin/        # Luau Plugin Source
    ├── default.project.json
    └── src/
        ├── Adapters/     # Modular Roblox API adapters
        ├── Addressing/   # UUID & path resolver
        ├── Bridge/       # HTTP polling client & session
        ├── Context/      # Architecture & summary engine
        ├── Core/         # CommandRouter & TransactionManager
        ├── Observation/  # Event & log observers
        ├── UI/           # Studio DockWidget
        └── Utils/        # Type coercion, errors, logger
```

---

## 2. Adding a New MCP Tool

To add a new capability:

### Step 1: Implement the Luau Handler
In `roblox-plugin/src/Adapters/YourAdapter.luau` (or an existing adapter):
```luau
function YourAdapter.DoSomething(params)
    -- Your Roblox Studio Luau logic
    return { success = true, result = ... }, nil
end
```

Register the action in `roblox-plugin/src/Core/CommandRouter.luau`:
```luau
your_tool_action = function(params)
    return YourAdapter.DoSomething(params)
end,
```

### Step 2: Define the MCP Tool in TypeScript
In `mcp-server/src/tools/yourTools.ts`:
```typescript
import { z } from 'zod';
import { commandDispatcher } from '../dispatcher/commandDispatcher.js';

export const yourTools = [
  {
    name: 'your_tool_action',
    description: 'Explain what this tool does...',
    inputSchema: z.object({
      target: z.string().describe('Target instance path or UUID'),
      option: z.number().optional(),
    }),
    handler: async (args: any) => {
      return await commandDispatcher.executeCommand('your_tool_action', args);
    },
  },
];
```

Register your tool array in `mcp-server/src/tools/index.ts`.

### Step 3: Rebuild & Rebundle
```bash
npm run build
npm run bundle:plugin
```

---

## 3. Local Development Workflow

Run the TypeScript server with hot-reloading:
```bash
npm run dev
```

Bundle the plugin and test in Roblox Studio:
```bash
npm run bundle:plugin
```
