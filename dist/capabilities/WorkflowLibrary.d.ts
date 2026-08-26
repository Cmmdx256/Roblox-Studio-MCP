import { CompiledCapability } from './types.js';
export interface WorkflowTemplate {
    id: string;
    name: string;
    category: 'world_building' | 'scripting' | 'animation' | 'assets' | 'ui' | 'testing' | 'debugging' | 'optimization' | 'publishing';
    description: string;
    parametersSchema: Record<string, any>;
    compiledWorkflow: CompiledCapability;
    verified: boolean;
    usageCount: number;
}
export declare class WorkflowLibrary {
    private templates;
    constructor();
    registerTemplate(template: WorkflowTemplate): void;
    getTemplate(id: string): WorkflowTemplate | undefined;
    listTemplates(category?: string): WorkflowTemplate[];
    findBestMatch(intent: string): WorkflowTemplate | undefined;
    private initializeDefaultTemplates;
}
export declare const workflowLibrary: WorkflowLibrary;
//# sourceMappingURL=WorkflowLibrary.d.ts.map