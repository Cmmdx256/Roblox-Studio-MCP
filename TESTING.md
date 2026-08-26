# Testing Guide

This document outlines the testing strategy, test suites, and instructions for verifying the Roblox Studio Universal MCP System.

---

## 1. Automated Test Suite

The automated test suite in `mcp-server/tests/server.test.ts` verifies:
* **Tool Registry Completeness**: Verifies all 35+ universal tools are registered with valid Zod input schemas.
* **HTTP Bridge Lifecycle**: Verifies server startup, `/api/status`, `/api/handshake`, and `/api/poll` endpoints.
* **Bidirectional RPC Flow**: Tests initiating an async tool command, fetching it via polling, returning execution response, and resolving the tool Promise.
* **Event Ingestion**: Tests buffering of `log` and `error` events from Studio.
* **Resource Queries**: Tests reading `roblox://project/info` and `roblox://output/recent`.

### Running Automated Tests
```bash
npm run build
npx tsx --test mcp-server/tests/server.test.ts
```

---

## 2. In-Engine Studio Manual Verification

To perform end-to-end verification inside Roblox Studio:

1. **Start the MCP Server**:
   ```bash
   node dist/index.js
   ```
2. **Open Roblox Studio** and load a place.
3. Open the plugin's **"MCP Status"** dock widget from the toolbar.
4. Verify the indicator turns **Green (● Connected)**.
5. In your AI Client (e.g. Claude Desktop or Cursor), test the following commands:
   * `"Inspect the project hierarchy and tell me what services exist."` -> Calls `studio_get_tree` / `context_build`.
   * `"Create a neon red part at position (0, 10, 0) named TestPart under Workspace."` -> Calls `instance_create`.
   * `"Search for all scripts in the project."` -> Calls `studio_search`.
   * `"Read the source code of ServerScriptService.GameManager."` -> Calls `script_get_source`.
   * `"Add a print statement to ServerScriptService.GameManager."` -> Calls `script_patch_source`.
   * `"Press Ctrl + Z in Studio to verify the change can be cleanly undone."` -> Verifies `ChangeHistoryService` integration.
