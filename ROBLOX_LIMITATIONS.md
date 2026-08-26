# Roblox Studio Plugin API Limitations & Security Model

This document specifies the legitimate capabilities, security boundaries, and architectural sandbox constraints of the Roblox Studio Plugin environment.

---

## 1. Legitimately Accessible APIs

Plugins running inside Roblox Studio have elevated permissions compared to normal game scripts:
* **Full DataModel Read & Write**: Access to `Workspace`, `ReplicatedStorage`, `ServerScriptService`, `ServerStorage`, `StarterGui`, `StarterPlayer`, `Lighting`, `SoundService`, `MaterialService`, `Teams`, `TestService`.
* **Script Reading & Writing**: Direct access to read and write `Script.Source`, `LocalScript.Source`, `ModuleScript.Source`, and modern `ScriptEditorService` editor documents.
* **Undo / Redo History**: Full access to `ChangeHistoryService` to create undo waypoints and transactional recording blocks (`TryBeginRecording`, `FinishRecording`).
* **Studio Selection**: Full control over `Selection:Get()` and `Selection:Set()`.
* **Output & Diagnostics**: Event capture on `LogService.MessageOut` and `ScriptContext.Error`.
* **Voxel Terrain**: Full manipulation via `workspace.Terrain`.
* **Outbound HTTP**: `HttpService:RequestAsync` to communicate with local processes (`127.0.0.1`).

---

## 2. Sandbox Constraints & Known Limitations

### A. No Inbound Listening Sockets in Luau
* **Limitation**: Roblox Luau scripts cannot bind or listen on raw TCP / WebSocket ports (e.g. no `net.listen()` or `ws.createServer()`).
* **Design Solution**: The system uses a thin external MCP transport bridge (Node.js/TS process) that runs the MCP server on stdio and hosts a local HTTP endpoint (`127.0.0.1:38883`). The Studio plugin connects out to this endpoint via adaptive fast long-polling.

### B. "Allow HTTP Requests" Setting
* **Limitation**: `HttpService` calls fail if HTTP requests are disabled in Studio Game Settings.
* **Solution**: The plugin UI displays a clear status notice and guidance if HTTP requests are blocked. Enabling **Home > Game Settings > Security > Allow HTTP Requests** resolves this immediately.

### C. Security Sandbox (CoreGui & Restricted Services)
* **Limitation**: Certain internal containers and services have `LocalUserSecurity` or `RobloxScriptSecurity` levels (e.g. `CoreGui`, `CorePackages`, `NetworkClient`, internal billing APIs) and cannot be modified by user plugins.
* **Handling**: The plugin gracefully skips or catches attempts to access restricted services and returns a structured `UNSUPPORTED_BY_ROBLOX_PLUGIN_API` or `PERMISSION_DENIED` error.

### D. No Direct OS / File System Access from Luau
* **Limitation**: Luau plugins cannot read or write arbitrary files on the developer's computer disk (e.g. `C:\Users\...`).
* **Handling**: All filesystem operations and MCP stdio streaming are managed by the Node.js MCP server process.

---

## 3. Security Philosophy

* **100% Legitimate Public Plugin APIs**: The system does NOT use binary hooks, DLL injection, memory modification, or exploit unauthorized vulnerabilities.
* **Localhost-Only Communication**: The HTTP bridge strictly binds to `127.0.0.1`, rejecting external network connections.
* **Session Handshake**: Every Studio session is authenticated with a unique random session identifier.
