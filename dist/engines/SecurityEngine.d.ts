export interface SecurityVulnerability {
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    type: 'CLIENT_AUTHORITY' | 'UNVALIDATED_REMOTE' | 'DATASTORE_EXPLOIT' | 'UNPROTECTED_PROXIMITY_PROMPT';
    target: string;
    description: string;
    remediation: string;
}
export declare class SecurityEngine {
    /**
     * Audits Roblox scripts and remote communications for client/server trust vulnerabilities.
     */
    auditProjectSecurity(scripts: Array<{
        path: string;
        source: string;
    }>): SecurityVulnerability[];
}
export declare const securityEngine: SecurityEngine;
//# sourceMappingURL=SecurityEngine.d.ts.map