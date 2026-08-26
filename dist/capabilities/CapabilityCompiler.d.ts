import { CapabilityGraph } from './CapabilityGraph.js';
import { CompiledCapability } from './types.js';
export declare class CapabilityCompiler {
    private graph;
    private compiledCache;
    constructor(graph?: CapabilityGraph);
    /**
     * Compiles a high-level intent or missing tool request into an executable sequence of primitives.
     */
    compile(intent: string, context?: Record<string, any>): CompiledCapability;
    getCompiledCapability(intentOrId: string): CompiledCapability | undefined;
    markVerified(id: string): void;
}
export declare const capabilityCompiler: CapabilityCompiler;
//# sourceMappingURL=CapabilityCompiler.d.ts.map