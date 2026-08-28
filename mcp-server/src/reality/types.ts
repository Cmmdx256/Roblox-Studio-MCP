/**
 * types.ts — Reality Engine type system
 *
 * Defines the canonical evidence and observation types used across all
 * Reality Engine subsystems. No game-genre assumptions are made here.
 */

// ────────────────────────────────────────────────────────────────────────────
// Shared Evidence & Status Types
// ────────────────────────────────────────────────────────────────────────────

/** Universal verification status for all observations and checks. */
export type VerificationStatus =
    | 'VERIFIED'
    | 'FAILED'
    | 'BLOCKED'
    | 'BLOCKED_BY_PLATFORM'
    | 'UNAVAILABLE'
    | 'NOT_TESTED'
    | 'SIMULATED'
    | 'PARTIAL'
    | 'SUSPICIOUS'
    | 'HIGH_RISK';

// ────────────────────────────────────────────────────────────────────────────
// Studio Observation
// ────────────────────────────────────────────────────────────────────────────

export interface ObservedInstance {
    path: string;
    className: string;
    name: string;
    properties?: Record<string, any>;
    attributes?: Record<string, any>;
    children?: ObservedInstance[];
    scriptSource?: string;
}

export interface StudioSnapshot {
    timestamp: number;
    sessionId?: string;
    instances: ObservedInstance[];
    scriptCount: number;
    remoteEventCount: number;
    remoteFunctionCount: number;
    uiRoots: ObservedInstance[];
    errors: string[];
    warnings: string[];
    raw?: any;
}

export interface TargetedObservation {
    path: string;
    depth: 'SHALLOW' | 'DEEP';
    result: ObservedInstance | null;
    status: VerificationStatus;
    observedAt: number;
    cost: 'CHEAP' | 'NORMAL' | 'DEEP' | 'FULL';
}

// ────────────────────────────────────────────────────────────────────────────
// Runtime Observation
// ────────────────────────────────────────────────────────────────────────────

export interface RuntimeLogEntry {
    timestamp: number;
    type: 'OUTPUT' | 'WARNING' | 'ERROR';
    message: string;
    source?: string;
}

export interface PlayerRuntimeState {
    userId: number;
    displayName: string;
    characterPath?: string;
    humanoidState?: string;
    toolEquipped?: string;
    cameraMode?: string;
    position?: { x: number; y: number; z: number };
}

export interface RuntimeObservation {
    sessionId: string;
    capturedAt: number;
    mode: 'EDIT' | 'PLAYTEST' | 'RUN';
    logs: RuntimeLogEntry[];
    errors: RuntimeLogEntry[];
    warnings: RuntimeLogEntry[];
    players: PlayerRuntimeState[];
    gameplayVariables: Record<string, any>;
    remoteActivity: Array<{ remote: string; direction: 'SERVER' | 'CLIENT'; timestamp: number }>;
    status: VerificationStatus;
}

// ────────────────────────────────────────────────────────────────────────────
// Screenshot & Vision
// ────────────────────────────────────────────────────────────────────────────

export type VisualDefectType =
    | 'UI_OVERLAP'
    | 'UI_CLIPPING'
    | 'OFF_SCREEN_UI'
    | 'BAD_SPACING'
    | 'INCORRECT_SCALING'
    | 'MISSING_ELEMENT'
    | 'BROKEN_HIERARCHY'
    | 'POOR_CONTRAST'
    | 'WRONG_POSITIONING'
    | 'BROKEN_CAMERA_FRAMING'
    | 'MISSING_ASSET'
    | 'VISUAL_GLITCH'
    | 'CHARACTER_POSE_PROBLEM'
    | 'ANIMATION_VISIBILITY_PROBLEM'
    | 'SCENE_COMPOSITION_PROBLEM';

export interface VisualDefect {
    type: VisualDefectType;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    region?: { x: number; y: number; width: number; height: number };
    evidence?: string;
    suggestedFix?: string;
}

export interface ScreenshotCapture {
    captureId: string;
    capturedAt: number;
    source: 'OFFICIAL_MCP' | 'PLUGIN_HTTP' | 'UNAVAILABLE';
    data?: Buffer | string; // base64 if string
    status: VerificationStatus;
    viewportWidth?: number;
    viewportHeight?: number;
    device?: 'Desktop' | 'Mobile' | 'Tablet' | 'Console';
}

export interface VisionInspectionResult {
    captureId: string;
    inspectedAt: number;
    defects: VisualDefect[];
    defectCount: number;
    highSeverityCount: number;
    status: VerificationStatus;
    summary: string;
    analysisMethod: 'GEOMETRIC' | 'AI_VISION' | 'COMBINED' | 'UNAVAILABLE';
}

// ────────────────────────────────────────────────────────────────────────────
// UI Reality
// ────────────────────────────────────────────────────────────────────────────

export type UIDevice = 'Desktop' | 'Mobile' | 'Tablet' | 'Console';

export interface UIRealityReport {
    screenName: string;
    device: UIDevice;
    builtAt: number;
    screenshot?: ScreenshotCapture;
    visionResult?: VisionInspectionResult;
    geometricQA?: VisionInspectionResult;
    patchApplied: boolean;
    patchDescription?: string;
    finalStatus: VerificationStatus;
    cycles: number;
    evidence: string[];
}

// ────────────────────────────────────────────────────────────────────────────
// Animation Reality
// ────────────────────────────────────────────────────────────────────────────

export interface AnimationRigCompatibility {
    rigType: 'R6' | 'R15' | 'UNKNOWN';
    jointNames: string[];
    missingJoints: string[];
    compatible: boolean;
    warnings: string[];
}

