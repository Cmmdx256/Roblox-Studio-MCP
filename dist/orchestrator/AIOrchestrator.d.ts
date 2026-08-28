import { StructuredIntent } from '../engines/IntentEngine.js';
import { AcceptanceSuite } from '../engines/AcceptanceCriteriaEngine.js';
import { StructuredChangePlan } from '../engines/ChangePlanEngine.js';
import { BuildArtifact } from './BuildHistoryEngine.js';
import { ExecutionResult } from '../providers/types.js';
export type OrchestratorOperatingMode = 'SAFE' | 'ASSISTED' | 'AUTONOMOUS' | 'EXPERT' | 'DRY_RUN';
export interface FullOrchestrationResult {
    intent: StructuredIntent;
    operatingMode: OrchestratorOperatingMode;
    selectedModel: string;
    changePlan: StructuredChangePlan;
    acceptanceSuite: AcceptanceSuite;
    executedOperationsCount: number;
    verifiedOperationsCount: number;
    recoveredErrorsCount: number;
    overallStatus: 'VERIFIED' | 'PARTIALLY_VERIFIED' | 'FAILED' | 'BLOCKED' | 'UNVERIFIED' | 'DRY_RUN_READY';
    buildArtifact?: BuildArtifact;
    projectMemorySummary: Record<string, any>;
    stepResults: Array<{
        operationId: string;
        description: string;
        result: ExecutionResult;
    }>;
}
export declare class AIOrchestrator {
    /**
     * Master AI Game Development OS Pipeline.
     * Converts arbitrary natural language intent into requirements, acceptance criteria,
     * a capability-driven change plan, verifiable execution, regression, and auditable build history.
     *
     * This pipeline is fully genre-agnostic — operates on capabilities, not game types.
     */
    orchestrateTask(prompt: string, mode?: OrchestratorOperatingMode): Promise<FullOrchestrationResult>;
}
export declare const aiOrchestrator: AIOrchestrator;
//# sourceMappingURL=AIOrchestrator.d.ts.map