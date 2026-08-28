/**
 * AssetRealityEngine.ts
 *
 * Verifies asset reality, security, and integrity in Studio:
 * 1. Security scanning for malicious scripts/backdoors (require(id), loadstring, getfenv)
 * 2. Duplicate asset & mesh detection
 * 3. Texture and audio dependency resolution
 * 4. Physics implications (unanchored parts, high collision mesh complexity)
 */

import { studioObservationEngine } from './StudioObservationEngine.js';
import { assetIntelligenceEngine } from '../engines/AssetIntelligenceEngine.js';
import { AssetRealityReport, VerificationStatus } from './types.js';

export class AssetRealityEngine {
    /**
     * Perform comprehensive asset reality evaluation for an instance or model.
     */
    public async evaluateAsset(instancePath: string): Promise<AssetRealityReport> {
        const evidence: string[] = [];
        const observation = await studioObservationEngine.observe(instancePath, 'DEEP');

        if (!observation.result) {
            return {
                assetId: instancePath,
                assetName: instancePath.split('.').pop() || 'Unknown',
                assetType: 'Unknown',
                securityStatus: 'BLOCKED',
                duplicates: [],
                missingDependencies: [`Instance at '${instancePath}' could not be located.`],
                physicsImplications: [],
                performanceRisk: 'HIGH',
                evidence: ['Asset not found in DataModel.'],
                finalStatus: 'FAILED'
            };
        }

        const assetName = observation.result.name;
        const assetType = observation.result.className;

        // 1. Security Scan across all descendant scripts
        const suspiciousPatterns = ['require(%d+)', 'getfenv', 'setfenv', 'loadstring', 'TeleportService'];
        let isHighRisk = false;
        let isSuspicious = false;
        const securityIssues: string[] = [];

        const scanNode = (node: any) => {
            if (node.scriptSource) {
                for (const pattern of suspiciousPatterns) {
                    if (new RegExp(pattern, 'i').test(node.scriptSource)) {
                        securityIssues.push(`Script '${node.path}' matches suspicious pattern: ${pattern}`);
                        isSuspicious = true;
                        if (pattern.includes('require') || pattern.includes('loadstring')) {
                            isHighRisk = true;
                        }
                    }
                }
            }
            if (Array.isArray(node.children)) {
                for (const child of node.children) scanNode(child);
            }
        };

        scanNode(observation.result);

        const securityStatus: AssetRealityReport['securityStatus'] =
            isHighRisk ? 'HIGH_RISK' :
            isSuspicious ? 'SUSPICIOUS' :
            'SAFE';

        if (securityStatus === 'SAFE') {
            evidence.push('Security scan clean: No backdoors or suspicious bytecode patterns found.');
        } else {
            evidence.push(...securityIssues);
        }

        // 2. Dependency Resolution (Textures / Sounds)
        const depResult = await assetIntelligenceEngine.validateAssetDependencies(instancePath);
        const missingDependencies = [...depResult.missingTextures, ...depResult.missingSounds];

        if (missingDependencies.length === 0) {
            evidence.push('All texture and sound asset references resolved.');
        } else {
            evidence.push(`Missing dependencies: ${missingDependencies.join(', ')}`);
        }

        // 3. Physics & Geometry Analysis
        let partCount = 0;
        let unanchoredCount = 0;
        const physicsImplications: string[] = [];

        const countPhysics = (node: any) => {
            if (node.className === 'Part' || node.className === 'MeshPart') {
                partCount++;
                if (node.properties?.Anchored === false) {
                    unanchoredCount++;
                }
            }
            if (Array.isArray(node.children)) {
                for (const child of node.children) countPhysics(child);
            }
        };

        countPhysics(observation.result);

        if (unanchoredCount > 5) {
            physicsImplications.push(`${unanchoredCount} unanchored parts may cause physics lag or collapse.`);
        }
        if (partCount > 500) {
            physicsImplications.push(`High part count (${partCount} parts) in single model.`);
        }

        const performanceRisk: AssetRealityReport['performanceRisk'] =
            partCount > 500 || unanchoredCount > 20 ? 'HIGH' :
            partCount > 100 || unanchoredCount > 5 ? 'MEDIUM' :
            'LOW';

        // 4. Duplicate Detection
        const dupes = await assetIntelligenceEngine.detectDuplicates();
        const duplicates = dupes
            .filter(d => d.original === instancePath || d.duplicate === instancePath)
            .map(d => d.duplicate);

        const finalStatus: VerificationStatus =
            securityStatus === 'HIGH_RISK' ? 'FAILED' :
            missingDependencies.length > 0 ? 'PARTIAL' :
            'VERIFIED';

        return {
            assetId: instancePath,
            assetName,
            assetType,
            securityStatus,
            duplicates,
            missingDependencies,
            polycount: partCount,
            physicsImplications,
            performanceRisk,
            evidence,
            finalStatus
        };
    }
}

export const assetRealityEngine = new AssetRealityEngine();
