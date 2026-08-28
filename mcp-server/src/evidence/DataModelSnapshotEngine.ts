/**
 * DataModelSnapshotEngine.ts  (P4 — Phase 6)
 *
 * Captures Before/After DataModel snapshots and computes structural diffs.
 * Used to verify that planned operations actually occurred in Studio.
 *
 * RULE 0: A generated plan does NOT prove implementation.
 *         Only a confirmed snapshot diff proves an instance was created/modified.
 */

import { v4 as uuidv4 } from 'uuid';
import { commandDispatcher } from '../dispatcher/commandDispatcher.js';
import { studioSessionManager } from '../session/StudioSessionManager.js';

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
    snapshotA: string; // snapshotId before
    snapshotB: string; // snapshotId after
    createdInstances: string[];
    deletedInstances: string[];
    modifiedInstances: string[];
    renamedInstances: Array<{ path: string; oldName: string; newName: string }>;
    reparentedInstances: Array<{ path: string; oldParent: string; newParent: string }>;
    scriptChanges: Array<{ path: string; changed: boolean }>;
    propertyChanges: Array<{ path: string; property: string; oldValue: any; newValue: any }>;
    attributeChanges: Array<{ path: string; attribute: string; oldValue: any; newValue: any }>;
    isEmpty: boolean;
}

const SNAPSHOT_LUAU = `
local results = {}
local function scan(inst, depth)
    if depth > 8 then return end
    local props = {}
    pcall(function()
        props.Archivable = inst.Archivable
        if inst:IsA("BasePart") then
            props.Anchored = inst.Anchored
            props.Size = tostring(inst.Size)
        end
    end)
    local attrs = {}
    pcall(function()
        attrs = inst:GetAttributes()
    end)
    local source = nil
    if inst:IsA("LuaSourceContainer") then
        pcall(function() source = inst.Source end)
    end
    local runtimeId = nil
    pcall(function() runtimeId = inst:GetDebugId(0) end)
    results[#results + 1] = {
        path = inst:GetFullName(),
        name = inst.Name,
        className = inst.ClassName,
        parentPath = inst.Parent and inst.Parent:GetFullName() or nil,
        properties = props,
        attributes = attrs,
        scriptSource = source,
        runtimeId = runtimeId,
        childCount = #inst:GetChildren()
    }
    for _, child in ipairs(inst:GetChildren()) do
        scan(child, depth + 1)
    end
end
for _, svc in ipairs({
    game:GetService("ServerScriptService"),
    game:GetService("ReplicatedStorage"),
    game:GetService("StarterGui"),
    game:GetService("StarterPlayer"),
    workspace
}) do
    scan(svc, 0)
end
return results
`;

export class DataModelSnapshotEngine {
    private snapshots: Map<string, DataModelSnapshot> = new Map();

    /**
     * Capture a real DataModel snapshot from Studio.
     * Returns a BLOCKED snapshot if Studio is not connected.
     */
    public async capture(label = 'snapshot'): Promise<DataModelSnapshot> {
        const session = studioSessionManager.getSession();
        const snapshotId = `${label}_${uuidv4().slice(0, 8)}`;

        if (!session.dataModelAvailable || !session.bridgeConnected) {
            const blocked: DataModelSnapshot = {
                snapshotId,
                capturedAt: Date.now(),
                studioSessionId: session.sessionId,
                isRealStudioSnapshot: false,
                blockedReason: 'BLOCKED_BY_PLATFORM: DataModel not accessible. Studio offline or plugin disconnected.',
                nodes: [],
                nodeCount: 0,
            };
            this.snapshots.set(snapshotId, blocked);
            return blocked;
        }

        try {
            const response = await commandDispatcher.executeCommand('execute_luau', {
                code: SNAPSHOT_LUAU
            });

            const rawNodes: any[] = response?.result ?? [];
            const nodes: DataModelNode[] = rawNodes.map((n: any) => ({
                path: n.path ?? '',
                name: n.name ?? '',
                className: n.className ?? 'Unknown',
                parentPath: n.parentPath ?? null,
                properties: n.properties ?? {},
                attributes: n.attributes ?? {},
                scriptSource: n.scriptSource,
                runtimeId: n.runtimeId,
                childCount: n.childCount ?? 0,
            }));

            const snapshot: DataModelSnapshot = {
                snapshotId,
                capturedAt: Date.now(),
                studioSessionId: session.sessionId,
                isRealStudioSnapshot: true,
                nodes,
                nodeCount: nodes.length,
                treeHash: this.hashNodes(nodes),
            };

            this.snapshots.set(snapshotId, snapshot);
            return snapshot;
        } catch (err: any) {
            const failed: DataModelSnapshot = {
                snapshotId,
                capturedAt: Date.now(),
                studioSessionId: session.sessionId,
                isRealStudioSnapshot: false,
                blockedReason: `Snapshot capture failed: ${err?.message ?? 'Unknown error'}`,
                nodes: [],
                nodeCount: 0,
            };
            this.snapshots.set(snapshotId, failed);
            return failed;
        }
    }

