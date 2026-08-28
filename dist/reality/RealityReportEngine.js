/**
 * RealityReportEngine.ts
 *
 * Generates unified, auditable markdown and structured reports aggregating:
 * - Studio Snapshot
 * - Runtime & Gameplay Observation
 * - Visual & UI Reality
 * - Animation & Rig Reality
 * - Asset & Security Reality
 * - Performance Reality
 * - Audio & Multiplayer Reality
 * - Game Design QA
 * - Evidence Correlation Trace
 */
export class RealityReportEngine {
    /**
     * Format a complete RealityReport as a rich, structured Markdown document.
     */
    formatMarkdownReport(report) {
        const lines = [
            `# 🌐 Reality Engine Master Report: ${report.domain}`,
            ``,
            `> **Status**: \`${report.overallStatus}\` | **Report ID**: \`${report.reportId}\` | **Build**: \`${report.buildId ?? 'N/A'}\` | **Timestamp**: ${new Date(report.generatedAt).toISOString()}`,
            ``,
            `### 📋 Executive Summary`,
            `${report.summary}`,
            ``
        ];
        // Critical Issues
        if (report.criticalIssues.length > 0) {
            lines.push(`### ⚠️ Critical Issues & Risks`);
            for (const issue of report.criticalIssues) {
                lines.push(`- 🔴 ${issue}`);
            }
            lines.push('');
        }
        // Studio DataModel Snapshot
        if (report.studioSnapshot) {
            const ss = report.studioSnapshot;
            lines.push(`### 🏗️ Studio DataModel State`);
            lines.push(`- **Service Roots Observed**: ${ss.instances.length}`);
            lines.push(`- **Total Scripts**: ${ss.scriptCount}`);
            lines.push(`- **Network Remotes**: ${ss.remoteEventCount} Events, ${ss.remoteFunctionCount} Functions`);
            lines.push(`- **UI Roots**: ${ss.uiRoots.length}`);
            if (ss.warnings.length > 0) {
                lines.push(`- **Observation Warnings**: ${ss.warnings.join(', ')}`);
            }
            lines.push('');
        }
        // Runtime Observations
        if (report.runtimeObservation) {
            const ro = report.runtimeObservation;
            lines.push(`### 🎮 Runtime Observation (Play Mode)`);
            lines.push(`- **Mode**: \`${ro.mode}\` | **Status**: \`${ro.status}\``);
            lines.push(`- **Active Players**: ${ro.players.length}`);
            lines.push(`- **Errors Detected**: ${ro.errors.length}`);
            lines.push(`- **Warnings**: ${ro.warnings.length}`);
            if (ro.errors.length > 0) {
                lines.push(`- **Error Log Sample**:`);
                for (const err of ro.errors.slice(0, 3)) {
                    lines.push(`  - \`${err.message}\``);
                }
            }
            lines.push('');
        }
        // Visual / UI Reality
        if (report.uiReality && report.uiReality.length > 0) {
            lines.push(`### 🖼️ UI Reality & Multi-Device Layout`);
            for (const ui of report.uiReality) {
                lines.push(`- **${ui.device}**: \`${ui.finalStatus}\` (${ui.cycles} cycle${ui.cycles > 1 ? 's' : ''}${ui.patchApplied ? ', auto-repaired' : ''})`);
                if (ui.geometricQA && ui.geometricQA.defects.length > 0) {
                    for (const d of ui.geometricQA.defects) {
                        lines.push(`  - ⚠️ [${d.type}] ${d.description}`);
                    }
                }
            }
            lines.push('');
        }
        // Performance Reality
        if (report.performanceReality) {
            const pr = report.performanceReality;
            lines.push(`### ⚡ Performance & Physics Metrics`);
            lines.push(`- **Instances**: ${pr.instanceCount} | **Parts**: ${pr.partCount} | **Unanchored**: ${pr.unanchoredPartCount}`);
            lines.push(`- **Scripts**: ${pr.scriptCount} | **UI Nodes**: ${pr.uiObjectCount}`);
            lines.push(`- **Risk Level**: \`${pr.riskLevel}\``);
            if (pr.memoryIndicators.length > 0) {
                for (const mem of pr.memoryIndicators)
                    lines.push(`  - ℹ️ ${mem}`);
            }
            lines.push('');
        }
        // Game Design QA
        if (report.gameDesignQA) {
            const dq = report.gameDesignQA;
            lines.push(`### 🎯 Game Design Coherence QA`);
            lines.push(`- **Design Status**: \`${dq.status}\` (${dq.riskCount} risks, ${dq.improvementCount} improvements)`);
            for (const obs of dq.observations) {
                const icon = obs.type === 'DESIGN_RISK' ? '⚠️' : obs.type === 'POSSIBLE_IMPROVEMENT' ? '💡' : 'ℹ️';
                lines.push(`- ${icon} **[${obs.aspect}]** ${obs.description}`);
                if (obs.suggestedAction)
                    lines.push(`  - *Action*: ${obs.suggestedAction}`);
            }
            lines.push('');
        }
        // Evidence Audit Trail
        if (report.evidenceCorrelation) {
            const ec = report.evidenceCorrelation;
            lines.push(`### 🔗 Evidence Correlation & Traceability`);
            lines.push(`- **Fully Verified**: ${ec.fullyVerifiedCount}`);
            lines.push(`- **Failed**: ${ec.failedCount}`);
            lines.push(`- **Platform Blocked**: ${ec.blockedCount}`);
            lines.push(``);
            lines.push(`| Requirement | Trace Path | Status |`);
            lines.push(`| :--- | :--- | :--- |`);
            for (const entry of ec.entries) {
                const statusBadge = entry.finalStatus === 'VERIFIED' ? '✅ VERIFIED' :
                    entry.finalStatus === 'FAILED' ? '❌ FAILED' :
                        entry.finalStatus === 'BLOCKED' ? '🚫 BLOCKED' :
                            `⚠️ ${entry.finalStatus}`;
                lines.push(`| \`${entry.requirementId}\` | \`${entry.tracePath.join(' → ')}\` | ${statusBadge} |`);
            }
            lines.push('');
        }
        lines.push(`---`);
        lines.push(`*Generated by Roblox Universal AI Game Development OS — Reality Engine*`);
        return lines.join('\n');
    }
}
export const realityReportEngine = new RealityReportEngine();
//# sourceMappingURL=RealityReportEngine.js.map