/**
 * RealityEngine.ts — Master Reality Controller
 *
 * The Reality Engine is the bridge between:
 *   WHAT AI THINKS IT BUILT
 * and:
 *   WHAT ACTUALLY EXISTS AND HAPPENS IN ROBLOX STUDIO
 *
 * Orchestrates all Reality subsystems:
 *   - StudioObservationEngine    → DataModel inspection
 *   - RuntimeObservationEngine   → Play mode logs & state
 *   - GameplayStateObserver      → Player/inventory/round state
 *   - VisionInspectionEngine     → Visual QA
 *   - GameDesignQAEngine         → Design coherence
 *   - EvidenceCorrelationEngine  → Audit trail
 *
 * Fully genre-agnostic. Capability-driven. No hardcoded game types.
 */
import { UIElementBound } from './VisionInspectionEngine.js';
import { RealityReport, VerificationStatus } from './types.js';
import { StructuredIntent } from '../engines/IntentEngine.js';
import { AcceptanceSuite } from '../engines/AcceptanceCriteriaEngine.js';
import { StructuredChangePlan } from '../engines/ChangePlanEngine.js';
export interface RealityEngineOptions {
    /** Observation targets — if empty, uses default service roots */
    observationTargets?: string[];
    /** UI bounds for geometric QA */
    uiBounds?: UIElementBound[];
    /** Viewport info for UI QA */
    viewport?: {
        width: number;
        height: number;
        device?: string;
    };
    /** Include runtime observation (only possible in Play mode) */
    includeRuntime?: boolean;
    /** Include gameplay state snapshot */
    includeGameplayState?: boolean;
    /** Include design QA evaluation */
    includeDesignQA?: boolean;
}
export declare class RealityEngine {
    /**
     * Full Reality Cycle:
     * Observe Studio → Runtime → Gameplay State → Visual QA → Design QA → Correlate Evidence
     *
     * @param intent The parsed intent from IntentEngine
     * @param changePlan The executed change plan
     * @param suite The evaluated acceptance suite
     * @param stepResults Execution step results from AIOrchestrator
     * @param buildId The build ID to correlate
     * @param opts Runtime options
     */
    runFullCycle(intent: StructuredIntent, changePlan: StructuredChangePlan, suite: AcceptanceSuite, stepResults: Array<{
        operationId: string;
        description: string;
        result: any;
    }>, buildId: string, opts?: RealityEngineOptions): Promise<RealityReport>;
    /**
     * Lightweight quick-observe: just checks if required paths exist.
     * Fast enough to run after every change operation.
     */
    quickVerify(paths: string[]): Promise<Record<string, VerificationStatus>>;
    /**
     * Generate a text summary of a reality report suitable for developer output.
     */
    formatProgressReport(report: RealityReport): string;
}
export declare const realityEngine: RealityEngine;
//# sourceMappingURL=RealityEngine.d.ts.map