    /**
     * Compute structural diff between two snapshots.
     */
    public diff(snapshotAId: string, snapshotBId: string): DataModelDiff {
        const a = this.snapshots.get(snapshotAId);
        const b = this.snapshots.get(snapshotBId);

        if (!a || !b) {
            return this.emptyDiff(snapshotAId, snapshotBId);
        }

        if (!a.isRealStudioSnapshot || !b.isRealStudioSnapshot) return this.emptyDiff(snapshotAId, snapshotBId);
        const aByPath = new Map<string, DataModelNode>(a.nodes.map(n => [n.path, n]));
        const bByPath = new Map<string, DataModelNode>(b.nodes.map(n => [n.path, n]));
        const aByRuntimeId = new Map(a.nodes.filter(n => n.runtimeId).map(n => [n.runtimeId!, n]));
        const bByRuntimeId = new Map(b.nodes.filter(n => n.runtimeId).map(n => [n.runtimeId!, n]));

        const createdInstances: string[] = [];
        const deletedInstances: string[] = [];
        const modifiedInstances: string[] = [];
        const scriptChanges: DataModelDiff['scriptChanges'] = [];
        const propertyChanges: DataModelDiff['propertyChanges'] = [];
        const attributeChanges: DataModelDiff['attributeChanges'] = [];
        const renamedInstances: DataModelDiff['renamedInstances'] = [];
        const reparentedInstances: DataModelDiff['reparentedInstances'] = [];

        // Detect created
        for (const [path] of bByPath) {
            if (!aByPath.has(path)) createdInstances.push(path);
        }

        // Detect deleted
        for (const [path] of aByPath) {
            if (!bByPath.has(path)) deletedInstances.push(path);
        }

        // Detect modified
        for (const [path, bNode] of bByPath) {
            const aNode = aByPath.get(path);
            if (!aNode) continue;
            if (bNode.scriptSource !== aNode.scriptSource) {
                scriptChanges.push({ path, changed: true });
                modifiedInstances.push(path);
            }
            const propertyNames = new Set([...Object.keys(aNode.properties ?? {}), ...Object.keys(bNode.properties ?? {})]);
            for (const property of propertyNames) {
                const oldValue = aNode.properties?.[property];
                const newValue = bNode.properties?.[property];
                if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                    propertyChanges.push({ path, property, oldValue, newValue });
                    if (!modifiedInstances.includes(path)) modifiedInstances.push(path);
                }
            }
            const attributeNames = new Set([...Object.keys(aNode.attributes ?? {}), ...Object.keys(bNode.attributes ?? {})]);
            for (const attribute of attributeNames) {
                const oldValue = aNode.attributes?.[attribute];
                const newValue = bNode.attributes?.[attribute];
                if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                    attributeChanges.push({ path, attribute, oldValue, newValue });
                    if (!modifiedInstances.includes(path)) modifiedInstances.push(path);
                }
            }
        }

        for (const [runtimeId, before] of aByRuntimeId) {
            const after = bByRuntimeId.get(runtimeId);
            if (!after) continue;
            if (before.name !== after.name) renamedInstances.push({ path: after.path, oldName: before.name, newName: after.name });
            if (before.parentPath !== after.parentPath) reparentedInstances.push({ path: after.path, oldParent: before.parentPath ?? '', newParent: after.parentPath ?? '' });
        }

        const result: DataModelDiff = {
            snapshotA: snapshotAId,
            snapshotB: snapshotBId,
            createdInstances,
            deletedInstances,
            modifiedInstances,
            renamedInstances,
            reparentedInstances,
            scriptChanges,
            propertyChanges,
            attributeChanges,
            isEmpty: createdInstances.length === 0 && deletedInstances.length === 0 && modifiedInstances.length === 0 && renamedInstances.length === 0 && reparentedInstances.length === 0,
        };

        return result;
    }

    public getSnapshot(snapshotId: string): DataModelSnapshot | undefined {
        return this.snapshots.get(snapshotId);
    }

    private hashNodes(nodes: DataModelNode[]): string {
        const str = nodes.map(n => `${n.path}:${n.className}`).sort().join('|');
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        return hash.toString(16);
    }

    private emptyDiff(a: string, b: string): DataModelDiff {
        return {
            snapshotA: a,
            snapshotB: b,
            createdInstances: [],
            deletedInstances: [],
            modifiedInstances: [],
            renamedInstances: [],
            reparentedInstances: [],
            scriptChanges: [],
            propertyChanges: [],
            attributeChanges: [],
            isEmpty: true,
        };
    }

    public clear(): void {
        this.snapshots.clear();
    }
}

export const dataModelSnapshotEngine = new DataModelSnapshotEngine();
