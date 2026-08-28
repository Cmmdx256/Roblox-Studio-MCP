import { BuildQualityReport } from './BuildQualityGateEngine.js';

export type BuildStatus =
    | 'PLANNED'
    | 'BUILDING'
    | 'BUILT'
    | 'TESTING'
    | 'FAILED'
    | 'VERIFIED'
    | 'VERIFIED_COMMIT'
    | 'ROLLED_BACK'
    | 'BLOCKED'
    | 'UNVERIFIED';

export interface BuildRequirementRecord {
    id: string;
    title: string;
    category?: string;
    satisfied: boolean;
}

export interface BuildChangeRecord {
    type: 'create' | 'modify' | 'delete' | 'script' | 'remote' | 'ui' | 'animation';
    targetPath: string;
    details?: Record<string, any>;
}

export interface BuildObservationSummary {
    instanceCount?: number;
    scriptCount?: number;
    remoteCount?: number;
    errorsDetected?: number;
    warningsDetected?: number;
    visualDefectsCount?: number;
    regressionsFound?: boolean;
}

export interface BuildArtifact {
    buildNumber: number;
    buildId: string;
    label: string;
    timestamp: number;
    status: BuildStatus;
    changedInstances: string[];
    changedScripts: string[];
    satisfiedCriteriaCount: number;
    totalCriteriaCount: number;
    requirements?: BuildRequirementRecord[];
    changes?: BuildChangeRecord[];
    observations?: BuildObservationSummary;
    rollbackSnapshotId?: string;
    isKnownGood?: boolean;
    commitHash?: string;
    durationMs?: number;
    qualityReport?: BuildQualityReport;
}

export class BuildHistoryEngine {
    private builds: BuildArtifact[] = [];
    private currentBuildNumber = 0;
    private knownGoodBuildId?: string;

    public recordBuild(
        label: string,
        changedInstances: string[],
        changedScripts: string[],
        satisfiedCriteria: number,
        totalCriteria: number,
        rollbackId?: string,
        extra?: {
            requirements?: BuildRequirementRecord[];
            changes?: BuildChangeRecord[];
            observations?: BuildObservationSummary;
            durationMs?: number;
            qualityReport?: BuildQualityReport;
        }
    ): BuildArtifact {
        this.currentBuildNumber++;
        const buildId = `build_${this.currentBuildNumber.toString().padStart(3, '0')}`;
        // Completion is calculated by the quality gate engine.  Acceptance counts or a
        // green offline unit test are intentionally insufficient evidence.
        const qualityStatus = extra?.qualityReport?.finalStatus;
        const status: BuildStatus = qualityStatus === 'VERIFIED_COMMIT' ? 'VERIFIED_COMMIT'
            : qualityStatus === 'FAILED' ? 'FAILED'
            : qualityStatus === 'BLOCKED' ? 'BLOCKED'
            : 'UNVERIFIED';
        const isVerified = status === 'VERIFIED_COMMIT';

        const artifact: BuildArtifact = {
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

    public updateBuildStatus(buildId: string, status: BuildStatus): boolean {
        const build = this.builds.find(b => b.buildId === buildId);
        if (build) {
            // Direct promotion is prohibited.  Only recordBuild with a calculated
            // BuildQualityReport can create VERIFIED_COMMIT.
            if (status === 'VERIFIED_COMMIT') return false;
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

    public getBuildHistory(): BuildArtifact[] {
        return [...this.builds];
    }

    public getBuild(buildId: string): BuildArtifact | undefined {
        return this.builds.find(b => b.buildId === buildId);
    }

    public getLatestBuild(): BuildArtifact | undefined {
        return this.builds[this.builds.length - 1];
    }

    public getLatestKnownGoodBuild(): BuildArtifact | undefined {
        if (!this.knownGoodBuildId) {
            return [...this.builds].reverse().find(b => b.isKnownGood);
        }
        return this.getBuild(this.knownGoodBuildId);
    }

    public clear(): void {
        this.builds = [];
        this.currentBuildNumber = 0;
        this.knownGoodBuildId = undefined;
    }
}

export const buildHistoryEngine = new BuildHistoryEngine();
