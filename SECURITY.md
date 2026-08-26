# Security Architecture & Boundary Model

## Guiding Principles

The Universal Roblox Studio AI MCP strictly adheres to the following non-negotiable security principles:

1. **No Undocumented Bypass**: The system never attempts to bypass Roblox engine security boundaries (`RobloxScriptSecurity`, internal CoreScript sandboxes).
2. **Deterministic Evidence**: Operations never report success without verification. If a mutation cannot be verified, `FAILED_VERIFICATION` is returned.
3. **Atomic Undo/Redo**: All mutations in Studio are wrapped in `ChangeHistoryService` recordings (`TryBeginRecording` / `FinishRecording`).
4. **Local Host Isolation**: Bridge servers bind exclusively to `127.0.0.1` / `localhost` and enforce strict local origin validation.

---

## Security Context Hierarchy

| Context | Description | Permitted Operations |
|---|---|---|
| **`SAFE`** | Local Node.js analytical queries | Discovery, graph queries, spec parsing, audits |
| **`PluginSecurity`** | Roblox Studio Luau Plugin | DataModel edits, script source updates via `ScriptEditorService`, terrain voxel generation |
| **`LocalUserSecurity`** | Studio IDE native process | Mesh generation, material generation, screen capture |
| **`RobloxScriptSecurity`** | Internal Engine CoreScripts | **PROHIBITED / PROTECTED** |

---

## Error Handling & Failure Types

The platform defines standard error codes across all layers:
* `CAPABILITY_UNAVAILABLE`
* `PROVIDER_UNAVAILABLE`
* `PERMISSION_DENIED`
* `FAILED_VERIFICATION`
* `STALE_TARGET`
* `INVALID_ARGUMENT`
* `TIMEOUT`
* `ROBLOX_ERROR`
* `MCP_ERROR`
* `UNKNOWN_CAPABILITY`
