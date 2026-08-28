/**
 * MultiplayerRealityEngine.ts
 *
 * Verifies multiplayer network architecture and security in Studio:
 * 1. Audits all RemoteEvent and RemoteFunction instances
 * 2. Checks server-authoritative state management (detecting client-trust exploits)
 * 3. Detects InvokeClient hanging anti-patterns (Server calling Client RemoteFunction)
 * 4. Transparently records multi-client test limitations as BLOCKED_BY_PLATFORM
 */
import { MultiplayerRealityReport } from './types.js';
export declare class MultiplayerRealityEngine {
    /**
     * Audit multiplayer network boundaries and remote safety across the project.
     */
    auditMultiplayer(): Promise<MultiplayerRealityReport>;
}
export declare const multiplayerRealityEngine: MultiplayerRealityEngine;
//# sourceMappingURL=MultiplayerRealityEngine.d.ts.map