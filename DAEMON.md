# Background Daemon & Multi-Process Architecture

## Overview

The Universal Roblox Studio AI MCP runs a background daemon that persists connections, maintains health monitoring, and synchronizes state between multiple AI client processes.

```
                    +---------------------------+
                    |  Roblox Studio (Plugin)   |
                    +-------------+-------------+
                                  |
                                  v (HTTP Long-Polling 38883 / 38884)
                    +---------------------------+
                    |  Primary Daemon Process   |
                    |  (Holds live Studio link) |
                    +-------------+-------------+
                                  |
               +------------------+------------------+
               | (Shared Proxy /api/execute)         |
               v                                     v
    +----------------------+              +----------------------+
    |  Claude Desktop      |              |  Cursor / Antigravity|
    |  (Child Node.js MCP) |              |  (Child Node.js MCP) |
    +----------------------+              +----------------------+
```

---

## Daemon Health Endpoints
* **`GET /`**: HTML discovery dashboard with live status and active place information.
* **`GET /health`**: Daemon liveness probe, TLS fingerprint, active sessions list.
* **`GET /ready`**: Readiness check (`activeSessionsCount > 0`).
* **`GET /providers`**: Live status of all registered capability providers.
* **`GET /capabilities`**: Full Capability Matrix across all providers.
* **`GET /state`**: Current snapshot of Studio state and project knowledge graph.
* **`POST /api/execute`**: Inter-process proxy endpoint for secondary MCP clients.

---

## Automatic Port Recovery
If an abandoned Node.js process holds port `38883` on Windows, the daemon automatically invokes a port recovery routine (`portManager.ts`), reclaiming the port and launching cleanly.
