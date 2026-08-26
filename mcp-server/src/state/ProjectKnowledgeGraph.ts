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
export class ProjectKnowledgeGraph {
    private nodes: Map<string, GraphNode> = new Map();
    private edges: GraphEdge[] = [];

    public addNode(id: string, type: string, metadata: Record<string, any>): void {
        this.nodes.set(id, { id, type, metadata });
    }

    public addEdge(fromId: string, toId: string, type: string, metadata: Record<string, any> = {}): void {
        this.edges.push({ fromId, toId, type, metadata });
    }

    public removeNode(id: string): void {
        this.nodes.delete(id);
        this.edges = this.edges.filter(e => e.fromId !== id && e.toId !== id);
    }

    public buildFromScan(servicesScan: any, codeGraph: any): void {
        if (servicesScan && Array.isArray(servicesScan)) {
            servicesScan.forEach((item: any) => {
                if (item.id) {
                    this.addNode(item.id, item.type || 'INSTANCE', item.metadata || {});
                }
            });
        }
        
        if (codeGraph && Array.isArray(codeGraph.edges)) {
            codeGraph.edges.forEach((edge: any) => {
                this.addEdge(edge.fromId, edge.toId, edge.type, edge.metadata || {});
            });
        }
    }

    public findDependencies(nodeId: string): Array<{ node: GraphNode, edge: GraphEdge }> {
        const dependencies: Array<{ node: GraphNode, edge: GraphEdge }> = [];
        const outEdges = this.edges.filter(e => e.fromId === nodeId);
        
        for (const edge of outEdges) {
            const targetNode = this.nodes.get(edge.toId);
            if (targetNode) {
                dependencies.push({ node: targetNode, edge });
            }
        }
        return dependencies;
    }

    public findDependents(nodeId: string): Array<{ node: GraphNode, edge: GraphEdge }> {
        const dependents: Array<{ node: GraphNode, edge: GraphEdge }> = [];
        const inEdges = this.edges.filter(e => e.toId === nodeId);
        
        for (const edge of inEdges) {
            const sourceNode = this.nodes.get(edge.fromId);
            if (sourceNode) {
                dependents.push({ node: sourceNode, edge });
            }
        }
        return dependents;
    }

    public getArchitectureSummary(): Record<string, any> {
        const systemNodes = Array.from(this.nodes.values()).filter(n => n.type === 'SYSTEM');
        return {
            systems: systemNodes.map(n => n.id)
        };
    }

    public getSystemNodes(systemName: string): GraphNode[] {
        const belongsEdges = this.edges.filter(e => e.type === 'BELONGS_TO' && e.toId === systemName);
        return belongsEdges.map(e => this.nodes.get(e.fromId)).filter((n): n is GraphNode => n !== undefined);
    }

    public getStats(): { totalNodes: number, totalEdges: number, classCounts: Record<string, number> } {
        const classCounts: Record<string, number> = {};
        
        for (const node of this.nodes.values()) {
            classCounts[node.type] = (classCounts[node.type] || 0) + 1;
        }
        
        return {
            totalNodes: this.nodes.size,
            totalEdges: this.edges.length,
            classCounts
        };
    }
}

export const projectKnowledgeGraph = new ProjectKnowledgeGraph();
