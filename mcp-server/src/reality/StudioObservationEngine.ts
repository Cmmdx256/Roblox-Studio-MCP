/**
 * StudioObservationEngine.ts
 *
 * Performs targeted, cost-controlled observation of the live Roblox Studio DataModel.
 * Routes through OfficialRobloxMCPProvider then falls back to EmbeddedPluginProvider.
 * Never dumps the full DataModel — always uses targeted queries.
 */

import { commandDispatcher } from '../dispatcher/commandDispatcher.js';
import { studioStateGraph } from '../state/StudioStateGraph.js';
import {
    ObservedInstance,
    StudioSnapshot,
    TargetedObservation,
    VerificationStatus
} from './types.js';

/** Observation cost tiers — controls how deep we traverse the DataModel. */
const COST_DEPTH: Record<string, number> = {
    CHEAP:  1,
    NORMAL: 2,
    DEEP:   4,
    FULL:   8
};

export class StudioObservationEngine {
    /**
     * Observe a specific path in the DataModel at the requested cost tier.
     * Returns null if Studio is disconnected.
     */
    public async observe(
        path: string,
        cost: 'CHEAP' | 'NORMAL' | 'DEEP' | 'FULL' = 'NORMAL'
    ): Promise<TargetedObservation> {
        const observedAt = Date.now();
        const depth = COST_DEPTH[cost] ?? 2;

        try {
            // Try to get live data via the command dispatcher (Studio HTTP bridge)
            const response = await commandDispatcher.executeCommand('studio_inspect', {
                path,
                depth,
                includeProperties: cost !== 'CHEAP',
                includeAttributes: cost === 'DEEP' || cost === 'FULL',
                includeScriptSource: cost === 'FULL'
            });

            if (response && response.instance) {
                const instance = this.mapResponseToInstance(response.instance);
                return {
                    path,
                    depth: depth > 2 ? 'DEEP' : 'SHALLOW',
                    result: instance,
                    status: 'VERIFIED',
                    observedAt,
                    cost
                };
            }
        } catch {
            // Fall through to state graph cache
        }

        // Fallback: consult the in-memory state graph cache
        const cached = studioStateGraph.getNode(path);
        if (cached) {
            return {
                path,
                depth: 'SHALLOW',
                result: {
                    path,
                    className: cached.className || 'Unknown',
                    name: cached.name || path.split('.').pop() || path,
                    properties: cached.properties || {}
                },
                status: 'PARTIAL',
                observedAt,
                cost
            };
        }

        return {
            path,
            depth: 'SHALLOW',
            result: null,
            status: 'UNAVAILABLE',
            observedAt,
            cost
        };
    }

    /**
     * Collect a broad snapshot of key Studio service roots.
     * Uses CHEAP observations to minimize latency.
     */
    public async collectSnapshot(
        targets: string[] = [
            'Workspace',
            'ReplicatedStorage',
            'ServerScriptService',
            'StarterGui',
            'StarterPlayer',
            'SoundService',
            'Teams'
        ]
    ): Promise<StudioSnapshot> {
        const timestamp = Date.now();
        const instances: ObservedInstance[] = [];
        const errors: string[] = [];
        const warnings: string[] = [];

        for (const target of targets) {
            try {
                const obs = await this.observe(target, 'CHEAP');
                if (obs.result) {
                    instances.push(obs.result);
                } else {
                    warnings.push(`Could not observe: ${target} (status: ${obs.status})`);
                }
            } catch (err: any) {
                errors.push(`Error observing ${target}: ${err?.message ?? String(err)}`);
            }
        }

        // Pull counts from state graph
        const allNodes = studioStateGraph.getAllNodes ? studioStateGraph.getAllNodes() : [];
        const scriptCount = allNodes.filter((n) => n.className === 'Script' || n.className === 'ModuleScript' || n.className === 'LocalScript').length;
        const remoteEventCount = allNodes.filter((n) => n.className === 'RemoteEvent').length;
        const remoteFunctionCount = allNodes.filter((n) => n.className === 'RemoteFunction').length;
        const uiRoots = instances.filter(i => i.path === 'StarterGui');

        return {
            timestamp,
            instances,
            scriptCount,
            remoteEventCount,
            remoteFunctionCount,
            uiRoots,
            errors,
            warnings
        };
    }

    /**
     * Verify that a specific instance exists with expected className.
     */
    public async verifyExists(
        path: string,
        expectedClassName?: string
    ): Promise<{ exists: boolean; status: VerificationStatus; className?: string }> {
        const obs = await this.observe(path, 'CHEAP');
        if (obs.result) {
            const classMatch = !expectedClassName || obs.result.className === expectedClassName;
            return {
                exists: true,
                status: classMatch ? 'VERIFIED' : 'PARTIAL',
                className: obs.result.className
            };
        }
        return {
            exists: false,
            status: obs.status === 'UNAVAILABLE' ? 'BLOCKED' : 'FAILED'
        };
    }

    /**
     * Find all instances of a given className under a root path.
     */
    public async findByClass(
        rootPath: string,
        className: string
    ): Promise<Array<{ path: string; name: string }>> {
        const obs = await this.observe(rootPath, 'DEEP');
        if (!obs.result) return [];
        return this.collectByClass(obs.result, className, rootPath);
    }

    private collectByClass(
        instance: ObservedInstance,
        className: string,
        currentPath: string
    ): Array<{ path: string; name: string }> {
        const results: Array<{ path: string; name: string }> = [];
        if (instance.className === className) {
            results.push({ path: currentPath, name: instance.name });
        }
        for (const child of instance.children ?? []) {
            results.push(...this.collectByClass(child, className, `${currentPath}.${child.name}`));
        }
        return results;
    }

    private mapResponseToInstance(raw: any): ObservedInstance {
        return {
            path: raw.path ?? '',
            className: raw.className ?? 'Unknown',
            name: raw.name ?? '',
            properties: raw.properties,
            attributes: raw.attributes,
            scriptSource: raw.source,
            children: Array.isArray(raw.children)
                ? raw.children.map((c: any) => this.mapResponseToInstance(c))
                : undefined
        };
    }
}

export const studioObservationEngine = new StudioObservationEngine();
