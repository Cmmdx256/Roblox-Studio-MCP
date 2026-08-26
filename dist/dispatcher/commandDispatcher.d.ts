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
    private syncWithSharedDaemon;
    registerSession(info: Partial<StudioSessionInfo> & {
        sessionId: string;
    }): StudioSessionInfo;
    heartbeat(sessionId: string): boolean;
    isStudioConnected(): boolean;
    getSessionInfo(): StudioSessionInfo | null;
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