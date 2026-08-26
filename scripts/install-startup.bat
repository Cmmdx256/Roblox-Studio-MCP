@echo off
echo [Universal MCP] Registering silent background auto-start with Windows...

set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "SHORTCUT_PATH=%STARTUP_FOLDER%\RobloxUniversalMCP.vbs"

copy /Y "%~dp0silent-runner.vbs" "%SHORTCUT_PATH%" >nul

echo [Universal MCP] Successfully registered! The MCP server will now start automatically in the background on Windows boot.
echo [Universal MCP] Starting background instance now...
wscript.exe "%~dp0silent-runner.vbs"
echo [Universal MCP] Done!
pause
