/**
 * In-memory relational knowledge graph representing the entire project structure.
 */
export class ProjectKnowledgeGraph {
    nodes = new Map();
    edges = [];
    addNode(id, type, metadata) {
        this.nodes.set(id, { id, type, metadata });
    }
    addEdge(fromId, toId, type, metadata = {}) {
        this.edges.push({ fromId, toId, type, metadata });
    }
    removeNode(id) {
        this.nodes.delete(id);
        this.edges = this.edges.filter(e => e.fromId !== id && e.toId !== id);
    }
    buildFromScan(servicesScan, codeGraph) {
        if (servicesScan && Array.isArray(servicesScan)) {
            servicesScan.forEach((item) => {
                if (item.id) {
                    this.addNode(item.id, item.type || 'INSTANCE', item.metadata || {});
                }
            });
        }
        if (codeGraph && Array.isArray(codeGraph.edges)) {
            codeGraph.edges.forEach((edge) => {
                this.addEdge(edge.fromId, edge.toId, edge.type, edge.metadata || {});
            });
        }
    }
    findDependencies(nodeId) {
        const dependencies = [];
        const outEdges = this.edges.filter(e => e.fromId === nodeId);
        for (const edge of outEdges) {
            const targetNode = this.nodes.get(edge.toId);
            if (targetNode) {
                dependencies.push({ node: targetNode, edge });
            }
        }
        return dependencies;
    }
    findDependents(nodeId) {
        const dependents = [];
        const inEdges = this.edges.filter(e => e.toId === nodeId);
        for (const edge of inEdges) {
            const sourceNode = this.nodes.get(edge.fromId);
            if (sourceNode) {
                dependents.push({ node: sourceNode, edge });
            }
        }
        return dependents;
    }
    getArchitectureSummary() {
        const systemNodes = Array.from(this.nodes.values()).filter(n => n.type === 'SYSTEM');
        return {
            systems: systemNodes.map(n => n.id)
        };
    }
    getSystemNodes(systemName) {
        const belongsEdges = this.edges.filter(e => e.type === 'BELONGS_TO' && e.toId === systemName);
        return belongsEdges.map(e => this.nodes.get(e.fromId)).filter((n) => n !== undefined);
    }
    getStats() {
        const classCounts = {};
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
//# sourceMappingURL=ProjectKnowledgeGraph.js.map