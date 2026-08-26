export interface SecurityVulnerability {
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    type: 'CLIENT_AUTHORITY' | 'UNVALIDATED_REMOTE' | 'DATASTORE_EXPLOIT' | 'UNPROTECTED_PROXIMITY_PROMPT';
    target: string;
    description: string;
    remediation: string;
}

export class SecurityEngine {
    /**
     * Audits Roblox scripts and remote communications for client/server trust vulnerabilities.
     */
    public auditProjectSecurity(scripts: Array<{ path: string; source: string }>): SecurityVulnerability[] {
        const vulnerabilities: SecurityVulnerability[] = [];

        for (const s of scripts) {
            const src = s.source;

            // Pattern 1: RemoteEvent trust without type/range validation
            if (src.includes('OnServerEvent:Connect(function(player, amount') && !src.includes('type(amount) == "number"') && !src.includes('math.clamp')) {
                vulnerabilities.push({
                    severity: 'CRITICAL',
                    type: 'UNVALIDATED_REMOTE',
                    target: s.path,
                    description: 'Server accepts client-provided numeric amount without type or range validation.',
                    remediation: 'Validate type(amount) == "number" and assert(amount > 0 and amount <= MAX_TRANSACTION)'
                });
            }

            // Pattern 2: Client directly setting health or humanoid speed
            if (s.path.includes('StarterPlayer') && (src.includes('.Health =') || src.includes('.WalkSpeed = 100'))) {
                vulnerabilities.push({
                    severity: 'HIGH',
                    type: 'CLIENT_AUTHORITY',
                    target: s.path,
                    description: 'Client script directly mutates authoritative Humanoid properties.',
                    remediation: 'Move authoritative health and movement changes to server-side scripts.'
                });
            }
        }

        return vulnerabilities;
    }
}

export const securityEngine = new SecurityEngine();
