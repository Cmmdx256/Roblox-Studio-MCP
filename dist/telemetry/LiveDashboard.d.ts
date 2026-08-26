export interface DashboardMetrics {
    pluginStatus: 'ONLINE' | 'OFFLINE';
    officialMcpStatus: 'ONLINE' | 'OFFLINE';
    httpsStatus: 'CONNECTED' | 'DISCONNECTED';
    daemonState: 'READY' | 'DEGRADED' | 'UNHEALTHY';
    activeStudioId: string;
    placeName: string;
    placeId: number | string;
    liveCapabilitiesCount: number;
    liveToolsCount: number;
    lowLevelToolsCount: number;
    highLevelWorkflowsCount: number;
    totalUniversalTools: number;
    activeMode: string;
    currentTask: string;
    verificationStatus: string;
    recentErrorsCount: number;
    recentMutations: Array<{
        target: string;
        action: string;
        timestamp: number;
    }>;
    timestamp: number;
}
export declare class LiveDashboard {
    /**
     * Gathers real-time telemetry metrics dynamically from all live subsystems.
     */
    getMetrics(): Promise<DashboardMetrics>;
}
export declare const liveDashboard: LiveDashboard;
//# sourceMappingURL=LiveDashboard.d.ts.map