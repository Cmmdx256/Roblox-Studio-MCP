import { CapabilityGraph } from './CapabilityGraph.js';
import { CapabilityCompiler } from './CapabilityCompiler.js';
import { CapabilityProbe } from './CapabilityProbe.js';
import { CapabilityRouter } from './CapabilityRouter.js';
import { ExecutionResult } from '../providers/types.js';
export interface CapabilityResolution {
    tier: 1 | 2 | 3 | 4;
    strategy: 'DIRECT_TOOL' | 'EXTERNAL_PROVIDER' | 'COMPILED_PRIMITIVES' | 'UNAVAILABLE';
    capabilityName: string;
    provider?: string;
    executablePlan?: any;
    confidence: number;
    explanation: string;
}
export declare class UniversalCapabilityEngine {
    private graph;
    private compiler;
    private probe;
    private router;
    constructor(graph?: CapabilityGraph, compiler?: CapabilityCompiler, probe?: CapabilityProbe, router?: CapabilityRouter);
    /**
     * Resolves how a capability or intent can legitimately be accomplished.
     * Follows the 4-tier capability resolution hierarchy.
     */
    resolveCapability(intentOrAction: string, context?: Record<string, any>): Promise<CapabilityResolution>;
    /**
     * Executes an action, routing through direct tool, external provider, or compiled primitive plan.
     */
    executeCapability(intentOrAction: string, params?: Record<string, any>): Promise<ExecutionResult>;
    /**
     * Executes a multi-step compiled primitive plan sequentially.
     */
    private executeCompiledPlan;
}
export declare const universalCapabilityEngine: UniversalCapabilityEngine;
//# sourceMappingURL=UniversalCapabilityEngine.d.ts.map