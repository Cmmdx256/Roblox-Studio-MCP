import { IProvider } from '../providers/IProvider.js';
import { providerRegistry } from '../providers/ProviderRegistry.js';
import {
    ProviderCapability,
    ProviderType,
    AvailabilityStatus,
    CapabilityState,
    SecurityLevel,
    ExecutionContext,
    RiskLevel,
    VerificationMethod
} from '../providers/types.js';

export interface CapabilityMatrixRow {
    capabilityName: string;
    provider: string;
    securityLevel: SecurityLevel;
    context: ExecutionContext;
    status: CapabilityState | string;
    risk: RiskLevel;
    verification: VerificationMethod;
    fallback?: ProviderType | string;
}

export type CapabilityMatrix = CapabilityMatrixRow[];

export interface AuditReport {
    available: number;
    unavailable: number;
    officialOnly: number;
    pluginOnly: number;
    unknown: number;
    duplicates: number;
    brokenProviders: string[];
}

export class CapabilityDiscoveryEngine {
    private providers: IProvider[] = [];
    private matrix: CapabilityMatrix = [];
    private discoveryInterval: NodeJS.Timeout | null = null;

    public registerProvider(provider: IProvider): void {
        this.providers.push(provider);
    }

    public startContinuousDiscovery(intervalMs = 30000): void {
        if (this.discoveryInterval) return;
        this.discoveryInterval = setInterval(() => {
            this.discoverAll().catch(err => {
                console.error('[CapabilityDiscoveryEngine] Error during continuous discovery', err);
            });
        }, intervalMs);
    }

    public stopContinuousDiscovery(): void {
        if (this.discoveryInterval) {
            clearInterval(this.discoveryInterval);
            this.discoveryInterval = null;
        }
    }

    public async discoverAll(): Promise<CapabilityMatrix> {
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
            } catch (error) {
                console.error(`[CapabilityDiscoveryEngine] Error discovering from ${provider.name}`, error);
            }
        }
        return this.matrix;
    }

    public getMatrix(): CapabilityMatrix {
        return this.matrix;
    }

    public async audit(): Promise<AuditReport> {
        await this.discoverAll();
        const report: AuditReport = {
            available: 0,
            unavailable: 0,
            officialOnly: 0,
            pluginOnly: 0,
            unknown: 0,
            duplicates: 0,
            brokenProviders: []
        };

        const names = new Set<string>();

        for (const row of this.matrix) {
            const s = String(row.status);
            if (s === 'AVAILABLE') report.available++;
            else if (s === 'UNAVAILABLE') report.unavailable++;
            else if (s === 'OFFICIAL_ONLY') report.officialOnly++;
            else if (s === 'PLUGIN_ONLY') report.pluginOnly++;
            else report.unknown++;
            
            if (names.has(row.capabilityName)) {
                report.duplicates++;
            } else {
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
