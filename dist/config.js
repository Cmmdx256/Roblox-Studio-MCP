export const DEFAULT_CONFIG = {
    port: parseInt(process.env.ROBLOX_MCP_PORT || '38883', 10),
    host: process.env.ROBLOX_MCP_HOST || '127.0.0.1',
    commandTimeoutMs: parseInt(process.env.ROBLOX_MCP_TIMEOUT_MS || '30000', 10),
    pollTimeoutMs: 15000,
    sessionExpiryMs: 60000,
    maxLogBufferSize: 1000,
    debug: process.env.ROBLOX_MCP_DEBUG === 'true' || false,
};
//# sourceMappingURL=config.js.map