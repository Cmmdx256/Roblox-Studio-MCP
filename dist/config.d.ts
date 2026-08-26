export interface BridgeConfig {
    port: number;
    host: string;
    commandTimeoutMs: number;
    pollTimeoutMs: number;
    sessionExpiryMs: number;
    maxLogBufferSize: number;
    debug: boolean;
}
export declare const DEFAULT_CONFIG: BridgeConfig;
//# sourceMappingURL=config.d.ts.map