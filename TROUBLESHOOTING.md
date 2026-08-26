# Troubleshooting & Diagnostics Guide

Common issues and step-by-step diagnostic solutions for Roblox Studio Universal MCP.

---

## 1. Plugin Shows "Disconnected" in Studio

### Cause A: MCP Server is not running
* **Solution**: Ensure your MCP server is started in terminal or running via Claude Desktop/Cursor:
  ```bash
  npm run start
  # or
  node dist/index.js
  ```
* Check if port `38883` is listening (`netstat -ano | findstr 38883`).

### Cause B: "Allow HTTP Requests" is disabled in Studio
* **Solution**:
  1. In Roblox Studio, click the **Home** tab.
  2. Open **Game Settings**.
  3. Navigate to **Security**.
  4. Enable **"Allow HTTP Requests"**.
  5. Click **Save** and click **Reconnect** on the MCP plugin widget.

---

## 2. "NO_STUDIO_CONNECTED" Error in AI Client

### Cause: AI sent a tool call before Studio finished connecting
* **Solution**:
  1. Open Roblox Studio with the target place loaded.
  2. Confirm the plugin widget displays `● Connected to AI Runtime`.
  3. Retry the prompt in your AI client.

---

## 3. "SCRIPT_NOT_EDITABLE" Error

### Cause: Script execution / source write permissions in Studio
* **Solution**: Ensure the plugin has script injection/edit permissions enabled when prompted by Roblox Studio.
* Note: Modern Studio with `ScriptEditorService` allows live editing without restrictions when edit mode is active.

---

## 4. Port Conflict (Port 38883 in use)

### Solution: Change the Port
You can customize the port via the `ROBLOX_MCP_PORT` environment variable:

In your MCP client config:
```json
{
  "mcpServers": {
    "roblox-studio": {
      "command": "node",
      "args": ["<path-to-dist/index.js>"],
      "env": {
        "ROBLOX_MCP_PORT": "39999"
      }
    }
  }
}
```

In the Roblox Plugin (`roblox-plugin/src/Config.luau`):
```luau
Config.Port = 39999
```
Then run `npm run bundle:plugin` and update the plugin in Studio.
