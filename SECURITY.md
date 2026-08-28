# Roblox AI Platform — Security & Safety Policies

## 1. Security Architecture & Risk Classification

All operations are evaluated by the `SecurityEngine` before execution:

| Risk Level | Operations | Policy |
|---|---|---|
| `READ_ONLY` | `property_get`, `studio_search`, `script_search_code`, `selection_get` | Allowed unconditionally |
| `LOW` | `selection_set`, `instance_rename`, `attribute_set` | Allowed with evidence logging |
| `MEDIUM` | `property_set`, `instance_create`, `instance_move`, `terrain_fill_block` | Allowed with idempotency check |
| `HIGH` | `script_set_source`, `instance_delete`, `terrain_clear`, `playtest_control` | Transaction waypoint required |
| `CRITICAL` | Mutating `CoreGui`, `PluginGuiService`, internal Roblox binaries, or unauthenticated HTTP | **BLOCKED** |

---

## 2. Protected Roblox Services

The platform permanently blocks destructive mutations on protected internal Roblox services:
- `CoreGui`
- `PluginGuiService`
- `RobloxPluginSecurity`
- `PluginDebugService`
- Operating system level files and paths

---

## 3. Asset Security & Creator Store Scanning (`AssetSecurityEngine.ts`)

Third-party models and Creator Store assets are scanned before insertion:

```
ASSET SCRIPT SOURCE
    │
    ├── 1. Obfuscation Check: detects getfenv(), setfenv(), loadstring(), \104\116\116\112
    ├── 2. Remote Require Check: detects require(123456789) external payloads
    ├── 3. Unauthorized HTTP: detects HttpService requests to unknown endpoints
    └── 4. Backdoor Check: detects TeleportService hijacks and hidden admin scripts
    │
    ▼
SAFETY REPORT: SAFE | SUSPICIOUS | BLOCKED
```

---

## 4. Multiplayer & Economy Security Rules

- **Zero-Trust Client**: The client is never trusted for currency changes, inventory grants, or damage calculations.
- **Strict Server Validation**: All `RemoteEvent` and `RemoteFunction` handlers must validate player ownership, distance, cooldowns, and parameter types on the server.
