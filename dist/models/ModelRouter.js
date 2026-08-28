export const DEFAULT_MODEL_PROFILES = [
    {
        id: 'fast-utility',
        name: 'Fast Utility / Property Worker',
        provider: 'anthropic',
        capabilities: {
            reasoning: 0.7,
            coding: 0.75,
            luau: 0.7,
            ui: 0.6,
            vision: 0.0,
            planning: 0.6,
            debugging: 0.65
        },
        contextWindow: 128000,
        estimatedCostPerMillionTokens: 0.8,
        latencyClass: 'ULTRA_FAST',
        recommendedFor: ['property_get', 'property_set', 'instance_rename', 'instance_move', 'quick_inspection']
    },
    {
        id: 'luau-coder',
        name: 'Luau Code Specialist',
        provider: 'anthropic',
        capabilities: {
            reasoning: 0.88,
            coding: 0.96,
            luau: 0.95,
            ui: 0.8,
            vision: 0.0,
            planning: 0.82,
            debugging: 0.9
        },
        contextWindow: 200000,
        estimatedCostPerMillionTokens: 3.0,
        latencyClass: 'FAST',
        recommendedFor: ['script_generation', 'script_patching', 'module_extraction', 'remote_wiring', 'algorithm_optimization']
    },
    {
        id: 'ui-designer',
        name: 'Roblox UI & Design Specialist',
        provider: 'anthropic',
        capabilities: {
            reasoning: 0.85,
            coding: 0.9,
            luau: 0.88,
            ui: 0.98,
            vision: 0.85,
            planning: 0.85,
            debugging: 0.82
        },
        contextWindow: 200000,
        estimatedCostPerMillionTokens: 3.0,
        latencyClass: 'BALANCED',
        recommendedFor: ['ui_design', 'theme_application', 'responsive_layout', 'component_styling', 'ui_animation']
    },
    {
        id: 'deep-architect',
        name: 'Deep Reasoning & Architecture Planner',
        provider: 'anthropic',
        capabilities: {
            reasoning: 0.98,
            coding: 0.95,
            luau: 0.92,
            ui: 0.85,
            vision: 0.8,
            planning: 0.98,
            debugging: 0.96
        },
        contextWindow: 200000,
        estimatedCostPerMillionTokens: 15.0,
        latencyClass: 'THOROUGH',
        recommendedFor: ['system_architecture', 'complex_game_planning', 'multi_system_refactoring', 'root_cause_diagnosis']
    },
    {
        id: 'vision-qa',
        name: 'Visual QA & Viewport Inspector',
        provider: 'google',
        capabilities: {
            reasoning: 0.88,
            coding: 0.82,
            luau: 0.8,
            ui: 0.92,
            vision: 0.98,
            planning: 0.8,
            debugging: 0.85
        },
        contextWindow: 1000000,
        estimatedCostPerMillionTokens: 2.5,
        latencyClass: 'BALANCED',
        recommendedFor: ['screenshot_critique', 'visual_alignment', 'ui_clipping_check', 'scene_composition']
    }
];
export class ModelRouter {
    profiles = new Map();
    manualOverrideModelId;
    constructor(initialProfiles = DEFAULT_MODEL_PROFILES) {
        for (const p of initialProfiles) {
            this.profiles.set(p.id, p);
        }
    }
    registerProfile(profile) {
        this.profiles.set(profile.id, profile);
    }
    getProfile(id) {
        return this.profiles.get(id);
    }
    getAllProfiles() {
        return Array.from(this.profiles.values());
    }
    setManualOverride(modelId) {
        this.manualOverrideModelId = modelId;
    }
    /**
     * Determines the optimal model profile for a given task intent based on complexity,
     * required capabilities, latency, and cost trade-offs.
     */
    routeTask(intent, hints) {
        if (this.manualOverrideModelId && this.profiles.has(this.manualOverrideModelId)) {
            const manual = this.profiles.get(this.manualOverrideModelId);
            return {
                taskIntent: intent,
                selectedModel: manual,
                reason: `Manual override active (${manual.id})`,
                confidence: 1.0
            };
        }
        const lower = intent.toLowerCase();
        // 1. Vision & Visual QA Tasks
        if (hints?.requiresVision || lower.includes('screenshot') || lower.includes('critique') || lower.includes('visual qa') || lower.includes('looks like')) {
            const vision = this.profiles.get('vision-qa') || this.profiles.get('ui-designer') || this.profiles.get('deep-architect');
            return {
                taskIntent: intent,
                selectedModel: vision,
                fallbackModel: this.profiles.get('ui-designer'),
                reason: 'Task involves visual screenshot inspection and aesthetic QA assessment.',
                confidence: 0.95
            };
        }
        // 2. Deep Architecture / Zero-to-One Game Planning / Complex Debugging
        if (hints?.isArchitecturePlanning || lower.includes('architecture') || lower.includes('complete game') || lower.includes('0-to-1') || lower.includes('full refactor') || lower.includes('deep debug')) {
            const architect = this.profiles.get('deep-architect');
            return {
                taskIntent: intent,
                selectedModel: architect,
                fallbackModel: this.profiles.get('luau-coder'),
                reason: 'Task requires multi-system architectural reasoning and dependency planning.',
                confidence: 0.96
            };
        }
        // 3. UI Generation, Design & Theme Tasks
        if (lower.includes('ui') || lower.includes('gui') || lower.includes('menu') || lower.includes('screen') || lower.includes('theme') || lower.includes('button') || lower.includes('inventory panel') || lower.includes('shop layout')) {
            const uiModel = this.profiles.get('ui-designer') || this.profiles.get('luau-coder');
            return {
                taskIntent: intent,
                selectedModel: uiModel,
                fallbackModel: this.profiles.get('luau-coder'),
                reason: 'Task focuses on visual hierarchy, responsive layout, and UI component styling.',
                confidence: 0.92
            };
        }
        // 4. Luau Scripting, Logic, Algorithms, Module Extraction
        if (lower.includes('script') || lower.includes('code') || lower.includes('module') || lower.includes('remote') || lower.includes('logic') || lower.includes('algorithm') || lower.includes('leaderstats') || lower.includes('datastore')) {
            const coder = this.profiles.get('luau-coder');
            return {
                taskIntent: intent,
                selectedModel: coder,
                fallbackModel: this.profiles.get('fast-utility'),
                reason: 'Task involves Luau code authoring, type-checking, and server/client boundary wiring.',
                confidence: 0.94
            };
        }
        // 5. Fast Utility / Small Mutations
        const fast = this.profiles.get('fast-utility') || this.profiles.get('luau-coder');
        return {
            taskIntent: intent,
            selectedModel: fast,
            fallbackModel: this.profiles.get('luau-coder'),
            reason: 'Task is lightweight property/instance inspection or simple mutation.',
            confidence: 0.85
        };
    }
}
export const modelRouter = new ModelRouter();
//# sourceMappingURL=ModelRouter.js.map