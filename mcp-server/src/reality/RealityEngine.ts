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

import { v4 as uuidv4 } from 'uuid';
import { studioObservationEngine } from './StudioObservationEngine.js';
import { runtimeObservationEngine } from './RuntimeObservationEngine.js';
import { gameplayStateObserver } from './GameplayStateObserver.js';
import { visionInspectionEngine, UIElementBound } from './VisionInspectionEngine.js';
import { gameDesignQAEngine } from './GameDesignQAEngine.js';
import { evidenceCorrelationEngine } from './EvidenceCorrelationEngine.js';
import { designerBrain } from '../engines/designer/DesignerBrain.js';
import {
    RealityReport,
    StudioSnapshot,
    RuntimeObservation,
    GameplayStateSnapshot,
    UIRealityReport,
    VerificationStatus
} from './types.js';
import { StructuredIntent } from '../engines/IntentEngine.js';
import { AcceptanceSuite } from '../engines/AcceptanceCriteriaEngine.js';
import { StructuredChangePlan } from '../engines/ChangePlanEngine.js';

export interface RealityEngineOptions {
    /** Observation targets — if empty, uses default service roots */
    observationTargets?: string[];
    /** UI bounds for geometric QA */
    uiBounds?: UIElementBound[];
    /** Viewport info for UI QA */
    viewport?: { width: number; height: number; device?: string };
    /** Include runtime observation (only possible in Play mode) */
    includeRuntime?: boolean;
    /** Include gameplay state snapshot */
    includeGameplayState?: boolean;
    /** Include design QA evaluation */
    includeDesignQA?: boolean;
}

export class RealityEngine {
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
    public async runFullCycle(
        intent: StructuredIntent,
        changePlan: StructuredChangePlan,
        suite: AcceptanceSuite,
        stepResults: Array<{ operationId: string; description: string; result: any }>,
        buildId: string,
        opts: RealityEngineOptions = {}
    ): Promise<RealityReport> {
        const reportId = `reality_${uuidv4().slice(0, 8)}`;
        const criticalIssues: string[] = [];

        console.error(`[RealityEngine] Starting full reality cycle for: "${intent.domain}" (build: ${buildId})`);

        // ── 1. Studio Snapshot ────────────────────────────────────────────────
        let studioSnapshot: StudioSnapshot | undefined;
        try {
            studioSnapshot = await studioObservationEngine.collectSnapshot(
                opts.observationTargets
            );
            if (studioSnapshot.errors.length > 0) {
                criticalIssues.push(...studioSnapshot.errors.map(e => `[Studio] ${e}`));
            }
        } catch (err: any) {
            criticalIssues.push(`[Studio] Snapshot failed: ${err?.message}`);
        }

        // ── 2. Runtime Observation (if in Play mode) ──────────────────────────
        let runtimeObservation: RuntimeObservation | undefined;
        if (opts.includeRuntime !== false) {
            try {
                runtimeObservation = await runtimeObservationEngine.collectObservation();
                const errCount = runtimeObservation.errors.length;
                if (errCount > 0) {
                    criticalIssues.push(`[Runtime] ${errCount} script error(s) detected in Play mode`);
                }
            } catch (err: any) {
                // Runtime observation is best-effort — not a critical failure
            }
        }

        // ── 3. Gameplay State ─────────────────────────────────────────────────
        let gameplayState: GameplayStateSnapshot | undefined;
        if (opts.includeGameplayState !== false) {
            try {
                gameplayState = await gameplayStateObserver.collectSnapshot();
            } catch {
                // Best-effort
            }
        }

        // ── 4. Visual QA ─────────────────────────────────────────────────────
        const uiRealityReports: UIRealityReport[] = [];
        if (opts.uiBounds && opts.uiBounds.length > 0 && opts.viewport) {
            const { width, height, device = 'Desktop' } = opts.viewport;
            const geometricResult = visionInspectionEngine.inspectGeometric(
                opts.uiBounds,
                width,
                height,
                device
            );
            uiRealityReports.push({
                screenName: intent.domain,
                device: (device as any) ?? 'Desktop',
                builtAt: Date.now(),
                geometricQA: geometricResult,
                patchApplied: false,
                finalStatus: geometricResult.status,
                cycles: 1,
                evidence: [geometricResult.summary]
            });
            if (geometricResult.highSeverityCount > 0) {
                criticalIssues.push(`[VisualQA] ${geometricResult.highSeverityCount} high-severity UI defects on ${device}`);
            }
        }

        // ── 5. Design QA ─────────────────────────────────────────────────────
        let designQA;
        if (opts.includeDesignQA !== false) {
            try {
                const spec = designerBrain.createGameDesignSpec(intent.rawPrompt);
                designQA = gameDesignQAEngine.evaluate(spec, intent);
                if (designQA.status === 'REVIEW_REQUIRED') {
                    criticalIssues.push(`[DesignQA] ${designQA.riskCount} critical design risks detected`);
                }
            } catch {
                // Design QA is advisory — not a critical failure
            }
        }

        // ── 6. Evidence Correlation ───────────────────────────────────────────
        const evidenceCorrelation = evidenceCorrelationEngine.correlate(
            buildId,
            intent,
            changePlan,
            suite,
            stepResults
        );

        // ── 7. Determine Overall Status ───────────────────────────────────────
        const allVerified = evidenceCorrelation.failedCount === 0 &&
                            evidenceCorrelation.blockedCount === 0 &&
                            criticalIssues.length === 0;
        const anyVerified = evidenceCorrelation.fullyVerifiedCount > 0;

        const overallStatus: VerificationStatus =
            allVerified ? 'VERIFIED' :
            anyVerified ? 'PARTIAL'  :
            criticalIssues.some(i => i.includes('[Runtime]')) ? 'FAILED' :
            'UNAVAILABLE';

        const summary = [
            `Reality cycle complete for: ${intent.domain}`,
            `Evidence: ${evidenceCorrelation.fullyVerifiedCount} verified, ` +
            `${evidenceCorrelation.failedCount} failed, ` +
            `${evidenceCorrelation.blockedCount} blocked`,
            criticalIssues.length > 0 ? `Critical issues: ${criticalIssues.length}` : 'No critical issues',
            designQA ? `Design QA: ${designQA.status} (${designQA.riskCount} risks)` : ''
        ].filter(Boolean).join(' | ');

        return {
            reportId,
            buildId,
            generatedAt: Date.now(),
            domain: intent.domain,
            studioSnapshot,
            runtimeObservation,
            gameplayState,
            uiReality: uiRealityReports.length > 0 ? uiRealityReports : undefined,
            gameDesignQA: designQA,
            evidenceCorrelation,
            overallStatus,
            summary,
            criticalIssues
        };
    }

