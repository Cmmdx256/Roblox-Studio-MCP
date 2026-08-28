import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { commandDispatcher } from '../src/dispatcher/commandDispatcher.js';
import { studioSessionManager } from '../src/session/StudioSessionManager.js';
import { executionPipeline, assertValidTransition } from '../src/execution/ExecutionPipeline.js';
import { evidenceEngine } from '../src/evidence/EvidenceEngine.js';
import { verificationEngine } from '../src/verification/VerificationEngine.js';
import { playtestEngine } from '../src/engines/PlaytestEngine.js';
import { buildHistoryEngine } from '../src/orchestrator/BuildHistoryEngine.js';
import { buildQualityGateEngine } from '../src/orchestrator/BuildQualityGateEngine.js';
import { gameplayStateObserver } from '../src/reality/GameplayStateObserver.js';
import { intentEngine } from '../src/engines/IntentEngine.js';
import { acceptanceCriteriaEngine } from '../src/engines/AcceptanceCriteriaEngine.js';
import { changePlanEngine } from '../src/engines/ChangePlanEngine.js';

/** Offline/adversarial tests.  These expressly do not claim a Studio integration. */
describe('Reality-first adversarial suite (offline)', () => {
  beforeEach(() => {
    commandDispatcher.clearSession();
    studioSessionManager.reset();
    evidenceEngine.clear();
    buildHistoryEngine.clear();
  });

  it('blocks a Studio mutation when no session exists', async () => {
    const result = await executionPipeline.execute('instance_create', { parent: 'Workspace', className: 'Folder', name: 'RealityTest' });
    assert.strictEqual(result.state, 'BLOCKED');
    assert.strictEqual(result.verified, false);
    assert.strictEqual(result.result.code, 'BLOCKED_BY_PLATFORM');
  });

  it('does not let a bridge health record substitute for an active Studio poll', () => {
    const session = studioSessionManager.getSession();
    assert.strictEqual(studioSessionManager.isAlive(), false);
    assert.strictEqual(session.dataModelAvailable, false);
    assert.strictEqual(session.playtestRunning, false);
  });

  it('exposes an asynchronous session refresh for secondary MCP processes', () => {
    assert.strictEqual(typeof commandDispatcher.refreshSessionInfo, 'function');
  });

  it('keeps test processes isolated from a real Studio bridge', async () => {
    process.env.ROBLOX_MCP_TEST_MODE = '1';
    commandDispatcher.clearSession();
    const session = await commandDispatcher.refreshSessionInfo();
    assert.strictEqual(session, null);
  });

  it('does not launch or connect the official StudioMCP provider in test mode', async () => {
    const { officialRobloxMCPProvider } = await import('../src/providers/OfficialRobloxMCPProvider.js');
    await officialRobloxMCPProvider.initialize();
    const health = await officialRobloxMCPProvider.healthCheck();
    assert.strictEqual(health.status, 'UNAVAILABLE');
    assert.match(String(health.message), /disabled for ROBLOX_MCP_TEST_MODE/);
  });

  it('uses the plugin property schema target rather than the obsolete path alias', async () => {
    const result = await executionPipeline.execute('property_get', { target: 'Workspace', property: 'Name' });
    // The offline suite has no Studio session, but the request must reach the
    // availability guard without being rejected for a parameter mismatch.
    assert.notStrictEqual(result.result.code, 'INVALID_ARGUMENT');
  });

  it('does not treat dry runs or fake evidence as verification', async () => {
    const dryRun = await executionPipeline.execute('instance_create', { parent: 'Workspace', name: 'DryRun' }, { dryRun: true });
    assert.strictEqual(dryRun.state, 'PLANNED');
    assert.strictEqual(dryRun.verified, false);

    const fake = evidenceEngine.recordObservation({
      operationId: 'fake', targetPath: 'Workspace.Fake', action: 'create',
      evidenceType: 'DATAMODEL_OBSERVATION', observations: { claimed: true },
    });
    assert.strictEqual(evidenceEngine.isValidForVerification(fake), false);
  });

  it('does not verify a dispatched command when no Studio postcondition was requested', async () => {
    const originalExecute = commandDispatcher.executeCommand.bind(commandDispatcher);
    (commandDispatcher as any).executeCommand = async () => ({ success: true });
    try {
      const wrapped = await verificationEngine.wrapWithVerification('property_get', { target: 'Workspace', property: 'Name' });
      assert.strictEqual(wrapped.verification.status, 'NOT_VERIFIABLE');
      assert.strictEqual(wrapped.verification.verified, false);
    } finally {
      (commandDispatcher as any).executeCommand = originalExecute;
    }
  });

  it('does not report a source recovery as successful without a live Studio read-back', async () => {
    const { recoveryEngine } = await import('../src/engines/RecoveryEngine.js');
    const recovery = await recoveryEngine.attemptRecovery(
      'Unable to assign property C0. Property is read only',
      { scriptPath: 'Workspace.Dummy.Animate', sourceCode: 'dummy.RightUpperArm.RightShoulder.C0 = CFrame.new()' }
    );
    assert.strictEqual(recovery.success, false);
    assert.strictEqual(recovery.verification.verified, false);
    assert.strictEqual(recovery.verification.status, 'NOT_VERIFIABLE');
  });

  it('blocks a fabricated generic test-suite result when no runner is installed', async () => {
    const { testingProvider } = await import('../src/providers/TestingProvider.js');
    const result = await testingProvider.execute('testing_run_suite', { suite: 'SmokeTest' });
    assert.strictEqual(result.status, 'BLOCKED');
    assert.strictEqual(result.verified, false);
    assert.strictEqual(result.data.state, 'BLOCKED_BY_PLATFORM');
  });

  it('does not treat session presence as a successful capability probe', async () => {
    const { capabilityProbe } = await import('../src/capabilities/CapabilityProbe.js');
    const result = await capabilityProbe.probeCapability({
      id: 'compiled:empty-probe', name: 'Empty Probe', intent: 'probe', description: 'test',
      steps: [], confidence: 0, verified: false, reusable: false, createdAt: Date.now()
    });
    assert.strictEqual(result.passed, false);
  });

  it('keeps novel and hybrid genre concepts explicit and derives generic systems', async () => {
    const { designerBrain } = await import('../src/engines/DesignerBrain.js');
    const custom = designerBrain.createGameDesignSpec('Create an asynchronous dream-weaving ritual experience');
    assert.strictEqual(custom.identity.genre, 'Custom');
    assert.strictEqual(custom.systems.some((system: any) => system.name === 'GameConfig'), true);
    assert.strictEqual(custom.systems.some((system: any) => system.name === 'FishDataModule'), false);

    const hybrid = designerBrain.createGameDesignSpec('Create a hybrid tower defense roguelike with cooperative waves');
    assert.strictEqual(hybrid.identity.genre, 'Hybrid');
    assert.strictEqual(hybrid.systems.every((system: any) => !system.name.includes('Fishing')), true);
  });

  it('marks generated script scaffolds as specification-only rather than executable code', () => {
    const intent = intentEngine.parseIntent('Create a server-authoritative inventory system');
    const plan = changePlanEngine.generatePlan(intent, acceptanceCriteriaEngine.generateCriteria(intent));
    const scripts = plan.operations.filter(op => op.type === 'CREATE_SCRIPT');
    assert.strictEqual(scripts.length > 0, true);
    assert.strictEqual(scripts.every(op => op.payload.implementationState === 'SPECIFICATION_ONLY'), true);
    assert.strictEqual(scripts.every(op => String(op.payload.source).includes('IMPLEMENTATION REQUIRED:')), true);
  });

  it('rejects custom conditions without a live evaluator', async () => {
    const report = await verificationEngine.verifyConditions([{ type: 'CUSTOM', target: 'Workspace.Unknown', expected: true }]);
    assert.strictEqual(report.verified, false);
    assert.notStrictEqual(report.status, 'VERIFIED');
  });

  it('cannot promote negative execution states to verified', () => {
    assert.throws(() => assertValidTransition('BLOCKED', 'VERIFIED'));
    assert.throws(() => assertValidTransition('FAILED', 'VERIFIED'));
    assert.throws(() => assertValidTransition('UNVERIFIED', 'VERIFIED'));
  });

  it('blocks live playtests instead of passing a local simulation', async () => {
    const report = await playtestEngine.runScenario({ name: 'offline scenario', steps: [{ action: 'WAIT' }] });
    assert.strictEqual(report.status, 'BLOCKED');
    assert.strictEqual(report.passed, false);
  });

  it('does not verify gameplay state without an observed Play session', async () => {
    const snapshot = await gameplayStateObserver.collectSnapshot();
    assert.strictEqual(snapshot.status, 'BLOCKED');

    const condition = await gameplayStateObserver.verifyCondition('true');
    assert.strictEqual(condition.passed, false);
    assert.strictEqual(condition.status, 'BLOCKED');
  });

  it('requires calculated quality gates for a verified build', () => {
    const unverified = buildHistoryEngine.recordBuild('no evidence', [], [], 1, 1);
    assert.strictEqual(unverified.status, 'UNVERIFIED');
    assert.strictEqual(buildHistoryEngine.updateBuildStatus(unverified.buildId, 'VERIFIED_COMMIT'), false);

    const blockedGates = buildQualityGateEngine.evaluate('b', { G01: 'PASS', G04: 'BLOCKED', G05: 'BLOCKED', G06: 'BLOCKED', G10: 'PASS', G12: 'BLOCKED' });
    assert.strictEqual(blockedGates.finalStatus, 'BLOCKED');
  });
});
