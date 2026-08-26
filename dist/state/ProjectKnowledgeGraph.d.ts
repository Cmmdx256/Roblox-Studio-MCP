export type NodeType = 'INSTANCE' | 'SCRIPT' | 'MODULE' | 'REMOTE_EVENT' | 'REMOTE_FUNCTION' | 'BINDABLE_EVENT' | 'TAG' | 'SYSTEM' | 'ASSET' | 'ANIMATION';
export type EdgeType = 'PARENT_OF' | 'REQUIRES' | 'FIRE_SERVER' | 'FIRE_CLIENT' | 'INVOKE_SERVER' | 'MODIFIES' | 'DEPENDS_ON' | 'BELONGS_TO' | 'TAGGED_AS';
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
/**
 * In-memory relational knowledge graph representing the entire project structure.
 */
export declare class ProjectKnowledgeGraph {
    private nodes;
    private edges;
    addNode(id: string, type: string, metadata: Record<string, any>): void;
    addEdge(fromId: string, toId: string, type: string, metadata?: Record<string, any>): void;
    removeNode(id: string): void;
    buildFromScan(servicesScan: any, codeGraph: any): void;
    findDependencies(nodeId: string): Array<{
        node: GraphNode;
        edge: GraphEdge;
    }>;
    findDependents(nodeId: string): Array<{
        node: GraphNode;
        edge: GraphEdge;
    }>;
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