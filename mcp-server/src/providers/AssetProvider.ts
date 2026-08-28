import { IProvider } from './IProvider.js';
import {
    CapabilityState,
    ExecutionContext,
    ExecutionResult,
    HealthStatus,
    ProviderCapability,
    ProviderState,
    ProviderToolDefinition,
    ProviderType,
    RiskLevel,
    SecurityLevel,
    VerificationMethod
} from './types.js';
import { assetIntelligenceEngine } from '../engines/AssetIntelligenceEngine.js';

export class AssetProvider implements IProvider {
    public readonly name = 'asset-provider';
    public readonly type = ProviderType.ASSET;

    public async initialize(): Promise<void> {
        console.error('[AssetProvider] Initialized Asset Provider.');
    }

    public async discover(): Promise<ProviderCapability[]> {
        return [
            {
                name: 'asset.search',
                description: 'Search Roblox marketplace and local assets by keyword with quality rating',
                provider: this.name,
                availability: CapabilityState.AVAILABLE,
                securityLevel: SecurityLevel.SAFE,
                executionContext: ExecutionContext.STUDIO,
                riskLevel: RiskLevel.READ_ONLY,
                verificationMethod: VerificationMethod.NONE,
                aliases: ['search_asset']
            },
            {
                name: 'asset.insert',
                description: 'Inserts asset by ID into DataModel at target location and validates dependencies',
                provider: this.name,
                availability: CapabilityState.AVAILABLE,
                securityLevel: SecurityLevel.SAFE,
                executionContext: ExecutionContext.EDIT,
                riskLevel: RiskLevel.MEDIUM,
                verificationMethod: VerificationMethod.EXISTENCE_CHECK,
                aliases: ['insert_asset']
            },
            {
                name: 'asset.deduplicate',
                description: 'Scans place DataModel for duplicate sounds, textures, and models',
                provider: this.name,
                availability: CapabilityState.AVAILABLE,
                securityLevel: SecurityLevel.SAFE,
                executionContext: ExecutionContext.STUDIO,
                riskLevel: RiskLevel.READ_ONLY,
                verificationMethod: VerificationMethod.NONE
            }
        ];
    }

    public async healthCheck(): Promise<HealthStatus> {
        return {
            status: CapabilityState.AVAILABLE,
            state: ProviderState.READY,
            message: 'Asset provider is operational',
            capabilities: 3,
            lastChecked: Date.now()
        };
    }

    public async listTools(): Promise<ProviderToolDefinition[]> {
        return [
            {
                name: 'asset_search',
                description: 'Search for assets with quality scoring',
                category: 'assets',
                provider: this.name,
                riskLevel: RiskLevel.READ_ONLY,
                verificationMethod: VerificationMethod.NONE
            },
            {
                name: 'asset_insert',
                description: 'Insert asset into place',
                category: 'assets',
                provider: this.name,
                riskLevel: RiskLevel.MEDIUM,
                verificationMethod: VerificationMethod.EXISTENCE_CHECK
            },
            {
                name: 'asset_deduplicate',
                description: 'Detect duplicate assets in project',
                category: 'assets',
                provider: this.name,
                riskLevel: RiskLevel.READ_ONLY,
                verificationMethod: VerificationMethod.NONE
            }
        ];
    }

    public async getCapabilities(): Promise<ProviderCapability[]> {
        return this.discover();
    }

    public async execute(action: string, params: Record<string, any>): Promise<ExecutionResult> {
        const startTime = Date.now();
        console.error(`[AssetProvider] Executing action: ${action}`);

        try {
            if (action === 'asset.search' || action === 'asset_search' || action === 'search_asset') {
                const results = await assetIntelligenceEngine.searchAssets(params.query || '', params.options);
                return {
                    status: 'SUCCESS',
                    verified: false,
                    provider: this.name,
                    tool: action,
                    changes: [],
                    evidence: [],
                    warnings: [],
                    errors: [],
                    data: results,
                    duration: Date.now() - startTime
                };
            }

            if (action === 'asset.insert' || action === 'asset_insert' || action === 'insert_asset') {
                return await assetIntelligenceEngine.insertAsset(params.assetId, params.parent, params.position);
            }

            if (action === 'asset.deduplicate' || action === 'asset_deduplicate') {
                const duplicates = await assetIntelligenceEngine.detectDuplicates(params.scope);
                return {
                    status: 'SUCCESS',
                    verified: false,
                    provider: this.name,
                    tool: action,
                    changes: [],
                    evidence: [],
                    warnings: [],
                    errors: [],
                    data: { duplicateCount: duplicates.length, duplicates },
                    duration: Date.now() - startTime
                };
            }

            return {
                status: 'ERROR',
                verified: false,
                provider: this.name,
                tool: action,
                changes: [],
                evidence: [],
                warnings: [],
                errors: [`Unknown AssetProvider action: ${action}`],
                duration: Date.now() - startTime
            };
        } catch (err: any) {
            return {
                status: 'ERROR',
                verified: false,
                provider: this.name,
                tool: action,
                changes: [],
                evidence: [],
                warnings: [],
                errors: [err?.message || String(err)],
                duration: Date.now() - startTime
            };
        }
    }

    public async shutdown(): Promise<void> {}
}

export const assetProvider = new AssetProvider();
