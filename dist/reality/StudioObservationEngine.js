/**
 * StudioObservationEngine.ts
 *
 * Performs targeted, cost-controlled observation of the live Roblox Studio DataModel.
 * Routes through OfficialRobloxMCPProvider then falls back to EmbeddedPluginProvider.
 * Never dumps the full DataModel — always uses targeted queries.
 */
import { commandDispatcher } from '../dispatcher/commandDispatcher.js';
import { studioStateGraph } from '../state/StudioStateGraph.js';
/** Observation cost tiers — controls how deep we traverse the DataModel. */
const COST_DEPTH = {
    CHEAP: 1,
    NORMAL: 2,
    DEEP: 4,
    FULL: 8
};
export class StudioObservationEngine {
    /**
     * Observe a specific path in the DataModel at the requested cost tier.
     * Returns null if Studio is disconnected.
     */
    async observe(path, cost = 'NORMAL') {
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
        }
        catch {
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
    async collectSnapshot(targets = [
        'Workspace',
        'ReplicatedStorage',
        'ServerScriptService',
        'StarterGui',
        'StarterPlayer',
        'SoundService',
        'Teams'
    ]) {
        const timestamp = Date.now();
        const instances = [];
        const errors = [];
        const warnings = [];
        for (const target of targets) {
            try {
                const obs = await this.observe(target, 'CHEAP');
                if (obs.result) {
                    instances.push(obs.result);
                }
                else {
                    warnings.push(`Could not observe: ${target} (status: ${obs.status})`);
                }
            }
            catch (err) {
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
    async verifyExists(path, expectedClassName) {
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
    async findByClass(rootPath, className) {
        const obs = await this.observe(rootPath, 'DEEP');
        if (!obs.result)
            return [];
        return this.collectByClass(obs.result, className, rootPath);
    }
    collectByClass(instance, className, currentPath) {
        const results = [];
        if (instance.className === className) {
            results.push({ path: currentPath, name: instance.name });
        }
        for (const child of instance.children ?? []) {
            results.push(...this.collectByClass(child, className, `${currentPath}.${child.name}`));
        }
        return results;
    }
    mapResponseToInstance(raw) {
        return {
            path: raw.path ?? '',
            className: raw.className ?? 'Unknown',
            name: raw.name ?? '',
            properties: raw.properties,
            attributes: raw.attributes,
            scriptSource: raw.source,
            children: Array.isArray(raw.children)
                ? raw.children.map((c) => this.mapResponseToInstance(c))
                : undefined
        };
    }
}
export const studioObservationEngine = new StudioObservationEngine();
//# sourceMappingURL=StudioObservationEngine.js.map