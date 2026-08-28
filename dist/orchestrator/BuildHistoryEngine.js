export class BuildHistoryEngine {
    builds = [];
    currentBuildNumber = 0;
    knownGoodBuildId;
    recordBuild(label, changedInstances, changedScripts, satisfiedCriteria, totalCriteria, rollbackId, extra) {
        this.currentBuildNumber++;
        const buildId = `build_${this.currentBuildNumber.toString().padStart(3, '0')}`;
        // Completion is calculated by the quality gate engine.  Acceptance counts or a
        // green offline unit test are intentionally insufficient evidence.
        const qualityStatus = extra?.qualityReport?.finalStatus;
        const status = qualityStatus === 'VERIFIED_COMMIT' ? 'VERIFIED_COMMIT'
            : qualityStatus === 'FAILED' ? 'FAILED'
                : qualityStatus === 'BLOCKED' ? 'BLOCKED'
                    : 'UNVERIFIED';
        const isVerified = status === 'VERIFIED_COMMIT';
        const artifact = {
            buildNumber: this.currentBuildNumber,
            buildId,
            label,
            timestamp: Date.now(),
            status,
            changedInstances,
            changedScripts,
            satisfiedCriteriaCount: satisfiedCriteria,
            totalCriteriaCount: totalCriteria,
            rollbackSnapshotId: rollbackId,
            requirements: extra?.requirements,
            changes: extra?.changes,
            observations: extra?.observations,
            durationMs: extra?.durationMs,
            qualityReport: extra?.qualityReport,
            isKnownGood: isVerified
        };
        if (isVerified) {
            this.knownGoodBuildId = buildId;
        }
        this.builds.push(artifact);
        console.error(`[BuildHistory] Recorded Build #${artifact.buildNumber} (${artifact.buildId}): "${label}" -> status: ${artifact.status}`);
        return artifact;
    }
    updateBuildStatus(buildId, status) {
        const build = this.builds.find(b => b.buildId === buildId);
        if (build) {
            // Direct promotion is prohibited.  Only recordBuild with a calculated
            // BuildQualityReport can create VERIFIED_COMMIT.
            if (status === 'VERIFIED_COMMIT')
                return false;
            build.status = status;
            if (status === 'ROLLED_BACK' || status === 'FAILED' || status === 'BLOCKED' || status === 'UNVERIFIED') {
                build.isKnownGood = false;
                if (this.knownGoodBuildId === buildId) {
                    // Find previous known good
                    const prev = [...this.builds].reverse().find(b => b.isKnownGood && b.buildId !== buildId);
                    this.knownGoodBuildId = prev?.buildId;
                }
            }
            return true;
        }
        return false;
    }
    getBuildHistory() {
        return [...this.builds];
    }
    getBuild(buildId) {
        return this.builds.find(b => b.buildId === buildId);
    }
    getLatestBuild() {
        return this.builds[this.builds.length - 1];
    }
    getLatestKnownGoodBuild() {
        if (!this.knownGoodBuildId) {
            return [...this.builds].reverse().find(b => b.isKnownGood);
        }
        return this.getBuild(this.knownGoodBuildId);
    }
    clear() {
        this.builds = [];
        this.currentBuildNumber = 0;
        this.knownGoodBuildId = undefined;
    }
}
export const buildHistoryEngine = new BuildHistoryEngine();
//# sourceMappingURL=BuildHistoryEngine.js.map