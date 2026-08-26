/**
 * GameCreationEngine coordinates the end-to-end zero-to-one autonomous creation pipeline.
 */
export declare class GameCreationEngine {
    /**
     * Parses a natural language specification into structural game components.
     */
    parseSpecification(nlPrompt: string): Promise<{
        gdd: any;
        architecture: any;
        featureGraph: any;
        assetPlan: any;
        animationPlan: any;
        uiPlan: any;
        testingPlan: any;
    }>;
    /**
     * Generates a dependency-aware topological execution ordering.
     */
    planExecutionOrder(featureGraph: any): string[];
    /**
     * Executes the zero-to-one game pipeline based on a prompt.
     */
    createGameFromSpec(nlPrompt: string, progressCallback?: (step: string, status: string) => void): Promise<{
        success: boolean;
        stepsCompleted: string[];
        artifacts: any;
        report: string;
    }>;
}
export declare const gameCreationEngine: GameCreationEngine;
//# sourceMappingURL=GameCreationEngine.d.ts.map