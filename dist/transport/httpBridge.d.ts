import { StudioSessionInfo } from '../types/rpc.js';
export interface ExtendedStudioSessionInfo extends StudioSessionInfo {
    studioInstanceId?: string;
    pluginInstanceId?: string;
    lastActive: number;
    /** Opaque per-handshake secret. Never expose this in bridge status output. */
    bridgeToken: string;
}
export declare class HttpBridgeServer {
    private app;
    private httpServer;
    private httpsServer;
    private sessions;
    private startTime;
    private installationId;
    constructor();
    private setupRoutes;
    private getPublicSessions;
    /**
     * A completed handshake is only an initial identity exchange.  It must not
     * keep a dead Studio instance eligible for execution forever.  Poll/event
     * traffic refreshes `lastSeenAt`; an expired plugin has to handshake again.
     */
    private purgeExpiredSessions;
    private toPublicSession;
    private tokenMatches;
    start(port?: number, host?: string): Promise<void>;
    stop(): Promise<void>;
}
export declare const httpBridgeServer: HttpBridgeServer;
//# sourceMappingURL=httpBridge.d.ts.map