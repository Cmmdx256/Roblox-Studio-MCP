import { RiskLevel } from '../providers/types.js';
export interface SecurityVulnerability {
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    type: 'CLIENT_AUTHORITY' | 'UNVALIDATED_REMOTE' | 'DATASTORE_EXPLOIT' | 'UNPROTECTED_PROXIMITY_PROMPT';
    target: string;
    description: string;
    remediation: string;
}
export interface SecurityPolicyCheckResult {
    allowed: boolean;
    riskLevel: RiskLevel;
    requiresConfirmation: boolean;
    reason?: string;
}
export declare class SecurityEngine {
    private protectedRoots;
    /**
     * Classifies risk level of an operation based on action and parameters.
     */
    classifyRisk(action: string, params: Record<string, any>): RiskLevel;
    /**
     * Evaluates security policy before executing an operation.
     */
    evaluatePolicy(action: string, params: Record<string, any>): SecurityPolicyCheckResult;
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