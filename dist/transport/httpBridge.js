import express from 'express';
import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DEFAULT_CONFIG } from '../config.js';
import { commandDispatcher } from '../dispatcher/commandDispatcher.js';
import { certificateManager } from '../security/certificateManager.js';
import { providerRegistry } from '../providers/ProviderRegistry.js';
import { capabilityDiscoveryEngine } from '../capabilities/CapabilityDiscoveryEngine.js';
import { studioStateGraph } from '../state/StudioStateGraph.js';
import { projectKnowledgeGraph } from '../state/ProjectKnowledgeGraph.js';
import { liveDashboard } from '../telemetry/LiveDashboard.js';
import { multiModeEngine } from '../modes/MultiModeEngine.js';
import { universalCapabilityEngine } from '../capabilities/UniversalCapabilityEngine.js';
import { OperatingMode } from '../providers/types.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');
export class HttpBridgeServer {
    app;
    httpServer = null;
    httpsServer = null;
    sessions = new Map();
    startTime = Date.now();
    installationId = 'roblox_mcp_daemon_v1';
    constructor() {
        this.app = express();
        this.app.use(express.json({ limit: '50mb' }));
        // CORS & Local Isolation
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
            res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            if (req.method === 'OPTIONS') {
                return res.sendStatus(200);
            }
            next();
        });
        this.setupRoutes();
    }
    setupRoutes() {
        // 0. Root Endpoint — Dashboard & Discovery
        this.app.get('/', (_req, res) => {
            res.json({
                name: 'Roblox Studio Universal MCP Bridge',
                version: '1.0.0',
                status: 'running',
                protocol: 'mcp-2024-11-05',
                endpoints: {
                    health: '/health',
                    ready: '/ready',
                    version: '/version',
                    status: '/api/status',
                    handshake: 'POST /api/handshake',
                    poll: 'POST /api/poll',
                    response: 'POST /api/response',
                    events: 'POST /api/events',
                    pluginLua: '/plugin/RobloxUniversalMCP.lua',
                    pluginRbxmx: '/plugin/RobloxUniversalMCP.rbxmx',
                },
                uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
                activeSessions: this.sessions.size,
            });
        });
        // 1. Health Probe (Section 121)
        this.app.get('/health', (_req, res) => {
            res.json({
                status: 'ready',
                daemon: 'universal-roblox-mcp',
                version: '1.0.0',
                protocol: 'mcp-2024-11-05',
                installationId: this.installationId,
                tls: { enabled: true, fingerprint: certificateManager.getFingerprint() },
                mcp: { active: true, stdioConnected: true },
                uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
                activeSessions: Array.from(this.sessions.values()),
            });
        });
        // 2. Readiness Probe
        this.app.get('/ready', (_req, res) => {
            res.json({ ready: true, activeSessionsCount: this.sessions.size });
        });
        // 3. Version & Identity Endpoint
        this.app.get('/version', (_req, res) => {
            res.json({
                daemon: 'Roblox Studio Universal MCP Daemon',
                version: '1.0.0',
                protocolVersion: '2024-11-05',
                installationId: this.installationId,
                fingerprint: certificateManager.getFingerprint(),
            });
        });
        // 4. Backward-compatible Status Endpoint
        this.app.get('/api/status', (_req, res) => {
            const activeSession = commandDispatcher.getActiveSession();
            res.json({
                status: 'ok',
                connected: !!activeSession,
                session: activeSession ? activeSession.sessionId : null,
                placeName: activeSession ? activeSession.placeName : null,
                timestamp: Date.now(),
            });
        });
        // 5. Plugin Distribution Endpoints
        this.app.get('/plugin/RobloxUniversalMCP.lua', (_req, res) => {
            const p = path.join(projectRoot, 'plugin-build', 'RobloxUniversalMCP.lua');
            if (fs.existsSync(p)) {
                res.setHeader('Content-Type', 'text/plain');
                return res.sendFile(p);
            }
            res.status(404).send('Plugin file not found');
        });
        this.app.get('/plugin/RobloxUniversalMCP.rbxmx', (_req, res) => {
            const p = path.join(projectRoot, 'plugin-build', 'RobloxUniversalMCP.rbxmx');
            if (fs.existsSync(p)) {
                res.setHeader('Content-Type', 'application/xml');
                return res.sendFile(p);
            }
            res.status(404).send('Plugin rbxmx file not found');
        });
        // 6. Providers Health Endpoint
        this.app.get('/providers', async (_req, res) => {
            const healthMap = await providerRegistry.healthCheckAll();
            const providersObj = {};
            for (const [name, h] of healthMap.entries()) {
                providersObj[name] = h;
            }
            res.json({
                totalProviders: providerRegistry.getAll().length,
                providers: providersObj,
                timestamp: Date.now(),
            });
        });
        // 7. Capability Matrix Endpoint
        this.app.get('/capabilities', async (_req, res) => {
            const matrix = capabilityDiscoveryEngine.getMatrix();
            res.json({
                totalCapabilities: matrix.length,
                matrix,
                timestamp: Date.now(),
            });
        });
        // 8. State Graph Endpoint
        this.app.get('/state', (_req, res) => {
            res.json({
                state: studioStateGraph.getStateSnapshot(),
                knowledgeStats: projectKnowledgeGraph.getStats(),
                timestamp: Date.now(),
            });
        });
        // 9. Live Dashboard & Telemetry Endpoint (Master Spec Section 125)
        this.app.get('/dashboard', async (_req, res) => {
            const metrics = await liveDashboard.getMetrics();
            res.json({
                success: true,
                dashboard: metrics,
            });
        });
        this.app.get('/telemetry', async (_req, res) => {
            const metrics = await liveDashboard.getMetrics();
            res.json(metrics);
        });
        // 10. Operating Modes Endpoint
        this.app.get('/modes', (_req, res) => {
            res.json({
                activeMode: multiModeEngine.getMode(),
                permissions: multiModeEngine.getPermissions(),
                autonomousState: multiModeEngine.getAutonomousState(),
            });
        });
        this.app.post('/api/mode', (req, res) => {
            const { mode, reason } = req.body;
            if (mode && Object.values(OperatingMode).includes(mode)) {
                multiModeEngine.setMode(mode, reason || 'API request');
                return res.json({ success: true, activeMode: multiModeEngine.getMode() });
            }
            res.status(400).json({ success: false, error: 'Invalid operating mode' });
        });
        // 11. 4-Tier Capability Resolution API Endpoint
        this.app.post('/api/resolve', async (req, res) => {
            const { intent, context } = req.body;
            if (!intent) {
                return res.status(400).json({ success: false, error: 'intent is required' });
            }
            const resolution = await universalCapabilityEngine.resolveCapability(intent, context);
            res.json({ success: true, resolution });
        });
        // 9. Multi-Studio Session Handshake
        this.app.post('/api/handshake', (req, res) => {
            const payload = req.body;
            if (!payload || !payload.sessionId) {
                return res.status(400).json({ success: false, error: 'Malformed handshake payload' });
            }
            const sessionInfo = {
                sessionId: payload.sessionId,
                studioInstanceId: payload.studioInstanceId,
                pluginInstanceId: payload.pluginInstanceId,
                placeId: payload.placeId || 0,
                placeName: payload.placeName || 'Local Place',
                gameId: payload.gameId || 0,
                studioVersion: payload.studioVersion || 'Unknown',
                mode: payload.mode || 'Edit',
                connectedAt: Date.now(),
                lastActive: Date.now(),
                lastSeenAt: Date.now(),
            };
            this.sessions.set(payload.sessionId, sessionInfo);
            commandDispatcher.registerSession(payload);
            res.json({
                success: true,
                message: 'Handshake accepted. Multi-Studio MCP Bridge connected.',
                session: sessionInfo,
                daemonVersion: '1.0.0',
                fingerprint: certificateManager.getFingerprint(),
            });
        });
        // 7. Polling Command Queue
        this.app.post('/api/poll', async (req, res) => {
            const { sessionId, events } = req.body;
            if (!sessionId) {
                return res.status(400).json({ success: false, error: 'sessionId is required' });
            }
            const session = this.sessions.get(sessionId);
            if (session) {
                session.lastActive = Date.now();
                session.lastSeenAt = Date.now();
            }
            commandDispatcher.heartbeat(sessionId);
            if (Array.isArray(events) && events.length > 0) {
                commandDispatcher.ingestEvents(events);
            }
            try {
                const commands = await commandDispatcher.fetchPendingCommands(sessionId);
                res.json({
                    success: true,
                    commands,
                });
            }
            catch (err) {
                res.status(500).json({
                    success: false,
                    error: err?.message || 'Error fetching pending commands',
                });
            }
        });
        // 8. Command Execution Response
        this.app.post('/api/response', (req, res) => {
            const response = req.body;
            if (!response || !response.id) {
                return res.status(400).json({ success: false, error: 'Malformed response payload: id is required' });
            }
            const handled = commandDispatcher.handleResponse(response);
            res.json({ success: handled });
        });
        // 9. Asynchronous Event Ingestion
        this.app.post('/api/events', (req, res) => {
            const { events } = req.body;
            if (Array.isArray(events)) {
                commandDispatcher.ingestEvents(events);
            }
            res.json({ success: true, count: Array.isArray(events) ? events.length : 0 });
        });
        // 10. Secondary MCP Process Remote Command Execution
        this.app.post('/api/execute', async (req, res) => {
            const { action, params } = req.body;
            if (!action) {
                return res.status(400).json({ success: false, error: 'action is required' });
            }
            try {
                const result = await commandDispatcher.executeCommand(action, params || {});
                res.json({ success: true, result });
            }
            catch (err) {
                res.status(500).json({
                    success: false,
                    error: {
                        code: err?.code || 'EXECUTION_ERROR',
                        message: err?.message || String(err),
                        details: err?.details,
                    },
                });
            }
        });
    }
    async start(port = DEFAULT_CONFIG.port, host = DEFAULT_CONFIG.host) {
        // Generate or load real X.509 TLS certificate (async)
        const certInfo = await certificateManager.getOrCreateCertificate();
        const httpPort = port; // 38883
        const httpsPort = port + 1; // 38884
        // --- Start HTTP Server on port 38883 ---
        await new Promise((resolve) => {
            try {
                this.httpServer = http.createServer(this.app);
                this.httpServer.listen(httpPort, host, () => {
                    console.error(`[HTTP  Bridge] ✅ Listening on http://${host}:${httpPort}`);
                    resolve();
                });
                this.httpServer.on('error', async (err) => {
                    if (err.code === 'EADDRINUSE') {
                        console.error(`[HTTP  Bridge] Port ${httpPort} in use, attempting reclaim...`);
                        try {
                            const res = await fetch(`http://${host}:${httpPort}/health`);
                            if (res.ok) {
                                console.error(`[HTTP  Bridge] Existing daemon healthy, reusing.`);
                                return resolve();
                            }
                        }
                        catch { }
                        try {
                            const { execSync } = await import('child_process');
                            if (process.platform === 'win32') {
                                execSync(`powershell -NoProfile -NonInteractive -Command "Get-NetTCPConnection -LocalPort ${httpPort} -ErrorAction SilentlyContinue | Where-Object { $_.OwningProcess -gt 4 } | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"`, { stdio: 'ignore' });
                            }
                            this.httpServer = http.createServer(this.app);
                            this.httpServer.listen(httpPort, host, () => {
                                console.error(`[HTTP  Bridge] ✅ Port reclaimed. Listening on http://${host}:${httpPort}`);
                                resolve();
                            });
                            return;
                        }
                        catch { }
                    }
                    console.error(`[HTTP  Bridge] ❌ Failed to bind http://${host}:${httpPort}:`, err.message);
                    resolve();
                });
            }
            catch {
                resolve();
            }
        });
        // --- Start HTTPS Server on port 38884 ---
        await new Promise((resolve) => {
            try {
                this.httpsServer = https.createServer({ key: certInfo.key, cert: certInfo.cert }, this.app);
                this.httpsServer.listen(httpsPort, host, () => {
                    console.error(`[HTTPS Bridge] ✅ Listening on https://${host}:${httpsPort}`);
                    resolve();
                });
                this.httpsServer.on('error', async (err) => {
                    if (err.code === 'EADDRINUSE') {
                        console.error(`[HTTPS Bridge] Port ${httpsPort} in use, existing daemon reusing.`);
                        return resolve();
                    }
                    console.error(`[HTTPS Bridge] ❌ Failed to bind https://${host}:${httpsPort}:`, err.message);
                    resolve();
                });
            }
            catch (e) {
                console.error(`[HTTPS Bridge] ❌ Exception:`, e.message);
                resolve();
            }
        });
    }
    stop() {
        return new Promise((resolve) => {
            const closeHttps = () => {
                if (this.httpsServer) {
                    this.httpsServer.close(() => resolve());
                }
                else {
                    resolve();
                }
            };
            if (this.httpServer) {
                this.httpServer.close(() => closeHttps());
            }
            else {
                closeHttps();
            }
        });
    }
}
export const httpBridgeServer = new HttpBridgeServer();
//# sourceMappingURL=httpBridge.js.map