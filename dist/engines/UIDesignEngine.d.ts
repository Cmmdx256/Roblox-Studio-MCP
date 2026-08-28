import { UIScreenSpec, UITheme, CompiledUIInstance } from '../ui/types.js';
import { ExecutionResult } from '../providers/types.js';
export declare class UIDesignEngine {
    /**
     * Retrieves or creates a design theme.
     */
    getTheme(themeId?: string): UITheme;
    listThemes(): UITheme[];
    /**
     * Compiles an intermediate UI specification into structured Roblox DataModel instances.
     * Follows the Structure -> Style -> Behavior -> Animation pipeline.
     */
    compileScreenSpec(spec: UIScreenSpec): CompiledUIInstance;
    private compileComponent;
    /**
     * Executes the compiled UI specification in Roblox Studio and verifies outcome with evidence.
     */
    /**
     * Executes the compiled UI specification in Roblox Studio and verifies outcome with evidence.
     * Recursively instantiates all child containers, components, corners, strokes, and layouts.
     */
    createScreen(spec: UIScreenSpec): Promise<ExecutionResult>;
    private instantiateChildren;
    /**
     * Performs a design critique on an existing UI tree, evaluating visual hierarchy, spacing, contrast, and alignment.
     */
    critiqueUI(rootPath: string, properties: Record<string, any>): {
        score: number;
        passed: boolean;
        recommendations: string[];
        issues: string[];
    };
}
export declare const uiDesignEngine: UIDesignEngine;
//# sourceMappingURL=UIDesignEngine.d.ts.map