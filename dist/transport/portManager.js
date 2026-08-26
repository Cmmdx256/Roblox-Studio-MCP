import net from 'net';
export class PortManager {
    static async isPortAvailable(port, host = '127.0.0.1') {
        return new Promise((resolve) => {
            const server = net.createServer();
            server.unref();
            server.on('error', () => {
                resolve(false);
            });
            server.listen(port, host, () => {
                server.close(() => {
                    resolve(true);
                });
            });
        });
    }
    static async findAvailablePort(startPort = 38883, maxTries = 10, host = '127.0.0.1') {
        for (let i = 0; i < maxTries; i++) {
            const candidate = startPort + i;
            const available = await PortManager.isPortAvailable(candidate, host);
            if (available) {
                return candidate;
            }
        }
        return startPort;
    }
}
//# sourceMappingURL=portManager.js.map