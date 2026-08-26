import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, ListResourcesRequestSchema, ReadResourceRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { allTools, toolMap } from './tools/index.js';
import { projectResources, readResourceByUri } from './resources/projectResources.js';
import { httpBridgeServer } from './transport/httpBridge.js';
import { DEFAULT_CONFIG } from './config.js';
import { providerRegistry } from './providers/ProviderRegistry.js';
import { embeddedPluginProvider } from './providers/EmbeddedPluginProvider.js';
import { officialRobloxMCPProvider } from './providers/OfficialRobloxMCPProvider.js';
import { modelingProvider } from './providers/ModelingProvider.js';
import { animationProvider } from './providers/AnimationProvider.js';
import { luauProvider } from './providers/LuauProvider.js';
import { workflowProvider } from './providers/WorkflowProvider.js';
import { assetProvider } from './providers/AssetProvider.js';
import { testingProvider } from './providers/TestingProvider.js';
import { diagnosticsProvider } from './providers/DiagnosticsProvider.js';
import { observationProvider } from './providers/ObservationProvider.js';
import { designProvider } from './providers/DesignProvider.js';
import { capabilityRouter } from './capabilities/CapabilityRouter.js';
import { capabilityDiscoveryEngine } from './capabilities/CapabilityDiscoveryEngine.js';
import { universalCapabilityEngine } from './capabilities/UniversalCapabilityEngine.js';
import { multiModeEngine } from './modes/MultiModeEngine.js';
import { liveDashboard } from './telemetry/LiveDashboard.js';
import { worldBuildingEngine } from './engines/WorldBuildingEngine.js';
import { gameCreationEngine } from './engines/GameCreationEngine.js';
import { playtestEngine } from './engines/PlaytestEngine.js';
import { diagnosticsEngine } from './engines/DiagnosticsEngine.js';
import { completenessEngine } from './engines/CompletenessEngine.js';
import { studioStateGraph } from './state/StudioStateGraph.js';
import { projectKnowledgeGraph } from './state/ProjectKnowledgeGraph.js';
// High-level Platform Tools
const platformTools = [
    {
        name: 'capability_discover',
        description: 'Scans all providers (Embedded Plugin, Official MCP, Studio services) and returns the live capability matrix with availability, security level, risk, and fallback.',
        inputSchema: {
            type: 'object',
            properties: {
                refresh: { type: 'boolean', description: 'Force real-time rescan of providers' },
            },
        },
        handler: async (args) => {
            const matrix = await capabilityDiscoveryEngine.discoverAll();
            return {
                status: 'SUCCESS',
                verified: true,
                totalCapabilities: matrix.length,
                matrix,
            };
        },
    },
    {
        name: 'capability_audit',
        description: 'Comprehensive system audit: reports available, unavailable, official-only, plugin-only, unknown capabilities, and schema mismatches.',
        inputSchema: {
            type: 'object',
            properties: {},
        },
        handler: async () => {
            return await capabilityDiscoveryEngine.audit();
        },
    },
    {
        name: 'system_audit',
        description: 'Deep audit of the entire development platform: providers health, Studio connection, DataModel state, and knowledge graph statistics.',
        inputSchema: {
            type: 'object',
            properties: {},
        },
        handler: async () => {
            const healthMap = await providerRegistry.healthCheckAll();
            const providersHealth = {};
            for (const [name, h] of healthMap.entries()) {
                providersHealth[name] = h;
            }
            return {
                status: 'SUCCESS',
                verified: true,
                providers: providersHealth,
                stateSnapshot: studioStateGraph.getStateSnapshot(),
                knowledgeStats: projectKnowledgeGraph.getStats(),
            };
        },
    },
    {
        name: 'game_create_from_spec',
        description: 'Autonomous Game Creation Pipeline: Takes natural-language game specification, parses requirements, generates architecture/GDD/plans, creates all systems, models, UI, animations, and produces verified game.',
        inputSchema: {
            type: 'object',
            properties: {
                specification: { type: 'string', description: 'Natural language specification of the game to create' },
            },
            required: ['specification'],
        },
        handler: async (args) => {
            return await gameCreationEngine.createGameFromSpec(args.specification);
        },
    },
    {
        name: 'world_build',
        description: 'World Building Engine: Construct spatial layout, zones, spawn points, lighting, terrain, roads, and interaction anchors atomically.',
        inputSchema: {
            type: 'object',
            properties: {
                theme: { type: 'string' },
                zones: { type: 'array', items: { type: 'object' } },
                lighting: { type: 'object' },
                terrain: { type: 'object' },
            },
            required: ['theme'],
        },
        handler: async (args) => {
            return await worldBuildingEngine.buildFullWorld(args);
        },
    },
    {
        name: 'playtest_run_scenario',
        description: 'Automated Playtest Runner: Executes multi-step gameplay testing scenario with input simulation, console output analysis, and screenshot capture.',
        inputSchema: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                steps: { type: 'array', items: { type: 'object' } },
            },
            required: ['name', 'steps'],
        },
        handler: async (args) => {
            return await playtestEngine.runScenario(args);
        },
    },
    {
        name: 'diagnostics_safe_repair',
        description: 'Root-Cause Error Analyzer & Safe Repair: Analyzes Studio errors, correlates with code, generates verified patch with dry-run support.',
        inputSchema: {
            type: 'object',
            properties: {
                scriptPath: { type: 'string' },
                search: { type: 'string' },
                replacement: { type: 'string' },
                dryRun: { type: 'boolean' },
            },
            required: ['scriptPath', 'search', 'replacement'],
        },
        handler: async (args) => {
            return await diagnosticsEngine.safeRepair(args);
        },
    },
    {
        name: 'completeness_audit',
        description: 'Completeness Engine: Compares requested requirements against implemented systems, detects missing features, and runs final validation.',
        inputSchema: {
            type: 'object',
            properties: {
                requestedFeatures: { type: 'array', items: { type: 'string' } },
            },
            required: ['requestedFeatures'],
        },
        handler: async (args) => {
            return await completenessEngine.auditCompleteness(args.requestedFeatures || [], studioStateGraph.getStateSnapshot());
        },
    },
    {
        name: 'capability_resolve',
        description: 'Universal Capability Engine: Resolves any intent or missing tool through 4-tier hierarchy (Direct Tool -> External Provider -> Primitive Composition -> UNAVAILABLE).',
        inputSchema: {
            type: 'object',
            properties: {
                intent: { type: 'string', description: 'Desired capability or action intent' },
                context: { type: 'object', description: 'Optional execution parameters or targets' },
            },
            required: ['intent'],
        },
        handler: async (args) => {
            return await universalCapabilityEngine.resolveCapability(args.intent, args.context);
        },
    },
    {
        name: 'mode_set',
        description: 'Multi-Mode Engine: Switches active operating mode (CHAT, OBSERVE, PLAN, BUILD, PLAYTEST, VISUAL, DEBUG, OPTIMIZE, VERIFY, AUTONOMOUS).',
        inputSchema: {
            type: 'object',
            properties: {
                mode: { type: 'string', description: 'Target operating mode' },
                reason: { type: 'string', description: 'Reason for mode change' },
            },
            required: ['mode'],
        },
        handler: async (args) => {
            multiModeEngine.setMode(args.mode, args.reason || 'Tool invocation');
            return {
                status: 'SUCCESS',
                activeMode: multiModeEngine.getMode(),
                permissions: multiModeEngine.getPermissions(),
            };
        },
    },
    {
        name: 'mode_get',
        description: 'Multi-Mode Engine: Inspects current operating mode, permissions, and autonomous loop state.',
        inputSchema: {
            type: 'object',
            properties: {},
        },
        handler: async () => {
            return {
                status: 'SUCCESS',
                activeMode: multiModeEngine.getMode(),
                permissions: multiModeEngine.getPermissions(),
                autonomousState: multiModeEngine.getAutonomousState(),
            };
        },
    },
    {
        name: 'telemetry_get',
        description: 'Live Dashboard: Retrieves real-time metrics across all 11 providers, active Studio session, capability counts, and mutation audit log.',
        inputSchema: {
            type: 'object',
            properties: {},
        },
        handler: async () => {
            const metrics = await liveDashboard.getMetrics();
            return {
                status: 'SUCCESS',
                metrics,
            };
        },
    },
    {
        name: 'capability_restricted_routes',
        description: 'Official MCP Routing: Lists all capabilities restricted by Roblox 3rd-party HTTP/sandbox that are routed directly to Official Roblox Studio MCP (3D AI, Asset Insertion, Screen Capture, Playtest Input).',
        inputSchema: {
            type: 'object',
            properties: {},
        },
        handler: async () => {
            const restricted = capabilityRouter.getRestrictedCapabilities();
            const tree = capabilityRouter.getRestrictedHierarchyTree();
            const officialProvider = providerRegistry.get('official-roblox-mcp');
            const officialHealth = officialProvider ? await officialProvider.healthCheck() : null;
            return {
                status: 'SUCCESS',
                officialMcpStatus: officialHealth?.state || 'UNAVAILABLE',
                officialMcpMessage: officialHealth?.message,
                totalRestrictedCapabilities: restricted.length,
                taxonomyCategories: Object.keys(tree).length,
                taxonomyTree: tree,
                restrictedRoutes: restricted,
            };
        },
    },
];
const platformToolMap = new Map();
for (const pt of platformTools) {
    platformToolMap.set(pt.name, pt);
    platformToolMap.set(pt.name.replace(/_/g, '.'), pt);
}
export function createMCPServer() {
    const server = new Server({
        name: 'roblox-studio-universal-mcp',
        version: '1.0.0',
    }, {
        capabilities: {
            tools: {},
            resources: {},
        },
    });
    // List Tools Handler
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        // 1. Standard tools converted to JSON schema
        const standardToolsFormatted = allTools.map((tool) => {
            const rawJsonSchema = zodToJsonSchema(tool.inputSchema, {
                target: 'jsonSchema7',
                $refStrategy: 'none',
            });
            return {
                name: tool.name,
                description: tool.description,
                inputSchema: {
                    type: 'object',
                    properties: rawJsonSchema.properties || {},
                    required: rawJsonSchema.required || [],
                },
            };
        });
        // 2. High-level platform tools
        const platformToolsFormatted = platformTools.map((tool) => ({
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema,
        }));
        return {
            tools: [...standardToolsFormatted, ...platformToolsFormatted],
        };
    });
    // Call Tool Handler
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: rawArgs } = request.params;
        // Check platform tools first
        const platformTool = platformToolMap.get(name);
        if (platformTool) {
            try {
                const result = await platformTool.handler(rawArgs || {});
                return {
                    isError: false,
                    content: [
                        {
                            type: 'text',
                            text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            catch (err) {
                return {
                    isError: true,
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                status: 'ERROR',
                                verified: false,
                                code: err?.code || 'EXECUTION_ERROR',
                                message: err?.message || String(err),
                            }, null, 2),
                        },
                    ],
                };
            }
        }
        // Check standard tools
        const tool = toolMap.get(name);
        if (!tool) {
            // 4-Tier Capability Resolution & Execution via UniversalCapabilityEngine
            try {
                const routeResult = await universalCapabilityEngine.executeCapability(name, rawArgs || {});
                return {
                    isError: routeResult.status === 'ERROR',
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(routeResult, null, 2),
                        },
                    ],
                };
            }
            catch (routerErr) {
                return {
                    isError: true,
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                status: 'ERROR',
                                verified: false,
                                code: 'CAPABILITY_EXECUTION_ERROR',
                                message: `Capability '${name}' execution encountered an error.`,
                                details: routerErr?.message || routerErr,
                            }, null, 2),
                        },
                    ],
                };
            }
        }
        try {
            const parsedArgs = tool.inputSchema.parse(rawArgs || {});
            const result = await tool.handler(parsedArgs);
            return {
                isError: false,
                content: [
                    {
                        type: 'text',
                        text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
                    },
                ],
            };
        }
        catch (err) {
            return {
                isError: true,
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            status: 'ERROR',
                            verified: false,
                            code: err?.code || 'EXECUTION_ERROR',
                            message: err?.message || String(err),
                            details: err?.details || err?.stack,
                        }, null, 2),
                    },
                ],
            };
        }
    });
    // List Resources Handler
    server.setRequestHandler(ListResourcesRequestSchema, async () => {
        return {
            resources: projectResources.map((res) => ({
                uri: res.uri,
                name: res.name,
                description: res.description,
                mimeType: res.mimeType,
            })),
        };
    });
    // Read Resource Handler
    server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
        const { uri } = request.params;
        try {
            const response = await readResourceByUri(uri);
            return response;
        }
        catch (err) {
            throw new Error(`Failed to read resource ${uri}: ${err?.message || 'Unknown error'}`);
        }
    });
    return server;
}
export async function runServer() {
    // 1. Register and initialize all 11 Providers (Master Engineering Spec)
    providerRegistry.register(embeddedPluginProvider);
    providerRegistry.register(officialRobloxMCPProvider);
    providerRegistry.register(modelingProvider);
    providerRegistry.register(animationProvider);
    providerRegistry.register(luauProvider);
    providerRegistry.register(workflowProvider);
    providerRegistry.register(assetProvider);
    providerRegistry.register(testingProvider);
    providerRegistry.register(diagnosticsProvider);
    providerRegistry.register(observationProvider);
    providerRegistry.register(designProvider);
    await providerRegistry.initializeAll();
    // 2. Discover capabilities and populate Unified Tool Registry
    await capabilityDiscoveryEngine.discoverAll();
    const server = createMCPServer();
    // 3. Start HTTP & HTTPS Bridge for Roblox Studio Plugin (logs to stderr)
    await httpBridgeServer.start(DEFAULT_CONFIG.port, DEFAULT_CONFIG.host);
    console.error(`[Roblox MCP] HTTP Bridge active on http://${DEFAULT_CONFIG.host}:${DEFAULT_CONFIG.port}`);
    console.error(`[Roblox MCP] HTTPS Bridge active on https://${DEFAULT_CONFIG.host}:${DEFAULT_CONFIG.port + 1}`);
    // 4. Connect stdio transport for Claude Desktop / Cursor / Antigravity
    try {
        const transport = new StdioServerTransport();
        await server.connect(transport);
        console.error('[Roblox MCP] Stdio Transport connected. Ready for MCP AI client requests.');
    }
    catch (err) {
        console.error('[Roblox MCP] Stdio Transport notice:', err?.message || err);
    }
    // Keep process alive indefinitely
    setInterval(() => { }, 1000 * 60 * 60);
}
//# sourceMappingURL=server.js.map