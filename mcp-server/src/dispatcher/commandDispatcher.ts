import { v4 as uuidv4 } from 'uuid';
import {
  ErrorCode,
  RPCError,
  RPCRequestPayload,
  RPCResponsePayload,
  StudioEvent,
  StudioLogEntry,
  StudioSessionInfo,
} from '../types/rpc.js';
import { DEFAULT_CONFIG } from '../config.js';

interface PendingCommand {
  request: RPCRequestPayload;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
  timer: NodeJS.Timeout;
}

export class CommandDispatcher {
  private activeSession: StudioSessionInfo | null = null;
  private remoteActiveSession: StudioSessionInfo | null = null;
  private pendingQueue: RPCRequestPayload[] = [];
  private inFlightCommands = new Map<string, PendingCommand>();
  private logBuffer: StudioLogEntry[] = [];
  private errorBuffer: StudioLogEntry[] = [];
  private eventListeners: Array<(event: StudioEvent) => void> = [];
  private pollWaiters: Array<(commands: RPCRequestPayload[]) => void> = [];

  constructor() {
    // Clean up stale sessions
    setInterval(() => this.checkSessionLiveness(), 10000);
    // Background sync with shared daemon if this process is not the primary listener
    setInterval(() => this.syncWithSharedDaemon(), 2000);
    this.syncWithSharedDaemon();
  }

  private async syncWithSharedDaemon(): Promise<void> {
    if (this.activeSession) return; // This process is already the primary listener
    try {
      const res = await fetch(`http://${DEFAULT_CONFIG.host}:${DEFAULT_CONFIG.port}/health`);
      if (res.ok) {
        const data: any = await res.json();
        if (data && Array.isArray(data.activeSessions) && data.activeSessions.length > 0) {
          const s = data.activeSessions[0];
          this.remoteActiveSession = {
            sessionId: s.sessionId,
            connectedAt: s.connectedAt || Date.now(),
            lastSeenAt: Date.now(),
            studioVersion: s.studioVersion || 'Unknown',
            placeId: s.placeId || 0,
            placeName: s.placeName || 'Local Place',
            gameId: s.gameId || 0,
            mode: s.mode || 'Edit',
          };
          return;
        }
      }
    } catch {
      // Benign if daemon is starting
    }
    this.remoteActiveSession = null;
  }

  public registerSession(info: Partial<StudioSessionInfo> & { sessionId: string }): StudioSessionInfo {
    const now = Date.now();
    this.activeSession = {
      sessionId: info.sessionId,
      connectedAt: this.activeSession?.sessionId === info.sessionId ? this.activeSession.connectedAt : now,
      lastSeenAt: now,
      studioVersion: info.studioVersion || this.activeSession?.studioVersion,
      placeId: info.placeId || this.activeSession?.placeId,
      placeName: info.placeName || this.activeSession?.placeName,
      gameId: info.gameId || this.activeSession?.gameId,
      mode: info.mode || this.activeSession?.mode || 'Edit',
    };
    return this.activeSession;
  }

  public heartbeat(sessionId: string): boolean {
    if (this.activeSession && this.activeSession.sessionId === sessionId) {
      this.activeSession.lastSeenAt = Date.now();
      return true;
    }
    return false;
  }

  public isStudioConnected(): boolean {
    if (this.activeSession) {
      const isAlive = Date.now() - this.activeSession.lastSeenAt < DEFAULT_CONFIG.sessionExpiryMs;
      if (isAlive) return true;
    }
    if (this.remoteActiveSession) {
      const isAlive = Date.now() - this.remoteActiveSession.lastSeenAt < DEFAULT_CONFIG.sessionExpiryMs;
      if (isAlive) return true;
    }
    return false;
  }

  public getSessionInfo(): StudioSessionInfo | null {
    if (this.isStudioConnected()) {
      return this.activeSession || this.remoteActiveSession;
    }
    return null;
  }

  public getActiveSession(): StudioSessionInfo | null {
    return this.activeSession || this.remoteActiveSession;
  }

