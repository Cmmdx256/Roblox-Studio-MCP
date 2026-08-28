/**
 * Universal Roblox AI Studio - Core Provider Types
 * Defines the type system for providers, capability states, operating modes, and execution models.
 */
export declare enum ProviderType {
    EMBEDDED_PLUGIN = "EMBEDDED_PLUGIN",
    OFFICIAL_ROBLOX_MCP = "OFFICIAL_ROBLOX_MCP",
    LUAU = "LUAU",
    WORKFLOW = "WORKFLOW",
    ANIMATION = "ANIMATION",
    MODELING = "MODELING",
    ASSET = "ASSET",
    TESTING = "TESTING",
    DIAGNOSTICS = "DIAGNOSTICS",
    OBSERVATION = "OBSERVATION",
    DESIGN = "DESIGN"
}
/**
 * 10 Canonical Capability States
 * Note: UNAVAILABLE is the FINAL state only when direct tools, external providers,
 * and primitive composition paths have all been completely exhausted.
 */
export declare enum CapabilityState {
    DISCOVERED = "DISCOVERED",
    AVAILABLE = "AVAILABLE",
    COMPOSABLE = "COMPOSABLE",
    EXECUTABLE = "EXECUTABLE",
    VERIFIED = "VERIFIED",
    UNVERIFIED = "UNVERIFIED",
    CONTEXT_DEPENDENT = "CONTEXT_DEPENDENT",
    RESTRICTED = "RESTRICTED",
    UNSUPPORTED = "UNSUPPORTED",
    UNAVAILABLE = "UNAVAILABLE"
}
/** Backward compatibility alias */
export type AvailabilityStatus = CapabilityState;
export declare const AvailabilityStatus: {
    readonly OFFICIAL_ONLY: "OFFICIAL_ONLY";
    readonly PLUGIN_ONLY: "PLUGIN_ONLY";
    readonly DEGRADED: "DEGRADED";
    readonly DISCOVERED: CapabilityState.DISCOVERED;
    readonly AVAILABLE: CapabilityState.AVAILABLE;
    readonly COMPOSABLE: CapabilityState.COMPOSABLE;
    readonly EXECUTABLE: CapabilityState.EXECUTABLE;
    readonly VERIFIED: CapabilityState.VERIFIED;
    readonly UNVERIFIED: CapabilityState.UNVERIFIED;
    readonly CONTEXT_DEPENDENT: CapabilityState.CONTEXT_DEPENDENT;
    readonly RESTRICTED: CapabilityState.RESTRICTED;
    readonly UNSUPPORTED: CapabilityState.UNSUPPORTED;
    readonly UNAVAILABLE: CapabilityState.UNAVAILABLE;
};
export declare enum OperatingMode {
    CHAT = "CHAT",
    OBSERVE = "OBSERVE",
    PLAN = "PLAN",
    BUILD = "BUILD",
    PLAYTEST = "PLAYTEST",
    VISUAL = "VISUAL",
    DEBUG = "DEBUG",
    OPTIMIZE = "OPTIMIZE",
    VERIFY = "VERIFY",
    AUTONOMOUS = "AUTONOMOUS"
}
export declare enum ObservationCost {
    CHEAP = "CHEAP",
    NORMAL = "NORMAL",
    DEEP = "DEEP",
    VISUAL = "VISUAL",
    FULL = "FULL"
}
export declare enum SecurityLevel {
    SAFE = "SAFE",
    ELEVATED = "ELEVATED",
    DANGEROUS = "DANGEROUS",
    NONE = "None",
    PLUGIN_SECURITY = "PluginSecurity",
    LOCAL_USER_SECURITY = "LocalUserSecurity",
    ROBLOX_SCRIPT_SECURITY = "RobloxScriptSecurity",
    ROBLOX_SECURITY = "RobloxSecurity",
    STUDIO_SECURITY = "StudioSecurity"
}
export declare enum RobloxSecurityContext {
    GAME = "Game",
    ROBLOX_GAME = "RobloxGame",
    ROBLOX_SCRIPT = "RobloxScript",
    STUDIO = "Studio",
    ROBLOX = "Roblox",
    LOCAL_USER = "LocalUser",
    PLAYTEST = "Playtest"
}
export declare enum SandboxCapability {
    ASSET_READ = "AssetRead",
    ASSET_CREATE_UPDATE = "AssetCreateUpdate",
    ASSET_MANAGEMENT = "AssetManagement",
    DATA_STORE = "DataStore",
    SERVER_COMMUNICATION = "ServerCommunication",
    TELEPORT = "Teleport",
    SOCIAL = "Social",
    CONSEQUENCES = "Consequences",
    SENSITIVE_INPUT = "SensitiveInput",
    CAPTURE = "Capture",
    AVATAR_APPEARANCE = "AvatarAppearance",
    AVATAR_BEHAVIOR = "AvatarBehavior",
    AUDIO = "Audio",
    CSG = "CSG",
    UI = "UI",
    REMOTE_EVENT = "RemoteEvent",
    CHAT = "Chat",
    CAPABILITY_CONTROL = "CapabilityControl"
}
export declare enum RestrictedCategory {
    ROBLOX_SECURITY = "RobloxSecurity",
    ROBLOX_SCRIPT_SECURITY = "RobloxScriptSecurity",
    INTERNAL_STUDIO_APIS = "Internal Studio APIs",
    INTERNAL_ENGINE_APIS = "Internal Engine APIs",
    INTERNAL_PLUGIN_APIS = "Internal Plugin APIs",
    PROTECTED_DEBUG_APIS = "Protected Debug APIs",
    PROTECTED_STUDIO_CONTROL_APIS = "Protected Studio Control APIs",
    MISSING_SANDBOX_CAPABILITIES = "Missing Sandbox Capabilities",
    RESTRICTED_ASSET_APIS = "Restricted Asset APIs",
    RESTRICTED_HTTP_APIS = "Restricted HTTP APIs",
    INTERNAL_NETWORK_APIS = "Internal Network APIs",
    PROVIDER_SPECIFIC_RESTRICTED = "Provider-specific restricted capabilities"
}
export declare enum ExecutionContext {
    STUDIO = "STUDIO",
    PLAYTEST = "PLAYTEST",
    EDIT = "EDIT",
    PLAY_CLIENT = "PlayClient",
    PLAY_SERVER = "PlayServer",
    ANY = "Any"
}
export declare enum RiskLevel {
    READ_ONLY = "READ_ONLY",
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL"
}
export declare enum VerificationMethod {
    NONE = "NONE",
    READ_BACK = "READ_BACK",
    PROPERTY_CHECK = "PROPERTY_CHECK",
    EXISTENCE_CHECK = "EXISTENCE_CHECK",
    CONSOLE_CHECK = "CONSOLE_CHECK",
    SCREENSHOT = "SCREENSHOT",
    COMPOSITE = "COMPOSITE",
    EVIDENCE = "EVIDENCE",
    CONFIRMATION = "CONFIRMATION"
}
export declare enum ProviderState {
    IDLE = "IDLE",
    STARTING = "STARTING",
    CONNECTING = "CONNECTING",
    READY = "READY",
    DEGRADED = "DEGRADED",
    UNHEALTHY = "UNHEALTHY",
    STOPPING = "STOPPING",
    FAILED = "FAILED",
    ERROR = "ERROR"
}
export declare enum FailureCode {
    CAPABILITY_NOT_DISCOVERED = "CAPABILITY_NOT_DISCOVERED",
    CAPABILITY_UNVERIFIED = "CAPABILITY_UNVERIFIED",
    CAPABILITY_RESTRICTED = "CAPABILITY_RESTRICTED",
    PROVIDER_UNAVAILABLE = "PROVIDER_UNAVAILABLE",
    EXECUTION_FAILED = "EXECUTION_FAILED",
    FAILED_VERIFICATION = "FAILED_VERIFICATION",
    STALE_STATE = "STALE_STATE",
    INVALID_TARGET = "INVALID_TARGET",
    TIMEOUT = "TIMEOUT",
    SCHEMA_MISMATCH = "SCHEMA_MISMATCH",
    ROBLOX_ERROR = "ROBLOX_ERROR",
    MCP_ERROR = "MCP_ERROR"
}
export interface ProviderCapability {
    name: string;
    description: string;
    category?: string;
    provider: ProviderType | string;
    availability: CapabilityState | string;
    securityLevel: SecurityLevel;
    executionContext: ExecutionContext;
    riskLevel: RiskLevel;
    verificationMethod: VerificationMethod;
    confidence?: number;
    qualityScore?: number;
    schema?: any;
    inputSchema?: any;
    outputSchema?: any;
    fallbackProvider?: ProviderType | string;
    aliases?: string[];
    dependencies?: string[];
    isComposable?: boolean;
    isCompiled?: boolean;
}
export interface Evidence {
    type: 'property_snapshot' | 'script_diff' | 'instance_path' | 'console_output' | 'screenshot' | 'test_result' | 'state_diff' | 'custom' | string;
    content: string;
    label?: string;
    timestamp?: number;
    data?: Record<string, any>;
}
export interface Change {
    type: 'create' | 'delete' | 'modify' | 'move' | 'rename' | string;
    details: string;
    target?: string;
    property?: string;
    before?: any;
    after?: any;
}
export interface ExecutionResult {
    status?: 'SUCCESS' | 'ERROR' | 'FAILED_VERIFICATION' | 'PARTIAL' | 'BLOCKED' | 'UNVERIFIED';
    success?: boolean;
    code?: FailureCode | string;
    message?: string;
    data?: any;
    diagnostic?: any;
    evidence?: Evidence[];
    changes?: Change[];
    duration?: number;
    verified?: boolean;
    provider?: string;
    tool?: string;
    warnings?: string[];
    errors?: string[];
}
export interface HealthStatus {
    status: CapabilityState | string;
    state?: ProviderState;
    message?: string;
    capabilities?: number;
    lastChecked?: number;
    details?: any;
}
export interface ProviderToolDefinition {
    name: string;
    description: string;
    category?: string;
    provider: string;
    schema?: any;
    inputSchema?: any;
    riskLevel?: RiskLevel;
    verificationMethod?: VerificationMethod;
}
//# sourceMappingURL=types.d.ts.map