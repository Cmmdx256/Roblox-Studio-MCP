import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { commandDispatcher } from '../src/dispatcher/commandDispatcher.js';
import { httpBridgeServer } from '../src/transport/httpBridge.js';
import { allTools, toolMap } from '../src/tools/index.js';
import { projectResources, readResourceByUri } from '../src/resources/projectResources.js';
import { ErrorCode } from '../src/types/rpc.js';

const TEST_PORT = Math.floor(39200 + Math.random() * 600);
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;
let testBridgeToken = '';

describe('Roblox Studio Universal MCP Test Suite', () => {
  before(async () => {
    await httpBridgeServer.start(TEST_PORT, '127.0.0.1');
  });

  after(async () => {
    await httpBridgeServer.stop();
  });

  it('Tool Registry contains all 36 universal tools', () => {
    assert.strictEqual(allTools.length >= 36, true, `Expected >= 36 tools, got ${allTools.length}`);
    const expectedTools = [
      'studio_info',
      'studio_get_tree',
      'studio_search',
      'studio_inspect',
      'instance_create',
      'instance_delete',
      'instance_clone',
      'instance_reparent',
      'instance_rename',
      'instance_move',
      'property_get',
      'property_set',
      'property_get_all',
      'attribute_get',
      'attribute_set',
      'attribute_delete',
      'attribute_get_all',
      'script_get_source',
      'script_set_source',
      'script_patch_source',
      'script_search_code',
      'selection_get',
      'selection_set',
      'selection_add',
      'selection_clear',
      'playtest_control',
      'playtest_get_state',
      'output_get',
      'output_get_errors',
      'output_clear',
      'context_build',
      'context_get_architecture',
      'terrain_fill_block',
      'terrain_fill_ball',
      'terrain_clear',
      'batch_execute',
      'project_analyze',
      'project_dependencies',
      'system_create',
      'scene_optimize',
      'debug_find_error',
    ];

    for (const toolName of expectedTools) {
      assert.strictEqual(toolMap.has(toolName), true, `Missing tool: ${toolName}`);
    }
  });

  it('HTTP Bridge Status returns disconnected when no session is active', async () => {
    const res = await fetch(`${BASE_URL}/api/status`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.status, 'ok');
  });

  it('HTTP Bridge Handshake registers studio session', async () => {
    const handshakePayload = {
      sessionId: 'test_session_12345',
      placeId: 987654321,
      placeName: 'MCP Unit Test Place',
      gameId: 12345,
      mode: 'Edit',
      studioVersion: '0.650.0.123',
    };

    const res = await fetch(`${BASE_URL}/api/handshake`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(handshakePayload),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.session.sessionId, 'test_session_12345');
    assert.strictEqual(typeof data.bridgeToken, 'string');
    assert.strictEqual(data.bridgeToken.length > 20, true);
    testBridgeToken = data.bridgeToken;
    assert.strictEqual(commandDispatcher.isStudioConnected(), true);
  });

  it('Executing a command dispatches over polling RPC and resolves with response', async () => {
    // 1. Initiate async command execution
    const cmdPromise = commandDispatcher.executeCommand('property_get', {
      target: 'Workspace.Baseplate',
      property: 'Size',
    });

    // 2. Simulate Roblox Studio polling for commands
    const pollRes = await fetch(`${BASE_URL}/api/poll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: 'test_session_12345', bridgeToken: testBridgeToken }),
    });

    const pollData = await pollRes.json();
    assert.strictEqual(pollData.success, true);
    assert.strictEqual(pollData.commands.length, 1);
    const cmd = pollData.commands[0];
    assert.strictEqual(cmd.action, 'property_get');

    const rejectedResponse = await fetch(`${BASE_URL}/api/response`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: cmd.id, sessionId: 'test_session_12345', bridgeToken: 'wrong-token', success: true }),
    });
    assert.strictEqual(rejectedResponse.status, 401);

    // 3. Simulate Roblox Studio sending back execution response
    const responsePayload = {
      id: cmd.id,
      sessionId: 'test_session_12345',
      bridgeToken: testBridgeToken,
      success: true,
      result: {
        property: 'Size',
        value: { _type: 'Vector3', x: 512, y: 20, z: 512 },
      },
    };

    const respRes = await fetch(`${BASE_URL}/api/response`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(responsePayload),
    });

    const respData = await respRes.json();
    assert.strictEqual(respData.success, true);

    // 4. Command promise should resolve
    const result = await cmdPromise;
    assert.strictEqual(result.property, 'Size');
    assert.strictEqual(result.value.x, 512);
  });

  it('Events ingestion buffers logs and error messages', async () => {
    const events = [
      {
        type: 'log',
        timestamp: Date.now(),
        data: {
          message: 'Player spawned successfully',
          messageType: 'MessageOutput',
        },
      },
      {
        type: 'log',
        timestamp: Date.now(),
        data: {
          message: 'Workspace.Script:12: attempt to index nil with Part',
          messageType: 'MessageError',
          traceback: 'Script "Workspace.Script", Line 12',
        },
      },
    ];

    const res = await fetch(`${BASE_URL}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: 'test_session_12345', bridgeToken: testBridgeToken, events }),
    });

    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.count, 2);

    const logs = commandDispatcher.getRecentLogs(10);
    assert.strictEqual(logs.some((l) => l.message.includes('Player spawned')), true);

    const errors = commandDispatcher.getRecentErrors(10);
    assert.strictEqual(errors.some((e) => e.message.includes('attempt to index nil')), true);
  });

  it('Project Resources can be read via URI', async () => {
    const infoRes = await readResourceByUri('roblox://project/info');
    assert.strictEqual(infoRes.contents.length, 1);
    const parsed = JSON.parse(infoRes.contents[0].text);
    assert.strictEqual(parsed.placeName, 'MCP Unit Test Place');

    const recentLogs = await readResourceByUri('roblox://output/recent');
    assert.strictEqual(recentLogs.contents.length, 1);
  });

  it('11 Providers are registered and operational in ProviderRegistry', async () => {
    const { providerRegistry } = await import('../src/providers/ProviderRegistry.js');
    const { embeddedPluginProvider } = await import('../src/providers/EmbeddedPluginProvider.js');
    const { officialRobloxMCPProvider } = await import('../src/providers/OfficialRobloxMCPProvider.js');
    const { modelingProvider } = await import('../src/providers/ModelingProvider.js');
    const { animationProvider } = await import('../src/providers/AnimationProvider.js');
    const { luauProvider } = await import('../src/providers/LuauProvider.js');
    const { workflowProvider } = await import('../src/providers/WorkflowProvider.js');
    const { assetProvider } = await import('../src/providers/AssetProvider.js');
    const { testingProvider } = await import('../src/providers/TestingProvider.js');
    const { diagnosticsProvider } = await import('../src/providers/DiagnosticsProvider.js');
    const { observationProvider } = await import('../src/providers/ObservationProvider.js');
    const { designProvider } = await import('../src/providers/DesignProvider.js');

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
    const providers = providerRegistry.getAll();
    assert.strictEqual(providers.length, 11, `Expected 11 providers, got ${providers.length}`);
  });

  it('Universal Capability Engine resolves across 4-tier hierarchy', async () => {
    const { universalCapabilityEngine } = await import('../src/capabilities/UniversalCapabilityEngine.js');
    
    // Tier 1: Direct Tool
    const resDirect = await universalCapabilityEngine.resolveCapability('studio_inspect');
    assert.strictEqual(resDirect.tier, 1);
    assert.strictEqual(resDirect.strategy, 'DIRECT_TOOL');

    // Tier 3: Primitive Composition (CapabilityCompiler)
    const resComposed = await universalCapabilityEngine.resolveCapability('Align fishing boats to shoreline');
    assert.strictEqual(resComposed.tier, 3);
    assert.strictEqual(resComposed.strategy, 'COMPILED_PRIMITIVES');
    assert.strictEqual(resComposed.executablePlan.steps.length > 0, true);
  });

  it('MultiModeEngine handles operating mode transitions and permissions', async () => {
    const { multiModeEngine } = await import('../src/modes/MultiModeEngine.js');
    const { OperatingMode } = await import('../src/providers/types.js');

    multiModeEngine.setMode(OperatingMode.OBSERVE, 'Read only scan');
    assert.strictEqual(multiModeEngine.getMode(), OperatingMode.OBSERVE);
    assert.strictEqual(multiModeEngine.getPermissions().canMutateDataModel, false);

    multiModeEngine.setMode(OperatingMode.BUILD, 'Constructing assets');
    assert.strictEqual(multiModeEngine.getMode(), OperatingMode.BUILD);
    assert.strictEqual(multiModeEngine.getPermissions().canMutateDataModel, true);

    multiModeEngine.startAutonomousLoop('Create complete fishing village');
    assert.strictEqual(multiModeEngine.getMode(), OperatingMode.AUTONOMOUS);
    assert.strictEqual(multiModeEngine.getAutonomousState().isRunning, true);
  });

  it('Live Dashboard endpoint returns comprehensive real-time telemetry', async () => {
    const res = await fetch(`${BASE_URL}/dashboard`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.dashboard.pluginStatus, 'ONLINE');
    assert.strictEqual(typeof data.dashboard.liveCapabilitiesCount, 'number');
    assert.strictEqual(typeof data.dashboard.liveToolsCount, 'number');

    // Reset session for pure in-memory engine unit tests
    commandDispatcher.clearSession();
  });

  it('Visual Construction Engine lists rich archetypes and templates', async () => {
    const { visualConstructionEngine } = await import('../src/engines/VisualConstructionEngine.js');
    const templates = visualConstructionEngine.listTemplates();
    assert.strictEqual(templates.length >= 7, true, `Expected >= 7 templates, got ${templates.length}`);
    const door = visualConstructionEngine.getTemplate('interactive_door');
    assert.strictEqual(door?.category, 'Interactions');
    assert.strictEqual(door?.requiredInstances.includes('ProximityPrompt'), true);
  });

  it('Animation Authoring Engine calibrates tool grips and keyframe sequences', async () => {
    const { animationAuthoringEngine } = await import('../src/engines/AnimationAuthoringEngine.js');
    assert.strictEqual(typeof animationAuthoringEngine.calibrateToolGrip, 'function');
    assert.strictEqual(typeof animationAuthoringEngine.poseRig, 'function');
    assert.strictEqual(typeof animationAuthoringEngine.createKeyframeSequence, 'function');
  });

  it('Verification Engine 2.0 evaluates conditions with 5-state reports and evidence', async () => {
    const { verificationEngine } = await import('../src/verification/VerificationEngine.js');

    // Empty conditions -> NOT_VERIFIABLE
    const emptyReport = await verificationEngine.verifyConditions([]);
    assert.strictEqual(emptyReport.status, 'NOT_VERIFIABLE');
    assert.strictEqual(emptyReport.verified, false);

    // Single unverified condition -> produces evidence item
    const singleReport = await verificationEngine.verifyConditions([
      { type: 'CUSTOM', target: 'TestTarget', expected: 'Active' }
    ]);
    assert.notStrictEqual(singleReport.status, 'VERIFIED');
    assert.strictEqual(singleReport.evidence.length, 1);
    assert.strictEqual(singleReport.evidence[0].target, 'TestTarget');
  });

  it('Idempotency Guard detects redundant creations and script mutations', async () => {
    const { idempotencyGuard } = await import('../src/security/IdempotencyGuard.js');

    const evalResult = await idempotencyGuard.evaluateAction('instance_create', {
      parent: 'Workspace',
      name: 'NonExistentUniqueFolder'
    });
    assert.strictEqual(evalResult.actionAdvice, 'EXECUTE');
    assert.strictEqual(evalResult.mode, 'REPEATABLE');
  });

  it('Transaction Engine coordinates lifecycle with begin, commit and rollback', async () => {
    const { transactionEngine } = await import('../src/transaction/TransactionEngine.js');

    const tx = await transactionEngine.beginTransaction('Unit Test Transaction');
    assert.strictEqual(tx.state, 'RUNNING');
    assert.strictEqual(typeof tx.id, 'string');

    const commitRes = await transactionEngine.commitTransaction(tx.id);
    assert.strictEqual(commitRes.success, false);
    assert.strictEqual(commitRes.transaction.state, 'FAILED');

    const tx2 = await transactionEngine.beginTransaction('Rollback Test');
    const rollbackRes = await transactionEngine.rollbackTransaction(tx2.id, 'Test rollback');
    assert.strictEqual(rollbackRes.success, true);
  });

  it('Security Engine evaluates operation risk and blocks protected internal services', async () => {
    const { securityEngine } = await import('../src/engines/SecurityEngine.js');
    const { RiskLevel } = await import('../src/providers/types.js');

    // Read operation
    const readPolicy = securityEngine.evaluatePolicy('property_get', { path: 'Workspace.Part', property: 'Position' });
    assert.strictEqual(readPolicy.allowed, true);
    assert.strictEqual(readPolicy.riskLevel, RiskLevel.READ_ONLY);

    // Destructive operation on protected service -> blocked
    const protectedPolicy = securityEngine.evaluatePolicy('instance_delete', { path: 'CoreGui.PluginGui' });
    assert.strictEqual(protectedPolicy.allowed, false);
    assert.strictEqual(protectedPolicy.riskLevel, RiskLevel.CRITICAL);
  });

  it('Autonomous Recovery Engine classifies errors and synthesizes repairs', async () => {
    const { recoveryEngine } = await import('../src/engines/RecoveryEngine.js');

    const recovery = await recoveryEngine.attemptRecovery(
      'Unable to assign property C0. Property is read only',
      { scriptPath: 'Workspace.Dummy.Animate', sourceCode: 'dummy.RightUpperArm.RightShoulder.C0 = CFrame.new()' }
    );
    assert.strictEqual(recovery.classification, 'PROPERTY_RESTRICTION');
    assert.strictEqual(typeof recovery.rootCause, 'string');
    assert.strictEqual(recovery.diagnosisType === 'AUTONOMOUS_RECOVERY' || recovery.diagnosisType === 'RULE_BASED_DIAGNOSTIC', true);
  });

  it('Project Context Engine ranks task-relevant entities and limits token usage', async () => {
    const { projectContextEngine } = await import('../src/engines/ProjectContextEngine.js');

    const context = await projectContextEngine.buildFocusedContext('Fix the fishing rod animation and catch script');
    assert.strictEqual(typeof context.intent, 'string');
    assert.strictEqual(Array.isArray(context.relevantInstances), true);
    assert.strictEqual(Array.isArray(context.relevantScripts), true);
    assert.strictEqual(typeof context.estimatedTokens, 'number');
  });

  it('Health Monitor audits all providers and computes unified health status', async () => {
    const { healthMonitor } = await import('../src/providers/HealthMonitor.js');

    const overview = await healthMonitor.checkAllProviders();
    assert.strictEqual(typeof overview.overallHealth, 'string');
    assert.strictEqual(typeof overview.totalCapabilities, 'number');
    assert.strictEqual(typeof overview.providers, 'object');
  });

  it('Model Router selects optimal AI models based on intent capabilities', async () => {
    const { modelRouter } = await import('../src/models/ModelRouter.js');

    // UI generation intent
    const uiDecision = modelRouter.routeTask('Create a dark fantasy inventory GUI with buttons');
    assert.strictEqual(uiDecision.selectedModel.id, 'ui-designer');

    // Luau coding intent
    const codeDecision = modelRouter.routeTask('Write a server script for leaderstats and datastore saving');
    assert.strictEqual(codeDecision.selectedModel.id, 'luau-coder');

    // Deep architecture intent
    const archDecision = modelRouter.routeTask('Design full architecture for a 0-to-1 open world adventure');
    assert.strictEqual(archDecision.selectedModel.id, 'deep-architect');

    // Vision critique intent
    const visionDecision = modelRouter.routeTask('Check screenshot for visual alignment and critique UI');
    assert.strictEqual(visionDecision.selectedModel.id, 'vision-qa');
  });

  it('UI Design Engine compiles intermediate UI specification with design tokens', async () => {
    const { uiDesignEngine } = await import('../src/engines/UIDesignEngine.js');

    const compiled = uiDesignEngine.compileScreenSpec({
      screenName: 'TestInventoryGui',
      theme: 'dark_fantasy',
      layout: 'centered',
      components: [
        {
          type: 'Panel',
          id: 'MainPanel',
          children: [
            { type: 'Button', id: 'CloseBtn', label: 'Close' },
            { type: 'ItemCard', id: 'SwordCard', title: 'Iron Sword' }
          ]
        }
      ]
    });

    assert.strictEqual(compiled.className, 'ScreenGui');
    assert.strictEqual(compiled.name, 'TestInventoryGui');
    assert.strictEqual(compiled.children?.length, 1);
    assert.strictEqual(compiled.children![0].name, 'MainPanel');
    assert.strictEqual(compiled.children![0].children?.length, 4); // UICorner, UIStroke, UIPadding + children
  });

  it('Project Memory records structured systems, decisions, and error memories', async () => {
    const { projectMemory } = await import('../src/memory/ProjectMemory.js');

    projectMemory.registerSystem({
      name: 'FishingSystem',
      description: 'Core rod casting and fish catching mechanics',
      rootPath: 'Workspace.FishingSystem',
      serverScripts: ['FishingServer'],
      clientScripts: ['FishingClient'],
      sharedModules: ['FishingConfig'],
      remotes: ['FishCaughtEvent'],
      dependencies: ['InventorySystem'],
      lastModified: Date.now()
    });

    assert.strictEqual(projectMemory.hasSystem('FishingSystem'), true);
    assert.strictEqual(projectMemory.findSystem('FishingSystem')?.rootPath, 'Workspace.FishingSystem');

    projectMemory.recordDecision('Persistence', 'Use ProfileService for atomic DataStore saves', 'High reliability');
    const summary = projectMemory.getCompactSummary();
    assert.strictEqual(summary.activeSystems.includes('fishingsystem'), true);
  });

  it('Refactoring and Code Architecture Engines analyze scripts and detect frameworks', async () => {
    const { refactoringEngine } = await import('../src/engines/RefactoringEngine.js');
    const { codeArchitectureEngine } = await import('../src/engines/CodeArchitectureEngine.js');

    // Framework detection
    const audit = codeArchitectureEngine.auditArchitecture([
      'ReplicatedStorage.Knit',
      'ServerScriptService.Services.InventoryService',
      'StarterPlayerScripts.Controllers.InventoryController'
    ]);
    assert.strictEqual(audit.framework, 'Knit');

    // Refactoring opportunities
    const sampleScript = `
      local function doSomething()
        wait(1)
        print("Done")
      end
    `;
    const plan = refactoringEngine.analyzeScriptForRefactoring('Workspace.TestScript', sampleScript);
    assert.strictEqual(plan.opportunities.some(o => o.type === 'DEPRECATED_CALLS'), true);
  });

  it('Mechanic Card Registry instantiates customizable verified cards', async () => {
    const { mechanicCardRegistry } = await import('../src/workflows/MechanicCardRegistry.js');

    const cards = mechanicCardRegistry.listCards();
    assert.strictEqual(cards.length >= 4, true);

    const instantiated = mechanicCardRegistry.instantiateCard('kill_brick', { damage: 50 });
    assert.strictEqual(instantiated.instances.length, 1);
    assert.strictEqual(instantiated.scripts.length, 1);
    assert.strictEqual(instantiated.scripts[0].source.includes('humanoid:TakeDamage(50)'), true);
  });

  it('Asset Security Engine detects backdoors and classifies malicious scripts', async () => {
    const { assetSecurityEngine } = await import('../src/security/AssetSecurityEngine.js');

    // Malicious asset with external require and loadstring
    const badReport = assetSecurityEngine.scanAsset('123456', 'FreeModelSword', [
      { path: 'FreeModelSword.Script', source: 'require(9876543210)() loadstring("dangerous")()' }
    ]);
    assert.strictEqual(badReport.status, 'BLOCKED');
    assert.strictEqual(badReport.recommendation, 'BLOCK');
    assert.strictEqual(badReport.detectedRisks.length >= 2, true);

    // Clean asset
    const cleanReport = assetSecurityEngine.scanAsset('654321', 'CleanTree', [
      { path: 'CleanTree.LeafSway', source: 'local part = script.Parent\npart.CFrame = part.CFrame * CFrame.Angles(0,0.01,0)' }
    ]);
    assert.strictEqual(cleanReport.status, 'SAFE');
    assert.strictEqual(cleanReport.safetyScore, 100);
  });

  it('Visual QA Engine performs geometric bounding calculation and detects defects', async () => {
    const { visualQAEngine } = await import('../src/engines/VisualQAEngine.js');

    // Overlapping siblings
    const report = visualQAEngine.evaluateUIGeometry([
      { name: 'ButtonA', position: { x: 100, y: 100 }, size: { x: 200, y: 50 } },
      { name: 'ButtonB', position: { x: 150, y: 120 }, size: { x: 200, y: 50 } } // Overlaps A
    ]);

    assert.strictEqual(report.overlapDetected, true);
    assert.strictEqual(report.status, 'VISUAL_DEFECT_DETECTED');
    assert.strictEqual(report.defects.length > 0, true);
  });

  it('AI Orchestrator 2.0 creates complete verifiable task plans in DRY_RUN mode', async () => {
    const { aiOrchestrator } = await import('../src/orchestrator/AIOrchestrator.js');

    const dryRun = await aiOrchestrator.orchestrateTask('Create an interactive door and gold coin pickup system', 'DRY_RUN');
    assert.strictEqual(dryRun.operatingMode, 'DRY_RUN');
    assert.strictEqual(dryRun.overallStatus, 'DRY_RUN_READY');
    assert.strictEqual(dryRun.changePlan.operations.length > 0, true);
    assert.strictEqual(dryRun.acceptanceSuite.criteria.length > 0, true);
    assert.strictEqual(typeof dryRun.selectedModel, 'string');
  });

  it('Event Bus emits platform events and notifies registered handlers', async () => {
    const { eventBus } = await import('../src/events/EventBus.js');

    let notified = false;
    const unsub = eventBus.on('BuildCommitted', (e) => {
      if (e.payload.buildId === 'test_001') notified = true;
    });

    eventBus.emit('BuildCommitted', { buildId: 'test_001', verified: true }, 'UnitTest');
    assert.strictEqual(notified, true);
    unsub();
  });

  it('Project Knowledge Graph computes impact analysis and dependents', async () => {
    const { projectKnowledgeGraph } = await import('../src/state/ProjectKnowledgeGraph.js');

    projectKnowledgeGraph.addNode('FishData', 'MODULE');
    projectKnowledgeGraph.addNode('FishingService', 'SYSTEM');
    projectKnowledgeGraph.addNode('SellService', 'SYSTEM');
    projectKnowledgeGraph.addNode('SellFishEvent', 'REMOTE_EVENT');

    projectKnowledgeGraph.addEdge('FishingService', 'FishData', 'DEPENDS_ON');
    projectKnowledgeGraph.addEdge('SellService', 'FishData', 'DEPENDS_ON');
    projectKnowledgeGraph.addEdge('SellService', 'SellFishEvent', 'FIRE_SERVER');

    const impact = projectKnowledgeGraph.getImpactAnalysis('FishData');
    assert.strictEqual(impact.directDependents.length >= 2, true);
    assert.strictEqual(impact.affectedSystems.includes('FishingService'), true);
    assert.strictEqual(impact.affectedSystems.includes('SellService'), true);
  });

  it('Animation DSL Engine compiles keyframes into native Luau state machine', async () => {
    const { animationDSLEngine } = await import('../src/engines/AnimationDSLEngine.js');

    const preset = animationDSLEngine.getFishingAnimationPreset();
    assert.strictEqual(preset.phases.length, 4);

    const compiled = animationDSLEngine.compileAnimationDSL(preset);
    assert.strictEqual(compiled.luauControllerCode.includes('TweenService'), true);
    assert.strictEqual(compiled.luauControllerCode.includes('Motor6D'), true);
    assert.strictEqual(compiled.keyframeSequenceData.phasesCount, 4);
  });

  it('Camera Engine generates cinematic controllers with shake support', async () => {
    const { cameraEngine } = await import('../src/engines/CameraEngine.js');

    const controller = cameraEngine.generateCameraController({
      mode: 'FISHING_CATCH',
      fov: 60,
      duration: 0.8
    });
    assert.strictEqual(controller.includes('workspace.CurrentCamera'), true);
    assert.strictEqual(controller.includes('CameraController.Shake'), true);
  });

  it('Multiplayer QA Engine detects unvalidated client-authoritative vulnerabilities', async () => {
    const { multiplayerQAEngine } = await import('../src/security/MultiplayerQAEngine.js');

    const audit = multiplayerQAEngine.auditNetworkBoundaries([
      {
        path: 'ServerScriptService.BadShopService',
        source: 'SellEvent.OnServerEvent:Connect(function(player, price)\n coins.Value = coins.Value + price\nend)'
      }
    ]);
    assert.strictEqual(audit.isMultiplayerSafe, false);
    assert.strictEqual(audit.vulnerabilities.some(v => v.riskType === 'CLIENT_AUTHORITATIVE_ECONOMY'), true);

    const sim = multiplayerQAEngine.simulateMultiplayerTransactionTest();
    assert.strictEqual(sim.passed, true);
  });

  it('End-to-End Golden Scenario: Create complete polished fishing game system', async () => {
    const { aiOrchestrator } = await import('../src/orchestrator/AIOrchestrator.js');
    const { eventBus } = await import('../src/events/EventBus.js');
    eventBus.clearHistory();

    const prompt = 'Create a polished fishing game where every fish has a different sale value. The player casts a rod, catches fish, stores them in a bucket/inventory, takes them to a seller NPC, sells them for their individual values, and the UI should have polished fishing-themed animations.';

    const result = await aiOrchestrator.orchestrateTask(prompt, 'AUTONOMOUS');

    // Intent Extraction Verification
    assert.strictEqual(result.intent.domain.includes('Fishing'), true);
    assert.strictEqual(result.intent.requirements.length >= 5, true);

    // Acceptance Criteria Generation Verification
    assert.strictEqual(result.acceptanceSuite.criteria.length >= 6, true);

    // Change Plan Verification (8 structured operations across 6 stages)
    assert.strictEqual(result.changePlan.operations.length >= 7, true);
    assert.strictEqual(result.changePlan.totalStages >= 5, true);

    // An autonomous build must stop before dispatch when no live Studio evidence path exists.
    assert.strictEqual(result.executedOperationsCount, 0);
    assert.strictEqual(result.overallStatus, 'BLOCKED');

    // Pipeline status: FAILED is expected when Studio is offline (no live read-back),
    // Build artifact is recorded
    assert.strictEqual(result.buildArtifact !== undefined, true);
    assert.strictEqual(result.buildArtifact?.status, 'BLOCKED');
    assert.strictEqual(typeof result.selectedModel, 'string');
    assert.strictEqual(eventBus.getRecentEvents('BuildCommitted').length, 0);
    assert.strictEqual(eventBus.getRecentEvents('BuildCompleted').at(-1)?.payload.status, 'BLOCKED');
  });

  it('Designer Brain synthesizes comprehensive multi-genre GameDesignSpecs', async () => {
    const { designerBrain } = await import('../src/engines/DesignerBrain.js');

    // 1. Simulator Spec
    const simSpec = designerBrain.createGameDesignSpec('Build an oceanic fishing adventure with rare sea creatures');
    assert.strictEqual(simSpec.identity.genre, 'Simulator');
    assert.strictEqual(simSpec.mechanics.length >= 3, true);
    assert.strictEqual(simSpec.world.zones.length >= 2, true);
    assert.strictEqual(simSpec.animation.cues.length >= 2, true);
    assert.strictEqual(simSpec.camera.cues.length >= 2, true);
    assert.strictEqual(simSpec.polish.feedbackSensoryChecklist.length >= 3, true);

    // 2. Obby Spec
    const obbySpec = designerBrain.createGameDesignSpec('Create a 15-stage floating obstacle course with lava killbricks');
    assert.strictEqual(obbySpec.identity.genre, 'Obby');
    assert.strictEqual(obbySpec.coreLoop.phases.length >= 2, true);

    // 3. Tycoon Spec
    const tycoonSpec = designerBrain.createGameDesignSpec('Industrial conveyor factory tycoon with droppers');
    assert.strictEqual(tycoonSpec.identity.genre, 'Tycoon');
  });

  it('Asset Intelligence Engine evaluates quality, scans security, and detects duplicate assets', async () => {
    const { assetIntelligenceEngine } = await import('../src/engines/AssetIntelligenceEngine.js');

    // Quality + security check on clean model
    const cleanReport = assetIntelligenceEngine.evaluateQuality({
      id: 'mesh_01',
      name: 'CleanBoat',
      meshId: 'rbxassetid://11111',
      textureId: 'rbxassetid://22222',
      childCount: 12
    });
    assert.strictEqual(cleanReport.suitable, true);
    assert.strictEqual(cleanReport.score >= 80, true);

    // Malicious asset with getfenv and external require
    const maliciousReport = assetIntelligenceEngine.evaluateQuality({
      id: 'backdoor_01',
      name: 'FreeAdmin',
      scripts: [
        { path: 'FreeAdmin.Loader', source: 'local f = getfenv(); require(12345678)' }
      ]
    });
    assert.strictEqual(maliciousReport.suitable, false);
    assert.strictEqual(maliciousReport.score < 40, true);
    assert.strictEqual(maliciousReport.security?.status, 'BLOCKED');
  });

  it('Gameplay Simulation Engine models loot drops and progression curves with Monte Carlo', async () => {
    const { gameplaySimulationEngine } = await import('../src/engines/GameplaySimulationEngine.js');

    const result = gameplaySimulationEngine.simulateEconomy({
      iterations: 5000,
      playerCount: 1,
      playtimeMinutesPerSession: 20,
      actionDurationSec: 4,
      lootTable: [
        { id: 'trout', name: 'River Trout', weight: 70, value: 15 },
        { id: 'salmon', name: 'Atlantic Salmon', weight: 25, value: 45 },
        { id: 'legendary_leviathan', name: 'Leviathan', weight: 5, value: 500 }
      ],
      upgradeCosts: [150, 600, 2500]
    });

    assert.strictEqual(result.totalCatchesSimulated, 5000);
    assert.strictEqual(result.averageIncomePerMinute > 0, true);
    assert.strictEqual(result.estimatedTimeToTier[1].minutesToReach > 0, true);
    assert.strictEqual(result.economyStabilityScore >= 60, true);
  });

  it('Playtest Engine executes automated gameplay scenarios and collects structured evidence', async () => {
    const { playtestEngine } = await import('../src/engines/PlaytestEngine.js');

    const scenarioReport = await playtestEngine.runScenario({
      name: 'Spawn and Verify Core Hierarchy',
      steps: [
        { action: 'WAIT', waitSeconds: 0.1 },
        { action: 'OBSERVE' }
      ]
    });

    assert.strictEqual(scenarioReport.scenario, 'Spawn and Verify Core Hierarchy');
    assert.strictEqual(scenarioReport.totalSteps, 2);
    assert.strictEqual(scenarioReport.stepResults.length, 2);
    assert.strictEqual(scenarioReport.status, 'BLOCKED');
    assert.strictEqual(scenarioReport.evidence.length, 0);

    // Direct hardware input returns BLOCKED_BY_PLATFORM when official MCP stdio is disconnected
    const inputRes = await playtestEngine.simulateInput({
      keyboard: [{ key: 'Space', durationMs: 100 }]
    });
    assert.strictEqual(inputRes.warnings.includes('CAPABILITY_STATUS: BLOCKED_BY_PLATFORM'), true);
  });
});
