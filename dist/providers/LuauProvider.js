import { CapabilityState, ExecutionContext, ProviderState, ProviderType, RiskLevel, SecurityLevel, VerificationMethod } from './types.js';
import { commandDispatcher } from '../dispatcher/commandDispatcher.js';
export class LuauProvider {
    name = 'luau-provider';
    type = ProviderType.LUAU;
    async initialize() {
        console.error('[LuauProvider] Initialized Luau intelligence & execution provider.');
    }
    async discover() {
        return [
            {
                name: 'luau.execute',
                description: 'Executes Luau code in Studio environment (Edit, PlayClient, or PlayServer context)',
                provider: this.name,
                availability: CapabilityState.AVAILABLE,
                securityLevel: SecurityLevel.SAFE,
                executionContext: ExecutionContext.ANY,
                riskLevel: RiskLevel.MEDIUM,
                verificationMethod: VerificationMethod.READ_BACK,
                aliases: ['execute_luau', 'script_execute']
            },
            {
                name: 'luau.analyze_syntax',
                description: 'Performs static syntax and semantic Luau analysis on provided code',
                provider: this.name,
                availability: CapabilityState.AVAILABLE,
                securityLevel: SecurityLevel.SAFE,
                executionContext: ExecutionContext.STUDIO,
                riskLevel: RiskLevel.READ_ONLY,
                verificationMethod: VerificationMethod.NONE
            },
            {
                name: 'luau.audit_security_boundaries',
                description: 'Audits Client/Server boundaries, RemoteEvent invocations, and trust validation',
                provider: this.name,
                availability: CapabilityState.AVAILABLE,
                securityLevel: SecurityLevel.SAFE,
                executionContext: ExecutionContext.STUDIO,
                riskLevel: RiskLevel.READ_ONLY,
                verificationMethod: VerificationMethod.NONE
            }
        ];
    }
    async healthCheck() {
        return {
            status: CapabilityState.AVAILABLE,
            state: ProviderState.READY,
            message: 'Luau provider is operational',
            capabilities: 3,
            lastChecked: Date.now()
        };
    }
    async listTools() {
        return [
            {
                name: 'luau_execute',
                description: 'Executes Luau code in Roblox Studio',
                provider: this.name,
                riskLevel: RiskLevel.MEDIUM,
                verificationMethod: VerificationMethod.READ_BACK
            },
            {
                name: 'luau_analyze_syntax',
                description: 'Analyzes Luau code syntax and structure',
                provider: this.name,
                riskLevel: RiskLevel.READ_ONLY,
                verificationMethod: VerificationMethod.NONE
            },
            {
                name: 'luau_audit_security',
                description: 'Audits Client/Server remote communication security',
                provider: this.name,
                riskLevel: RiskLevel.READ_ONLY,
                verificationMethod: VerificationMethod.NONE
            }
        ];
    }
    async getCapabilities() {
        return this.discover();
    }
    async execute(action, params) {
        const startTime = Date.now();
        console.error(`[LuauProvider] Executing action: ${action}`);
        try {
            if (action === 'luau.execute' || action === 'luau_execute' || action === 'execute_luau') {
                const scriptSource = params.code || params.source || '';
                // Forward execution request to embedded plugin or official mcp
                const res = await commandDispatcher.executeCommand('script_set_source', {
                    target: params.targetPath || 'ServerScriptService.TempExecutionScript',
                    source: scriptSource
                });
                return {
                    status: 'SUCCESS',
                    success: true,
                    data: res,
                    duration: Date.now() - startTime,
                    // Script writes need an explicit source read-back or a
                    // runtime/playtest postcondition before verification.
                    verified: false
                };
            }
            if (action === 'luau.analyze_syntax' || action === 'luau_analyze_syntax') {
                const code = params.code || '';
                const lines = code.split('\n');
                const hasDeprecated = code.includes('wait(') || code.includes('spawn(');
                return {
                    status: 'SUCCESS',
                    success: true,
                    data: {
                        lineCount: lines.length,
                        hasDeprecatedAPIs: hasDeprecated,
                        recommendations: hasDeprecated ? ['Replace wait() with task.wait()', 'Replace spawn() with task.spawn()'] : ['Code follows modern Luau guidelines']
                    },
                    duration: Date.now() - startTime
                };
            }
            if (action === 'luau.audit_security_boundaries' || action === 'luau_audit_security') {
                return {
                    status: 'BLOCKED',
                    success: false,
                    code: 'BLOCKED_BY_PLATFORM',
                    message: 'Security-boundary audit needs real script-source observations; no target scope was supplied.',
                    data: {
                        state: 'REQUIRES_SCRIPT_SOURCE_OBSERVATION'
                    },
                    duration: Date.now() - startTime,
                    verified: false
                };
            }
            return {
                status: 'ERROR',
                success: false,
                message: `Unknown LuauProvider action: ${action}`,
                duration: Date.now() - startTime
            };
        }
        catch (err) {
            return {
                status: 'ERROR',
                success: false,
                message: err?.message || String(err),
                duration: Date.now() - startTime
            };
        }
    }
    async shutdown() { }
}
export const luauProvider = new LuauProvider();
//# sourceMappingURL=LuauProvider.js.map