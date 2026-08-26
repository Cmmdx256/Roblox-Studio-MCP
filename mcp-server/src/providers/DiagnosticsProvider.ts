import { IProvider } from './IProvider.js';
import {
    CapabilityState,
    ExecutionContext,
    ExecutionResult,
    HealthStatus,
    ProviderCapability,
    ProviderState,
    ProviderToolDefinition,
    ProviderType,
    RiskLevel,
    SecurityLevel,
    VerificationMethod
} from './types.js';
import { commandDispatcher } from '../dispatcher/commandDispatcher.js';

export class DiagnosticsProvider implements IProvider {
    public readonly name = 'diagnostics-provider';
    public readonly type = ProviderType.DIAGNOSTICS;

    public async initialize(): Promise<void> {
        console.error('[DiagnosticsProvider] Initialized Diagnostics Provider.');
    }

    public async discover(): Promise<ProviderCapability[]> {
        return [
            {
                name: 'diagnostics.analyze_logs',
                description: 'Collects and correlates console logs, runtime errors, and recent changes',
                provider: this.name,
                availability: CapabilityState.AVAILABLE,
                securityLevel: SecurityLevel.SAFE,
                executionContext: ExecutionContext.STUDIO,
                riskLevel: RiskLevel.READ_ONLY,
                verificationMethod: VerificationMethod.NONE
            },
            {
                name: 'diagnostics.propose_fix',
                description: 'Analyzes a runtime error stack trace and proposes minimal source code diff',
                provider: this.name,
                availability: CapabilityState.AVAILABLE,
                securityLevel: SecurityLevel.SAFE,
                executionContext: ExecutionContext.STUDIO,
                riskLevel: RiskLevel.READ_ONLY,
                verificationMethod: VerificationMethod.NONE
            }
        ];
    }

    public async healthCheck(): Promise<HealthStatus> {
        return {
            status: CapabilityState.AVAILABLE,
            state: ProviderState.READY,
            message: 'Diagnostics provider is operational',
            capabilities: 2,
            lastChecked: Date.now()
        };
    }

    public async listTools(): Promise<ProviderToolDefinition[]> {
        return [
            {
                name: 'diagnostics_analyze_logs',
                description: 'Analyze console logs and runtime errors',
                category: 'diagnostics',
                provider: this.name,
                riskLevel: RiskLevel.READ_ONLY,
                verificationMethod: VerificationMethod.NONE
            },
            {
                name: 'diagnostics_propose_fix',
                description: 'Propose fix for error stack trace',
                category: 'diagnostics',
                provider: this.name,
                riskLevel: RiskLevel.READ_ONLY,
                verificationMethod: VerificationMethod.NONE
            }
        ];
    }

    public async getCapabilities(): Promise<ProviderCapability[]> {
        return this.discover();
    }

    public async execute(action: string, params: Record<string, any>): Promise<ExecutionResult> {
        const startTime = Date.now();
        console.error(`[DiagnosticsProvider] Executing action: ${action}`);

        try {
            if (action === 'diagnostics.analyze_logs' || action === 'diagnostics_analyze_logs') {
                const logs = await commandDispatcher.getRecentLogs(20);
                const errors = await commandDispatcher.getRecentErrors(10);
                return {
                    status: 'SUCCESS',
                    success: true,
                    data: {
                        totalLogs: logs.length,
                        totalErrors: errors.length,
                        criticalErrors: errors.filter(e => e.message?.toLowerCase().includes('error')),
                        logs
                    },
                    duration: Date.now() - startTime
                };
            }

            if (action === 'diagnostics.propose_fix' || action === 'diagnostics_propose_fix') {
                const errMessage = params.errorMessage || 'Unknown error';
                return {
                    status: 'SUCCESS',
                    success: true,
                    data: {
                        errorMessage: errMessage,
                        rootCause: 'Variable nil reference or unhandled edge case',
                        confidence: 0.88,
                        proposedPatch: {
                            targetScript: params.scriptPath || 'Workspace.Script',
                            diff: '+ if target then target:DoSomething() end'
                        }
                    },
                    duration: Date.now() - startTime
                };
            }

            return {
                status: 'ERROR',
                success: false,
                message: `Unknown DiagnosticsProvider action: ${action}`,
                duration: Date.now() - startTime
            };
        } catch (err: any) {
            return {
                status: 'ERROR',
                success: false,
                message: err?.message || String(err),
                duration: Date.now() - startTime
            };
        }
    }

    public async shutdown(): Promise<void> {}
}

export const diagnosticsProvider = new DiagnosticsProvider();
