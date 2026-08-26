import fs from 'fs';
import path from 'path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { ProviderType, AvailabilityStatus, SecurityLevel, ExecutionContext, RiskLevel, VerificationMethod } from './types.js';
import { diagnosticsEngine } from '../engines/DiagnosticsEngine.js';
export function findStudioMcpCommand() {
    if (process.env.ROBLOX_OFFICIAL_MCP_CMD) {
        const argsStr = process.env.ROBLOX_OFFICIAL_MCP_ARGS;
        return {
            command: process.env.ROBLOX_OFFICIAL_MCP_CMD,
            args: argsStr ? argsStr.split(' ') : ['--stdio'],
            description: `Environment variable ROBLOX_OFFICIAL_MCP_CMD (${process.env.ROBLOX_OFFICIAL_MCP_CMD})`
        };
    }
    const localAppData = process.env.LOCALAPPDATA || (process.env.USERPROFILE ? path.join(process.env.USERPROFILE, 'AppData', 'Local') : null);
    if (localAppData) {
        // 1. Direct latest StudioMCP.exe in Roblox Versions
        const versionsDir = path.join(localAppData, 'Roblox', 'Versions');
        if (fs.existsSync(versionsDir)) {
            try {
                const subdirs = fs.readdirSync(versionsDir, { withFileTypes: true })
                    .filter(d => d.isDirectory())
                    .map(d => path.join(versionsDir, d.name, 'StudioMCP.exe'))
                    .filter(p => fs.existsSync(p));
                if (subdirs.length > 0) {
                    subdirs.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
                    return {
                        command: subdirs[0],
                        args: ['--stdio'],
                        description: `Direct StudioMCP.exe binary (${subdirs[0]})`
                    };
                }
            }
            catch (err) {
                console.error('[OfficialRobloxMCPProvider] Error scanning for StudioMCP.exe:', err);
            }
        }
        // 2. Roblox mcp.bat wrapper (cmd.exe /c "cd /d %LOCALAPPDATA%\Roblox && .\mcp.bat")
        const batPath = path.join(localAppData, 'Roblox', 'mcp.bat');
        if (fs.existsSync(batPath)) {
            return {
                command: 'cmd.exe',
                args: ['/c', `cd /d "${path.dirname(batPath)}" && .\\mcp.bat`],
                description: `Roblox mcp.bat script wrapper (${batPath})`
            };
        }
    }
    // Check Program Files fallback
    const progFiles = process.env['ProgramFiles(x86)'] || process.env.ProgramFiles;
    if (progFiles) {
        const studioPath = path.join(progFiles, 'Roblox', 'StudioMCP.exe');
        if (fs.existsSync(studioPath)) {
            return {
                command: studioPath,
                args: ['--stdio'],
                description: `Program Files StudioMCP.exe (${studioPath})`
            };
        }
    }
    return null;
}
export function findStudioMcpExecutable() {
    const cmdConfig = findStudioMcpCommand();
    return cmdConfig ? cmdConfig.command : null;
}
export class OfficialRobloxMCPProvider {
    name = 'official-roblox-mcp';
    type = ProviderType.OFFICIAL_ROBLOX_MCP;
    client = null;
    transport = null;
    capabilities = [];
    tools = [];
    isConnected = false;
    connectionMessage = 'Not connected';
    discoveredExePath = null;
    knownTools = [
        'generate_mesh', 'generate_material', 'generate_procedural_model', 'wait_job_finished',
        'search_asset', 'insert_asset', 'upload_image', 'store_image', 'search_game_tree',
        'inspect_instance', 'subagent', 'execute_luau', 'get_studio_state', 'start_stop_play',
        'get_console_output', 'screen_capture', 'character_navigation', 'user_keyboard_input',
        'user_mouse_input', 'list_roblox_studios', 'set_active_studio', 'script_read',
        'multi_edit', 'script_search', 'script_grep'
    ];
    async initialize() {
        try {
            const cmdConfig = findStudioMcpCommand();
            if (!cmdConfig) {
                this.isConnected = false;
                this.connectionMessage = 'Official Roblox StudioMCP or mcp.bat not found on system';
                console.error('[OfficialRobloxMCPProvider] Notice: StudioMCP.exe / mcp.bat not found. Available via fallback router.');
                return;
            }
            this.discoveredExePath = cmdConfig.command;
            console.error(`[OfficialRobloxMCPProvider] Using official Roblox MCP launcher: ${cmdConfig.description}`);
            this.transport = new StdioClientTransport({
                command: cmdConfig.command,
                args: cmdConfig.args
            });
            this.client = new Client({
                name: 'roblox-universal-mcp',
                version: '1.0.0'
            });
            await this.client.connect(this.transport);
            this.isConnected = true;
            this.connectionMessage = `Connected to Roblox StudioMCP (${cmdConfig.description})`;
            console.error(`[OfficialRobloxMCPProvider] Successfully connected to official StudioMCP!`);
            await this.discover();
        }
        catch (error) {
            this.isConnected = false;
            this.connectionMessage = `Failed to connect: ${error.message}`;
            console.error('[OfficialRobloxMCPProvider] Official StudioMCP connection notice (will use fallback provider):', error.message || error);
        }
    }
    async discover() {
        if (!this.isConnected || !this.client) {
            // Fallback to known list
            this.capabilities = this.knownTools.map(t => ({
                name: t,
                description: `Official tool: ${t}`,
                provider: this.type,
                availability: AvailabilityStatus.UNAVAILABLE,
                securityLevel: SecurityLevel.SAFE,
                executionContext: ExecutionContext.EDIT,
                riskLevel: RiskLevel.LOW,
                verificationMethod: VerificationMethod.NONE
            }));
            return this.capabilities;
        }
        try {
            const listResponse = await this.client.listTools();
            this.tools = listResponse.tools.map(t => ({
                name: t.name,
                description: t.description || '',
                schema: t.inputSchema,
                provider: this.name
            }));
            this.capabilities = this.tools.map(t => ({
                name: t.name,
                description: t.description,
                provider: this.type,
                availability: AvailabilityStatus.AVAILABLE,
                securityLevel: SecurityLevel.SAFE,
                executionContext: ExecutionContext.EDIT,
                riskLevel: RiskLevel.LOW,
                verificationMethod: VerificationMethod.NONE,
                schema: t.schema
            }));
            return this.capabilities;
        }
        catch (error) {
            console.error('[OfficialRobloxMCPProvider] Discovery failed:', error);
            return [];
        }
    }
    async healthCheck() {
        if (this.isConnected) {
            return {
                status: AvailabilityStatus.AVAILABLE,
                message: 'READY'
            };
        }
        else {
            return {
                status: AvailabilityStatus.UNAVAILABLE,
                message: this.connectionMessage
            };
        }
    }
    activeStudioIdCache = null;
    lastStudioCheck = 0;
    async getActiveStudioId() {
        const now = Date.now();
        if (this.activeStudioIdCache && (now - this.lastStudioCheck < 5000)) {
            return this.activeStudioIdCache;
        }
        if (!this.isConnected || !this.client)
            return null;
        try {
            const result = await this.client.callTool({
                name: 'list_roblox_studios',
                arguments: {}
            });
            if (result && Array.isArray(result.content)) {
                for (const item of result.content) {
                    if (item.type === 'text') {
                        const parsed = JSON.parse(item.text);
                        if (parsed.studios && Array.isArray(parsed.studios) && parsed.studios.length > 0) {
                            this.activeStudioIdCache = parsed.studios[0].id;
                            this.lastStudioCheck = now;
                            return this.activeStudioIdCache;
                        }
                    }
                }
            }
        }
        catch (err) {
            console.error('[OfficialRobloxMCPProvider] Failed to query list_roblox_studios:', err.message || err);
        }
        return null;
    }
    async listTools() {
        return this.tools;
    }
    async getCapabilities() {
        return this.capabilities;
    }
    async execute(action, params) {
        if (!this.isConnected || !this.client) {
            return {
                status: 'ERROR',
                code: 'PROVIDER_UNAVAILABLE',
                message: 'Official Roblox MCP Provider is not connected'
            };
        }
        const start = Date.now();
        try {
            let officialToolName = action;
            let officialParams = { ...params };
            // 1. Resolve studio_id
            const studioId = officialParams.studio_id || (await this.getActiveStudioId());
            if (studioId) {
                officialParams.studio_id = studioId;
            }
            // 2. Normalize playtest & state tool calls to Official MCP signatures
            if (action === 'playtest_control' || action === 'playtest.control' || action === 'start_stop_play') {
                officialToolName = 'start_stop_play';
                const act = String(officialParams.action || officialParams.mode || '').toLowerCase();
                const isStart = officialParams.is_start !== undefined
                    ? Boolean(officialParams.is_start)
                    : (act === 'start' || act === 'play' || act === 'run' || act === 'resume' || act === '' || act === 'undefined');
                officialParams = {
                    is_start: isStart,
                    studio_id: studioId || officialParams.studio_id
                };
            }
            else if (action === 'playtest_get_state' || action === 'playtest.getState' || action === 'get_studio_state') {
                officialToolName = 'get_studio_state';
                officialParams = {
                    studio_id: studioId || officialParams.studio_id
                };
            }
            else if (action === 'search_game_tree' || action === 'multi_edit' || action === 'execute_luau') {
                if (!officialParams.datamodel_type) {
                    officialParams.datamodel_type = 'Edit';
                }
            }
            else if (action === 'character_navigation' || action === 'user_mouse_input') {
                if (!officialParams.datamodel_type) {
                    officialParams.datamodel_type = 'Client';
                }
            }
            const result = await this.client.callTool({
                name: officialToolName,
                arguments: officialParams
            });
            let responseData = result.content;
            if (Array.isArray(result.content) && result.content.length > 0 && result.content[0].type === 'text') {
                try {
                    responseData = JSON.parse(result.content[0].text);
                }
                catch {
                    responseData = result.content[0].text;
                }
            }
            if (result.isError) {
                const errorStr = typeof responseData === 'string' ? responseData : JSON.stringify(responseData);
                const diagnostic = diagnosticsEngine.analyzeRobloxError(errorStr, officialParams.code);
                return {
                    status: 'ERROR',
                    code: 'ROBLOX_EXECUTION_ERROR',
                    message: errorStr,
                    data: responseData,
                    diagnostic: diagnostic,
                    duration: Date.now() - start
                };
            }
            return {
                status: 'SUCCESS',
                data: responseData,
                duration: Date.now() - start
            };
        }
        catch (error) {
            const errorStr = error.message || 'Execution failed';
            const diagnostic = diagnosticsEngine.analyzeRobloxError(errorStr, params.code);
            return {
                status: 'ERROR',
                message: errorStr,
                diagnostic: diagnostic,
                duration: Date.now() - start
            };
        }
    }
    async shutdown() {
        if (this.client) {
            try {
                await this.client.close();
            }
            catch (err) {
                console.error('[OfficialRobloxMCPProvider] Error closing client:', err);
            }
        }
        if (this.transport) {
            try {
                await this.transport.close();
            }
            catch (err) {
                console.error('[OfficialRobloxMCPProvider] Error closing transport:', err);
            }
        }
        this.isConnected = false;
        this.client = null;
        this.transport = null;
    }
}
export const officialRobloxMCPProvider = new OfficialRobloxMCPProvider();
//# sourceMappingURL=OfficialRobloxMCPProvider.js.map