# Provider Architecture & Dynamic Routing

## 1. Provider Registry & Architecture

The platform uses a pluggable Provider architecture implementing the `IProvider` contract:

```typescript
export interface IProvider {
    readonly name: string;
    readonly type: ProviderType;
    discover(): Promise<ProviderCapability[]>;
    initialize(): Promise<void>;
    healthCheck(): Promise<HealthStatus>;
    listTools(): Promise<ProviderToolDefinition[]>;
    getCapabilities(): ProviderCapability[];
    execute(action: string, params: Record<string, any>): Promise<ExecutionResult>;
    shutdown(): Promise<void>;
}
```

---

## 2. Inventory of 11 Registered Providers

1. `embedded-plugin` (`ProviderType.EMBEDDED_PLUGIN`): Native Studio DataModel manipulation via HTTP bridge.
2. `official-roblox-mcp` (`ProviderType.OFFICIAL_ROBLOX_MCP`): Integration with official StudioMCP binary via stdio transport.
3. `modeling-provider` (`ProviderType.MODELING`): 3D part assembly and mesh generation.
4. `animation-provider` (`ProviderType.ANIMATION`): Keyframe posing and tool grip calibration.
5. `luau-provider` (`ProviderType.LUAU`): Static analysis, linting, and syntax patching.
6. `workflow-provider` (`ProviderType.WORKFLOW`): Multi-step mechanic templates.
7. `asset-provider` (`ProviderType.ASSET`): Asset search, security scanning, and insertion.
8. `testing-provider` (`ProviderType.TESTING`): Playtest scenario execution and assertions.
9. `diagnostics-provider` (`ProviderType.DIAGNOSTICS`): Error traceback correlation and diagnosis.
10. `observation-provider` (`ProviderType.OBSERVATION`): Structured DataModel and session state inspection.
11. `design-provider` (`ProviderType.DESIGN`): Spatial composition, lighting setups, and design tokens.

---

## 3. Dynamic Health-Aware Routing (`CapabilityRouter.ts`, `HealthMonitor.ts`)

- Dynamically selects the healthiest provider capable of executing an action.
- If the primary provider (e.g. Official Studio MCP) is offline or unavailable, automatically falls back to the secondary candidate (e.g. Embedded Studio Plugin) without crashing.
- Continuous background heartbeat monitors provider states (`READY`, `DEGRADED`, `UNHEALTHY`).
