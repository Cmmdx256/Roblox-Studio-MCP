import { StudioSessionInfo } from '../types/rpc.js';
export interface ExtendedStudioSessionInfo extends StudioSessionInfo {
    studioInstanceId?: string;
    pluginInstanceId?: string;
    lastActive: number;
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
    start(port?: number, host?: string): Promise<void>;
    stop(): Promise<void>;
}
export declare const httpBridgeServer: HttpBridgeServer;
//# sourceMappingURL=httpBridge.d.ts.map