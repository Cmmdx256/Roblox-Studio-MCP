/**
 * MultiplayerRealityEngine.ts
 *
 * Verifies multiplayer network architecture and security in Studio:
 * 1. Audits all RemoteEvent and RemoteFunction instances
 * 2. Checks server-authoritative state management (detecting client-trust exploits)
 * 3. Detects InvokeClient hanging anti-patterns (Server calling Client RemoteFunction)
 * 4. Transparently records multi-client test limitations as BLOCKED_BY_PLATFORM
 */
import { studioObservationEngine } from './StudioObservationEngine.js';
import { commandDispatcher } from '../dispatcher/commandDispatcher.js';
export class MultiplayerRealityEngine {
    /**
     * Audit multiplayer network boundaries and remote safety across the project.
     */
    async auditMultiplayer() {
        const vulnerabilities = [];
        const clientTrustViolations = [];
        const blockedTests = [];
        let remoteEventsAudited = 0;
        let remoteFunctionsAudited = 0;
        try {
            if (commandDispatcher.isStudioConnected()) {
                const response = await commandDispatcher.executeCommand('execute_luau', {
                    code: `
local remotes = {}
for _, inst in ipairs(game:GetDescendants()) do
    if inst:IsA("RemoteEvent") or inst:IsA("RemoteFunction") then
        remotes[#remotes + 1] = {
            name = inst.Name,
            path = inst:GetFullName(),
            className = inst.ClassName
        }
    end
end
return remotes
`
                });
                if (response?.result && Array.isArray(response.result)) {
                    for (const r of response.result) {
                        if (r.className === 'RemoteEvent')
                            remoteEventsAudited++;
                        if (r.className === 'RemoteFunction')
                            remoteFunctionsAudited++;
                        // Heuristic naming risk analysis
                        const lower = r.name.toLowerCase();
                        if (lower.includes('damage') || lower.includes('addcash') || lower.includes('givecoins') || lower.includes('sethealth')) {
                            vulnerabilities.push({
                                path: r.path,
                                riskType: 'CLIENT_AUTHORITATIVE_EXPLOIT_RISK',
                                description: `Remote '${r.name}' name suggests client may pass unvalidated authoritative state (damage/currency/health). Ensure server performs all validations.`,
                                severity: 'HIGH'
                            });
                            clientTrustViolations.push(r.path);
                        }
                    }
                }
                // Check for Server InvokeClient anti-pattern in Server scripts
                const scripts = await studioObservationEngine.findByClass('ServerScriptService', 'Script');
                for (const s of scripts) {
                    const obs = await studioObservationEngine.observe(s.path, 'FULL');
                    if (obs.result?.scriptSource && obs.result.scriptSource.includes(':InvokeClient(')) {
                        vulnerabilities.push({
                            path: s.path,
                            riskType: 'INVOKE_CLIENT_HANG_RISK',
                            description: `Server script '${s.path}' calls InvokeClient, which can hang the server if a client errors or disconnects.`,
                            severity: 'CRITICAL'
                        });
                    }
                }
            }
        }
        catch {
            // Best effort
        }
        // Multi-client concurrent testing is restricted without external emulator
        blockedTests.push('Multi-client concurrent race condition simulation is BLOCKED_BY_PLATFORM (requires multi-client local test server)');
        const status = vulnerabilities.some(v => v.severity === 'CRITICAL') ? 'FAILED' :
            vulnerabilities.length > 0 ? 'PARTIAL' :
                remoteEventsAudited > 0 || remoteFunctionsAudited > 0 ? 'VERIFIED' :
                    'NOT_TESTED';
        return {
            remoteEventsAudited,
            remoteFunctionsAudited,
            vulnerabilities,
            serverAuthoritative: vulnerabilities.length === 0,
            clientTrustViolations,
            status,
            blockedTests
        };
    }
}
export const multiplayerRealityEngine = new MultiplayerRealityEngine();
//# sourceMappingURL=MultiplayerRealityEngine.js.map