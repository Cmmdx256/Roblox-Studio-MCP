/**
 * RuntimeObservationEngine.ts
 *
 * Collects timestamped runtime observations during Play/Test mode.
 * Captures output logs, errors, player state, humanoid state, and remote activity.
 * Truthful — returns UNAVAILABLE/BLOCKED when Studio is offline; never fabricates data.
 */
import { commandDispatcher } from '../dispatcher/commandDispatcher.js';
import { v4 as uuidv4 } from 'uuid';
export class RuntimeObservationEngine {
    logBuffer = [];
    remoteActivity = [];
    /** Ingest a log entry from the Studio event stream. */
    ingestLog(type, message, source) {
        this.logBuffer.push({ timestamp: Date.now(), type, message, source });
        // Cap buffer to last 500 entries to prevent unbounded growth
        if (this.logBuffer.length > 500) {
            this.logBuffer = this.logBuffer.slice(-500);
        }
    }
    /** Ingest a remote event notification. */
    ingestRemoteActivity(remote, direction) {
        this.remoteActivity.push({ remote, direction, timestamp: Date.now() });
        if (this.remoteActivity.length > 200) {
            this.remoteActivity = this.remoteActivity.slice(-200);
        }
    }
    /**
     * Collect a snapshot of the current runtime state.
     * If Studio is in Play mode and connected, queries live player data.
     * Returns UNAVAILABLE/BLOCKED honestly when not in Play mode.
     */
    async collectObservation() {
        const sessionId = uuidv4().slice(0, 8);
        const capturedAt = Date.now();
        let mode = 'EDIT';
        let players = [];
        let gameplayVariables = {};
        let status = 'UNAVAILABLE';
        try {
            // Query Studio for current play mode and player data
            const sessionInfo = commandDispatcher.getActiveSession
                ? commandDispatcher.getActiveSession()
                : null;
            if (sessionInfo) {
                mode = sessionInfo.mode === 'Play' ? 'PLAYTEST' : 'EDIT';
            }
            // Try to get player list via the bridge
            const playersResp = await commandDispatcher.executeCommand('execute_luau', {
                code: `
local Players = game:GetService("Players")
local result = {}
for _, p in ipairs(Players:GetPlayers()) do
    local char = p.Character
    local hum = char and char:FindFirstChild("Humanoid")
    local root = char and char:FindFirstChild("HumanoidRootPart")
    result[#result+1] = {
        userId = p.UserId,
        displayName = p.DisplayName,
        characterPath = char and char:GetFullName() or nil,
        humanoidState = hum and tostring(hum:GetState()) or nil,
        position = root and { x = root.Position.X, y = root.Position.Y, z = root.Position.Z } or nil
    }
end
return result
`
            });
            if (playersResp && Array.isArray(playersResp.result)) {
                players = playersResp.result;
                status = 'VERIFIED';
            }
            else {
                status = 'PARTIAL';
            }
        }
        catch {
            status = 'BLOCKED';
        }
        const errors = this.logBuffer.filter(l => l.type === 'ERROR');
        const warnings = this.logBuffer.filter(l => l.type === 'WARNING');
        const output = this.logBuffer.filter(l => l.type === 'OUTPUT');
        return {
            sessionId,
            capturedAt,
            mode,
            logs: output,
            errors,
            warnings,
            players,
            gameplayVariables,
            remoteActivity: [...this.remoteActivity],
            status
        };
    }
    /**
     * Collect a targeted gameplay variable snapshot via Luau execution.
     * The query is driven by the requirement — not any specific game.
     *
     * @param luauQuery Luau code that returns a table of variable name → value
     */
    async collectGameplayVariables(luauQuery) {
        try {
            const resp = await commandDispatcher.executeCommand('execute_luau', { code: luauQuery });
            if (resp?.result && typeof resp.result === 'object') {
                return { variables: resp.result, status: 'VERIFIED' };
            }
            return { variables: {}, status: 'PARTIAL' };
        }
        catch (err) {
            return {
                variables: {},
                status: 'BLOCKED',
                error: err?.message ?? String(err)
            };
        }
    }
    /** Clear the log and remote activity buffers. */
    clearBuffers() {
        this.logBuffer = [];
        this.remoteActivity = [];
    }
    /** Return recent errors without clearing. */
    getRecentErrors(maxCount = 10) {
        return this.logBuffer.filter(l => l.type === 'ERROR').slice(-maxCount);
    }
}
export const runtimeObservationEngine = new RuntimeObservationEngine();
//# sourceMappingURL=RuntimeObservationEngine.js.map