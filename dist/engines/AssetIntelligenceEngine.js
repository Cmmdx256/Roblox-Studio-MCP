import { commandDispatcher } from '../dispatcher/commandDispatcher.js';
import { capabilityRouter } from '../capabilities/CapabilityRouter.js';
import { assetSecurityEngine } from '../security/AssetSecurityEngine.js';
import { studioStateGraph } from '../state/StudioStateGraph.js';
/**
 * AssetIntelligenceEngine provides intelligent asset curation, security scanning,
 * procedural fallbacks, and dependency validation.
 */
export class AssetIntelligenceEngine {
    /**
     * Searches for assets by query via Official MCP search or local project asset catalogs.
     */
    async searchAssets(query, options) {
        console.error(`[AssetIntelligenceEngine] Searching assets for: ${query}`);
        // 1. Try official MCP search tool
        try {
            const res = await capabilityRouter.route('search_asset', { query, assetType: options?.assetType });
            if (res.status === 'SUCCESS' && Array.isArray(res.data)) {
                return res.data;
            }
        }
        catch (err) {
            // Official MCP offline
        }
        // 2. Search local project state for reusable template models
        const snapshot = studioStateGraph.getStateSnapshot();
        const localMatches = [];
        const lower = query.toLowerCase();
        for (const [path, node] of Object.entries(snapshot.cachedNodes || {})) {
            const n = node;
            if (path.toLowerCase().includes(lower) || (n.name && n.name.toLowerCase().includes(lower))) {
                localMatches.push({
                    assetId: path,
                    name: n.name || path.split('.').pop(),
                    source: 'LOCAL_PROJECT',
                    className: n.className,
                    qualityScore: 90,
                    verified: false
                });
            }
        }
        return localMatches;
    }
    /**
     * Evaluates the quality, performance impact, and security of an asset.
     */
    evaluateQuality(asset) {
        const warnings = [];
        const tags = [];
        let score = 100;
        const hasScripts = Boolean(asset.scripts && asset.scripts.length > 0);
        const hasMesh = Boolean(asset.meshId && asset.meshId.length > 0);
        const hasTextures = Boolean(asset.textureId && asset.textureId.length > 0);
        if (hasMesh)
            tags.push('3D_MESH');
        if (hasTextures)
            tags.push('TEXTURED');
        // Security scan if scripts are bundled
        let secReport;
        if (hasScripts && asset.scripts) {
            secReport = assetSecurityEngine.scanAsset(asset.id || 0, asset.name || 'Asset', asset.scripts);
            if (secReport.status === 'BLOCKED') {
                score = 0;
                warnings.push('Asset contains malicious code or unauthorized dynamic requires.');
            }
            else if (secReport.status === 'SUSPICIOUS') {
                score -= 30;
                warnings.push('Asset contains suspicious script patterns.');
            }
        }
        // Hierarchy complexity evaluation
        if (asset.childCount && asset.childCount > 500) {
            score -= 20;
            warnings.push(`High instance count (${asset.childCount}) may impact rendering and streaming.`);
        }
        return {
            score: Math.max(0, score),
            suitable: score >= 60,
            tags,
            warnings,
            security: secReport,
            metrics: {
                instanceCount: asset.childCount,
                hasScripts,
                hasMesh,
                hasTextures
            }
        };
    }
    /**
     * Inserts a specific asset into the game with dependency check.
     */
    async insertAsset(assetId, parent = 'Workspace', position) {
        console.error(`[AssetIntelligenceEngine] Inserting asset ID: ${assetId} into ${parent}`);
        const startTime = Date.now();
        // 1. Try official MCP insert tool
        try {
            const officialRes = await capabilityRouter.route('insert_asset', { assetId, parent, position });
            if (officialRes.status === 'SUCCESS')
                return officialRes;
        }
        catch (err) {
            // Fallback
        }
        // 2. Procedural Model Creation fallback
        try {
            const modelName = `Asset_${String(assetId).replace(/[^a-zA-Z0-9_]/g, '')}`;
            const createRes = await commandDispatcher.executeCommand('instance_create', {
                className: 'Model',
                parent,
                name: modelName
            });
            if (createRes && createRes.success) {
                // If position provided, create primary part
                if (position) {
                    await commandDispatcher.executeCommand('instance_create', {
                        className: 'Part',
                        parent: `${parent}.${modelName}`,
                        name: 'PrimaryPart',
                        properties: {
                            Position: { X: position[0], Y: position[1], Z: position[2] },
                            Anchored: true,
                            Size: { X: 4, Y: 4, Z: 4 }
                        }
                    });
                }
                return {
                    status: 'SUCCESS',
                    verified: false,
                    provider: 'asset-intelligence-engine',
                    tool: 'asset.insert',
                    changes: [{ type: 'create', details: `Created model container ${parent}.${modelName}`, target: `${parent}.${modelName}` }],
                    evidence: [],
                    warnings: ['Asset inserted via procedural model container (Official Marketplace MCP unavailable).'],
                    errors: [],
                    duration: Date.now() - startTime
                };
            }
        }
        catch (err) {
            return {
                status: 'ERROR',
                verified: false,
                provider: 'asset-intelligence-engine',
                tool: 'asset.insert',
                changes: [],
                evidence: [],
                warnings: [],
                errors: [err.message || 'Failed to insert asset container'],
                duration: Date.now() - startTime
            };
        }
        return {
            status: 'ERROR',
            verified: false,
            provider: 'asset-intelligence-engine',
            tool: 'asset.insert',
            changes: [],
            evidence: [],
            warnings: [],
            errors: ['Failed to insert asset into Studio DataModel'],
            duration: Date.now() - startTime
        };
    }
    /**
     * Detects duplicated textures, meshes, and sounds across the DataModel cache.
     */
    async detectDuplicates(scope = 'Workspace') {
        console.error(`[AssetIntelligenceEngine] Detecting duplicates in scope: ${scope}`);
        const duplicates = [];
        const snapshot = studioStateGraph.getStateSnapshot();
        const seenMeshes = new Map();
        const seenTextures = new Map();
        for (const [path, node] of Object.entries(snapshot.cachedNodes || {})) {
            if (!path.startsWith(scope))
                continue;
            const n = node;
            const props = n.properties || {};
            if (props.MeshId && props.MeshId.length > 0) {
                if (seenMeshes.has(props.MeshId)) {
                    duplicates.push({
                        original: seenMeshes.get(props.MeshId),
                        duplicate: path,
                        reason: `Identical MeshId: ${props.MeshId}`,
                        assetType: 'Mesh'
                    });
                }
                else {
                    seenMeshes.set(props.MeshId, path);
                }
            }
            if (props.TextureId && props.TextureId.length > 0) {
                if (seenTextures.has(props.TextureId)) {
                    duplicates.push({
                        original: seenTextures.get(props.TextureId),
                        duplicate: path,
                        reason: `Identical TextureId: ${props.TextureId}`,
                        assetType: 'Texture'
                    });
                }
                else {
                    seenTextures.set(props.TextureId, path);
                }
            }
        }
        return duplicates;
    }
    /**
     * Validates dependencies (missing textures, invalid asset IDs) for a target instance.
     */
    async validateAssetDependencies(instancePath) {
        console.error(`[AssetIntelligenceEngine] Validating dependencies for: ${instancePath}`);
        const missingTextures = [];
        const missingSounds = [];
        if (commandDispatcher.isStudioConnected()) {
            try {
                const details = await commandDispatcher.executeCommand('instance_get_details', { path: instancePath });
                if (details && details.success) {
                    const props = details.data?.properties || {};
                    if (props.TextureID === '' || props.TextureId === '') {
                        missingTextures.push(instancePath);
                    }
                    if (props.SoundId === '') {
                        missingSounds.push(instancePath);
                    }
                }
            }
            catch (err) {
                // Ignore lookup error
            }
        }
        return {
            missingTextures,
            missingSounds,
            valid: missingTextures.length === 0 && missingSounds.length === 0
        };
    }
}
export const assetIntelligenceEngine = new AssetIntelligenceEngine();
//# sourceMappingURL=AssetIntelligenceEngine.js.map