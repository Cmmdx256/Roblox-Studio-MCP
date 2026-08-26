# Official Roblox Studio MCP Integration

## Architecture

The Universal Roblox Studio AI MCP integrates Roblox's official Studio MCP as a first-class provider:

```
                  +--------------------------------+
                  |  Universal MCP Gateway         |
                  |  (Server + Capability Router)  |
                  +---------------+----------------+
                                  |
               +------------------+------------------+
               |                                     |
               v                                     v
    +----------------------+              +----------------------+
    |  Embedded Plugin     |              |  Official Roblox     |
    |  Provider (HTTP/S)   |              |  MCP Provider (Stdio)|
    +----------+-----------+              +----------+-----------+
               |                                     |
               v                                     v
       [Roblox Studio Luau]                  [Studio Native MCP]
```

---

## Dynamic Discovery Sequence
1. **Connection**: Client establishes stdio pipe to Roblox Studio native MCP executable.
2. **Handshake**: `@modelcontextprotocol/sdk` client performs JSON-RPC `initialize`.
3. **Capability Negotiation**: Extracts server tools (`tools/list`) and resources (`resources/list`).
4. **Schema Extraction**: Dynamically parses input schemas into JSON Schema v7.
5. **Registration**: Ingests into `UnifiedToolRegistry` and `CapabilityDiscoveryEngine`.
6. **Health Monitoring**: Periodically checks liveness; on reconnection, auto-refreshes tools.

---

## Supported Official MCP Tool Surface
* **Scripting**: `script_read`, `multi_edit`, `script_search`, `script_grep`
* **3D & Generative AI**: `generate_mesh`, `generate_material`, `generate_procedural_model`, `wait_job_finished`
* **Asset Operations**: `search_asset`, `insert_asset`, `upload_image`, `store_image`
* **Hierarchy**: `search_game_tree`, `inspect_instance`
* **Luau Execution**: `execute_luau`
* **Studio & Playtest**: `get_studio_state`, `start_stop_play`, `get_console_output`, `screen_capture`
* **Input Simulation**: `character_navigation`, `user_keyboard_input`, `user_mouse_input`
* **Multi-Studio**: `list_roblox_studios`, `set_active_studio`

---

## Fallback & Graceful Degradation
If the Official Roblox MCP binary is not active or running:
* Official-only tools are marked `OFFICIAL_ONLY` or `UNAVAILABLE`.
* Universal tools seamlessly route to `EmbeddedPluginProvider`.
* No crashes or blocking errors occur.
