/**
 * RuntimeObservationEngine.ts
 *
 * Collects timestamped runtime observations during Play/Test mode.
 * Captures output logs, errors, player state, humanoid state, and remote activity.
 * Truthful — returns UNAVAILABLE/BLOCKED when Studio is offline; never fabricates data.
 */
import { RuntimeObservation, RuntimeLogEntry, VerificationStatus } from './types.js';
export declare class RuntimeObservationEngine {
    private logBuffer;
    private remoteActivity;
    /** Ingest a log entry from the Studio event stream. */
    ingestLog(type: RuntimeLogEntry['type'], message: string, source?: string): void;
    /** Ingest a remote event notification. */
    ingestRemoteActivity(remote: string, direction: 'SERVER' | 'CLIENT'): void;
    /**
     * Collect a snapshot of the current runtime state.
     * If Studio is in Play mode and connected, queries live player data.
     * Returns UNAVAILABLE/BLOCKED honestly when not in Play mode.
     */
    collectObservation(): Promise<RuntimeObservation>;
    /**
     * Collect a targeted gameplay variable snapshot via Luau execution.
     * The query is driven by the requirement — not any specific game.
     *
     * @param luauQuery Luau code that returns a table of variable name → value
     */
    collectGameplayVariables(luauQuery: string): Promise<{
        variables: Record<string, any>;
        status: VerificationStatus;
        error?: string;
    }>;
    /** Clear the log and remote activity buffers. */
    clearBuffers(): void;
    /** Return recent errors without clearing. */
    getRecentErrors(maxCount?: number): RuntimeLogEntry[];
}
export declare const runtimeObservationEngine: RuntimeObservationEngine;
//# sourceMappingURL=RuntimeObservationEngine.d.ts.map