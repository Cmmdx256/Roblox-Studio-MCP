import { providerRegistry } from '../providers/ProviderRegistry.js';
import { AvailabilityStatus } from '../providers/types.js';
export class CapabilityDiscoveryEngine {
    providers = [];
    matrix = [];
    discoveryInterval = null;
    registerProvider(provider) {
        this.providers.push(provider);
    }
    startContinuousDiscovery(intervalMs = 30000) {
        if (this.discoveryInterval)
            return;
        this.discoveryInterval = setInterval(() => {
            this.discoverAll().catch(err => {
                console.error('[CapabilityDiscoveryEngine] Error during continuous discovery', err);
            });
        }, intervalMs);
    }
    stopContinuousDiscovery() {
        if (this.discoveryInterval) {
            clearInterval(this.discoveryInterval);
            this.discoveryInterval = null;
        }
    }
    async discoverAll() {
        this.matrix = [];
        const providersToScan = this.providers.length > 0 ? this.providers : providerRegistry.getAll();
        for (const provider of providersToScan) {
            try {
                const capabilities = await provider.discover();
                for (const cap of capabilities) {
                    this.matrix.push({
                        capabilityName: cap.name,
                        provider: provider.name,
                        securityLevel: cap.securityLevel,
                        context: cap.executionContext,
                        status: cap.availability,
                        risk: cap.riskLevel,
                        verification: cap.verificationMethod,
                        fallback: cap.fallbackProvider
                    });
                }
            }
            catch (error) {
                console.error(`[CapabilityDiscoveryEngine] Error discovering from ${provider.name}`, error);
            }
        }
        return this.matrix;
    }
    getMatrix() {
        return this.matrix;
    }
    async audit() {
        await this.discoverAll();
        const report = {
            available: 0,
            unavailable: 0,
            officialOnly: 0,
            pluginOnly: 0,
            unknown: 0,
            duplicates: 0,
            brokenProviders: []
        };
        const names = new Set();
        for (const row of this.matrix) {
            const s = String(row.status);
            if (s === 'AVAILABLE')
                report.available++;
            else if (s === 'UNAVAILABLE')
                report.unavailable++;
            else if (s === 'OFFICIAL_ONLY')
                report.officialOnly++;
            else if (s === 'PLUGIN_ONLY')
                report.pluginOnly++;
            else
                report.unknown++;
            if (names.has(row.capabilityName)) {
                report.duplicates++;
            }
            else {
                names.add(row.capabilityName);
            }
        }
        for (const provider of this.providers) {
            const health = await provider.healthCheck();
            if (health.status !== AvailabilityStatus.AVAILABLE && health.status !== AvailabilityStatus.DEGRADED) {
                report.brokenProviders.push(provider.name);
            }
        }
        return report;
    }
}
export const capabilityDiscoveryEngine = new CapabilityDiscoveryEngine();
//# sourceMappingURL=CapabilityDiscoveryEngine.js.map