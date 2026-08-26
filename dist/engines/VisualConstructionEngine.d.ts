import { ExecutionResult } from '../providers/types.js';
export interface ComponentSpecification {
    templateId: string;
    name: string;
    parentPath?: string;
    position?: [number, number, number];
    theme?: string;
    attributes?: Record<string, any>;
    customProperties?: Record<string, any>;
    includeBehaviorScript?: boolean;
}
export interface ComponentTemplate {
    id: string;
    name: string;
    category: 'Interactions' | 'Items & Gear' | 'World & Props' | 'Vehicles' | 'Characters' | 'UI & Visuals';
    description: string;
    hierarchySummary: string;
    requiredInstances: string[];
    defaultAttributes: Record<string, any>;
}
export declare class VisualConstructionEngine {
    private templates;
    constructor();
    private initializeTemplates;
    listTemplates(): ComponentTemplate[];
    getTemplate(id: string): ComponentTemplate | undefined;
    /**
     * Builds a structured, hierarchy-first Roblox component into Studio DataModel.
     */
    composeComponent(spec: ComponentSpecification): Promise<ExecutionResult>;
    /**
     * Builds standard Roblox project hierarchy folder structure.
     */
    scaffoldHierarchy(): Promise<ExecutionResult>;
    private generateConstructionScript;
}
export declare const visualConstructionEngine: VisualConstructionEngine;
//# sourceMappingURL=VisualConstructionEngine.d.ts.map