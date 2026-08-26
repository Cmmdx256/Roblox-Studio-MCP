import { IProvider } from '../providers/IProvider.js';
import { ProviderType, CapabilityState, SecurityLevel, ExecutionContext, RiskLevel, VerificationMethod } from '../providers/types.js';
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
export declare class CapabilityDiscoveryEngine {
    private providers;
    private matrix;
    private discoveryInterval;
    registerProvider(provider: IProvider): void;
    startContinuousDiscovery(intervalMs?: number): void;
    stopContinuousDiscovery(): void;
    discoverAll(): Promise<CapabilityMatrix>;
    getMatrix(): CapabilityMatrix;
    audit(): Promise<AuditReport>;
}
export declare const capabilityDiscoveryEngine: CapabilityDiscoveryEngine;
//# sourceMappingURL=CapabilityDiscoveryEngine.d.ts.map