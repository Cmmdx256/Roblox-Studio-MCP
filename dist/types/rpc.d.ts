export declare enum ErrorCode {
    INVALID_ARGUMENT = "INVALID_ARGUMENT",
    INSTANCE_NOT_FOUND = "INSTANCE_NOT_FOUND",
    PROPERTY_NOT_FOUND = "PROPERTY_NOT_FOUND",
    PROPERTY_READ_ONLY = "PROPERTY_READ_ONLY",
    TYPE_COERCION_FAILED = "TYPE_COERCION_FAILED",
    SCRIPT_NOT_FOUND = "SCRIPT_NOT_FOUND",
    SCRIPT_NOT_EDITABLE = "SCRIPT_NOT_EDITABLE",
    SCRIPT_PATCH_FAILED = "SCRIPT_PATCH_FAILED",
    UNSUPPORTED_OPERATION = "UNSUPPORTED_OPERATION",
    UNSUPPORTED_BY_ROBLOX_PLUGIN_API = "UNSUPPORTED_BY_ROBLOX_PLUGIN_API",
    PERMISSION_DENIED = "PERMISSION_DENIED",
    PLAYTEST_NOT_ACTIVE = "PLAYTEST_NOT_ACTIVE",
    NO_STUDIO_CONNECTED = "NO_STUDIO_CONNECTED",
    TIMEOUT = "TIMEOUT",
    EXECUTION_FAILED = "EXECUTION_FAILED",
    INTERNAL_ERROR = "INTERNAL_ERROR"
}
export interface RPCError {
    code: ErrorCode | string;
    message: string;
    details?: Record<string, any>;
}
export interface RPCRequestPayload {
    id: string;
    action: string;
    params: Record<string, any>;
    timestamp: number;
    /** Session selected by the bridge when the command was queued. */
    sessionId?: string;
}
export interface RPCResponsePayload {
    id: string;
    success: boolean;
    result?: any;
    error?: RPCError;
    /** Must match the session that received the queued command. */
    sessionId?: string;
}
export interface StudioEvent {
    type: string;
    timestamp: number;
    data: Record<string, any>;
}
export interface StudioSessionInfo {
    sessionId: string;
    studioInstanceId?: string;
    pluginInstanceId?: string;
    connectedAt: number;
    lastSeenAt: number;
    studioVersion?: string;
    placeId?: number;
    placeName?: string;
    gameId?: number;
    mode?: 'Edit' | 'Run' | 'Play' | 'Unknown';
}
export interface StudioLogEntry {
    message: string;
    messageType: 'MessageOutput' | 'MessageInfo' | 'MessageWarning' | 'MessageError';
    timestamp: number;
    traceback?: string;
}
//# sourceMappingURL=rpc.d.ts.map