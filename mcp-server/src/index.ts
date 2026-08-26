#!/usr/bin/env node
import { runServer } from './server.js';

runServer().catch((err) => {
  console.error('[Roblox MCP Fatal Error]:', err);
  process.exit(1);
});
