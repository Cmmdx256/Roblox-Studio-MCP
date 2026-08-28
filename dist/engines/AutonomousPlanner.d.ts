export interface FeaturePlanNode {
    id: string;
    name: string;
    description: string;
    stage: number;
    dependencies: string[];
    status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'BLOCKED';
    provider: string;
    verificationStrategy: string;
    checkpointVerification?: boolean;
}
export interface AutonomousGamePlan {
    gameTitle: string;
    genre: string;
    theme: string;
    estimatedSteps: number;
    stages: Array<{
        stageNumber: number;
        name: string;
        nodeIds: string[];
    }>;
    featureGraph: FeaturePlanNode[];
    createdAt: number;
}
export declare class AutonomousPlanner {
    /**
     * Parses natural language game specification into a structured, dependency-ordered DAG feature graph.
     */
    planFromSpecification(spec: string): AutonomousGamePlan;
    /**
     * Returns parallel-executable batches of nodes based on completed prerequisites.
     */
    getNextExecutableNodes(plan: AutonomousGamePlan): FeaturePlanNode[];
    /**
     * Dynamically replans when a node fails or an assumption is invalidated.
     */
    adaptPlan(plan: AutonomousGamePlan, failedNodeId: string, errorReason: string): AutonomousGamePlan;
}
export declare const autonomousPlanner: AutonomousPlanner;
//# sourceMappingURL=AutonomousPlanner.d.ts.map