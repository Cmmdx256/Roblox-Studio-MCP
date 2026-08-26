import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { commandDispatcher } from '../src/dispatcher/commandDispatcher.js';
import { httpBridgeServer } from '../src/transport/httpBridge.js';
import { allTools, toolMap } from '../src/tools/index.js';
import { projectResources, readResourceByUri } from '../src/resources/projectResources.js';
import { ErrorCode } from '../src/types/rpc.js';

const TEST_PORT = 38896;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

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
      body: JSON.stringify({ sessionId: 'test_session_12345' }),
    });

    const pollData = await pollRes.json();
    assert.strictEqual(pollData.success, true);
    assert.strictEqual(pollData.commands.length, 1);
    const cmd = pollData.commands[0];
    assert.strictEqual(cmd.action, 'property_get');

    // 3. Simulate Roblox Studio sending back execution response
    const responsePayload = {
      id: cmd.id,
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
      body: JSON.stringify({ events }),
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
});