  public async executeCommand<T = any>(action: string, params: Record<string, any> = {}): Promise<T> {
    // 1. If this process owns the active session, execute directly in-memory
    if (this.activeSession && (Date.now() - this.activeSession.lastSeenAt < DEFAULT_CONFIG.sessionExpiryMs)) {
      return this.executeLocal<T>(action, params);
    }

    // 2. If running as a secondary process, forward to the shared bridge daemon
    try {
      const statusRes = await fetch(`http://${DEFAULT_CONFIG.host}:${DEFAULT_CONFIG.port}/health`);
      if (statusRes.ok) {
        const healthData: any = await statusRes.json();
        if (healthData && Array.isArray(healthData.activeSessions) && healthData.activeSessions.length > 0) {
          const execRes = await fetch(`http://${DEFAULT_CONFIG.host}:${DEFAULT_CONFIG.port}/api/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, params }),
          });
          const execData: any = await execRes.json();
          if (execData.success) {
            return execData.result as T;
          } else {
            throw execData.error || {
              code: ErrorCode.EXECUTION_FAILED,
              message: 'Command execution failed on bridge daemon.',
            };
          }
        }
      }
    } catch (err: any) {
      if (err?.code && err?.message) throw err;
    }

    throw {
      code: ErrorCode.NO_STUDIO_CONNECTED,
      message: 'No active Roblox Studio session connected. Please ensure Roblox Studio is open with the Universal MCP Plugin running.',
      details: {
        hint: '1. Open Roblox Studio. 2. Enable "Allow HTTP Requests" in Game Settings. 3. Ensure the Universal MCP Plugin is activated.',
      },
    } as RPCError;
  }

  private executeLocal<T = any>(action: string, params: Record<string, any>): Promise<T> {
    const id = `cmd_${uuidv4().replace(/-/g, '').slice(0, 12)}`;
    const request: RPCRequestPayload = {
      id,
      action,
      params,
      timestamp: Date.now(),
    };

    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        if (this.inFlightCommands.has(id)) {
          this.inFlightCommands.delete(id);
          reject({
            code: ErrorCode.TIMEOUT,
            message: `Command '${action}' timed out after ${DEFAULT_CONFIG.commandTimeoutMs}ms waiting for Roblox Studio response.`,
            details: { action, id },
          } as RPCError);
        }
      }, DEFAULT_CONFIG.commandTimeoutMs);

      this.inFlightCommands.set(id, {
        request,
        resolve,
        reject,
        timer,
      });

      // If a poller is currently waiting, dispatch immediately
      if (this.pollWaiters.length > 0) {
        const waiter = this.pollWaiters.shift()!;
        waiter([request]);
      } else {
        this.pendingQueue.push(request);
      }
    });
  }

  public fetchPendingCommands(sessionId: string): Promise<RPCRequestPayload[]> {
    this.heartbeat(sessionId);

    // If there are already queued commands, return them immediately
    if (this.pendingQueue.length > 0) {
      const commands = [...this.pendingQueue];
      this.pendingQueue = [];
      return Promise.resolve(commands);
    }

    // Otherwise, wait for commands or timeout
    return new Promise((resolve) => {
      const waiter = (commands: RPCRequestPayload[]) => {
        clearTimeout(timeoutHandle);
        resolve(commands);
      };

      const timeoutHandle = setTimeout(() => {
        const index = this.pollWaiters.indexOf(waiter);
        if (index !== -1) {
          this.pollWaiters.splice(index, 1);
        }
        resolve([]);
      }, DEFAULT_CONFIG.pollTimeoutMs);

      this.pollWaiters.push(waiter);
    });
  }

  public handleResponse(response: RPCResponsePayload): boolean {
    const { id, success, result, error } = response;
    const pending = this.inFlightCommands.get(id);

    if (!pending) {
      return false;
    }

    clearTimeout(pending.timer);
    this.inFlightCommands.delete(id);

    if (success) {
      pending.resolve(result);
    } else {
      pending.reject(
        error || {
          code: ErrorCode.EXECUTION_FAILED,
          message: 'Command execution failed in Roblox Studio with unknown error.',
        }
      );
    }

    return true;
  }

  public ingestEvents(events: StudioEvent[]): void {
    const now = Date.now();
    for (const ev of events) {
      if (ev.type === 'log') {
        const entry: StudioLogEntry = {
          message: ev.data.message || '',
          messageType: ev.data.messageType || 'MessageOutput',
          timestamp: ev.timestamp || now,
          traceback: ev.data.traceback,
        };
        this.logBuffer.push(entry);
        if (this.logBuffer.length > DEFAULT_CONFIG.maxLogBufferSize) {
          this.logBuffer.shift();
        }

        if (entry.messageType === 'MessageError' || entry.traceback) {
          this.errorBuffer.push(entry);
          if (this.errorBuffer.length > DEFAULT_CONFIG.maxLogBufferSize) {
            this.errorBuffer.shift();
          }
        }
      }

      // Notify external listeners
      for (const listener of this.eventListeners) {
        try {
          listener(ev);
        } catch {
          // Ignore listener errors
        }
      }
    }
  }

  public onEvent(callback: (event: StudioEvent) => void): () => void {
    this.eventListeners.push(callback);
    return () => {
      const idx = this.eventListeners.indexOf(callback);
      if (idx !== -1) this.eventListeners.splice(idx, 1);
    };
  }

  public getRecentLogs(limit = 50, filterType?: string): StudioLogEntry[] {
    let filtered = this.logBuffer;
    if (filterType) {
      filtered = filtered.filter((l) => l.messageType === filterType);
    }
    return filtered.slice(-limit);
  }

  public getRecentErrors(limit = 50): StudioLogEntry[] {
    return this.errorBuffer.slice(-limit);
  }

  public clearLogs(): void {
    this.logBuffer = [];
    this.errorBuffer = [];
  }

  private checkSessionLiveness(): void {
    if (this.activeSession && !this.isStudioConnected()) {
      if (DEFAULT_CONFIG.debug) {
        console.error(`[MCP Dispatcher] Session ${this.activeSession.sessionId} expired due to inactivity.`);
      }
      this.activeSession = null;
      // Reject any pending in-flight commands
      for (const [id, pending] of this.inFlightCommands.entries()) {
        clearTimeout(pending.timer);
        pending.reject({
          code: ErrorCode.NO_STUDIO_CONNECTED,
          message: 'Roblox Studio session disconnected while waiting for command execution.',
        });
      }
      this.inFlightCommands.clear();
      this.pendingQueue = [];
    }
  }
}

export const commandDispatcher = new CommandDispatcher();
