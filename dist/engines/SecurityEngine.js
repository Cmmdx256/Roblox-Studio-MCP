import { RiskLevel } from '../providers/types.js';
export class SecurityEngine {
    protectedRoots = new Set([
        'CoreGui',
        'PluginGuiService',
        'RobloxReplicatedStorage',
        'HttpRbxApiService',
        'CorePackages',
        'RobloxPluginHostService'
    ]);
    /**
     * Classifies risk level of an operation based on action and parameters.
     */
    classifyRisk(action, params) {
        const act = action.toLowerCase();
        if (act.includes('delete') || act.includes('clear') || act.includes('destroy')) {
            if (params.path === 'Workspace' || params.target === 'Workspace' || params.scope === 'game') {
                return RiskLevel.CRITICAL;
            }
            return RiskLevel.HIGH;
        }
        if (act.includes('set_source') || act.includes('patch') || act.includes('multi_edit')) {
            return RiskLevel.MEDIUM;
        }
        if (act.includes('create') || act.includes('clone') || act.includes('reparent') || act.includes('compose')) {
            return RiskLevel.LOW;
        }
        if (act.includes('get') || act.includes('search') || act.includes('inspect') || act.includes('info') || act.includes('read')) {
            return RiskLevel.READ_ONLY;
        }
        return RiskLevel.LOW;
    }
    /**
     * Evaluates security policy before executing an operation.
     */
    evaluatePolicy(action, params) {
        const riskLevel = this.classifyRisk(action, params);
        const targetPath = String(params.path || params.target || params.rootPath || '');
        // 1. Check Protected Services
        for (const root of this.protectedRoots) {
            if (targetPath.startsWith(root) || targetPath.includes(`game.${root}`)) {
                return {
                    allowed: false,
                    riskLevel: RiskLevel.CRITICAL,
                    requiresConfirmation: true,
                    reason: `Operation blocked: Target '${targetPath}' is in a protected internal Roblox service.`
                };
            }
        }
        // 2. High & Critical Risk Safeguards
        if (riskLevel === RiskLevel.CRITICAL) {
            return {
                allowed: true,
                riskLevel,
                requiresConfirmation: true,
                reason: 'Critical operation requires explicit confirmation or atomic transaction wrapper.'
            };
        }
        return {
            allowed: true,
            riskLevel,
            requiresConfirmation: false
        };
    }
    /**
     * Audits Roblox scripts and remote communications for client/server trust vulnerabilities.
     */
    auditProjectSecurity(scripts) {
        const vulnerabilities = [];
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
//# sourceMappingURL=SecurityEngine.js.map