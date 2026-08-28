export type NodeType =
    | 'INSTANCE'
    | 'SCRIPT'
    | 'MODULE'
    | 'REMOTE_EVENT'
    | 'REMOTE_FUNCTION'
    | 'BINDABLE_EVENT'
    | 'TAG'
    | 'SYSTEM'
    | 'ASSET'
    | 'ANIMATION'
    | 'ACCEPTANCE_CRITERIA'
    | 'MECHANIC';

export type EdgeType =
    | 'PARENT_OF'
    | 'REQUIRES'
    | 'FIRE_SERVER'
    | 'FIRE_CLIENT'
    | 'INVOKE_SERVER'
    | 'MODIFIES'
    | 'DEPENDS_ON'
    | 'BELONGS_TO'
    | 'TAGGED_AS'
    | 'VERIFIED_BY'
    | 'AFFECTS'
    | 'IMPLEMENTS_AC';

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
export class ProjectKnowledgeGraph {
    private nodes: Map<string, GraphNode> = new Map();
    private edges: GraphEdge[] = [];

    public addNode(id: string, type: NodeType | string, metadata: Record<string, any> = {}): void {
        this.nodes.set(id, { id, type, metadata });
    }

    public addEdge(fromId: string, toId: string, type: EdgeType | string, metadata: Record<string, any> = {}): void {
        const exists = this.edges.some(e => e.fromId === fromId && e.toId === toId && e.type === type);
        if (!exists) {
            this.edges.push({ fromId, toId, type, metadata });
        }
    }

    public removeNode(id: string): void {
        this.nodes.delete(id);
        this.edges = this.edges.filter(e => e.fromId !== id && e.toId !== id);
    }

    public getNode(id: string): GraphNode | undefined {
        return this.nodes.get(id);
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

    public findDependencies(nodeId: string): Array<{ node: GraphNode; edge: GraphEdge }> {
        const dependencies: Array<{ node: GraphNode; edge: GraphEdge }> = [];
        const outEdges = this.edges.filter(e => e.fromId === nodeId);

        for (const edge of outEdges) {
            const targetNode = this.nodes.get(edge.toId);
            if (targetNode) {
                dependencies.push({ node: targetNode, edge });
            }
        }
        return dependencies;
    }

    public findDependents(nodeId: string): Array<{ node: GraphNode; edge: GraphEdge }> {
        const dependents: Array<{ node: GraphNode; edge: GraphEdge }> = [];
        const inEdges = this.edges.filter(e => e.toId === nodeId);

        for (const edge of inEdges) {
            const sourceNode = this.nodes.get(edge.fromId);
            if (sourceNode) {
                dependents.push({ node: sourceNode, edge });
            }
        }
        return dependents;
    }

    /**
     * Answers: "If I modify this script/instance, what systems, remotes, and modules are affected?"
     */
    public getImpactAnalysis(targetId: string): ImpactAnalysisResult {
        const dependents = this.findDependents(targetId);
        const directDependents = dependents.map(d => d.node.id);
        const affectedSystems = new Set<string>();
        const affectedRemotes = new Set<string>();
        const affectedAcceptanceCriteria = new Set<string>();

        for (const dep of dependents) {
            if (dep.node.type === 'SYSTEM') affectedSystems.add(dep.node.id);
            if (dep.node.type === 'REMOTE_EVENT' || dep.node.type === 'REMOTE_FUNCTION') affectedRemotes.add(dep.node.id);
            if (dep.node.type === 'ACCEPTANCE_CRITERIA') affectedAcceptanceCriteria.add(dep.node.id);

            // Transitive lookup (1 level deep)
            const secondLevel = this.findDependents(dep.node.id);
            for (const s of secondLevel) {
                if (s.node.type === 'SYSTEM') affectedSystems.add(s.node.id);
                if (s.node.type === 'REMOTE_EVENT' || s.node.type === 'REMOTE_FUNCTION') affectedRemotes.add(s.node.id);
            }
        }

        let risk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
        if (affectedSystems.size > 1 || affectedRemotes.size > 2 || directDependents.length > 5) {
            risk = 'HIGH';
        } else if (affectedSystems.size === 1 || directDependents.length > 1) {
            risk = 'MEDIUM';
        }

        return {
            targetId,
            directDependents,
            affectedSystems: Array.from(affectedSystems),
            affectedRemotes: Array.from(affectedRemotes),
            affectedAcceptanceCriteria: Array.from(affectedAcceptanceCriteria),
            estimatedRisk: risk
        };
    }

    public searchNodes(query: string, type?: NodeType): GraphNode[] {
        const lower = query.toLowerCase();
        return Array.from(this.nodes.values()).filter(node => {
            if (type && node.type !== type) return false;
            return node.id.toLowerCase().includes(lower) || JSON.stringify(node.metadata).toLowerCase().includes(lower);
        });
    }

    public getArchitectureSummary(): Record<string, any> {
        const systemNodes = Array.from(this.nodes.values()).filter(n => n.type === 'SYSTEM');
        return {
            systems: systemNodes.map(n => n.id),
            stats: this.getStats()
        };
    }

    public getSystemNodes(systemName: string): GraphNode[] {
        const belongsEdges = this.edges.filter(e => e.type === 'BELONGS_TO' && e.toId === systemName);
        return belongsEdges.map(e => this.nodes.get(e.fromId)).filter((n): n is GraphNode => n !== undefined);
    }

    public getStats(): { totalNodes: number; totalEdges: number; classCounts: Record<string, number> } {
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
