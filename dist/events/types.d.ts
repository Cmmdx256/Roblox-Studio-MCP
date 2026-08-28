export type PlatformEventType = 'StudioConnected' | 'StudioDisconnected' | 'ToolCalled' | 'ToolCompleted' | 'InstanceCreated' | 'InstanceDeleted' | 'ScriptChanged' | 'PlaytestStarted' | 'PlaytestStopped' | 'PlaytestCompleted' | 'ErrorDetected' | 'ScreenshotCaptured' | 'VerificationStarted' | 'VerificationPassed' | 'VerificationFailed' | 'VerificationResult' | 'RepairStarted' | 'RepairCompleted' | 'RecoveryAttempted' | 'RollbackStarted' | 'RollbackCompleted' | 'BuildCommitted' | 'BuildCompleted' | 'IntentExtracted' | 'PlanGenerated' | 'ExecutionStarted' | 'StageCompleted' | 'RegressionTriggered' | 'MemoryUpdated' | 'ObservationCaptured' | 'RealityReportGenerated';
export interface PlatformEvent<T = any> {
    id: string;
    type: PlatformEventType;
    timestamp: number;
    source: string;
    payload: T;
    metadata?: Record<string, any>;
}
export type EventHandler<T = any> = (event: PlatformEvent<T>) => void | Promise<void>;
//# sourceMappingURL=types.d.ts.map