import { CapabilityState } from '../providers/types.js';
export class CapabilityGraph {
    nodes = new Map();
    edges = [];
    adjacency = new Map(); // fromId -> edges
    reverseAdjacency = new Map(); // toId -> edges
    constructor() {
        this.initializeBaselinePrimitives();
    }
    addNode(node) {
        this.nodes.set(node.id, node);
        if (!this.adjacency.has(node.id)) {
            this.adjacency.set(node.id, []);
        }
        if (!this.reverseAdjacency.has(node.id)) {
            this.reverseAdjacency.set(node.id, []);
        }
    }
    addEdge(fromId, toId, type, weight = 1.0, metadata) {
        const edgeId = `${fromId}->${toId}:${type}`;
        const edge = { id: edgeId, fromId, toId, type, weight, metadata };
        // Remove existing duplicate if any
        this.edges = this.edges.filter(e => e.id !== edgeId);
        this.edges.push(edge);
        const outList = this.adjacency.get(fromId) || [];
        this.adjacency.set(fromId, [...outList.filter(e => e.id !== edgeId), edge]);
        const inList = this.reverseAdjacency.get(toId) || [];
        this.reverseAdjacency.set(toId, [...inList.filter(e => e.id !== edgeId), edge]);
    }
    getNode(id) {
        return this.nodes.get(id);
    }
    getAllNodes() {
        return Array.from(this.nodes.values());
    }
    getAllEdges() {
        return [...this.edges];
    }
    getOutgoingEdges(nodeId) {
        return this.adjacency.get(nodeId) || [];
    }
    getIncomingEdges(nodeId) {
        return this.reverseAdjacency.get(nodeId) || [];
    }
    findNodesByType(type) {
        return this.getAllNodes().filter(n => n.type === type);
    }
    findNodesByState(state) {
        return this.getAllNodes().filter(n => n.state === state);
    }
    getComposingPrimitives(capabilityId) {
        const outEdges = this.getOutgoingEdges(capabilityId).filter(e => e.type === 'composes' || e.type === 'requires');
        return outEdges.map(e => this.getNode(e.toId)).filter((n) => n !== undefined);
    }
    getVerificationChain(nodeId) {
        const outEdges = this.getOutgoingEdges(nodeId).filter(e => e.type === 'verifies');
        return outEdges.map(e => this.getNode(e.toId)).filter((n) => n !== undefined);
    }
    updateNodeState(nodeId, state, confidence) {
        const node = this.nodes.get(nodeId);
        if (node) {
            node.state = state;
            if (confidence !== undefined) {
                node.confidence = confidence;
            }
        }
    }
    initializeBaselinePrimitives() {
        // Core Studio Primitives
        const primitives = [
            { id: 'primitive:instance_crud', name: 'Instance Manipulation', desc: 'Create, delete, reparent, rename instances', provider: 'embedded-plugin' },
            { id: 'primitive:property_read_write', name: 'Property Reflection', desc: 'Get and set properties with Luau type coercion', provider: 'embedded-plugin' },
            { id: 'primitive:attribute_read_write', name: 'Attribute Reflection', desc: 'Get and set custom attributes', provider: 'embedded-plugin' },
            { id: 'primitive:script_source_edit', name: 'Script Source Editing', desc: 'Get, set, and patch Luau script source', provider: 'embedded-plugin' },
            { id: 'primitive:luau_execution', name: 'Luau Dynamic Execution', desc: 'Execute arbitrary Luau code in Studio edit or play mode', provider: 'official-roblox-mcp' },
            { id: 'primitive:screen_capture', name: 'Visual Screen Capture', desc: 'Capture high-resolution Studio viewport frames', provider: 'official-roblox-mcp' },
            { id: 'primitive:player_input', name: 'Player Input Simulation', desc: 'Simulate character navigation, mouse, and keyboard input', provider: 'official-roblox-mcp' },
            { id: 'primitive:mesh_generation', name: 'AI 3D Mesh Generation', desc: 'Generate 3D meshes using Roblox AI pipeline', provider: 'official-roblox-mcp' },
            { id: 'primitive:material_generation', name: 'AI Material Generation', desc: 'Generate PBR materials using Roblox AI pipeline', provider: 'official-roblox-mcp' },
            { id: 'primitive:asset_search_insert', name: 'Asset Search & Insertion', desc: 'Search and insert Roblox marketplace assets', provider: 'official-roblox-mcp' },
            { id: 'primitive:terrain_voxel', name: 'Terrain Voxel Manipulation', desc: 'Fill block, ball, and clear voxel terrain', provider: 'embedded-plugin' },
            { id: 'primitive:output_log_stream', name: 'Output Console Stream', desc: 'Capture console logs, warnings, and runtime errors', provider: 'embedded-plugin' }
        ];
        for (const p of primitives) {
            this.addNode({
                id: p.id,
                name: p.name,
                type: 'primitive',
                provider: p.provider,
                description: p.desc,
                state: CapabilityState.AVAILABLE,
                confidence: 1.0,
                qualityScore: 95
            });
        }
    }
}
export const capabilityGraph = new CapabilityGraph();
//# sourceMappingURL=CapabilityGraph.js.map