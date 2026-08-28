/**
 * AssetRealityEngine.ts
 *
 * Verifies asset reality, security, and integrity in Studio:
 * 1. Security scanning for malicious scripts/backdoors (require(id), loadstring, getfenv)
 * 2. Duplicate asset & mesh detection
 * 3. Texture and audio dependency resolution
 * 4. Physics implications (unanchored parts, high collision mesh complexity)
 */
import { AssetRealityReport } from './types.js';
export declare class AssetRealityEngine {
    /**
     * Perform comprehensive asset reality evaluation for an instance or model.
     */
    evaluateAsset(instancePath: string): Promise<AssetRealityReport>;
}
export declare const assetRealityEngine: AssetRealityEngine;
//# sourceMappingURL=AssetRealityEngine.d.ts.map