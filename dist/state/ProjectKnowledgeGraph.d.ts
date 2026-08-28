export type NodeType = 'INSTANCE' | 'SCRIPT' | 'MODULE' | 'REMOTE_EVENT' | 'REMOTE_FUNCTION' | 'BINDABLE_EVENT' | 'TAG' | 'SYSTEM' | 'ASSET' | 'ANIMATION' | 'ACCEPTANCE_CRITERIA' | 'MECHANIC';
export type EdgeType = 'PARENT_OF' | 'REQUIRES' | 'FIRE_SERVER' | 'FIRE_CLIENT' | 'INVOKE_SERVER' | 'MODIFIES' | 'DEPENDS_ON' | 'BELONGS_TO' | 'TAGGED_AS' | 'VERIFIED_BY' | 'AFFECTS' | 'IMPLEMENTS_AC';
export interface GraphNode {
    id: string;
    type: NodeType | string;
    metadata: Record<string, any>;
}
export interface GraphEdge {
    fromId: string;
    toId: string;
    type: EdgeType | string;
    metadata: Record<string, any>;
}
export interface ImpactAnalysisResult {
    targetId: string;
    directDependents: string[];
    affectedSystems: string[];
    affectedRemotes: string[];
    affectedAcceptanceCriteria: string[];
    estimatedRisk: 'LOW' | 'MEDIUM' | 'HIGH';
}
/**
 * In-memory relational knowledge graph representing the entire project structure.
 */
export declare class ProjectKnowledgeGraph {
    private nodes;
    private edges;
    addNode(id: string, type: NodeType | string, metadata?: Record<string, any>): void;
    addEdge(fromId: string, toId: string, type: EdgeType | string, metadata?: Record<string, any>): void;
    removeNode(id: string): void;
    getNode(id: string): GraphNode | undefined;
    buildFromScan(servicesScan: any, codeGraph: any): void;
    findDependencies(nodeId: string): Array<{
        node: GraphNode;
        edge: GraphEdge;
    }>;
    findDependents(nodeId: string): Array<{
        node: GraphNode;
        edge: GraphEdge;
    }>;
    /**
     * Answers: "If I modify this script/instance, what systems, remotes, and modules are affected?"
     */
    getImpactAnalysis(targetId: string): ImpactAnalysisResult;
    searchNodes(query: string, type?: NodeType): GraphNode[];
    getArchitectureSummary(): Record<string, any>;
    getSystemNodes(systemName: string): GraphNode[];
    getStats(): {
        totalNodes: number;
        totalEdges: number;
        classCounts: Record<string, number>;
    };
}
export declare const projectKnowledgeGraph: ProjectKnowledgeGraph;
//# sourceMappingURL=ProjectKnowledgeGraph.d.ts.map