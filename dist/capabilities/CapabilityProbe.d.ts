import { CapabilityProbeResult, CompiledCapability } from './types.js';
export declare class CapabilityProbe {
    /**
     * Probes a capability plan or tool by executing non-destructive assertions or isolated sandbox checks.
     */
    probeCapability(capability: CompiledCapability): Promise<CapabilityProbeResult>;
}
export declare const capabilityProbe: CapabilityProbe;
//# sourceMappingURL=CapabilityProbe.d.ts.map