export interface AnimationRealityReport {
    animationId: string;
    description: string;
    rigCompatibility: AnimationRigCompatibility;
    keyframeCount?: number;
    runtimePlaybackStatus: VerificationStatus;
    toolAttachmentStatus: VerificationStatus;
    finalStatus: VerificationStatus;
    blockedByPlatform: boolean;
    blockReason?: string;
    evidence: string[];
}

// ────────────────────────────────────────────────────────────────────────────
// Asset Reality
// ────────────────────────────────────────────────────────────────────────────

export interface AssetRealityReport {
    assetId: string;
    assetName: string;
    assetType: string;
    securityStatus: 'SAFE' | 'SUSPICIOUS' | 'HIGH_RISK' | 'BLOCKED' | 'MANUAL_REVIEW';
    duplicates: string[];
    missingDependencies: string[];
    polycount?: number;
    textureResolution?: string;
    physicsImplications: string[];
    performanceRisk: 'LOW' | 'MEDIUM' | 'HIGH';
    evidence: string[];
    finalStatus: VerificationStatus;
}

// ────────────────────────────────────────────────────────────────────────────
// Performance Reality
// ────────────────────────────────────────────────────────────────────────────

export interface PerformanceRealityReport {
    measuredAt: number;
    instanceCount: number | 'UNAVAILABLE';
    partCount: number | 'UNAVAILABLE';
    unanchoredPartCount: number | 'UNAVAILABLE';
    scriptCount: number | 'UNAVAILABLE';
    uiObjectCount: number | 'UNAVAILABLE';
    fps: 'UNAVAILABLE';  // Never fabricated — always UNAVAILABLE unless live telemetry is available
    memoryIndicators: string[];
    runtimeErrors: number;
    warningFrequency: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNAVAILABLE';
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    observations: string[];
    status: VerificationStatus;
}

// ────────────────────────────────────────────────────────────────────────────
// Gameplay State
// ────────────────────────────────────────────────────────────────────────────

export interface GameplayStateSnapshot {
    capturedAt: number;
    players: PlayerRuntimeState[];
    leaderstats: Record<string, Record<string, any>>;
    inventories: Record<string, any[]>;
    activeRounds: number;
    spawnCount: number;
    gameplayVariables: Record<string, any>;
    remoteEventActivity: number;
    status: VerificationStatus;
}

// ────────────────────────────────────────────────────────────────────────────
// Audio Reality
// ────────────────────────────────────────────────────────────────────────────

export interface AudioRealityReport {
    soundInstances: Array<{
        path: string;
        volume: number;
        rollOffDistance?: number;
        soundGroup?: string;
        issues: string[];
    }>;
    missingGroupRouting: string[];
    volumeIssues: string[];
    status: VerificationStatus;
}

// ────────────────────────────────────────────────────────────────────────────
// Multiplayer Reality
// ────────────────────────────────────────────────────────────────────────────

export interface MultiplayerRealityReport {
    remoteEventsAudited: number;
    remoteFunctionsAudited: number;
    vulnerabilities: Array<{
        path: string;
        riskType: string;
        description: string;
        severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    }>;
    serverAuthoritative: boolean;
    clientTrustViolations: string[];
    status: VerificationStatus;
    blockedTests: string[];
}

// ────────────────────────────────────────────────────────────────────────────
// Game Design QA
// ────────────────────────────────────────────────────────────────────────────

export type DesignObservationType = 'DESIGN_RISK' | 'DESIGN_OBSERVATION' | 'POSSIBLE_IMPROVEMENT';

export interface DesignObservation {
    type: DesignObservationType;
    aspect: string;
    description: string;
    confidence: number; // 0-1
    suggestedAction?: string;
}

export interface GameDesignQAReport {
    evaluatedAt: number;
    domain: string;
    observations: DesignObservation[];
    riskCount: number;
    improvementCount: number;
    status: 'COHERENT' | 'DESIGN_RISKS_FOUND' | 'REVIEW_REQUIRED';
}

// ────────────────────────────────────────────────────────────────────────────
// Evidence Correlation
// ────────────────────────────────────────────────────────────────────────────

export interface EvidenceCorrelationEntry {
    requirementId: string;
    operationId?: string;
    scriptPath?: string;
    runtimeEventId?: string;
    screenshotId?: string;
    criterionId?: string;
    finalStatus: VerificationStatus;
    tracePath: string[];
}

export interface EvidenceCorrelationMap {
    buildId: string;
    correlatedAt: number;
    entries: EvidenceCorrelationEntry[];
    fullyVerifiedCount: number;
    failedCount: number;
    blockedCount: number;
}

// ────────────────────────────────────────────────────────────────────────────
// Reality Report (Master)
// ────────────────────────────────────────────────────────────────────────────

export interface RealityReport {
    reportId: string;
    buildId?: string;
    generatedAt: number;
    domain: string;
    studioSnapshot?: StudioSnapshot;
    runtimeObservation?: RuntimeObservation;
    gameplayState?: GameplayStateSnapshot;
    uiReality?: UIRealityReport[];
    animationReality?: AnimationRealityReport[];
    assetReality?: AssetRealityReport[];
    performanceReality?: PerformanceRealityReport;
    audioReality?: AudioRealityReport;
    multiplayerReality?: MultiplayerRealityReport;
    gameDesignQA?: GameDesignQAReport;
    evidenceCorrelation?: EvidenceCorrelationMap;
    overallStatus: VerificationStatus;
    summary: string;
    criticalIssues: string[];
}
