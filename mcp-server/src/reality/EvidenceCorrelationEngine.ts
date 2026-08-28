/**
 * EvidenceCorrelationEngine.ts
 *
 * Creates a full audit trail linking:
 *   Requirement → Change → Script → Runtime → Screenshot → Acceptance Criterion → Status
 *
 * Makes the platform auditable by correlating evidence across all subsystems.
 */

import { v4 as uuidv4 } from 'uuid';
import {
    EvidenceCorrelationEntry,
    EvidenceCorrelationMap,
    VerificationStatus
} from './types.js';
import { AcceptanceSuite, AcceptanceCriterion } from '../engines/AcceptanceCriteriaEngine.js';
import { StructuredChangePlan, ChangeOperation } from '../engines/ChangePlanEngine.js';
import { StructuredIntent } from '../engines/IntentEngine.js';

export class EvidenceCorrelationEngine {
    /**
     * Correlate all evidence from a completed build cycle.
     * Links each requirement to its operation → script → criterion → final status.
     */
    public correlate(
        buildId: string,
        intent: StructuredIntent,
        changePlan: StructuredChangePlan,
        suite: AcceptanceSuite,
        stepResults: Array<{ operationId: string; description: string; result: any }>
    ): EvidenceCorrelationMap {
        const entries: EvidenceCorrelationEntry[] = [];
        const resultMap = new Map<string, any>(stepResults.map(s => [s.operationId, s.result]));

        // Match each requirement to its associated change operation(s) and criterion
        for (const req of intent.requirements) {
            // Find operations that relate to this requirement (by requirementId in payload or title match)
            const relatedOps = changePlan.operations.filter(op =>
                op.payload?.requirementId === req.id ||
                op.description.toLowerCase().includes(req.title.toLowerCase().slice(0, 20))
            );

            // Find acceptance criteria related to this requirement
            const relatedCriteria = suite.criteria.filter(c =>
                c.description?.toLowerCase().includes(req.title.toLowerCase().slice(0, 20)) ||
                (c as any).requirementId === req.id
            );

            for (const op of relatedOps) {
                const opResult = resultMap.get(op.id);
                const criterion = relatedCriteria[0];

                const tracePath = [
                    `Requirement:${req.id}`,
                    `Operation:${op.id}`,
                    op.targetPath,
                    criterion ? `Criterion:${criterion.id}` : undefined
                ].filter(Boolean) as string[];

                let finalStatus: VerificationStatus;
                if (!opResult) {
                    finalStatus = 'NOT_TESTED';
                } else if (opResult.verified || opResult.status === 'SUCCESS') {
                    finalStatus = criterion?.status === 'BLOCKED' ? 'BLOCKED' :
                                  criterion?.status === 'FAILED'  ? 'FAILED'  :
                                  'VERIFIED';
                } else if (opResult.status === 'BLOCKED') {
                    finalStatus = 'BLOCKED';
                } else {
                    finalStatus = 'FAILED';
                }

                entries.push({
                    requirementId: req.id,
                    operationId: op.id,
                    scriptPath: op.type === 'CREATE_SCRIPT' || op.type === 'PATCH_SCRIPT' ? op.targetPath : undefined,
                    criterionId: criterion?.id,
                    finalStatus,
                    tracePath
                });
            }

            // Requirements with no matching operations
            if (relatedOps.length === 0) {
                entries.push({
                    requirementId: req.id,
                    finalStatus: 'NOT_TESTED',
                    tracePath: [`Requirement:${req.id}`, 'NO_OPERATION_PLANNED']
                });
            }
        }

        const fullyVerifiedCount = entries.filter(e => e.finalStatus === 'VERIFIED').length;
        const failedCount = entries.filter(e => e.finalStatus === 'FAILED').length;
        const blockedCount = entries.filter(e => e.finalStatus === 'BLOCKED' || e.finalStatus === 'BLOCKED_BY_PLATFORM').length;

        return {
            buildId,
            correlatedAt: Date.now(),
            entries,
            fullyVerifiedCount,
            failedCount,
            blockedCount
        };
    }

    /**
     * Format an evidence correlation map as a human-readable audit trail.
     */
    public formatAuditTrail(map: EvidenceCorrelationMap): string {
        const lines: string[] = [
            `# Evidence Audit Trail`,
            `Build: ${map.buildId} | Correlated: ${new Date(map.correlatedAt).toISOString()}`,
            `Verified: ${map.fullyVerifiedCount} | Failed: ${map.failedCount} | Blocked: ${map.blockedCount}`,
            ``
        ];

        for (const entry of map.entries) {
            const statusIcon = entry.finalStatus === 'VERIFIED' ? '✅' :
                               entry.finalStatus === 'FAILED'   ? '❌' :
                               entry.finalStatus === 'BLOCKED'  ? '🚫' :
                               entry.finalStatus === 'NOT_TESTED' ? '⬜' : '⚠️';

            lines.push(`${statusIcon} ${entry.requirementId}`);
            lines.push(`   Trace: ${entry.tracePath.join(' → ')}`);
            if (entry.scriptPath) lines.push(`   Script: ${entry.scriptPath}`);
            if (entry.criterionId) lines.push(`   Criterion: ${entry.criterionId}`);
            lines.push('');
        }

        return lines.join('\n');
    }
}

export const evidenceCorrelationEngine = new EvidenceCorrelationEngine();
