# Communication Protocols & Wire Formats

## 1. MCP Standard Protocol (Client ⟷ Node.js Server)

- **Transport**: `stdio` JSON-RPC 2.0 via `@modelcontextprotocol/sdk`.
- **Supported Capabilities**:
  - `tools/list`: Lists all registered MCP primitive and platform tools.
  - `tools/call`: Executes a tool with JSON arguments and returns structured markdown/JSON content.
  - `resources/list`: Exposes project resources (`roblox://place/info`, `roblox://datamodel/tree`, etc.).
  - `resources/read`: Reads structured project state snapshots.

---

## 2. Studio HTTP/HTTPS Bridge Protocol (Node.js Server ⟷ Studio Plugin)

The embedded Studio plugin communicates with the local Node.js bridge over local ports:
- **HTTP Endpoint**: `http://127.0.0.1:38896` (Primary polling bridge)
- **HTTPS Endpoint**: `https://127.0.0.1:38897` (TLS-encrypted bridge with local certs)

### Core Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/status` | `GET` | Health check returning bridge status, version, and active session count |
| `/session/handshake` | `POST` | Studio plugin registers place ID, place name, game ID, and simulation mode |
| `/session/heartbeat` | `POST` | Studio plugin maintains active connection liveness (every 5 seconds) |
| `/poll` | `POST` | Plugin long-polls for pending commands with a 25-second timeout |
| `/response` | `POST` | Plugin submits execution results, return data, or errors back to the bridge |
| `/events` | `POST` | Plugin streams live console logs, runtime errors, and selection changes |
| `/telemetry/dashboard`| `GET` | Real-time HTML and JSON dashboard of providers, health, and latency |
