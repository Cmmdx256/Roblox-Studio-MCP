import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('====================================');
console.log('Roblox Studio Universal MCP Daemon Installer');
console.log('====================================');

const appData = process.env.APPDATA || '';
const localAppData = process.env.LOCALAPPDATA || '';

// 1. Verify build files
const distIndex = path.join(projectRoot, 'dist', 'index.js');
const pluginRbxmx = path.join(projectRoot, 'plugin-build', 'RobloxUniversalMCP.rbxmx');
const pluginLua = path.join(projectRoot, 'plugin-build', 'RobloxUniversalMCP.lua');

if (!fs.existsSync(distIndex)) {
  console.log('[Installer] Building daemon...');
  execSync('npm run build', { cwd: projectRoot, stdio: 'inherit' });
}

// 2. Install Roblox Plugins
if (localAppData) {
  const robloxPluginDir = path.join(localAppData, 'Roblox', 'Plugins');
  if (!fs.existsSync(robloxPluginDir)) {
    fs.mkdirSync(robloxPluginDir, { recursive: true });
  }

  if (fs.existsSync(pluginRbxmx)) {
    fs.copyFileSync(pluginRbxmx, path.join(robloxPluginDir, 'RobloxUniversalMCP.rbxmx'));
    console.log(`[Installer] Installed Plugin RBXMX to: ${robloxPluginDir}\\RobloxUniversalMCP.rbxmx`);
  }

  if (fs.existsSync(pluginLua)) {
    fs.copyFileSync(pluginLua, path.join(robloxPluginDir, 'RobloxUniversalMCP.lua'));
    console.log(`[Installer] Installed Plugin Lua to: ${robloxPluginDir}\\RobloxUniversalMCP.lua`);
  }
}

// 3. Install Windows Startup Watchdog Daemon (Zero-config Auto-Start)
if (appData) {
  const startupFolder = path.join(appData, 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup');
  if (fs.existsSync(startupFolder)) {
    const watchdogScript = path.join(projectRoot, 'scripts', 'watchdog.vbs');
    const targetVbs = path.join(startupFolder, 'RobloxUniversalMCP_Watchdog.vbs');

    if (fs.existsSync(watchdogScript)) {
      fs.copyFileSync(watchdogScript, targetVbs);
      console.log(`[Installer] Registered Background Daemon to Windows Startup: ${targetVbs}`);
    }
  }
}

console.log('====================================');
console.log('Daemon Installation & Registration Completed Successfully!');
console.log('Roblox Studio will now automatically connect on launch without manual commands.');
console.log('====================================');
