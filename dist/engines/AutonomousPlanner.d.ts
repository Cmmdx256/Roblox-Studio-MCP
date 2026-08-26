export interface FeaturePlanNode {
    id: string;
    name: string;
    description: string;
    dependencies: string[];
    status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
    provider: string;
    verificationStrategy: string;
}
export interface AutonomousGamePlan {
    gameTitle: string;
    genre: string;
    theme: string;
    estimatedSteps: number;
    featureGraph: FeaturePlanNode[];
    createdAt: number;
}
export declare class AutonomousPlanner {
    /**
     * Parses natural language game specification into a structured, dependency-ordered feature graph.
     */
    planFromSpecification(spec: string): AutonomousGamePlan;
    /**
     * Adaptively recalculates the remaining plan if an environment assumption becomes invalid.
     */
    adaptPlan(plan: AutonomousGamePlan, failedNodeId: string, errorReason: string): AutonomousGamePlan;
}
export declare const autonomousPlanner: AutonomousPlanner;
//# sourceMappingURL=AutonomousPlanner.d.ts.map