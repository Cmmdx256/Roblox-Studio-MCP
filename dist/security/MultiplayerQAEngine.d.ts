export interface NetworkBoundaryAudit {
    remotesFound: string[];
    vulnerabilities: Array<{
        remote: string;
        scriptPath: string;
        riskType: 'CLIENT_AUTHORITATIVE_ECONOMY' | 'UNVALIDATED_DAMAGE' | 'MISSING_COOLDOWN' | 'RACE_CONDITION';
        description: string;
        recommendedFix: string;
    }>;
    isMultiplayerSafe: boolean;
}
export declare class MultiplayerQAEngine {
    /**
     * Inspects server/client network boundaries and RemoteEvents for client-authoritative exploits.
     */
    auditNetworkBoundaries(scripts: Array<{
        path: string;
        source: string;
    }>): NetworkBoundaryAudit;
    /**
     * Simulates a multi-player concurrent transaction test scenario.
     */
    simulateMultiplayerTransactionTest(): {
        testName: string;
        passed: boolean;
        details: Record<string, any>;
    };
}
export declare const multiplayerQAEngine: MultiplayerQAEngine;
//# sourceMappingURL=MultiplayerQAEngine.d.ts.map