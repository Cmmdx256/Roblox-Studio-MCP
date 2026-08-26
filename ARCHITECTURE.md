# System Architecture & Technical Specification

The **Roblox Studio Embedded Universal MCP System** bridges modern AI coding assistants with Roblox Studio's live runtime.

---

## 1. High-Level Architecture

```
┌────────────────────────────────────────────────────────┐
│                   AI Coding Agent                     │
│         (Claude Desktop, Cursor, Antigravity)          │
└───────────────────────────┬────────────────────────────┘
                            │ Standard MCP (stdio)
┌───────────────────────────▼────────────────────────────┐
│                 Node.js / TS MCP Server                │
│  - Tool Registry (35+ Tools, Zod Validation)          │
│  - Resource Registry (roblox:// URIs)                 │
│  - Command Dispatcher (Promise Queue & Timeouts)       │
│  - Event & Log Buffer                                 │
│  - Local HTTP Bridge Server (127.0.0.1:38883)         │
└───────────────────────────┬────────────────────────────┘
                            │ Adaptive Long-Polling (HTTP POST)
┌───────────────────────────▼────────────────────────────┐
│           Roblox Studio Plugin (Luau Sandbox)          │
│  - Bridge Client & Session Handshake                   │
│  - Execution Queue & Task Serializer                   │
│  - Command Router & Error Handler                     │
│  - Universal Studio Engine                             │
│    ├── InstanceResolver & UuidRegistry                 │
│    ├── LuauTypeCoercion                                │
│    ├── TransactionManager (ChangeHistoryService)       │
│    ├── EventObserver (LogService, Selection, Tree)     │
│    └── Adapters (Instance, Prop, Script, Terrain, ...) │
│  - Studio DockWidget UI                                │
└───────────────────────────┬────────────────────────────┘
                            │ Studio Plugin APIs
┌───────────────────────────▼────────────────────────────┐
│        Roblox Studio DataModel / Services / Place      │
└────────────────────────────────────────────────────────┘
```

---

## 2. Communication Protocol & Transport

### Why Fast Long-Polling?
Roblox Studio's Luau sandbox does not expose a raw TCP/WebSocket listening socket API. However, `HttpService:RequestAsync` provides high-throughput outbound HTTP requests to localhost.

1. **Handshake (`POST /api/handshake`)**:
   * The plugin generates a session UUID and registers place metadata with the bridge.
2. **Adaptive Polling (`POST /api/poll`)**:
   * The plugin continuously requests queued commands.
   * When idle, the poller waits with a 150ms interval.
   * When commands are dispatched, the interval shifts to 20ms for instant execution.
   * Any pending events (logs, selection changes, hierarchy events) are piggybacked on the poll request.
3. **Response Dispatch (`POST /api/response`)**:
   * When a command finishes execution, the result or structured error is posted back, resolving the pending Promise on the MCP server.

---

## 3. Instance Addressing Model

Roblox places often have multiple objects with identical names (e.g. dozens of parts named `"Part"` or `"Spawn"`). The Universal MCP system implements a two-tier addressing strategy:

1. **Session UUID (`id://...`)**:
   * On first inspect, create, clone, or traversal, the plugin assigns a unique session UUID stored in a weak-key table (`UuidRegistry`).
   * This UUID remains stable even if the instance is renamed or moved across the DataModel.
2. **Path Addressing with Indexing**:
   * `Workspace.Map.Buildings.House01`
   * `Workspace.Map.Roads.Part[3]` (indexes 3rd child named Part)
   * `ReplicatedStorage.Modules.Config`
   * `game.ServerScriptService.GameManager`

---

## 4. Script Editing & Code Search Pipeline

* **`ScriptEditorService` Integration**: Uses modern Studio APIs to read and update code in open document tabs without losing cursor position or undo history.
* **Direct `Script.Source` Fallback**: If the document is closed, directly updates the source code property.
* **Incremental Patching**:
  * Exact substring replacement with regex pattern escaping.
  * Regex search & replace.
  * Line-based edits.
* **Project-Wide Code Search**: Scans all `Script`, `LocalScript`, and `ModuleScript` containers across any specified scope (`game`, `ReplicatedStorage`, etc.) and returns structured snippets with line numbers.

---

## 5. Transaction Safety & Undo/Redo

All mutating operations (`instance_create`, `instance_delete`, `property_set`, `script_set_source`, `terrain_fill_block`, etc.) are wrapped in `TransactionManager`:
* Calls `ChangeHistoryService:TryBeginRecording()` before execution.
* On success, commits the transaction and creates a native Studio undo waypoint.
* On error or cancelled batch, calls `ChangeHistoryService:FinishRecording(..., Cancel)` to revert changes cleanly.

---

## 6. Type Coercion Engine

Roblox engine data types are seamlessly converted between JSON and Luau:
* **Vector3**: `[X, Y, Z]` or `{x, y, z}` or `{X, Y, Z}`
* **Color3**: `[R, G, B]` (0-1 or 0-255) or `"#RRGGBB"` hex strings
* **CFrame**: `[X, Y, Z]` position or full 12-component matrix
* **UDim2**: `[sx, ox, sy, oy]`
* **Enums**: `"Enum.Material.Neon"`, `"Material.Neon"`, or `"Neon"`
