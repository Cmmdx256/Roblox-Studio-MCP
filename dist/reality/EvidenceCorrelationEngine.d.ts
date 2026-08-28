/**
 * EvidenceCorrelationEngine.ts
 *
 * Creates a full audit trail linking:
 *   Requirement → Change → Script → Runtime → Screenshot → Acceptance Criterion → Status
 *
 * Makes the platform auditable by correlating evidence across all subsystems.
 */
import { EvidenceCorrelationMap } from './types.js';
import { AcceptanceSuite } from '../engines/AcceptanceCriteriaEngine.js';
import { StructuredChangePlan } from '../engines/ChangePlanEngine.js';
import { StructuredIntent } from '../engines/IntentEngine.js';
export declare class EvidenceCorrelationEngine {
    /**
     * Correlate all evidence from a completed build cycle.
     * Links each requirement to its operation → script → criterion → final status.
     */
    correlate(buildId: string, intent: StructuredIntent, changePlan: StructuredChangePlan, suite: AcceptanceSuite, stepResults: Array<{
        operationId: string;
        description: string;
        result: any;
    }>): EvidenceCorrelationMap;
    /**
     * Format an evidence correlation map as a human-readable audit trail.
     */
    formatAuditTrail(map: EvidenceCorrelationMap): string;
}
export declare const evidenceCorrelationEngine: EvidenceCorrelationEngine;
//# sourceMappingURL=EvidenceCorrelationEngine.d.ts.map