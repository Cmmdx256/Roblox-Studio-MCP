import net from 'net';

export class PortManager {
  public static async isPortAvailable(port: number, host = '127.0.0.1'): Promise<boolean> {
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

  public static async findAvailablePort(startPort = 38883, maxTries = 10, host = '127.0.0.1'): Promise<number> {
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
