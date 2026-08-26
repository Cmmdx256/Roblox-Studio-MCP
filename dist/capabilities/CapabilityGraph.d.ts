import { CapabilityEdge, CapabilityEdgeType, CapabilityNode, CapabilityNodeType } from './types.js';
import { CapabilityState } from '../providers/types.js';
export declare class CapabilityGraph {
    private nodes;
    private edges;
    private adjacency;
    private reverseAdjacency;
    constructor();
    addNode(node: CapabilityNode): void;
    addEdge(fromId: string, toId: string, type: CapabilityEdgeType, weight?: number, metadata?: Record<string, any>): void;
    getNode(id: string): CapabilityNode | undefined;
    getAllNodes(): CapabilityNode[];
    getAllEdges(): CapabilityEdge[];
    getOutgoingEdges(nodeId: string): CapabilityEdge[];
    getIncomingEdges(nodeId: string): CapabilityEdge[];
    findNodesByType(type: CapabilityNodeType): CapabilityNode[];
    findNodesByState(state: CapabilityState): CapabilityNode[];
    getComposingPrimitives(capabilityId: string): CapabilityNode[];
    getVerificationChain(nodeId: string): CapabilityNode[];
    updateNodeState(nodeId: string, state: CapabilityState, confidence?: number): void;
    private initializeBaselinePrimitives;
}
export declare const capabilityGraph: CapabilityGraph;
//# sourceMappingURL=CapabilityGraph.d.ts.map