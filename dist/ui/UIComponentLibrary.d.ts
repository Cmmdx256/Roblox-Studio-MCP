import { UIComponentType, UITheme } from './types.js';
export interface ComponentTemplate {
    type: UIComponentType;
    defaultSize: [number, number, number, number];
    defaultAnchorPoint: [number, number];
    buildInstances: (id: string, theme: UITheme, options?: any) => any[];
}
export declare class UIComponentLibrary {
    private templates;
    constructor();
    private registerDefaultTemplates;
    getTemplate(type: UIComponentType): ComponentTemplate | undefined;
    listTemplates(): UIComponentType[];
}
export declare const uiComponentLibrary: UIComponentLibrary;
//# sourceMappingURL=UIComponentLibrary.d.ts.map