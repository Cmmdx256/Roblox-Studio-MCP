import { CapabilityState, ExecutionContext, ProviderState, ProviderType, RiskLevel, SecurityLevel, VerificationMethod } from './types.js';
import { workflowLibrary } from '../capabilities/WorkflowLibrary.js';
import { commandDispatcher } from '../dispatcher/commandDispatcher.js';
export class WorkflowProvider {
    name = 'workflow-provider';
    type = ProviderType.WORKFLOW;
    async initialize() {
        console.error('[WorkflowProvider] Initialized Workflow Provider with registered templates.');
    }
    async discover() {
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
    async healthCheck() {
        return {
            status: CapabilityState.AVAILABLE,
            state: ProviderState.READY,
            message: 'Workflow provider is operational',
            capabilities: workflowLibrary.listTemplates().length,
            lastChecked: Date.now()
        };
    }
    async listTools() {
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
    async getCapabilities() {
        return this.discover();
    }
    async execute(action, params) {
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
export const workflowProvider = new WorkflowProvider();
//# sourceMappingURL=WorkflowProvider.js.map