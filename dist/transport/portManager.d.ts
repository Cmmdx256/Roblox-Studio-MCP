export declare class PortManager {
    static isPortAvailable(port: number, host?: string): Promise<boolean>;
    static findAvailablePort(startPort?: number, maxTries?: number, host?: string): Promise<number>;
}
//# sourceMappingURL=portManager.d.ts.map