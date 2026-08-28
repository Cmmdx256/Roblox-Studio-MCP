export * from './CapabilityContract.js';
import { CapabilityState, ExecutionContext, ProviderType, RiskLevel, SecurityLevel, VerificationMethod } from '../providers/types.js';
export type CapabilityNodeType = 'tool' | 'api' | 'provider' | 'workflow' | 'resource' | 'primitive' | 'capability';
export type CapabilityEdgeType = 'implements' | 'dependsOn' | 'composes' | 'verifies' | 'requires' | 'fallbackTo' | 'providedBy';
export interface CapabilityNode {
    id: string;
    name: string;
    type: CapabilityNodeType;
    provider?: ProviderType | string;
    description: string;
    state: CapabilityState;
    securityLevel?: SecurityLevel;
    executionContext?: ExecutionContext;
    riskLevel?: RiskLevel;
    confidence: number;
    qualityScore?: number;
    metadata?: Record<string, any>;
}
export interface CapabilityEdge {
    id: string;
    fromId: string;
    toId: string;
    type: CapabilityEdgeType;
    weight?: number;
    metadata?: Record<string, any>;
}
export interface CompiledStep {
    stepIndex: number;
    action: string;
    provider: ProviderType | string;
    params: Record<string, any>;
    description: string;
    verificationMethod: VerificationMethod;
    expectedOutcome?: string;
    fallbackAction?: string;
    allowFailure?: boolean;
}
export interface CompiledCapability {
    id: string;
    name: string;
    intent: string;
    description: string;
    steps: CompiledStep[];
    confidence: number;
    verified: boolean;
    reusable: boolean;
    tags?: string[];
    createdAt: number;
    lastExecuted?: number;
}
export interface CapabilityProbeResult {
    capabilityId: string;
    passed: boolean;
    durationMs: number;
    sideEffectsDetected: boolean;
    evidence: any[];
    error?: string;
}
export interface ToolIndexEntry {
    name: string;
    description: string;
    category: string;
    provider: string;
    riskLevel: RiskLevel;
    keywords: string[];
    context: ExecutionContext[];
    security: SecurityLevel;
}
//# sourceMappingURL=types.d.ts.map