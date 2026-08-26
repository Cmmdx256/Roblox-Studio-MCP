/**
 * Universal Roblox AI Studio - Core Provider Types
 * Defines the type system for providers, capability states, operating modes, and execution models.
 */
export var ProviderType;
(function (ProviderType) {
    ProviderType["EMBEDDED_PLUGIN"] = "EMBEDDED_PLUGIN";
    ProviderType["OFFICIAL_ROBLOX_MCP"] = "OFFICIAL_ROBLOX_MCP";
    ProviderType["LUAU"] = "LUAU";
    ProviderType["WORKFLOW"] = "WORKFLOW";
    ProviderType["ANIMATION"] = "ANIMATION";
    ProviderType["MODELING"] = "MODELING";
    ProviderType["ASSET"] = "ASSET";
    ProviderType["TESTING"] = "TESTING";
    ProviderType["DIAGNOSTICS"] = "DIAGNOSTICS";
    ProviderType["OBSERVATION"] = "OBSERVATION";
    ProviderType["DESIGN"] = "DESIGN";
})(ProviderType || (ProviderType = {}));
/**
 * 10 Canonical Capability States
 * Note: UNAVAILABLE is the FINAL state only when direct tools, external providers,
 * and primitive composition paths have all been completely exhausted.
 */
export var CapabilityState;
(function (CapabilityState) {
    CapabilityState["DISCOVERED"] = "DISCOVERED";
    CapabilityState["AVAILABLE"] = "AVAILABLE";
    CapabilityState["COMPOSABLE"] = "COMPOSABLE";
    CapabilityState["EXECUTABLE"] = "EXECUTABLE";
    CapabilityState["VERIFIED"] = "VERIFIED";
    CapabilityState["UNVERIFIED"] = "UNVERIFIED";
    CapabilityState["CONTEXT_DEPENDENT"] = "CONTEXT_DEPENDENT";
    CapabilityState["RESTRICTED"] = "RESTRICTED";
    CapabilityState["UNSUPPORTED"] = "UNSUPPORTED";
    CapabilityState["UNAVAILABLE"] = "UNAVAILABLE";
})(CapabilityState || (CapabilityState = {}));
export const AvailabilityStatus = {
    ...CapabilityState,
    OFFICIAL_ONLY: 'OFFICIAL_ONLY',
    PLUGIN_ONLY: 'PLUGIN_ONLY',
    DEGRADED: 'DEGRADED'
};
export var OperatingMode;
(function (OperatingMode) {
    OperatingMode["CHAT"] = "CHAT";
    OperatingMode["OBSERVE"] = "OBSERVE";
    OperatingMode["PLAN"] = "PLAN";
    OperatingMode["BUILD"] = "BUILD";
    OperatingMode["PLAYTEST"] = "PLAYTEST";
    OperatingMode["VISUAL"] = "VISUAL";
    OperatingMode["DEBUG"] = "DEBUG";
    OperatingMode["OPTIMIZE"] = "OPTIMIZE";
    OperatingMode["VERIFY"] = "VERIFY";
    OperatingMode["AUTONOMOUS"] = "AUTONOMOUS";
})(OperatingMode || (OperatingMode = {}));
export var ObservationCost;
(function (ObservationCost) {
    ObservationCost["CHEAP"] = "CHEAP";
    ObservationCost["NORMAL"] = "NORMAL";
    ObservationCost["DEEP"] = "DEEP";
    ObservationCost["VISUAL"] = "VISUAL";
    ObservationCost["FULL"] = "FULL";
})(ObservationCost || (ObservationCost = {}));
export var SecurityLevel;
(function (SecurityLevel) {
    SecurityLevel["SAFE"] = "SAFE";
    SecurityLevel["ELEVATED"] = "ELEVATED";
    SecurityLevel["DANGEROUS"] = "DANGEROUS";
    SecurityLevel["NONE"] = "None";
    SecurityLevel["PLUGIN_SECURITY"] = "PluginSecurity";
    SecurityLevel["LOCAL_USER_SECURITY"] = "LocalUserSecurity";
    SecurityLevel["ROBLOX_SCRIPT_SECURITY"] = "RobloxScriptSecurity";
    SecurityLevel["ROBLOX_SECURITY"] = "RobloxSecurity";
    SecurityLevel["STUDIO_SECURITY"] = "StudioSecurity";
})(SecurityLevel || (SecurityLevel = {}));
export var RobloxSecurityContext;
(function (RobloxSecurityContext) {
    RobloxSecurityContext["GAME"] = "Game";
    RobloxSecurityContext["ROBLOX_GAME"] = "RobloxGame";
    RobloxSecurityContext["ROBLOX_SCRIPT"] = "RobloxScript";
    RobloxSecurityContext["STUDIO"] = "Studio";
    RobloxSecurityContext["ROBLOX"] = "Roblox";
    RobloxSecurityContext["LOCAL_USER"] = "LocalUser";
    RobloxSecurityContext["PLAYTEST"] = "Playtest";
})(RobloxSecurityContext || (RobloxSecurityContext = {}));
export var SandboxCapability;
(function (SandboxCapability) {
    SandboxCapability["ASSET_READ"] = "AssetRead";
    SandboxCapability["ASSET_CREATE_UPDATE"] = "AssetCreateUpdate";
    SandboxCapability["ASSET_MANAGEMENT"] = "AssetManagement";
    SandboxCapability["DATA_STORE"] = "DataStore";
    SandboxCapability["SERVER_COMMUNICATION"] = "ServerCommunication";
    SandboxCapability["TELEPORT"] = "Teleport";
    SandboxCapability["SOCIAL"] = "Social";
    SandboxCapability["CONSEQUENCES"] = "Consequences";
    SandboxCapability["SENSITIVE_INPUT"] = "SensitiveInput";
    SandboxCapability["CAPTURE"] = "Capture";
    SandboxCapability["AVATAR_APPEARANCE"] = "AvatarAppearance";
    SandboxCapability["AVATAR_BEHAVIOR"] = "AvatarBehavior";
    SandboxCapability["AUDIO"] = "Audio";
    SandboxCapability["CSG"] = "CSG";
    SandboxCapability["UI"] = "UI";
    SandboxCapability["REMOTE_EVENT"] = "RemoteEvent";
    SandboxCapability["CHAT"] = "Chat";
    SandboxCapability["CAPABILITY_CONTROL"] = "CapabilityControl";
})(SandboxCapability || (SandboxCapability = {}));
export var RestrictedCategory;
(function (RestrictedCategory) {
    RestrictedCategory["ROBLOX_SECURITY"] = "RobloxSecurity";
    RestrictedCategory["ROBLOX_SCRIPT_SECURITY"] = "RobloxScriptSecurity";
    RestrictedCategory["INTERNAL_STUDIO_APIS"] = "Internal Studio APIs";
    RestrictedCategory["INTERNAL_ENGINE_APIS"] = "Internal Engine APIs";
    RestrictedCategory["INTERNAL_PLUGIN_APIS"] = "Internal Plugin APIs";
    RestrictedCategory["PROTECTED_DEBUG_APIS"] = "Protected Debug APIs";
    RestrictedCategory["PROTECTED_STUDIO_CONTROL_APIS"] = "Protected Studio Control APIs";
    RestrictedCategory["MISSING_SANDBOX_CAPABILITIES"] = "Missing Sandbox Capabilities";
    RestrictedCategory["RESTRICTED_ASSET_APIS"] = "Restricted Asset APIs";
    RestrictedCategory["RESTRICTED_HTTP_APIS"] = "Restricted HTTP APIs";
    RestrictedCategory["INTERNAL_NETWORK_APIS"] = "Internal Network APIs";
    RestrictedCategory["PROVIDER_SPECIFIC_RESTRICTED"] = "Provider-specific restricted capabilities";
})(RestrictedCategory || (RestrictedCategory = {}));
export var ExecutionContext;
(function (ExecutionContext) {
    ExecutionContext["STUDIO"] = "STUDIO";
    ExecutionContext["PLAYTEST"] = "PLAYTEST";
    ExecutionContext["EDIT"] = "EDIT";
    ExecutionContext["PLAY_CLIENT"] = "PlayClient";
    ExecutionContext["PLAY_SERVER"] = "PlayServer";
    ExecutionContext["ANY"] = "Any";
})(ExecutionContext || (ExecutionContext = {}));
export var RiskLevel;
(function (RiskLevel) {
    RiskLevel["READ_ONLY"] = "READ_ONLY";
    RiskLevel["LOW"] = "LOW";
    RiskLevel["MEDIUM"] = "MEDIUM";
    RiskLevel["HIGH"] = "HIGH";
    RiskLevel["CRITICAL"] = "CRITICAL";
})(RiskLevel || (RiskLevel = {}));
export var VerificationMethod;
(function (VerificationMethod) {
    VerificationMethod["NONE"] = "NONE";
    VerificationMethod["READ_BACK"] = "READ_BACK";
    VerificationMethod["PROPERTY_CHECK"] = "PROPERTY_CHECK";
    VerificationMethod["EXISTENCE_CHECK"] = "EXISTENCE_CHECK";
    VerificationMethod["CONSOLE_CHECK"] = "CONSOLE_CHECK";
    VerificationMethod["SCREENSHOT"] = "SCREENSHOT";
    VerificationMethod["COMPOSITE"] = "COMPOSITE";
    VerificationMethod["EVIDENCE"] = "EVIDENCE";
    VerificationMethod["CONFIRMATION"] = "CONFIRMATION";
})(VerificationMethod || (VerificationMethod = {}));
export var ProviderState;
(function (ProviderState) {
    ProviderState["IDLE"] = "IDLE";
    ProviderState["STARTING"] = "STARTING";
    ProviderState["CONNECTING"] = "CONNECTING";
    ProviderState["READY"] = "READY";
    ProviderState["DEGRADED"] = "DEGRADED";
    ProviderState["UNHEALTHY"] = "UNHEALTHY";
    ProviderState["STOPPING"] = "STOPPING";
    ProviderState["FAILED"] = "FAILED";
    ProviderState["ERROR"] = "ERROR";
})(ProviderState || (ProviderState = {}));
export var FailureCode;
(function (FailureCode) {
    FailureCode["CAPABILITY_NOT_DISCOVERED"] = "CAPABILITY_NOT_DISCOVERED";
    FailureCode["CAPABILITY_UNVERIFIED"] = "CAPABILITY_UNVERIFIED";
    FailureCode["CAPABILITY_RESTRICTED"] = "CAPABILITY_RESTRICTED";
    FailureCode["PROVIDER_UNAVAILABLE"] = "PROVIDER_UNAVAILABLE";
    FailureCode["EXECUTION_FAILED"] = "EXECUTION_FAILED";
    FailureCode["FAILED_VERIFICATION"] = "FAILED_VERIFICATION";
    FailureCode["STALE_STATE"] = "STALE_STATE";
    FailureCode["INVALID_TARGET"] = "INVALID_TARGET";
    FailureCode["TIMEOUT"] = "TIMEOUT";
    FailureCode["SCHEMA_MISMATCH"] = "SCHEMA_MISMATCH";
    FailureCode["ROBLOX_ERROR"] = "ROBLOX_ERROR";
    FailureCode["MCP_ERROR"] = "MCP_ERROR";
})(FailureCode || (FailureCode = {}));
//# sourceMappingURL=types.js.map