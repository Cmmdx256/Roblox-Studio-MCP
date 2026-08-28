import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
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
import { capabilityAdapterGenerator } from './capabilities/CapabilityAdapterGenerator.js';
import { universalCapabilityEngine } from './capabilities/UniversalCapabilityEngine.js';
import { multiModeEngine } from './modes/MultiModeEngine.js';
import { liveDashboard } from './telemetry/LiveDashboard.js';
import { unifiedToolRegistry } from './capabilities/UnifiedToolRegistry.js';
import { worldBuildingEngine } from './engines/WorldBuildingEngine.js';
import { gameCreationEngine } from './engines/GameCreationEngine.js';
import { playtestEngine } from './engines/PlaytestEngine.js';
import { diagnosticsEngine } from './engines/DiagnosticsEngine.js';
import { completenessEngine } from './engines/CompletenessEngine.js';
import { assetIntelligenceEngine } from './engines/AssetIntelligenceEngine.js';
import { studioStateGraph } from './state/StudioStateGraph.js';
import { projectKnowledgeGraph } from './state/ProjectKnowledgeGraph.js';
import { projectContextEngine } from './engines/ProjectContextEngine.js';
import { transactionEngine } from './transaction/TransactionEngine.js';
import { healthMonitor } from './providers/HealthMonitor.js';
import { recoveryEngine } from './engines/RecoveryEngine.js';
import { observationEngine } from './engines/ObservationEngine.js';
import { executionPipeline } from './execution/ExecutionPipeline.js';
import { uiDesignEngine } from './engines/UIDesignEngine.js';
import { modelRouter } from './models/ModelRouter.js';
import { projectMemory } from './memory/ProjectMemory.js';
import { refactoringEngine } from './engines/RefactoringEngine.js';
import { codeArchitectureEngine } from './engines/CodeArchitectureEngine.js';
import { mechanicCardRegistry } from './workflows/MechanicCardRegistry.js';
import { assetSecurityEngine } from './security/AssetSecurityEngine.js';
import { visualQAEngine } from './engines/VisualQAEngine.js';
import { aiOrchestrator } from './orchestrator/AIOrchestrator.js';
import { OperatingMode } from './providers/types.js';
import { eventBus } from './events/EventBus.js';
import { intentEngine } from './engines/IntentEngine.js';
import { acceptanceCriteriaEngine } from './engines/AcceptanceCriteriaEngine.js';
import { changePlanEngine } from './engines/ChangePlanEngine.js';
import { animationDSLEngine } from './engines/AnimationDSLEngine.js';
import { cameraEngine } from './engines/CameraEngine.js';
import { responsiveLayoutEngine } from './ui/ResponsiveLayoutEngine.js';
import { multiplayerQAEngine } from './security/MultiplayerQAEngine.js';
import { buildHistoryEngine } from './orchestrator/BuildHistoryEngine.js';
import { regressionEngine } from './engines/RegressionEngine.js';
import {
  realityEngine,
  studioObservationEngine,
  runtimeObservationEngine,
  gameplayStateObserver,
  visionInspectionEngine,
  gameDesignQAEngine,
  evidenceCorrelationEngine,
  realityReportEngine,
  performanceRealityEngine,
  multiplayerRealityEngine,
  assetRealityEngine,
  uiRealityEngine,
  animationRealityEngine
} from './reality/index.js';
import { studioSessionManager } from './session/StudioSessionManager.js';
import { studioAvailabilityGuard } from './session/StudioAvailabilityGuard.js';
import { evidenceEngine } from './evidence/EvidenceEngine.js';
import { dataModelSnapshotEngine } from './evidence/DataModelSnapshotEngine.js';
import { buildQualityGateEngine } from './orchestrator/BuildQualityGateEngine.js';
import { idempotencyEngine } from './execution/IdempotencyEngine.js';
import { assertValidTransition, ExecutionState } from './execution/ExecutionPipeline.js';

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
    handler: async (args: any) => {
      const matrix = await capabilityDiscoveryEngine.discoverAll();
      return {
        // Capability discovery proves only that adapters/providers describe a
        // route. It does not prove a live Studio operation succeeded.
        status: 'UNVERIFIED',
        verified: false,
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
      const providersHealth: Record<string, any> = {};
      for (const [name, h] of healthMap.entries()) {
        providersHealth[name] = h;
      }
      return {
        // Health and graph snapshots are observability data, not execution
        // evidence. Consumers must not read this response as Studio verified.
        status: 'UNVERIFIED',
        verified: false,
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
    handler: async (args: any) => {
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
    handler: async (args: any) => {
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
    handler: async (args: any) => {
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
    handler: async (args: any) => {
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
    handler: async (args: any) => {
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
    handler: async (args: any) => {
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
    handler: async (args: any) => {
      multiModeEngine.setMode(args.mode as any, args.reason || 'Tool invocation');
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
  {
    name: 'context_focus',
    description: 'Relevance-Aware Context Engine: Dynamically discovers, ranks, and compresses task-relevant instances, scripts, and errors to prevent context flooding.',
    inputSchema: {
      type: 'object',
      properties: {
        intent: { type: 'string', description: 'User intent or task description' },
        maxInstances: { type: 'number', description: 'Maximum instance nodes to return (default 8)' },
        maxScripts: { type: 'number', description: 'Maximum focused script snippets to return (default 3)' },
      },
      required: ['intent'],
    },
    handler: async (args: any) => {
      const context = await projectContextEngine.buildFocusedContext(args.intent, args.maxInstances, args.maxScripts);
      return {
        status: 'SUCCESS',
        context,
      };
    },
  },
  {
    name: 'transaction_manage',
    description: 'Transaction Engine: Atomic multi-step operation coordinator with ChangeHistoryService checkpointing and automatic rollback on failure.',
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['begin', 'commit', 'rollback'], description: 'Transaction operation' },
        name: { type: 'string', description: 'Transaction name / waypoint identifier' },
        transactionId: { type: 'string', description: 'Target transaction ID for commit or rollback' },
        reason: { type: 'string', description: 'Reason for rollback if applicable' },
      },
      required: ['action'],
    },
    handler: async (args: any) => {
      if (args.action === 'begin') {
        const tx = await transactionEngine.beginTransaction(args.name || 'AI Atomic Operation');
        return { status: 'SUCCESS', transaction: tx };
      }
      if (args.action === 'commit') {
        if (!args.transactionId) throw new Error('transactionId required for commit');
        return await transactionEngine.commitTransaction(args.transactionId);
      }
      if (args.action === 'rollback') {
        if (!args.transactionId) throw new Error('transactionId required for rollback');
        return await transactionEngine.rollbackTransaction(args.transactionId, args.reason);
      }
      throw new Error(`Unknown transaction action: ${args.action}`);
    },
  },
  {
    name: 'system_health',
    description: 'Health Monitoring Subsystem: Returns active live health, latency, and capability counts across all 11 providers and Studio bridge.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    handler: async () => {
      const health = await healthMonitor.checkAllProviders();
      return {
        status: 'SUCCESS',
        health,
      };
    },
  },
  {
    name: 'autonomous_recovery',
    description: 'Autonomous Recovery Engine: Synthesizes intelligent root-cause repairs for Studio runtime/script errors and re-verifies state.',
    inputSchema: {
      type: 'object',
      properties: {
        error: { type: 'string', description: 'Runtime or syntax error message' },
        scriptPath: { type: 'string', description: 'Offending script path' },
        sourceCode: { type: 'string', description: 'Optional current script source code' },
      },
      required: ['error'],
    },
    handler: async (args: any) => {
      const result = await recoveryEngine.attemptRecovery(args.error, {
        scriptPath: args.scriptPath,
        sourceCode: args.sourceCode,
      });
      return {
        status: result.success ? 'SUCCESS' : 'FAILED',
        recovery: result,
      };
    },
  },
  {
    name: 'observation_focus',
    description: 'Observation Engine 2.0: Performs structured, cost-controlled observation of target instances, focused script snippets, or session state.',
    inputSchema: {
      type: 'object',
      properties: {
        target: { type: 'string', description: 'Instance or script path to observe' },
        type: { type: 'string', enum: ['instance', 'script', 'session'], description: 'Observation type' },
        cost: { type: 'string', enum: ['CHEAP', 'NORMAL', 'DEEP', 'FULL'], description: 'Observation cost/depth' },
        targetSymbol: { type: 'string', description: 'Optional symbol for focused script inspection' },
      },
      required: ['type'],
    },
    handler: async (args: any) => {
      if (args.type === 'session') {
        const snap = await observationEngine.observeSessionState();
        return { status: 'SUCCESS', snapshot: snap };
      }
      if (args.type === 'script') {
        const obs = await observationEngine.observeScript(args.target, args.targetSymbol);
        return { status: 'SUCCESS', script: obs };
      }
      const obs = await observationEngine.observeInstance(args.target, args.cost as any);
      return { status: 'SUCCESS', instance: obs };
    },
  },
  {
    name: 'ui_design_create',
    description: 'UI Design Engine: Compiles intermediate UI specification into Roblox DataModel instances (ScreenGui, Panels, Buttons, Cards, Corner, Strokes, Padding) with theme tokens.',
    inputSchema: {
      type: 'object',
      properties: {
        screenName: { type: 'string', description: 'Screen name e.g. InventoryGui, ShopGui' },
        theme: { type: 'string', description: 'Theme id: dark_fantasy, modern_minimal, cartoon, fishing_casual, sci_fi' },
        layout: { type: 'string', enum: ['centered', 'dock_left', 'dock_right', 'fullscreen', 'hud_overlay'] },
        components: { type: 'array', items: { type: 'object' } },
      },
      required: ['screenName', 'components'],
    },
    handler: async (args: any) => {
      const result = await uiDesignEngine.createScreen({
        screenName: args.screenName,
        theme: args.theme || 'dark_fantasy',
        layout: args.layout || 'centered',
        components: args.components || [],
      });
      return result;
    },
  },
  {
    name: 'ui_theme_apply',
    description: 'UI Design Tokens: Lists or retrieves design token themes (palette, typography, spacing, radius, strokes) for styling Roblox GUIs.',
    inputSchema: {
      type: 'object',
      properties: {
        themeId: { type: 'string', description: 'Optional theme ID to inspect' },
      },
    },
    handler: async (args: any) => {
      if (args.themeId) {
        return { status: 'SUCCESS', theme: uiDesignEngine.getTheme(args.themeId) };
      }
      return { status: 'SUCCESS', themes: uiDesignEngine.listThemes() };
    },
  },
  {
    name: 'ui_critique',
    description: 'Visual QA Engine: Critiques UI layout geometry, detecting overlapping siblings, viewport boundary clipping, and contrast defects.',
    inputSchema: {
      type: 'object',
      properties: {
        elements: { type: 'array', items: { type: 'object' }, description: 'Array of { name, position: {x,y}, size: {x,y} }' },
      },
      required: ['elements'],
    },
    handler: async (args: any) => {
      const critique = visualQAEngine.evaluateUIGeometry(args.elements || []);
      return { status: 'SUCCESS', critique };
    },
  },
  {
    name: 'project_memory_inspect',
    description: 'Project Memory Engine: Retrieves structured project memory summary including registered systems, architecture summary, error memory, and decisions.',
    inputSchema: {
      type: 'object',
      properties: {
        detailed: { type: 'boolean', description: 'Return full memory maps instead of compact summary' },
      },
    },
    handler: async (args: any) => {
      if (args.detailed) {
        return { status: 'SUCCESS', memory: projectMemory.getMemory() };
      }
      return { status: 'SUCCESS', summary: projectMemory.getCompactSummary() };
    },
  },
  {
    name: 'code_refactor_analyze',
    description: 'Refactoring & Architecture Engine: Scans Luau scripts for monolithic structures (>250 lines), deprecated wait() calls, security risks, and detects project framework.',
    inputSchema: {
      type: 'object',
      properties: {
        scriptPath: { type: 'string', description: 'Script path' },
        sourceCode: { type: 'string', description: 'Source code content' },
        knownProjectPaths: { type: 'array', items: { type: 'string' } },
      },
      required: ['scriptPath', 'sourceCode'],
    },
    handler: async (args: any) => {
      const refactorPlan = refactoringEngine.analyzeScriptForRefactoring(args.scriptPath, args.sourceCode);
      const archAudit = codeArchitectureEngine.auditArchitecture(args.knownProjectPaths || [args.scriptPath]);
      return {
        status: 'SUCCESS',
        refactoring: refactorPlan,
        architecture: archAudit,
      };
    },
  },
  {
    name: 'mechanic_card_instantiate',
    description: 'Mechanic Card Registry: Lists or instantiates pre-built, verified gameplay mechanics (kill_brick, coin_pickup, interactive_door, sprint_stamina).',
    inputSchema: {
      type: 'object',
      properties: {
        cardId: { type: 'string', description: 'Mechanic card ID' },
        customParams: { type: 'object', description: 'Customization parameter overrides' },
      },
    },
    handler: async (args: any) => {
      if (!args.cardId) {
        return { status: 'SUCCESS', availableCards: mechanicCardRegistry.listCards() };
      }
      const instantiated = mechanicCardRegistry.instantiateCard(args.cardId, args.customParams || {});
      return { status: 'SUCCESS', cardId: args.cardId, instantiated };
    },
  },
  {
    name: 'asset_security_scan',
    description: 'Asset Security Engine: Scans candidate 3D models and scripts for malicious backdoors, obfuscation (getfenv/loadstring), external ID requires, and rates safety.',
    inputSchema: {
      type: 'object',
      properties: {
        assetId: { type: 'string', description: 'Asset identifier' },
        assetName: { type: 'string', description: 'Asset name' },
        scripts: { type: 'array', items: { type: 'object' }, description: 'Array of { path, source }' },
      },
      required: ['assetId', 'assetName', 'scripts'],
    },
    handler: async (args: any) => {
      const report = assetSecurityEngine.scanAsset(args.assetId, args.assetName, args.scripts || []);
      return { status: 'SUCCESS', securityReport: report };
    },
  },
  {
    name: 'model_route_query',
    description: 'Model Router: Evaluates natural language task intent and selects optimal AI model profile based on reasoning, coding, UI, vision, latency, and cost.',
    inputSchema: {
      type: 'object',
      properties: {
        intent: { type: 'string', description: 'Task intent' },
        requiresVision: { type: 'boolean' },
        isArchitecturePlanning: { type: 'boolean' },
      },
      required: ['intent'],
    },
    handler: async (args: any) => {
      const decision = modelRouter.routeTask(args.intent, {
        requiresVision: args.requiresVision,
        isArchitecturePlanning: args.isArchitecturePlanning,
      });
      return { status: 'SUCCESS', decision, allProfiles: modelRouter.getAllProfiles() };
    },
  },
  {
    name: 'orchestrator_execute',
    description: 'Master AI Orchestrator 2.0: Executes complete autonomous pipeline from user intent -> DAG planner -> model routing -> domain engines -> verifiable execution -> recovery.',
    inputSchema: {
      type: 'object',
      properties: {
        intent: { type: 'string', description: 'Natural language development request' },
        mode: { type: 'string', enum: ['SAFE', 'ASSISTED', 'AUTONOMOUS', 'EXPERT', 'DRY_RUN'], description: 'Operating mode' },
      },
      required: ['intent'],
    },
    handler: async (args: any) => {
      const result = await aiOrchestrator.orchestrateTask(args.intent, args.mode as any || 'AUTONOMOUS');
      return { status: 'SUCCESS', orchestration: result };
    },
  },
  {
    name: 'intent_parse',
    description: 'Intent Engine: Parses natural language prompt into structured requirements, constraints, assumptions, and subsystem dependencies.',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'Natural language user prompt' },
      },
      required: ['prompt'],
    },
    handler: async (args: any) => {
      const intent = intentEngine.parseIntent(args.prompt);
      return { status: 'SUCCESS', intent };
    },
  },
  {
    name: 'acceptance_criteria_generate',
    description: 'Acceptance Criteria Engine: Generates machine-checkable acceptance criteria from structured intent requirements.',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'Natural language prompt to generate criteria from' },
      },
      required: ['prompt'],
    },
    handler: async (args: any) => {
      const intent = intentEngine.parseIntent(args.prompt);
      const suite = acceptanceCriteriaEngine.generateCriteria(intent);
      return { status: 'SUCCESS', suite };
    },
  },
  {
    name: 'change_plan_generate',
    description: 'Change Plan Engine: Generates multi-stage structured change plan with operations, risk levels, and acceptance criteria linkage.',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'Natural language prompt' },
        mode: { type: 'string', enum: ['DRY_RUN', 'READY_TO_APPLY'], description: 'Plan mode' },
      },
      required: ['prompt'],
    },
    handler: async (args: any) => {
      const intent = intentEngine.parseIntent(args.prompt);
      const suite = acceptanceCriteriaEngine.generateCriteria(intent);
      const plan = changePlanEngine.generatePlan(intent, suite);
      return { status: 'SUCCESS', plan };
    },
  },
  {
    name: 'animation_dsl_compile',
    description: 'Animation DSL Engine: Compiles intermediate animation specification (phases, joint angles, easing) into native Luau TweenService controller and keyframe data.',
    inputSchema: {
      type: 'object',
      properties: {
        preset: { type: 'string', description: 'Preset name (e.g. fishing_cast, melee_slash, interact_pickup, locomotion_idle)' },
        custom: { type: 'object', description: 'Custom AnimationDSLSpec' },
      },
    },
    handler: async (args: any) => {
      if (args.preset) {
        const spec = animationDSLEngine.getPreset(args.preset);
        if (spec) {
          const result = animationDSLEngine.compileAnimationDSL(spec);
          return { status: 'SUCCESS', spec, compiled: result };
        }
      }
      if (args.custom) {
        const result = animationDSLEngine.compileAnimationDSL(args.custom);
        return { status: 'SUCCESS', compiled: result };
      }
      return { status: 'SUCCESS', availablePresets: animationDSLEngine.listPresets() };
    },
  },
  {
    name: 'camera_controller_generate',
    description: 'Camera Intelligence Engine: Generates cinematic camera controllers (focus, shake, NPC dialogue, orbit, custom) as native Luau LocalScripts.',
    inputSchema: {
      type: 'object',
      properties: {
        mode: { type: 'string', description: 'Camera mode (e.g. ACTION_FOCUS, NPC_INTERACTION, CINEMATIC_ORBIT, CAMERA_SHAKE, DEFAULT_FOLLOW, SHOP_INSPECTION, FISHING_CATCH, or custom)' },
        fov: { type: 'number' },
        duration: { type: 'number' },
        shakeIntensity: { type: 'number' },
        offsetCFrame: { type: 'array', description: '[x, y, z] camera offset' },
      },
      required: ['mode'],
    },
    handler: async (args: any) => {
      const controller = cameraEngine.generateCameraController(args);
      return { status: 'SUCCESS', luauCode: controller };
    },
  },
  {
    name: 'responsive_layout_generate',
    description: 'Responsive Layout Engine: Generates cross-device UI constraints (UIAspectRatioConstraint, UISizeConstraint) and TweenService button animation controllers.',
    inputSchema: {
      type: 'object',
      properties: {
        aspectRatio: { type: 'number', description: 'Target aspect ratio (default 1.6)' },
        includeAnimationController: { type: 'boolean', description: 'Include button hover/press animation controller' },
      },
    },
    handler: async (args: any) => {
      const constraints = responsiveLayoutEngine.generateResponsiveConstraints(args.aspectRatio);
      const result: any = { status: 'SUCCESS', constraints };
      if (args.includeAnimationController) {
        result.animationController = responsiveLayoutEngine.generateUIAnimationController();
      }
      return result;
    },
  },
  {
    name: 'multiplayer_qa_audit',
    description: 'Multiplayer QA Engine: Audits server/client network boundaries for client-authoritative exploits, race conditions, and missing cooldowns.',
    inputSchema: {
      type: 'object',
      properties: {
        scripts: { type: 'array', items: { type: 'object' }, description: 'Array of { path, source }' },
      },
      required: ['scripts'],
    },
    handler: async (args: any) => {
      const audit = multiplayerQAEngine.auditNetworkBoundaries(args.scripts || []);
      const sim = multiplayerQAEngine.simulateMultiplayerTransactionTest();
      return { status: 'SUCCESS', networkAudit: audit, transactionSimulation: sim };
    },
  },
  {
    name: 'build_history_inspect',
    description: 'Build History Engine: Retrieves versioned build artifact history with change tracking, criteria satisfaction, and rollback references.',
    inputSchema: {
      type: 'object',
      properties: {
        latest: { type: 'boolean', description: 'Return only the latest build' },
      },
    },
    handler: async (args: any) => {
      if (args.latest) {
        return { status: 'SUCCESS', latestBuild: buildHistoryEngine.getLatestBuild() };
      }
      return { status: 'SUCCESS', builds: buildHistoryEngine.getBuildHistory() };
    },
  },
  {
    name: 'regression_suite_run',
    description: 'Regression Engine: Runs automated regression test suite ensuring new features do not break existing systems.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    handler: async () => {
      const report = await regressionEngine.runRegressionSuite();
      return { status: 'SUCCESS', regressionReport: report };
    },
  },
  {
    name: 'event_bus_inspect',
    description: 'Event Bus: Retrieves recent platform lifecycle events (StudioConnected, ToolCalled, InstanceCreated, VerificationPassed, BuildCommitted, etc.).',
    inputSchema: {
      type: 'object',
      properties: {
        eventType: { type: 'string', description: 'Filter by specific event type' },
        limit: { type: 'number', description: 'Max events to return (default 50)' },
      },
    },
    handler: async (args: any) => {
      const events = eventBus.getRecentEvents(args.eventType, args.limit || 50);
      return { status: 'SUCCESS', totalEvents: events.length, events };
    },
  },
  {
    name: 'knowledge_graph_impact',
    description: 'Knowledge Graph Impact Analysis: Computes dependency impact of modifying a target node — affected systems, remotes, and acceptance criteria.',
    inputSchema: {
      type: 'object',
      properties: {
        targetId: { type: 'string', description: 'Node ID to analyze (e.g. FishData, InventoryService)' },
        action: { type: 'string', enum: ['impact', 'search', 'stats'], description: 'Analysis type' },
        query: { type: 'string', description: 'Search query (when action is search)' },
      },
      required: ['action'],
    },
    handler: async (args: any) => {
      if (args.action === 'impact' && args.targetId) {
        const impact = projectKnowledgeGraph.getImpactAnalysis(args.targetId);
        return { status: 'SUCCESS', impactAnalysis: impact };
      }
      if (args.action === 'search' && args.query) {
        const results = projectKnowledgeGraph.searchNodes(args.query);
        return { status: 'SUCCESS', results };
      }
      return { status: 'SUCCESS', stats: projectKnowledgeGraph.getStats(), architecture: projectKnowledgeGraph.getArchitectureSummary() };
    },
  },
  {
    name: 'gameplay_simulation_run',
    description: 'Gameplay Simulation Engine: Runs Monte Carlo loot drop simulations, progression curves, and economic balance analysis.',
    inputSchema: {
      type: 'object',
      properties: {
        iterations: { type: 'number', description: 'Monte Carlo draw count (e.g. 10000)' },
        actionDurationSec: { type: 'number', description: 'Time per action cycle' },
        lootTable: { type: 'array', description: 'Items with weights and values' },
        upgradeCosts: { type: 'array', description: 'Progression tier upgrade costs' },
      },
      required: ['lootTable'],
    },
    handler: async (args: any) => {
      const { gameplaySimulationEngine } = await import('./engines/GameplaySimulationEngine.js');
      const res = gameplaySimulationEngine.simulateEconomy({
        iterations: args.iterations || 10000,
        playerCount: 1,
        playtimeMinutesPerSession: 20,
        lootTable: args.lootTable,
        actionDurationSec: args.actionDurationSec || 5,
        upgradeCosts: args.upgradeCosts || [250, 1000, 5000]
      });
      return { status: 'SUCCESS', simulationResult: res };
    },
  },
  {
    name: 'designer_spec_generate',
    description: 'DesignerBrain: Generates complete GameDesignSpec with 8 sub-brains (GameDesign, UX, World, Animation, Camera, Polish) across any genre.',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'Game concept prompt' },
        themeOverride: { type: 'string', description: 'Optional theme override' },
      },
      required: ['prompt'],
    },
    handler: async (args: any) => {
      const { designerBrain } = await import('./engines/DesignerBrain.js');
      const spec = designerBrain.createGameDesignSpec(args.prompt, args.themeOverride);
      return { status: 'SUCCESS', gameDesignSpec: spec };
    },
  },
  {
    name: 'reality_observe_studio',
    description: 'Reality Engine: Targeted observation of Studio DataModel at controlled cost tier (CHEAP, NORMAL, DEEP, FULL).',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Instance path to inspect' },
        cost: { type: 'string', enum: ['CHEAP', 'NORMAL', 'DEEP', 'FULL'], description: 'Observation cost/depth tier' },
      },
      required: ['path'],
    },
    handler: async (args: any) => {
      const obs = await studioObservationEngine.observe(args.path, args.cost || 'NORMAL');
      return { status: 'SUCCESS', observation: obs };
    },
  },
  {
    name: 'reality_run_cycle',
    description: 'Reality Engine: Runs full closed-loop Reality verification cycle (Studio DataModel + Runtime + Gameplay State + Visual QA + Design QA + Evidence Correlation).',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'Intent/game prompt' },
        mode: { type: 'string', enum: ['SAFE', 'ASSISTED', 'AUTONOMOUS', 'EXPERT', 'DRY_RUN'], description: 'Operating mode' },
      },
      required: ['prompt'],
    },
    handler: async (args: any) => {
      const orchResult = await aiOrchestrator.orchestrateTask(args.prompt, args.mode || 'AUTONOMOUS');
      const realityReport = await realityEngine.runFullCycle(
        orchResult.intent,
        orchResult.changePlan,
        orchResult.acceptanceSuite,
        orchResult.stepResults,
        orchResult.buildArtifact?.buildId || 'build_latest'
      );
      const markdownReport = realityReportEngine.formatMarkdownReport(realityReport);
      return {
        status: 'SUCCESS',
        orchestration: orchResult,
        realityReport,
        markdownReport,
      };
    },
  },
  {
    name: 'reality_inspect_vision',
    description: 'Reality Engine: Geometric UI layout audit, clipping detection, safe area validation, and WCAG contrast check.',
    inputSchema: {
      type: 'object',
      properties: {
        screenName: { type: 'string', description: 'Screen name in StarterGui' },
        devices: { type: 'array', description: 'Devices to audit (Desktop, Mobile, Tablet, Console)' },
        autoRepair: { type: 'boolean', description: 'Synthesize layout repair patches automatically' },
      },
      required: ['screenName'],
    },
    handler: async (args: any) => {
      const reports = await uiRealityEngine.verifyScreen({
        screenName: args.screenName,
        devices: args.devices,
        autoRepair: args.autoRepair !== false,
      });
      return { status: 'SUCCESS', reports };
    },
  },
  {
    name: 'reality_design_qa',
    description: 'Reality Engine: Evaluates game design specification coherence, core loops, onboarding, feedback, progression, and design risks.',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'Game concept prompt to evaluate' },
      },
      required: ['prompt'],
    },
    handler: async (args: any) => {
      const intent = intentEngine.parseIntent(args.prompt);
      const qaReport = gameDesignQAEngine.evaluateFromPrompt(args.prompt, intent);
      return { status: 'SUCCESS', gameDesignQA: qaReport };
    },
  },
  {
    name: 'reality_audit_trail',
    description: 'Reality Engine: Returns end-to-end evidence correlation audit trail for a build ID.',
    inputSchema: {
      type: 'object',
      properties: {
        buildId: { type: 'string', description: 'Build ID (e.g. build_001)' },
      },
    },
    handler: async (args: any) => {
      const build = args.buildId
        ? buildHistoryEngine.getBuild(args.buildId)
        : buildHistoryEngine.getLatestBuild();
      return { status: 'SUCCESS', build, history: buildHistoryEngine.getBuildHistory() };
    },
  },
  {
    name: 'gameplay_state_observe',
    description: 'Reality Engine: Generic gameplay state observer (players, leaderstats, inventories, spawn count, condition verification).',
    inputSchema: {
      type: 'object',
      properties: {
        conditionLuau: { type: 'string', description: 'Optional Luau boolean condition to verify' },
      },
    },
    handler: async (args: any) => {
      const snapshot = await gameplayStateObserver.collectSnapshot();
      let conditionResult: any = undefined;
      if (args.conditionLuau) {
        conditionResult = await gameplayStateObserver.verifyCondition(args.conditionLuau);
      }
      return { status: 'SUCCESS', gameplaySnapshot: snapshot, conditionResult };
    },
  },
  {
    name: 'performance_reality_measure',
    description: 'Reality Engine: Measures live DataModel metrics (instance count, part count, unanchored part count, script count, ui object count, memory, warning frequency).',
    inputSchema: { type: 'object', properties: {} },
    handler: async () => {
      const perf = await performanceRealityEngine.measurePerformance();
      return { status: 'SUCCESS', performanceReality: perf };
    },
  },
  {
    name: 'multiplayer_boundary_audit',
    description: 'Reality Engine: Audits client/server remote boundaries, exploits risks, InvokeClient anti-patterns, and multi-client test limits.',
    inputSchema: { type: 'object', properties: {} },
    handler: async () => {
      const mpReport = await multiplayerRealityEngine.auditMultiplayer();
      return { status: 'SUCCESS', multiplayerAudit: mpReport };
    },
  },
];

