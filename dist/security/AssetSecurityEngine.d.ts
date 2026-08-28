export type AssetSecurityStatus = 'SAFE' | 'SUSPICIOUS' | 'BLOCKED' | 'UNKNOWN';
export interface AssetSecurityReport {
    assetId: string | number;
    assetName: string;
    status: AssetSecurityStatus;
    safetyScore: number;
    detectedRisks: Array<{
        severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        issue: string;
        evidence?: string;
    }>;
    recommendation: 'ALLOW' | 'ALLOW_WITH_SCRIPTS_STRIPPED' | 'BLOCK';
}
export declare class AssetSecurityEngine {
    /**
     * Inspects asset hierarchy and script contents for malicious backdoors, obfuscation,
     * external requires, and unauthorized networking.
     */
    scanAsset(assetId: string | number, assetName: string, scripts: Array<{
        path: string;
        source: string;
    }>): AssetSecurityReport;
}
export declare const assetSecurityEngine: AssetSecurityEngine;
//# sourceMappingURL=AssetSecurityEngine.d.ts.map