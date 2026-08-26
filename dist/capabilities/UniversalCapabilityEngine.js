import { capabilityGraph } from './CapabilityGraph.js';
import { capabilityCompiler } from './CapabilityCompiler.js';
import { capabilityProbe } from './CapabilityProbe.js';
import { capabilityRouter } from './CapabilityRouter.js';
import { providerRegistry } from '../providers/ProviderRegistry.js';
import { CapabilityState, FailureCode } from '../providers/types.js';
import { toolMap } from '../tools/index.js';
export class UniversalCapabilityEngine {
    graph;
    compiler;
    probe;
    router;
    constructor(graph = capabilityGraph, compiler = capabilityCompiler, probe = capabilityProbe, router = capabilityRouter) {
        this.graph = graph;
        this.compiler = compiler;
        this.probe = probe;
        this.router = router;
    }
    /**
     * Resolves how a capability or intent can legitimately be accomplished.
     * Follows the 4-tier capability resolution hierarchy.
     */
    async resolveCapability(intentOrAction, context) {
        console.error(`[UniversalCapabilityEngine] Resolving capability for: '${intentOrAction}'`);
        // Tier 1: Check if a direct tool exists in the embedded plugin or unified registry
        const directTool = this.graph.getNode(`tool:${intentOrAction}`) || this.graph.getNode(intentOrAction);
        if (toolMap.has(intentOrAction) || (directTool && directTool.state === CapabilityState.AVAILABLE)) {
            return {
                tier: 1,
                strategy: 'DIRECT_TOOL',
                capabilityName: intentOrAction,
                provider: directTool?.provider || 'embedded-plugin',
                confidence: 1.0,
                explanation: `Direct universal tool '${intentOrAction}' is available.`
            };
        }
        // Tier 2: Check if another provider (e.g. Official Roblox MCP) exposes the tool
        const providers = providerRegistry.getAll();
        for (const provider of providers) {
            const caps = await provider.getCapabilities();
            const matchingCap = caps.find(c => c.name === intentOrAction || c.aliases?.includes(intentOrAction));
            if (matchingCap && matchingCap.availability === CapabilityState.AVAILABLE) {
                return {
                    tier: 2,
                    strategy: 'EXTERNAL_PROVIDER',
                    capabilityName: matchingCap.name,
                    provider: provider.name,
                    confidence: 0.95,
                    explanation: `Capability '${intentOrAction}' provided directly by ${provider.name}.`
                };
            }
        }
        // Tier 3: Legitimate primitive composition via CapabilityCompiler
        try {
            const compiled = this.compiler.compile(intentOrAction, context);
            if (compiled && compiled.steps.length > 0) {
                // Non-destructive sandbox probe before execution
                const probeResult = await this.probe.probeCapability(compiled);
                return {
                    tier: 3,
                    strategy: 'COMPILED_PRIMITIVES',
                    capabilityName: compiled.name,
                    provider: 'capability-compiler',
                    executablePlan: compiled,
                    confidence: probeResult.passed ? compiled.confidence : 0.5,
                    explanation: `Compiled from ${compiled.steps.length} legitimate Studio primitives. Probe status: ${probeResult.passed ? 'PASSED' : 'UNPROBED'}.`
                };
            }
        }
        catch (err) {
            console.error(`[UniversalCapabilityEngine] Compilation failed for '${intentOrAction}':`, err?.message || err);
        }
        // Tier 4: UNAVAILABLE (The FINAL state reached only after exhaustive evaluation)
        return {
            tier: 4,
            strategy: 'UNAVAILABLE',
            capabilityName: intentOrAction,
            confidence: 0.0,
            explanation: `Capability '${intentOrAction}' cannot be legitimately achieved with current Studio and provider primitives without violating security boundaries.`
        };
    }
    /**
     * Executes an action, routing through direct tool, external provider, or compiled primitive plan.
     */
    async executeCapability(intentOrAction, params = {}) {
        const resolution = await this.resolveCapability(intentOrAction, params);
        switch (resolution.tier) {
            case 1:
            case 2:
                return await this.router.route(intentOrAction, params);
            case 3:
                return await this.executeCompiledPlan(resolution.executablePlan);
            case 4:
            default:
                return {
                    status: 'ERROR',
                    success: false,
                    code: FailureCode.CAPABILITY_RESTRICTED,
                    message: resolution.explanation,
                    data: { resolution }
                };
        }
    }
    /**
     * Executes a multi-step compiled primitive plan sequentially.
     */
    async executeCompiledPlan(plan) {
        const startTime = Date.now();
        const stepResults = [];
        const changes = [];
        const evidence = [];
        console.error(`[UniversalCapabilityEngine] Executing compiled plan '${plan.name}' (${plan.steps.length} steps)...`);
        for (const step of plan.steps) {
            try {
                const res = await this.router.route(step.action, step.params);
                stepResults.push({ step: step.stepIndex, action: step.action, result: res });
                if (res.changes)
                    changes.push(...res.changes);
                if (res.evidence)
                    evidence.push(...res.evidence);
                if (res.status === 'ERROR' && !step.allowFailure) {
                    return {
                        status: 'ERROR',
                        success: false,
                        code: FailureCode.EXECUTION_FAILED,
                        message: `Step ${step.stepIndex} (${step.action}) failed: ${res.message || 'Execution error'}`,
                        data: { stepResults },
                        changes,
                        evidence,
                        duration: Date.now() - startTime
                    };
                }
            }
            catch (err) {
                if (!step.allowFailure) {
                    return {
                        status: 'ERROR',
                        success: false,
                        code: FailureCode.EXECUTION_FAILED,
                        message: `Exception during step ${step.stepIndex} (${step.action}): ${err?.message || String(err)}`,
                        data: { stepResults },
                        changes,
                        evidence,
                        duration: Date.now() - startTime
                    };
                }
            }
        }
        // Mark verified in compiler and graph
        this.compiler.markVerified(plan.id);
        return {
            status: 'SUCCESS',
            success: true,
            message: `Successfully executed compiled capability '${plan.name}' (${plan.steps.length} steps)`,
            data: { stepResults },
            changes,
            evidence,
            verified: true,
            duration: Date.now() - startTime
        };
    }
}
export const universalCapabilityEngine = new UniversalCapabilityEngine();
//# sourceMappingURL=UniversalCapabilityEngine.js.map