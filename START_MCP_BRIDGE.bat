@echo off
title Roblox Studio Universal MCP Bridge
color 0A
cd /d "%~dp0"

echo ================================================================
echo    ROBLOX STUDIO UNIVERSAL MCP RUNTIME BRIDGE
echo ================================================================
echo.
echo [*] Checking Node.js environment...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    pause
    exit /b 1
)

echo [*] Starting MCP Bridge on http://127.0.0.1:38883 ...
echo [*] Status: Waiting for Roblox Studio Plugin and AI Client...
echo.
node dist/index.js

echo.
echo [!] MCP Bridge stopped.
pause
