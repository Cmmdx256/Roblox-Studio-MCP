/**
 * StudioObservationEngine.ts
 *
 * Performs targeted, cost-controlled observation of the live Roblox Studio DataModel.
 * Routes through OfficialRobloxMCPProvider then falls back to EmbeddedPluginProvider.
 * Never dumps the full DataModel — always uses targeted queries.
 */
import { StudioSnapshot, TargetedObservation, VerificationStatus } from './types.js';
export declare class StudioObservationEngine {
    /**
     * Observe a specific path in the DataModel at the requested cost tier.
     * Returns null if Studio is disconnected.
     */
    observe(path: string, cost?: 'CHEAP' | 'NORMAL' | 'DEEP' | 'FULL'): Promise<TargetedObservation>;
    /**
     * Collect a broad snapshot of key Studio service roots.
     * Uses CHEAP observations to minimize latency.
     */
    collectSnapshot(targets?: string[]): Promise<StudioSnapshot>;
    /**
     * Verify that a specific instance exists with expected className.
     */
    verifyExists(path: string, expectedClassName?: string): Promise<{
        exists: boolean;
        status: VerificationStatus;
        className?: string;
    }>;
    /**
     * Find all instances of a given className under a root path.
     */
    findByClass(rootPath: string, className: string): Promise<Array<{
        path: string;
        name: string;
    }>>;
    private collectByClass;
    private mapResponseToInstance;
}
export declare const studioObservationEngine: StudioObservationEngine;
//# sourceMappingURL=StudioObservationEngine.d.ts.map