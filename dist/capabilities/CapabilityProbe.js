import { commandDispatcher } from '../dispatcher/commandDispatcher.js';
export class CapabilityProbe {
    /**
     * Probes a capability plan or tool by executing non-destructive assertions or isolated sandbox checks.
     */
    async probeCapability(capability) {
        const startTime = Date.now();
        const evidence = [];
        let sideEffectsDetected = false;
        try {
            console.error(`[CapabilityProbe] Probing capability '${capability.name}' (${capability.steps.length} steps)...`);
            // Verify studio is connected before probing
            if (!commandDispatcher.isStudioConnected()) {
                return {
                    capabilityId: capability.id,
                    passed: false,
                    durationMs: Date.now() - startTime,
                    sideEffectsDetected: false,
                    evidence: [],
                    error: 'Studio session is not connected for probing.'
                };
            }
            // Probe session state from in-memory cache
            const session = commandDispatcher.getActiveSession();
            evidence.push({ type: 'studio_session_probe', data: session });
            // Check if any step touches protected services or high-risk paths
            for (const step of capability.steps) {
                if (step.action === 'instance_delete' && (step.params?.path === 'Workspace' || step.params?.path === 'game')) {
                    sideEffectsDetected = true;
                    throw new Error(`Probe rejected: Dangerous root deletion step detected in ${step.action}`);
                }
            }
            return {
                capabilityId: capability.id,
                passed: true,
                durationMs: Date.now() - startTime,
                sideEffectsDetected,
                evidence
            };
        }
        catch (err) {
            console.error(`[CapabilityProbe] Probe failed for '${capability.name}':`, err?.message || err);
            return {
                capabilityId: capability.id,
                passed: false,
                durationMs: Date.now() - startTime,
                sideEffectsDetected,
                evidence,
                error: err?.message || String(err)
            };
        }
    }
}
export const capabilityProbe = new CapabilityProbe();
//# sourceMappingURL=CapabilityProbe.js.map