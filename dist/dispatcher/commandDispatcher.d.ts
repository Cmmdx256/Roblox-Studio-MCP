import { RPCRequestPayload, RPCResponsePayload, StudioEvent, StudioLogEntry, StudioSessionInfo } from '../types/rpc.js';
export declare class CommandDispatcher {
    private activeSession;
    private remoteActiveSession;
    private pendingQueue;
    private inFlightCommands;
    private logBuffer;
    private errorBuffer;
    private eventListeners;
    private pollWaiters;
    constructor();
    /**
     * Test processes must never discover or forward commands to a creator's
     * real Studio daemon.  Unit/integration tests can still register their own
     * in-memory session explicitly, but remote bridge discovery is disabled.
     */
    private isRemoteProxyDisabled;
    private syncWithSharedDaemon;
    registerSession(info: Partial<StudioSessionInfo> & {
        sessionId: string;
    }): StudioSessionInfo;
    heartbeat(sessionId: string): boolean;
    isStudioConnected(): boolean;
    getSessionInfo(): StudioSessionInfo | null;
    /**
     * Refreshes the bridge-owned session for secondary MCP processes.  A process
     * that did not start the HTTP listener has no synchronous local session, so
     * callers that need a truthful connection decision must await this first.
     */
    refreshSessionInfo(): Promise<StudioSessionInfo | null>;
    clearSession(): void;
    getActiveSession(): StudioSessionInfo | null;
    executeCommand<T = any>(action: string, params?: Record<string, any>): Promise<T>;
    private executeLocal;
    fetchPendingCommands(sessionId: string): Promise<RPCRequestPayload[]>;
    handleResponse(response: RPCResponsePayload): boolean;
    ingestEvents(events: StudioEvent[]): void;
    onEvent(callback: (event: StudioEvent) => void): () => void;
    getRecentLogs(limit?: number, filterType?: string): StudioLogEntry[];
    getRecentErrors(limit?: number): StudioLogEntry[];
    clearLogs(): void;
    private checkSessionLiveness;
}
export declare const commandDispatcher: CommandDispatcher;
//# sourceMappingURL=commandDispatcher.d.ts.map