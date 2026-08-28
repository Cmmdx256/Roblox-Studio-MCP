/**
 * DataModelSnapshotEngine.ts  (P4 — Phase 6)
 *
 * Captures Before/After DataModel snapshots and computes structural diffs.
 * Used to verify that planned operations actually occurred in Studio.
 *
 * RULE 0: A generated plan does NOT prove implementation.
 *         Only a confirmed snapshot diff proves an instance was created/modified.
 */
export interface DataModelNode {
    path: string;
    name: string;
    className: string;
    parentPath: string | null;
    properties?: Record<string, any>;
    scriptSource?: string;
    attributes?: Record<string, any>;
    /** Stable within a live Studio process; used only to classify rename/reparent diffs. */
    runtimeId?: string;
    childCount: number;
}
export interface DataModelSnapshot {
    snapshotId: string;
    capturedAt: number;
    studioSessionId: string;
    isRealStudioSnapshot: boolean;
    blockedReason?: string;
    nodes: DataModelNode[];
    nodeCount: number;
    treeHash?: string;
}
export interface DataModelDiff {
    snapshotA: string;
    snapshotB: string;
    createdInstances: string[];
    deletedInstances: string[];
    modifiedInstances: string[];
    renamedInstances: Array<{
        path: string;
        oldName: string;
        newName: string;
    }>;
    reparentedInstances: Array<{
        path: string;
        oldParent: string;
        newParent: string;
    }>;
    scriptChanges: Array<{
        path: string;
        changed: boolean;
    }>;
    propertyChanges: Array<{
        path: string;
        property: string;
        oldValue: any;
        newValue: any;
    }>;
    attributeChanges: Array<{
        path: string;
        attribute: string;
        oldValue: any;
        newValue: any;
    }>;
    isEmpty: boolean;
}
export declare class DataModelSnapshotEngine {
    private snapshots;
    /**
     * Capture a real DataModel snapshot from Studio.
     * Returns a BLOCKED snapshot if Studio is not connected.
     */
    capture(label?: string): Promise<DataModelSnapshot>;
    /**
     * Compute structural diff between two snapshots.
     */
    diff(snapshotAId: string, snapshotBId: string): DataModelDiff;
    getSnapshot(snapshotId: string): DataModelSnapshot | undefined;
    private hashNodes;
    private emptyDiff;
    clear(): void;
}
export declare const dataModelSnapshotEngine: DataModelSnapshotEngine;
//# sourceMappingURL=DataModelSnapshotEngine.d.ts.map