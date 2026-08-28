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
import { workflowLibrary } from '../capabilities/WorkflowLibrary.js';
import { commandDispatcher } from '../dispatcher/commandDispatcher.js';

export class WorkflowProvider implements IProvider {
    public readonly name = 'workflow-provider';
    public readonly type = ProviderType.WORKFLOW;

    public async initialize(): Promise<void> {
        console.error('[WorkflowProvider] Initialized Workflow Provider with registered templates.');
    }

    public async discover(): Promise<ProviderCapability[]> {
        const templates = workflowLibrary.listTemplates();
        return templates.map(t => ({
            name: `workflow.${t.id.replace('workflow:', '')}`,
            description: t.description,
            category: t.category,
            provider: this.name,
            availability: CapabilityState.AVAILABLE,
            securityLevel: SecurityLevel.SAFE,
            executionContext: ExecutionContext.EDIT,
            riskLevel: RiskLevel.MEDIUM,
            verificationMethod: VerificationMethod.COMPOSITE,
            aliases: [t.name.toLowerCase().replace(/\s+/g, '_')]
        }));
    }

    public async healthCheck(): Promise<HealthStatus> {
        return {
            status: CapabilityState.AVAILABLE,
            state: ProviderState.READY,
            message: 'Workflow provider is operational',
            capabilities: workflowLibrary.listTemplates().length,
            lastChecked: Date.now()
        };
    }

    public async listTools(): Promise<ProviderToolDefinition[]> {
        const templates = workflowLibrary.listTemplates();
        return templates.map(t => ({
            name: `workflow_${t.id.replace('workflow:', '')}`,
            description: t.description,
            category: 'workflow',
            provider: this.name,
            riskLevel: RiskLevel.MEDIUM,
            verificationMethod: VerificationMethod.COMPOSITE
        }));
    }

    public async getCapabilities(): Promise<ProviderCapability[]> {
        return this.discover();
    }

    public async execute(action: string, params: Record<string, any>): Promise<ExecutionResult> {
        const startTime = Date.now();
        console.error(`[WorkflowProvider] Executing workflow: ${action}`);

        try {
            const template = workflowLibrary.findBestMatch(action);
            if (!template) {
                return {
                    status: 'ERROR',
                    success: false,
                    message: `Workflow template not found for: ${action}`,
                    duration: Date.now() - startTime
                };
            }

            // Execute corresponding workflow in Luau WorkflowEngine via commandDispatcher
            const luauAction = `workflow_${template.category}_execute` || 'project_analyze';
            const res = await commandDispatcher.executeCommand('workflow_system_create', {
                name: template.name,
                options: params
            });

            return {
                status: 'SUCCESS',
                success: true,
                message: `Successfully executed workflow '${template.name}'`,
                data: res,
                duration: Date.now() - startTime,
                verified: false
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

export const workflowProvider = new WorkflowProvider();
