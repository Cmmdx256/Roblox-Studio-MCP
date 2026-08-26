@echo off
title Roblox Studio Universal MCP Server
echo ===================================================
echo [Universal MCP] Starting Bridge on 127.0.0.1:38883...
echo ===================================================
cd /d "%~dp0"
node dist/index.js
pause
