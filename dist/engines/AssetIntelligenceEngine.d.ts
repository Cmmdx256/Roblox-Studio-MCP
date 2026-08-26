import { ExecutionResult } from '../providers/types.js';
/**
 * AssetIntelligenceEngine provides intelligent asset curation and dependency validation.
 */
export declare class AssetIntelligenceEngine {
    /**
     * Searches for assets by query.
     */
    searchAssets(query: string, options?: {
        assetType?: string;
        maxResults?: number;
        minQualityScore?: number;
    }): Promise<any[]>;
    /**
     * Evaluates the quality and suitability of an asset.
     */
    evaluateQuality(asset: any): {
        score: number;
        suitable: boolean;
        tags: string[];
        warnings: string[];
    };
    /**
     * Inserts a specific asset into the game.
     */
    insertAsset(assetId: number | string, parent?: string, position?: [number, number, number]): Promise<ExecutionResult>;
    /**
     * Detects duplicated assets within a scope.
     */
    detectDuplicates(scope?: string): Promise<Array<{
        original: string;
        duplicate: string;
        reason: string;
    }>>;
    /**
     * Validates dependencies for a specific asset.
     */
    validateAssetDependencies(instancePath: string): Promise<{
        missingTextures: string[];
        missingSounds: string[];
        valid: boolean;
    }>;
}
export declare const assetIntelligenceEngine: AssetIntelligenceEngine;
//# sourceMappingURL=AssetIntelligenceEngine.d.ts.map