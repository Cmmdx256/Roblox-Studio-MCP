import { ExecutionResult } from '../providers/types.js';
import { AssetSecurityReport } from '../security/AssetSecurityEngine.js';
export interface AssetQualityReport {
    score: number;
    suitable: boolean;
    tags: string[];
    warnings: string[];
    security?: AssetSecurityReport;
    metrics: {
        instanceCount?: number;
        hasScripts: boolean;
        hasMesh: boolean;
        hasTextures: boolean;
    };
}
export interface DuplicateAssetReport {
    original: string;
    duplicate: string;
    reason: string;
    assetType: 'Texture' | 'Mesh' | 'Sound' | 'Model';
}
/**
 * AssetIntelligenceEngine provides intelligent asset curation, security scanning,
 * procedural fallbacks, and dependency validation.
 */
export declare class AssetIntelligenceEngine {
    /**
     * Searches for assets by query via Official MCP search or local project asset catalogs.
     */
    searchAssets(query: string, options?: {
        assetType?: string;
        maxResults?: number;
        minQualityScore?: number;
    }): Promise<any[]>;
    /**
     * Evaluates the quality, performance impact, and security of an asset.
     */
    evaluateQuality(asset: {
        id?: string | number;
        name?: string;
        className?: string;
        scripts?: Array<{
            path: string;
            source: string;
        }>;
        meshId?: string;
        textureId?: string;
        childCount?: number;
    }): AssetQualityReport;
    /**
     * Inserts a specific asset into the game with dependency check.
     */
    insertAsset(assetId: number | string, parent?: string, position?: [number, number, number]): Promise<ExecutionResult>;
    /**
     * Detects duplicated textures, meshes, and sounds across the DataModel cache.
     */
    detectDuplicates(scope?: string): Promise<DuplicateAssetReport[]>;
    /**
     * Validates dependencies (missing textures, invalid asset IDs) for a target instance.
     */
    validateAssetDependencies(instancePath: string): Promise<{
        missingTextures: string[];
        missingSounds: string[];
        valid: boolean;
    }>;
}
export declare const assetIntelligenceEngine: AssetIntelligenceEngine;
//# sourceMappingURL=AssetIntelligenceEngine.d.ts.map