    /**
     * Lightweight quick-observe: just checks if required paths exist.
     * Fast enough to run after every change operation.
     */
    public async quickVerify(paths: string[]): Promise<Record<string, VerificationStatus>> {
        const results: Record<string, VerificationStatus> = {};
        for (const path of paths) {
            try {
                const obs = await studioObservationEngine.observe(path, 'CHEAP');
                results[path] = obs.status;
            } catch {
                results[path] = 'UNAVAILABLE';
            }
        }
        return results;
    }

    /**
     * Generate a text summary of a reality report suitable for developer output.
     */
    public formatProgressReport(report: RealityReport): string {
        const lines: string[] = [
            `┌─ Reality Engine Report ──────────────────────────────`,
            `│ Domain:  ${report.domain}`,
            `│ Status:  ${report.overallStatus}`,
            `│ Build:   ${report.buildId ?? 'N/A'}`,
            `│`
        ];

        if (report.evidenceCorrelation) {
            const ec = report.evidenceCorrelation;
            lines.push(`│ Evidence: ${ec.fullyVerifiedCount} verified | ${ec.failedCount} failed | ${ec.blockedCount} blocked`);
        }

        if (report.studioSnapshot) {
            const ss = report.studioSnapshot;
            lines.push(`│ Studio:   ${ss.instances.length} roots | ${ss.scriptCount} scripts | ${ss.remoteEventCount} remotes`);
        }

        if (report.runtimeObservation) {
            const ro = report.runtimeObservation;
            lines.push(`│ Runtime:  ${ro.players.length} players | ${ro.errors.length} errors | ${ro.warnings.length} warnings (${ro.status})`);
        }

        if (report.gameDesignQA) {
            const dq = report.gameDesignQA;
            lines.push(`│ Design:   ${dq.status} | ${dq.riskCount} risks | ${dq.improvementCount} improvements`);
        }

        if (report.criticalIssues.length > 0) {
            lines.push(`│`);
            lines.push(`│ ⚠ Critical Issues:`);
            for (const issue of report.criticalIssues) {
                lines.push(`│   • ${issue}`);
            }
        }

        lines.push(`└──────────────────────────────────────────────────────`);
        return lines.join('\n');
    }
}

export const realityEngine = new RealityEngine();
