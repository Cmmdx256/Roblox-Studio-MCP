import { BuildQualityReport } from './BuildQualityGateEngine.js';
export type BuildStatus = 'PLANNED' | 'BUILDING' | 'BUILT' | 'TESTING' | 'FAILED' | 'VERIFIED' | 'VERIFIED_COMMIT' | 'ROLLED_BACK' | 'BLOCKED' | 'UNVERIFIED';
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
export declare class BuildHistoryEngine {
    private builds;
    private currentBuildNumber;
    private knownGoodBuildId?;
    recordBuild(label: string, changedInstances: string[], changedScripts: string[], satisfiedCriteria: number, totalCriteria: number, rollbackId?: string, extra?: {
        requirements?: BuildRequirementRecord[];
        changes?: BuildChangeRecord[];
        observations?: BuildObservationSummary;
        durationMs?: number;
        qualityReport?: BuildQualityReport;
    }): BuildArtifact;
    updateBuildStatus(buildId: string, status: BuildStatus): boolean;
    getBuildHistory(): BuildArtifact[];
    getBuild(buildId: string): BuildArtifact | undefined;
    getLatestBuild(): BuildArtifact | undefined;
    getLatestKnownGoodBuild(): BuildArtifact | undefined;
    clear(): void;
}
export declare const buildHistoryEngine: BuildHistoryEngine;
//# sourceMappingURL=BuildHistoryEngine.d.ts.map