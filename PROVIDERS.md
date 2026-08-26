# Universal Roblox Studio AI MCP — Provider Architecture

## Overview
The Universal Roblox Studio AI MCP system implements a polymorphic, multi-provider model. Every capability in the platform belongs to a registered provider.

```
                           AI Client
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Capability Router  │
                    └──────────┬──────────┘
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
  EmbeddedPluginProvider  OfficialRobloxMCP   ModelingProvider
            │                  │                  │
            ▼                  ▼                  ▼
    AnimationProvider    AssetEngine       WorkflowEngine
```

---

## Registered Providers

### 1. `EmbeddedPluginProvider` (`ProviderType.EMBEDDED_PLUGIN`)
* **Role**: Primary local connection surface running directly inside Roblox Studio via Luau plugin.
* **Security Level**: `PluginSecurity`
* **Transport**: Local HTTP Long-Polling on `127.0.0.1:38883` and HTTPS on `127.0.0.1:38884`.
* **Exposed Capabilities**: 54 atomic low-level and mid-level Studio tools (DataModel, properties, scripts, selection, terrain, batching, context extraction).

### 2. `OfficialRobloxMCPProvider` (`ProviderType.OFFICIAL_ROBLOX_MCP`)
* **Role**: First-class client integration connecting to Roblox Studio's official built-in Model Context Protocol (MCP) server.
* **Security Level**: `LocalUserSecurity` / `PluginSecurity`
* **Transport**: `@modelcontextprotocol/sdk` Stdio Client.
* **Exposed Capabilities**: Official content generation (`generate_mesh`, `generate_material`, `generate_procedural_model`), visual capture (`screen_capture`), code execution (`execute_luau`), and player simulation (`character_navigation`, `user_keyboard_input`, `user_mouse_input`).

### 3. `ModelingProvider` (`ProviderType.MODELING`)
* **Role**: 3D content creation pipeline with embedded 3D Quality System.
* **Capabilities**:
  - `model.generate`: Autonomous model hierarchy creation with PrimaryPart assignment and pivot alignment.
  - `material.generate`: MaterialVariant creation with physical properties.
  - `model.inspect_quality`: 3D Quality System scoring (geometry, collisions, hierarchy, scale).

### 4. `AnimationProvider` (`ProviderType.ANIMATION`)
* **Role**: Roblox animation workflows and controller generation.
* **Capabilities**:
  - `animation.inspect`: Hierarchy and Animator validation.
  - `animation.create`: Animation asset reference registration.
  - `animation.integrate`: Automated animation controller module generation.
  - `animation.validate`: Playback readiness validation.
  - `animation.plan`: Natural language animation plan to keyframe and pose timing.

---

## Provider Lifecycle State Machine

```
[STARTING] ───► [READY] ───► [DEGRADED] ───► [UNHEALTHY] ───► [STOPPING] ───► [FAILED]
```

* **`STARTING`**: Provider registered, preparing sockets or process pipes.
* **`READY`**: Provider initialized, healthy, and all capabilities verified.
* **`DEGRADED`**: Studio session offline or optional provider unavailable (graceful fallback active).
* **`UNHEALTHY`**: Healthcheck failed with unrecoverable error.
* **`STOPPING` / `FAILED`**: Provider disconnected or terminated.
