import { CapabilityGraph, capabilityGraph } from './CapabilityGraph.js';
import { CompiledCapability, CompiledStep } from './types.js';
import { CapabilityState, VerificationMethod } from '../providers/types.js';

export class CapabilityCompiler {
    private graph: CapabilityGraph;
    private compiledCache = new Map<string, CompiledCapability>();

    constructor(graph: CapabilityGraph = capabilityGraph) {
        this.graph = graph;
    }

    /**
     * Compiles a high-level intent or missing tool request into an executable sequence of primitives.
     */
    public compile(intent: string, context?: Record<string, any>): CompiledCapability {
        const normalizedIntent = intent.toLowerCase().trim();
        const cacheKey = normalizedIntent;

        if (this.compiledCache.has(cacheKey)) {
            const cached = this.compiledCache.get(cacheKey)!;
            cached.lastExecuted = Date.now();
            return cached;
        }

        const steps: CompiledStep[] = [];
        let confidence = 0.85;

        // Semantic Intent Decomposition
        if (normalizedIntent.includes('align') && (normalizedIntent.includes('shoreline') || normalizedIntent.includes('water') || normalizedIntent.includes('surface'))) {
            // Step 1: Discover candidate models
            steps.push({
                stepIndex: 0,
                action: 'studio_search',
                provider: 'embedded-plugin',
                params: { query: context?.targetName || 'Boat', searchBy: 'name' },
                description: 'Search for target models in Workspace',
                verificationMethod: VerificationMethod.EXISTENCE_CHECK,
                expectedOutcome: 'Finds matching model instances'
            });
            // Step 2: Inspect spatial positions
            steps.push({
                stepIndex: 1,
                action: 'studio_inspect',
                provider: 'embedded-plugin',
                params: { path: 'Workspace' },
                description: 'Inspect spatial positions and bounding boxes',
                verificationMethod: VerificationMethod.PROPERTY_CHECK
            });
            // Step 3: Compute and apply transformation via Luau or Move
            steps.push({
                stepIndex: 2,
                action: 'instance_move',
                provider: 'embedded-plugin',
                params: { path: context?.targetPath || 'Workspace.Boat', position: context?.targetPosition || [0, 5, 0] },
                description: 'Apply oriented transformation aligning model with surface plane',
                verificationMethod: VerificationMethod.READ_BACK
            });
            // Step 4: Visual verification frame
            steps.push({
                stepIndex: 3,
                action: 'screen_capture',
                provider: 'official-roblox-mcp',
                params: {},
                description: 'Capture screenshot of aligned model for visual QA',
                verificationMethod: VerificationMethod.SCREENSHOT,
                allowFailure: true
            });
        } else if (normalizedIntent.includes('animation') && (normalizedIntent.includes('create') || normalizedIntent.includes('setup') || normalizedIntent.includes('play'))) {
            // Animation pipeline composition
            steps.push({
                stepIndex: 0,
                action: 'studio_search',
                provider: 'embedded-plugin',
                params: { query: 'Animator', searchBy: 'className' },
                description: 'Discover Humanoid/Animator controllers',
                verificationMethod: VerificationMethod.EXISTENCE_CHECK
            });
            steps.push({
                stepIndex: 1,
                action: 'instance_create',
                provider: 'embedded-plugin',
                params: { className: 'Animation', parent: 'ReplicatedStorage', name: context?.animName || 'CustomAnimation', properties: { AnimationId: context?.animationId || 'rbxassetid://0' } },
                description: 'Create Animation asset instance in ReplicatedStorage',
                verificationMethod: VerificationMethod.PROPERTY_CHECK
            });
            steps.push({
                stepIndex: 2,
                action: 'script_set_source',
                provider: 'embedded-plugin',
                params: { path: context?.controllerScriptPath || 'StarterPlayer.StarterCharacterScripts.AnimationHandler', source: context?.controllerSource || '-- Animation controller\nlocal anim = game:GetService("ReplicatedStorage"):WaitForChild("CustomAnimation")\n' },
                description: 'Deploy Luau animation playback controller script',
                verificationMethod: VerificationMethod.READ_BACK
            });
        } else if (normalizedIntent.includes('day') && normalizedIntent.includes('night')) {
            // Day/Night cycle system composition
            steps.push({
                stepIndex: 0,
                action: 'property_set',
                provider: 'embedded-plugin',
                params: { path: 'Lighting', property: 'ClockTime', value: 14 },
                description: 'Initialize Lighting ClockTime',
                verificationMethod: VerificationMethod.READ_BACK
            });
            steps.push({
                stepIndex: 1,
                action: 'instance_create',
                provider: 'embedded-plugin',
                params: {
                    className: 'Script',
                    parent: 'ServerScriptService',
                    name: 'DayNightCycle',
                    properties: {
                        Source: `local Lighting = game:GetService("Lighting")\nlocal MINUTES_PER_SECOND = 0.1\nwhile true do\n    Lighting.ClockTime = (Lighting.ClockTime + (MINUTES_PER_SECOND / 60)) % 24\n    task.wait(1)\nend`
                    }
                },
                description: 'Create Day/Night loop Script in ServerScriptService',
                verificationMethod: VerificationMethod.EXISTENCE_CHECK
            });
        } else {
            // Generic dynamic composition from primitives
            steps.push({
                stepIndex: 0,
                action: 'studio_inspect',
                provider: 'embedded-plugin',
                params: { path: context?.targetPath || 'Workspace' },
                description: `Inspect context for '${intent}'`,
                verificationMethod: VerificationMethod.EXISTENCE_CHECK
            });
            steps.push({
                stepIndex: 1,
                action: 'batch_execute',
                provider: 'embedded-plugin',
                params: { operations: context?.operations || [] },
                description: `Execute composed batch operations for '${intent}'`,
                verificationMethod: VerificationMethod.COMPOSITE
            });
            confidence = 0.70;
        }

        const compiled: CompiledCapability = {
            id: `compiled:${Date.now()}:${Math.random().toString(36).substring(2, 7)}`,
            name: intent,
            intent,
            description: `Auto-compiled multi-step capability for: ${intent}`,
            steps,
            confidence,
            verified: false,
            reusable: true,
            createdAt: Date.now()
        };

        // Cache compiled capability
        this.compiledCache.set(cacheKey, compiled);

        // Register in CapabilityGraph
        this.graph.addNode({
            id: compiled.id,
            name: compiled.name,
            type: 'workflow',
            description: compiled.description,
            state: CapabilityState.COMPOSABLE,
            confidence: compiled.confidence,
            metadata: { stepCount: steps.length }
        });

        return compiled;
    }

    public getCompiledCapability(intentOrId: string): CompiledCapability | undefined {
        return this.compiledCache.get(intentOrId.toLowerCase().trim()) || 
               Array.from(this.compiledCache.values()).find(c => c.id === intentOrId);
    }

    public markVerified(id: string): void {
        const found = Array.from(this.compiledCache.values()).find(c => c.id === id);
        if (found) {
            found.verified = true;
            found.confidence = 1.0;
            this.graph.updateNodeState(id, CapabilityState.VERIFIED, 1.0);
        }
    }
}

export const capabilityCompiler = new CapabilityCompiler();
