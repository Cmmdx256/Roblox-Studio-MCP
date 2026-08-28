export type AssetSecurityStatus = 'SAFE' | 'SUSPICIOUS' | 'BLOCKED' | 'UNKNOWN';

export interface AssetSecurityReport {
    assetId: string | number;
    assetName: string;
    status: AssetSecurityStatus;
    safetyScore: number; // 0 - 100
    detectedRisks: Array<{ severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; issue: string; evidence?: string }>;
    recommendation: 'ALLOW' | 'ALLOW_WITH_SCRIPTS_STRIPPED' | 'BLOCK';
}

export class AssetSecurityEngine {
    /**
     * Inspects asset hierarchy and script contents for malicious backdoors, obfuscation,
     * external requires, and unauthorized networking.
     */
    public scanAsset(assetId: string | number, assetName: string, scripts: Array<{ path: string; source: string }>): AssetSecurityReport {
        const risks: Array<{ severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; issue: string; evidence?: string }> = [];
        let score = 100;

        for (const script of scripts) {
            const src = script.source;

            // 1. Obfuscation detection: string.char / loadstring / getfenv
            if (src.includes('getfenv') || src.includes('setfenv')) {
                score -= 40;
                risks.push({
                    severity: 'HIGH',
                    issue: 'Environment tampering detected (getfenv/setfenv). Often used to evade static analysis.',
                    evidence: script.path
                });
            }

            if (src.includes('loadstring(')) {
                score -= 50;
                risks.push({
                    severity: 'CRITICAL',
                    issue: 'Dynamic code execution (loadstring) detected.',
                    evidence: script.path
                });
            }

            // 2. Suspicious string concatenation obfuscation e.g. \104\116\116\112
            if (src.match(/\\(\d{2,3})\\(\d{2,3})/)) {
                score -= 30;
                risks.push({
                    severity: 'MEDIUM',
                    issue: 'Bytecode / ASCII escape sequence obfuscation detected.',
                    evidence: script.path
                });
            }

            // 3. External Module require via numerical AssetId
            const requireMatch = src.match(/require\(\s*(\d{6,15})\s*\)/);
            if (requireMatch) {
                score -= 45;
                risks.push({
                    severity: 'HIGH',
                    issue: `External third-party module require by ID (${requireMatch[1]}) detected. Malicious backdoors frequently load payloads dynamically from remote asset IDs.`,
                    evidence: requireMatch[0]
                });
            }

            // 4. Unauthorized HTTP endpoints
            if (src.includes('HttpService:GetAsync') || src.includes('HttpService:PostAsync') || src.includes('HttpService:RequestAsync')) {
                score -= 20;
                risks.push({
                    severity: 'MEDIUM',
                    issue: 'External network HTTP request detected in asset script.',
                    evidence: script.path
                });
            }
        }

        let status: AssetSecurityStatus = 'SAFE';
        let recommendation: 'ALLOW' | 'ALLOW_WITH_SCRIPTS_STRIPPED' | 'BLOCK' = 'ALLOW';

        if (score < 40) {
            status = 'BLOCKED';
            recommendation = 'BLOCK';
        } else if (score < 80) {
            status = 'SUSPICIOUS';
            recommendation = scripts.length > 0 ? 'ALLOW_WITH_SCRIPTS_STRIPPED' : 'BLOCK';
        }

        return {
            assetId,
            assetName,
            status,
            safetyScore: Math.max(0, score),
            detectedRisks: risks,
            recommendation
        };
    }
}

export const assetSecurityEngine = new AssetSecurityEngine();