const platformToolMap = new Map<string, any>();
for (const pt of platformTools) {
  platformToolMap.set(pt.name, pt);
  platformToolMap.set(pt.name.replace(/_/g, '.'), pt);
}

export function createMCPServer(): Server {
  const server = new Server(
    {
      name: 'roblox-studio-universal-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    }
  );

  // List Tools Handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    // 1. Standard tools converted to JSON schema
    const standardToolsFormatted = allTools.map((tool) => {
      const rawJsonSchema: any = zodToJsonSchema(tool.inputSchema, {
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
      } catch (err: any) {
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
        const routeResult = await universalCapabilityEngine.executeCapability(name, (rawArgs as Record<string, any>) || {});
        return {
          isError: routeResult.status === 'ERROR',
          content: [
            {
              type: 'text',
              text: JSON.stringify(routeResult, null, 2),
            },
          ],
        };
      } catch (routerErr: any) {
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
    } catch (err: any) {
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
    } catch (err: any) {
      throw new Error(`Failed to read resource ${uri}: ${err?.message || 'Unknown error'}`);
    }
  });

  return server;
}

export async function runServer(): Promise<void> {
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
  } catch (err: any) {
    console.error('[Roblox MCP] Stdio Transport notice:', err?.message || err);
  }

  // Keep process alive indefinitely
  setInterval(() => {}, 1000 * 60 * 60);
}
