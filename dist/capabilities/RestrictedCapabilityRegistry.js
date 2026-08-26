import { RestrictedCategory, RobloxSecurityContext, SandboxCapability, SecurityLevel } from '../providers/types.js';
/**
 * Master Registry for Restricted / Official-Only Capabilities
 * Categorizes all APIs and capabilities that are restricted in 3rd-party HTTP / plugin sandbox
 * and maps them directly to the Official Roblox Studio MCP (StudioMCP.exe) with fallback paths.
 */
export class RestrictedCapabilityRegistry {
    descriptors = new Map();
    constructor() {
        this.initializeRegistry();
    }
    initializeRegistry() {
        const list = [
            // 1. RobloxSecurity Level APIs
            {
                name: 'roblox_security_core',
                category: RestrictedCategory.ROBLOX_SECURITY,
                securityLevel: SecurityLevel.ROBLOX_SECURITY,
                robloxSecurityContext: RobloxSecurityContext.ROBLOX,
                description: 'Roblox internal platform security level operations and CoreScript execution.',
                primaryProvider: 'official-roblox-mcp',
                fallbackProviders: ['luau-provider'],
                officialToolName: 'execute_luau'
            },
            {
                name: 'core_packages_access',
                category: RestrictedCategory.ROBLOX_SECURITY,
                securityLevel: SecurityLevel.ROBLOX_SECURITY,
                robloxSecurityContext: RobloxSecurityContext.ROBLOX,
                description: 'Direct read/write access to internal CorePackages and CoreGui elements.',
                primaryProvider: 'official-roblox-mcp',
                fallbackProviders: ['embedded-plugin'],
                officialToolName: 'search_game_tree'
            },
            // 2. RobloxScriptSecurity Level APIs
            {
                name: 'roblox_script_security_exec',
                category: RestrictedCategory.ROBLOX_SCRIPT_SECURITY,
                securityLevel: SecurityLevel.ROBLOX_SCRIPT_SECURITY,
                robloxSecurityContext: RobloxSecurityContext.ROBLOX_SCRIPT,
                description: 'RobloxScriptSecurity level operations (e.g. OpenScreenshotsFolder, internal settings).',
                primaryProvider: 'official-roblox-mcp',
                fallbackProviders: ['embedded-plugin'],
                officialToolName: 'execute_luau'
            },
            {
                name: 'script_debugger_engine',
                category: RestrictedCategory.ROBLOX_SCRIPT_SECURITY,
                securityLevel: SecurityLevel.ROBLOX_SCRIPT_SECURITY,
                robloxSecurityContext: RobloxSecurityContext.ROBLOX_SCRIPT,
                description: 'Native script debugger manipulation and internal breakpoint inspection.',
                primaryProvider: 'official-roblox-mcp',
                fallbackProviders: ['diagnostics-provider', 'embedded-plugin'],
                officialToolName: 'script_grep'
            },
            // 3. Internal Studio APIs
            {
                name: 'get_studio_state',
                category: RestrictedCategory.INTERNAL_STUDIO_APIS,
                securityLevel: SecurityLevel.PLUGIN_SECURITY,
                robloxSecurityContext: RobloxSecurityContext.STUDIO,
                description: 'Direct query of internal Studio window state, open documents, and place status.',
                primaryProvider: 'official-roblox-mcp',
                fallbackProviders: ['embedded-plugin'],
                officialToolName: 'get_studio_state'
            },
            {
                name: 'list_roblox_studios',
                category: RestrictedCategory.INTERNAL_STUDIO_APIS,
                securityLevel: SecurityLevel.PLUGIN_SECURITY,
                robloxSecurityContext: RobloxSecurityContext.STUDIO,
                description: 'Enumerate all active Studio process instances running on the OS.',
                primaryProvider: 'official-roblox-mcp',
                fallbackProviders: ['embedded-plugin'],
                officialToolName: 'list_roblox_studios'
            },
            {
                name: 'set_active_studio',
                category: RestrictedCategory.INTERNAL_STUDIO_APIS,
                securityLevel: SecurityLevel.PLUGIN_SECURITY,
                robloxSecurityContext: RobloxSecurityContext.STUDIO,
                description: 'Switch active MCP focus to another running Roblox Studio instance.',
                primaryProvider: 'official-roblox-mcp',
                fallbackProviders: ['embedded-plugin'],
                officialToolName: 'set_active_studio'
            },
            // 4. Internal Engine APIs
            {
                name: 'csg_native_engine',
                category: RestrictedCategory.INTERNAL_ENGINE_APIS,
                securityLevel: SecurityLevel.PLUGIN_SECURITY,
                robloxSecurityContext: RobloxSecurityContext.STUDIO,
                requiredSandboxCapability: SandboxCapability.CSG,
                description: 'Low-level CSG solid modeling union/subtract engine invocation.',
                primaryProvider: 'official-roblox-mcp',
                fallbackProviders: ['modeling-provider'],
                officialToolName: 'generate_mesh'
            },
            {
                name: 'engine_memory_stats',
                category: RestrictedCategory.INTERNAL_ENGINE_APIS,
                securityLevel: SecurityLevel.PLUGIN_SECURITY,
                robloxSecurityContext: RobloxSecurityContext.STUDIO,
                description: 'Internal engine memory allocation tags and low-level diagnostic pools.',
                primaryProvider: 'official-roblox-mcp',
                fallbackProviders: ['diagnostics-provider', 'embedded-plugin'],
                officialToolName: 'get_console_output'
            },
            // 5. Internal Plugin APIs
            {
                name: 'internal_plugin_manager',
                category: RestrictedCategory.INTERNAL_PLUGIN_APIS,
                securityLevel: SecurityLevel.PLUGIN_SECURITY,
                robloxSecurityContext: RobloxSecurityContext.STUDIO,
                description: 'Internal plugin installation, loading, and private plugin isolation boundaries.',
                primaryProvider: 'official-roblox-mcp',
                fallbackProviders: ['embedded-plugin'],
                officialToolName: 'execute_luau'
            },
            // 6. Protected Debug APIs
            {
                name: 'protected_log_capture',
                category: RestrictedCategory.PROTECTED_DEBUG_APIS,
                securityLevel: SecurityLevel.SAFE,
                robloxSecurityContext: RobloxSecurityContext.STUDIO,
                description: 'Direct capture of protected Studio logs, crash traces, and engine outputs.',
                primaryProvider: 'official-roblox-mcp',
                fallbackProviders: ['diagnostics-provider', 'embedded-plugin'],
                officialToolName: 'get_console_output'
            },
            // 7. Protected Studio Control APIs (Simulation Lifecycle)
            {
                name: 'start_stop_play',
                category: RestrictedCategory.PROTECTED_STUDIO_CONTROL_APIS,
                securityLevel: SecurityLevel.PLUGIN_SECURITY,
                robloxSecurityContext: RobloxSecurityContext.STUDIO,
                description: 'Engine-level simulation state transitions: Play, Run, Stop, Pause, Resume.',
                primaryProvider: 'official-roblox-mcp',
                fallbackProviders: ['embedded-plugin'],
                officialToolName: 'start_stop_play'
            },
            {
                name: 'playtest_control',
                category: RestrictedCategory.PROTECTED_STUDIO_CONTROL_APIS,
                securityLevel: SecurityLevel.PLUGIN_SECURITY,
                robloxSecurityContext: RobloxSecurityContext.STUDIO,
                description: 'Playtest simulation mode transition routed to official StudioMCP.',
                primaryProvider: 'official-roblox-mcp',
                fallbackProviders: ['embedded-plugin'],
                officialToolName: 'start_stop_play'
            },
            {
                name: 'playtest_get_state',
                category: RestrictedCategory.PROTECTED_STUDIO_CONTROL_APIS,
                securityLevel: SecurityLevel.PLUGIN_SECURITY,
                robloxSecurityContext: RobloxSecurityContext.STUDIO,
                description: 'Query simulation status and active runmode state from Studio engine.',
                primaryProvider: 'official-roblox-mcp',
                fallbackProviders: ['embedded-plugin'],
                officialToolName: 'get_studio_state'
            },
            // 8. Missing Sandbox Capabilities (Hardware Input & Screen Capture)
            {
                name: 'screen_capture',
                category: RestrictedCategory.MISSING_SANDBOX_CAPABILITIES,
                securityLevel: SecurityLevel.SAFE,
                robloxSecurityContext: RobloxSecurityContext.STUDIO,
                requiredSandboxCapability: SandboxCapability.CAPTURE,
                description: 'Native viewport framebuffer capture without plugin GUI interference.',
                primaryProvider: 'official-roblox-mcp',
                fallbackProviders: ['observation-provider'],
                officialToolName: 'screen_capture'
            },
            {
                name: 'character_navigation',
                category: RestrictedCategory.MISSING_SANDBOX_CAPABILITIES,
                securityLevel: SecurityLevel.SAFE,
                robloxSecurityContext: RobloxSecurityContext.PLAYTEST,
                requiredSandboxCapability: SandboxCapability.SENSITIVE_INPUT,
                description: 'Direct humanoid character navigation during playtest simulation.',
                primaryProvider: 'official-roblox-mcp',
                fallbackProviders: ['embedded-plugin'],
                officialToolName: 'character_navigation'
            },
            {
                name: 'user_keyboard_input',
                category: RestrictedCategory.MISSING_SANDBOX_CAPABILITIES,
                securityLevel: SecurityLevel.SAFE,
                robloxSecurityContext: RobloxSecurityContext.PLAYTEST,
                requiredSandboxCapability: SandboxCapability.SENSITIVE_INPUT,
                description: 'Inject virtual hardware keyboard key events into simulation.',
                primaryProvider: 'official-roblox-mcp',
                fallbackProviders: ['embedded-plugin'],
                officialToolName: 'user_keyboard_input'
            },
            {
                name: 'user_mouse_input',
                category: RestrictedCategory.MISSING_SANDBOX_CAPABILITIES,
                securityLevel: SecurityLevel.SAFE,
                robloxSecurityContext: RobloxSecurityContext.PLAYTEST,
                requiredSandboxCapability: SandboxCapability.SENSITIVE_INPUT,
                description: 'Inject virtual hardware mouse click and cursor coordinates into simulation.',
                primaryProvider: 'official-roblox-mcp',
                fallbackProviders: ['embedded-plugin'],
                officialToolName: 'user_mouse_input'
            },
            // 9. Restricted Asset APIs (3D Generative AI & Cloud Marketplace)
            {
                name: 'generate_mesh',
                category: RestrictedCategory.RESTRICTED_ASSET_APIS,
                securityLevel: SecurityLevel.SAFE,
                robloxSecurityContext: RobloxSecurityContext.STUDIO,
                requiredSandboxCapability: SandboxCapability.ASSET_CREATE_UPDATE,
                description: 'Roblox Official Cloud AI 3D Mesh generator from natural language prompt.',
                primaryProvider: 'official-roblox-mcp',
                fallbackProviders: ['modeling-provider'],
                officialToolName: 'generate_mesh'
            },
            {
                name: 'generate_material',
                category: RestrictedCategory.RESTRICTED_ASSET_APIS,
                securityLevel: SecurityLevel.SAFE,
                robloxSecurityContext: RobloxSecurityContext.STUDIO,
                requiredSandboxCapability: SandboxCapability.ASSET_CREATE_UPDATE,
                description: 'Roblox Official Cloud AI PBR texture & material generator.',
                primaryProvider: 'official-roblox-mcp',
                fallbackProviders: ['modeling-provider'],
                officialToolName: 'generate_material'
            },
            {
                name: 'generate_procedural_model',
                category: RestrictedCategory.RESTRICTED_ASSET_APIS,
                securityLevel: SecurityLevel.SAFE,
                robloxSecurityContext: RobloxSecurityContext.STUDIO,
                requiredSandboxCapability: SandboxCapability.ASSET_CREATE_UPDATE,
                description: 'Roblox Official procedural model assembly generator.',
                primaryProvider: 'official-roblox-mcp',
                fallbackProviders: ['modeling-provider'],
                officialToolName: 'generate_procedural_model'
            },
            {
                name: 'wait_job_finished',
                category: RestrictedCategory.RESTRICTED_ASSET_APIS,
                securityLevel: SecurityLevel.SAFE,
                robloxSecurityContext: RobloxSecurityContext.STUDIO,
                requiredSandboxCapability: SandboxCapability.ASSET_READ,
                description: 'Poll async AI generation job completion status.',
                primaryProvider: 'official-roblox-mcp',
                fallbackProviders: ['modeling-provider'],
                officialToolName: 'wait_job_finished'
            },
            {
                name: 'search_asset',
                category: RestrictedCategory.RESTRICTED_ASSET_APIS,
                securityLevel: SecurityLevel.SAFE,
                robloxSecurityContext: RobloxSecurityContext.STUDIO,
                requiredSandboxCapability: SandboxCapability.ASSET_READ,
                description: 'Search Roblox Creator Store / Marketplace via authenticated official API.',
                primaryProvider: 'official-roblox-mcp',
                fallbackProviders: ['asset-provider'],
                officialToolName: 'search_asset'
            },
            {
                name: 'insert_asset',
                category: RestrictedCategory.RESTRICTED_ASSET_APIS,
                securityLevel: SecurityLevel.SAFE,
                robloxSecurityContext: RobloxSecurityContext.STUDIO,
                requiredSandboxCapability: SandboxCapability.ASSET_CREATE_UPDATE,
                description: 'Insert Cloud Marketplace asset by AssetId directly into Studio.',
                primaryProvider: 'official-roblox-mcp',
                fallbackProviders: ['asset-provider', 'embedded-plugin'],
                officialToolName: 'insert_asset'
            },
            {
                name: 'upload_image',
                category: RestrictedCategory.RESTRICTED_ASSET_APIS,
                securityLevel: SecurityLevel.SAFE,
                robloxSecurityContext: RobloxSecurityContext.STUDIO,
                requiredSandboxCapability: SandboxCapability.ASSET_CREATE_UPDATE,
                description: 'Upload image asset to Roblox Cloud as Decal/Texture asset.',
                primaryProvider: 'official-roblox-mcp',
                fallbackProviders: ['asset-provider'],
                officialToolName: 'upload_image'
            },
            {
                name: 'store_image',
                category: RestrictedCategory.RESTRICTED_ASSET_APIS,
                securityLevel: SecurityLevel.SAFE,
                robloxSecurityContext: RobloxSecurityContext.STUDIO,
                requiredSandboxCapability: SandboxCapability.ASSET_MANAGEMENT,
                description: 'Store and link image asset in Studio project.',
                primaryProvider: 'official-roblox-mcp',
                fallbackProviders: ['asset-provider'],
                officialToolName: 'store_image'
            },
            // 10. Restricted HTTP & Network APIs (TrustCheck / HttpEnabled boundaries)
            {
                name: 'authenticated_cloud_http',
                category: RestrictedCategory.RESTRICTED_HTTP_APIS,
                securityLevel: SecurityLevel.ROBLOX_SCRIPT_SECURITY,
                robloxSecurityContext: RobloxSecurityContext.STUDIO,
                requiredSandboxCapability: SandboxCapability.SERVER_COMMUNICATION,
                description: 'Roblox-authenticated internal cloud API requests bypassing TrustCheck.',
                primaryProvider: 'official-roblox-mcp',
                fallbackProviders: ['embedded-plugin'],
                officialToolName: 'execute_luau'
            },
            {
                name: 'internal_network_telemetry',
                category: RestrictedCategory.INTERNAL_NETWORK_APIS,
                securityLevel: SecurityLevel.ROBLOX_SECURITY,
                robloxSecurityContext: RobloxSecurityContext.ROBLOX,
                description: 'Roblox internal network telemetry and replication diagnostics.',
                primaryProvider: 'official-roblox-mcp',
                fallbackProviders: ['diagnostics-provider'],
                officialToolName: 'get_console_output'
            },
            // 11. IDE Multi-File Native Script Operations
            {
                name: 'script_read',
                category: RestrictedCategory.INTERNAL_STUDIO_APIS,
                securityLevel: SecurityLevel.SAFE,
                robloxSecurityContext: RobloxSecurityContext.STUDIO,
                description: 'Read Luau script directly from Studio Script Editor buffer.',
                primaryProvider: 'official-roblox-mcp',
                fallbackProviders: ['embedded-plugin', 'luau-provider'],
                officialToolName: 'script_read'
            },
            {
                name: 'multi_edit',
                category: RestrictedCategory.INTERNAL_STUDIO_APIS,
                securityLevel: SecurityLevel.SAFE,
                robloxSecurityContext: RobloxSecurityContext.STUDIO,
                description: 'Atomic multi-file script edits in Studio editor.',
                primaryProvider: 'official-roblox-mcp',
                fallbackProviders: ['embedded-plugin', 'luau-provider'],
                officialToolName: 'multi_edit'
            },
            {
                name: 'script_search',
                category: RestrictedCategory.INTERNAL_STUDIO_APIS,
                securityLevel: SecurityLevel.SAFE,
                robloxSecurityContext: RobloxSecurityContext.STUDIO,
                description: 'Native regex search across all scripts in Studio.',
                primaryProvider: 'official-roblox-mcp',
                fallbackProviders: ['embedded-plugin', 'luau-provider'],
                officialToolName: 'script_search'
            },
            {
                name: 'script_grep',
                category: RestrictedCategory.INTERNAL_STUDIO_APIS,
                securityLevel: SecurityLevel.SAFE,
                robloxSecurityContext: RobloxSecurityContext.STUDIO,
                description: 'Native symbol and pattern grep across scripts.',
                primaryProvider: 'official-roblox-mcp',
                fallbackProviders: ['embedded-plugin', 'luau-provider'],
                officialToolName: 'script_grep'
            },
            // 12. Provider-Specific Restricted Capabilities (Subagent & Luau)
            {
                name: 'subagent',
                category: RestrictedCategory.PROVIDER_SPECIFIC_RESTRICTED,
                securityLevel: SecurityLevel.SAFE,
                robloxSecurityContext: RobloxSecurityContext.STUDIO,
                description: 'Roblox native subagent delegation engine.',
                primaryProvider: 'official-roblox-mcp',
                fallbackProviders: [],
                officialToolName: 'subagent'
            },
            {
                name: 'execute_luau',
                category: RestrictedCategory.PROVIDER_SPECIFIC_RESTRICTED,
                securityLevel: SecurityLevel.SAFE,
                robloxSecurityContext: RobloxSecurityContext.STUDIO,
                description: 'Official Studio execution of Luau code.',
                primaryProvider: 'official-roblox-mcp',
                fallbackProviders: ['luau-provider', 'embedded-plugin'],
                officialToolName: 'execute_luau'
            }
        ];
        for (const desc of list) {
            this.descriptors.set(desc.name, desc);
            this.descriptors.set(desc.name.replace(/_/g, '.'), desc);
        }
    }
    isRestricted(name) {
        return this.descriptors.has(name) || this.descriptors.has(name.replace(/_/g, '.'));
    }
    getDescriptor(name) {
        return this.descriptors.get(name) || this.descriptors.get(name.replace(/_/g, '.'));
    }
    getRoute(name) {
        const desc = this.getDescriptor(name);
        if (desc) {
            return [desc.primaryProvider, ...desc.fallbackProviders];
        }
        return ['official-roblox-mcp', 'embedded-plugin'];
    }
    getAllRestrictedCapabilities() {
        const seen = new Set();
        const unique = [];
        for (const desc of this.descriptors.values()) {
            if (!seen.has(desc.name)) {
                seen.add(desc.name);
                unique.push(desc);
            }
        }
        return unique;
    }
    getHierarchyTree() {
        const tree = {};
        for (const category of Object.values(RestrictedCategory)) {
            tree[category] = [];
        }
        for (const desc of this.getAllRestrictedCapabilities()) {
            if (!tree[desc.category]) {
                tree[desc.category] = [];
            }
            tree[desc.category].push(desc);
        }
        return tree;
    }
}
export const restrictedCapabilityRegistry = new RestrictedCapabilityRegistry();
//# sourceMappingURL=RestrictedCapabilityRegistry.js.map