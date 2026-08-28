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

export class TestingProvider implements IProvider {
    public readonly name = 'testing-provider';
    public readonly type = ProviderType.TESTING;

    public async initialize(): Promise<void> {
        console.error('[TestingProvider] Initialized Testing Provider.');
    }

    public async discover(): Promise<ProviderCapability[]> {
        return [
            {
                name: 'testing.run_suite',
                description: 'Runs a suite of automated Luau test cases against current place state',
                provider: this.name,
                availability: CapabilityState.AVAILABLE,
                securityLevel: SecurityLevel.SAFE,
                executionContext: ExecutionContext.ANY,
                riskLevel: RiskLevel.READ_ONLY,
                verificationMethod: VerificationMethod.EVIDENCE
            },
            {
                name: 'testing.assert_instance',
                description: 'Asserts instance existence, parentage, property values, and attributes',
                provider: this.name,
                availability: CapabilityState.AVAILABLE,
                securityLevel: SecurityLevel.SAFE,
                executionContext: ExecutionContext.STUDIO,
                riskLevel: RiskLevel.READ_ONLY,
                verificationMethod: VerificationMethod.READ_BACK
            }
        ];
    }

    public async healthCheck(): Promise<HealthStatus> {
        return {
            status: CapabilityState.AVAILABLE,
            state: ProviderState.READY,
            message: 'Testing provider is operational',
            capabilities: 2,
            lastChecked: Date.now()
        };
    }

    public async listTools(): Promise<ProviderToolDefinition[]> {
        return [
            {
                name: 'testing_run_suite',
                description: 'Run automated tests in Studio',
                category: 'testing',
                provider: this.name,
                riskLevel: RiskLevel.READ_ONLY,
                verificationMethod: VerificationMethod.EVIDENCE
            },
            {
                name: 'testing_assert_instance',
                description: 'Verify instance properties and state',
                category: 'testing',
                provider: this.name,
                riskLevel: RiskLevel.READ_ONLY,
                verificationMethod: VerificationMethod.READ_BACK
            }
        ];
    }

    public async getCapabilities(): Promise<ProviderCapability[]> {
        return this.discover();
    }

    public async execute(action: string, params: Record<string, any>): Promise<ExecutionResult> {
        const startTime = Date.now();
        console.error(`[TestingProvider] Executing testing action: ${action}`);

        try {
            if (action === 'testing.assert_instance' || action === 'testing_assert_instance') {
                const target = params.target || params.path || 'Workspace';
                const inspectRes = await commandDispatcher.executeCommand('instance_get_details', { target });
                return {
                    status: 'SUCCESS',
                    success: true,
                    // This tool currently gathers a real DataModel observation;
                    // it does not invent an assertion result when no explicit
                    // expected state was supplied.
                    data: { target, inspection: inspectRes, assertionState: 'UNVERIFIED' },
                    duration: Date.now() - startTime,
                    verified: false
                };
            }

            if (action === 'testing.run_suite' || action === 'testing_run_suite') {
                const suiteName = params.suite || 'SmokeTest';
                return {
                    // The embedded plugin has no generic in-Studio test-suite
                    // runner.  Reporting fabricated counts here used to make
                    // an unavailable capability look like a passing playtest.
                    status: 'BLOCKED',
                    success: false,
                    code: 'BLOCKED_BY_PLATFORM',
                    message: 'No real in-Studio test-suite runner is installed. Use explicit verified scenarios or connect a supported runner.',
                    data: {
                        suite: suiteName,
                        state: 'BLOCKED_BY_PLATFORM'
                    },
                    duration: Date.now() - startTime,
                    verified: false
                };
            }

            return {
                status: 'ERROR',
                success: false,
                message: `Unknown TestingProvider action: ${action}`,
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

export const testingProvider = new TestingProvider();
