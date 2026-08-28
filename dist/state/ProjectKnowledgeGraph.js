/**
 * In-memory relational knowledge graph representing the entire project structure.
 */
export class ProjectKnowledgeGraph {
    nodes = new Map();
    edges = [];
    addNode(id, type, metadata = {}) {
        this.nodes.set(id, { id, type, metadata });
    }
    addEdge(fromId, toId, type, metadata = {}) {
        const exists = this.edges.some(e => e.fromId === fromId && e.toId === toId && e.type === type);
        if (!exists) {
            this.edges.push({ fromId, toId, type, metadata });
        }
    }
    removeNode(id) {
        this.nodes.delete(id);
        this.edges = this.edges.filter(e => e.fromId !== id && e.toId !== id);
    }
    getNode(id) {
        return this.nodes.get(id);
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
    /**
     * Answers: "If I modify this script/instance, what systems, remotes, and modules are affected?"
     */
    getImpactAnalysis(targetId) {
        const dependents = this.findDependents(targetId);
        const directDependents = dependents.map(d => d.node.id);
        const affectedSystems = new Set();
        const affectedRemotes = new Set();
        const affectedAcceptanceCriteria = new Set();
        for (const dep of dependents) {
            if (dep.node.type === 'SYSTEM')
                affectedSystems.add(dep.node.id);
            if (dep.node.type === 'REMOTE_EVENT' || dep.node.type === 'REMOTE_FUNCTION')
                affectedRemotes.add(dep.node.id);
            if (dep.node.type === 'ACCEPTANCE_CRITERIA')
                affectedAcceptanceCriteria.add(dep.node.id);
            // Transitive lookup (1 level deep)
            const secondLevel = this.findDependents(dep.node.id);
            for (const s of secondLevel) {
                if (s.node.type === 'SYSTEM')
                    affectedSystems.add(s.node.id);
                if (s.node.type === 'REMOTE_EVENT' || s.node.type === 'REMOTE_FUNCTION')
                    affectedRemotes.add(s.node.id);
            }
        }
        let risk = 'LOW';
        if (affectedSystems.size > 1 || affectedRemotes.size > 2 || directDependents.length > 5) {
            risk = 'HIGH';
        }
        else if (affectedSystems.size === 1 || directDependents.length > 1) {
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
    searchNodes(query, type) {
        const lower = query.toLowerCase();
        return Array.from(this.nodes.values()).filter(node => {
            if (type && node.type !== type)
                return false;
            return node.id.toLowerCase().includes(lower) || JSON.stringify(node.metadata).toLowerCase().includes(lower);
        });
    }
    getArchitectureSummary() {
        const systemNodes = Array.from(this.nodes.values()).filter(n => n.type === 'SYSTEM');
        return {
            systems: systemNodes.map(n => n.id),
            stats: this.getStats()
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