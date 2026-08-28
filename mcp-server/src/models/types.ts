export interface ModelCapabilities {
    reasoning: number;   // 0.0 - 1.0 (Architecture, deep debugging, complex planning)
    coding: number;      // 0.0 - 1.0 (Luau code generation, syntax correctness)
    luau: number;        // 0.0 - 1.0 (Roblox-specific APIs, services, optimization)
    ui: number;          // 0.0 - 1.0 (Visual design, component layouts, design systems)
    vision: number;      // 0.0 - 1.0 (Screenshot observation, visual critique, QA)
    planning: number;    // 0.0 - 1.0 (DAG task decomposition, multi-step workflows)
    debugging: number;   // 0.0 - 1.0 (Root-cause error diagnosis, patch synthesis)
}

export type LatencyClass = 'ULTRA_FAST' | 'FAST' | 'BALANCED' | 'THOROUGH';

export interface ModelProfile {
    id: string;
    name: string;
    provider: 'anthropic' | 'google' | 'openai' | 'custom' | 'local';
    capabilities: ModelCapabilities;
    contextWindow: number;
    estimatedCostPerMillionTokens: number;
    latencyClass: LatencyClass;
    recommendedFor: string[];
}

export interface ModelRoutingDecision {
    taskIntent: string;
    selectedModel: ModelProfile;
    fallbackModel?: ModelProfile;
    reason: string;
    confidence: number;
}
