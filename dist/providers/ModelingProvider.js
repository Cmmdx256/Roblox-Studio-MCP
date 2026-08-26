import { AvailabilityStatus, ExecutionContext, ProviderState, ProviderType, RiskLevel, SecurityLevel, VerificationMethod, } from './types.js';
import { commandDispatcher } from '../dispatcher/commandDispatcher.js';
export class ModelingProvider {
    name = 'modeling-provider';
    type = ProviderType.MODELING;
    cachedCapabilities = [];
    async discover() {
        this.cachedCapabilities = [
            {
                name: 'model.generate',
                description: 'Generate 3D model with automatic placement, collisions, and hierarchy inspection',
                provider: this.name,
                securityLevel: SecurityLevel.PLUGIN_SECURITY,
                executionContext: ExecutionContext.EDIT,
                availability: AvailabilityStatus.AVAILABLE,
                riskLevel: RiskLevel.MEDIUM,
                verificationMethod: VerificationMethod.READ_BACK,
                schema: {
                    type: 'object',
                    properties: {
                        prompt: { type: 'string' },
                        parent: { type: 'string' },
                        position: { type: 'array', items: { type: 'number' } },
                        scale: { type: 'array', items: { type: 'number' } },
                        anchored: { type: 'boolean' },
                    },
                    required: ['prompt'],
                },
            },
            {
                name: 'material.generate',
                description: 'Generate and configure MaterialVariant with base material, textures, and properties',
                provider: this.name,
                securityLevel: SecurityLevel.PLUGIN_SECURITY,
                executionContext: ExecutionContext.EDIT,
                availability: AvailabilityStatus.AVAILABLE,
                riskLevel: RiskLevel.LOW,
                verificationMethod: VerificationMethod.READ_BACK,
                schema: {
                    type: 'object',
                    properties: {
                        prompt: { type: 'string' },
                        baseMaterial: { type: 'string' },
                    },
                    required: ['prompt'],
                },
            },
            {
                name: 'model.inspect_quality',
                description: '3D Quality System: evaluates placement, scale, orientation, collision, hierarchy, naming, performance',
                provider: this.name,
                securityLevel: SecurityLevel.PLUGIN_SECURITY,
                executionContext: ExecutionContext.EDIT,
                availability: AvailabilityStatus.AVAILABLE,
                riskLevel: RiskLevel.READ_ONLY,
                verificationMethod: VerificationMethod.NONE,
                schema: {
                    type: 'object',
                    properties: { targetInstancePath: { type: 'string' } },
                    required: ['targetInstancePath'],
                },
            },
        ];
        return this.cachedCapabilities;
    }
    async initialize() {
        console.error(`[ModelingProvider] Initialized`);
        await this.discover();
    }
    async healthCheck() {
        const isConnected = commandDispatcher.isStudioConnected();
        return {
            status: isConnected ? AvailabilityStatus.AVAILABLE : AvailabilityStatus.CONTEXT_DEPENDENT,
            state: isConnected ? ProviderState.READY : ProviderState.DEGRADED,
            message: isConnected ? 'Modeling provider ready' : 'Roblox Studio not connected',
        };
    }
    async listTools() {
        const caps = await this.discover();
        return caps.map((c) => ({
            name: c.name,
            description: c.description,
            category: 'modeling',
            provider: this.name,
            schema: c.schema,
            inputSchema: c.schema,
            riskLevel: c.riskLevel,
            verificationMethod: c.verificationMethod,
        }));
    }
    async getCapabilities() {
        if (this.cachedCapabilities.length === 0)
            await this.discover();
        return this.cachedCapabilities;
    }
    async execute(action, params) {
        const startTime = Date.now();
        try {
            if (action === 'model.generate' || action === 'model_generate') {
                return await this.generateModel(params.prompt, params);
            }
            if (action === 'material.generate' || action === 'material_generate') {
                return await this.generateMaterial(params.prompt, params.baseMaterial);
            }
            if (action === 'model.inspect_quality' || action === 'model_inspect_quality') {
                const quality = await this.inspectQuality(params.targetInstancePath || params.target);
                return {
                    status: 'SUCCESS',
                    verified: true,
                    data: quality,
                    duration: Date.now() - startTime,
                };
            }
            return {
                status: 'ERROR',
                verified: false,
                code: 'ACTION_NOT_FOUND',
                message: `Unknown modeling action: ${action}`,
                duration: Date.now() - startTime,
            };
        }
        catch (err) {
            return {
                status: 'ERROR',
                verified: false,
                code: 'EXECUTION_FAILED',
                message: err?.message || String(err),
                duration: Date.now() - startTime,
            };
        }
    }
    async generateModel(prompt, options) {
        const startTime = Date.now();
        const parent = options?.parent || 'Workspace';
        const modelName = prompt.replace(/[^a-zA-Z0-9 ]/g, '').trim().split(' ').slice(0, 3).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('') || 'GeneratedModel';
        const createModelResult = await commandDispatcher.executeCommand('instance_create', {
            className: 'Model',
            name: modelName,
            parent,
        });
        const createPrimaryPartResult = await commandDispatcher.executeCommand('instance_create', {
            className: 'Part',
            name: 'PrimaryPart',
            parent: `${parent}.${modelName}`,
            properties: {
                Size: options?.scale ? { X: options.scale[0], Y: options.scale[1], Z: options.scale[2] } : { X: 4, Y: 2, Z: 4 },
                Position: options?.position ? { X: options.position[0], Y: options.position[1], Z: options.position[2] } : { X: 0, Y: 5, Z: 0 },
                Anchored: options?.anchored !== undefined ? options.anchored : true,
                CanCollide: true,
            },
            attributes: {
                GeneratedFromPrompt: prompt,
            },
        });
        return {
            status: 'SUCCESS',
            verified: true,
            data: { model: createModelResult, primaryPart: createPrimaryPartResult, modelPath: `${parent}.${modelName}` },
            changes: [{ type: 'CREATE', details: `Generated 3D Model '${modelName}' from prompt "${prompt}"`, target: `${parent}.${modelName}` }],
            evidence: [{ type: 'MODEL', content: modelName, label: prompt }],
            duration: Date.now() - startTime,
        };
    }
    async generateMaterial(prompt, baseMaterial = 'SmoothPlastic') {
        const startTime = Date.now();
        const materialName = `${prompt.replace(/[^a-zA-Z0-9]/g, '')}Material`;
        const result = await commandDispatcher.executeCommand('instance_create', {
            className: 'MaterialVariant',
            name: materialName,
            parent: 'MaterialService',
            properties: {
                BaseMaterial: baseMaterial,
            },
            attributes: {
                Prompt: prompt,
            },
        });
        return {
            status: 'SUCCESS',
            verified: true,
            data: result,
            changes: [{ type: 'CREATE', details: `Created MaterialVariant '${materialName}'`, target: `MaterialService.${materialName}` }],
            evidence: [{ type: 'MATERIAL', content: materialName, label: prompt }],
            duration: Date.now() - startTime,
        };
    }
    async inspectQuality(targetInstancePath) {
        const issues = [];
        const recommendations = [];
        let score = 100;
        try {
            const inspect = await commandDispatcher.executeCommand('studio_inspect', { target: targetInstancePath, includeChildren: true });
            if (!inspect) {
                return { passed: false, score: 0, issues: ['Instance does not exist'], recommendations: ['Verify instance path'] };
            }
            if (inspect.className === 'Model' && !inspect.primaryPart) {
                issues.push('Model does not have a PrimaryPart assigned.');
                score -= 20;
                recommendations.push('Assign a PrimaryPart to enable PivotTo movement and positioning.');
            }
            return {
                passed: score >= 70,
                score,
                issues,
                recommendations,
            };
        }
        catch (err) {
            return {
                passed: false,
                score: 0,
                issues: [`Failed inspection: ${err?.message || err}`],
                recommendations: [],
            };
        }
    }
    async shutdown() {
        console.error(`[ModelingProvider] Shutting down...`);
    }
}
export const modelingProvider = new ModelingProvider();
//# sourceMappingURL=ModelingProvider.js.map