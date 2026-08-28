export interface ModelCapabilities {
    reasoning: number;
    coding: number;
    luau: number;
    ui: number;
    vision: number;
    planning: number;
    debugging: number;
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
//# sourceMappingURL=types.d.ts.map