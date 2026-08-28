# Capability Matrix & Discovery System

## Capability Matrix

Every capability registered in the system contains explicit security, execution context, and risk metadata:

| Capability Name | Primary Provider | Security Level | Context | Status | Risk Level | Verification Method |
|---|---|---|---|---|---|---|
| `capability_discover` | Gateway / Engine | `SAFE` | Studio | `AVAILABLE` | `READ_ONLY` | None |
| `capability_audit` | Gateway / Engine | `SAFE` | Studio | `AVAILABLE` | `READ_ONLY` | None |
| `system_audit` | Gateway / Engine | `SAFE` | Studio | `AVAILABLE` | `READ_ONLY` | None |
| `game_create_from_spec` | GameCreationEngine | `SAFE` | Edit | `AVAILABLE` | `MEDIUM` | VerificationEngine |
| `world_build` | WorldBuildingEngine | `PluginSecurity` | Edit | `AVAILABLE` | `MEDIUM` | Read-Back |
| `playtest_run_scenario` | PlaytestEngine | `PluginSecurity` | Playtest | `AVAILABLE` | `LOW` | Screen & Log |
| `diagnostics_safe_repair` | DiagnosticsEngine | `PluginSecurity` | Edit | `AVAILABLE` | `HIGH` | Script Diff |
| `completeness_audit` | CompletenessEngine | `SAFE` | Studio | `AVAILABLE` | `READ_ONLY` | None |
| `instance_create` | Embedded Plugin | `PluginSecurity` | Edit | `AVAILABLE` | `MEDIUM` | Read-Back |
| `instance_delete` | Embedded Plugin | `PluginSecurity` | Edit | `AVAILABLE` | `HIGH` | Postcondition |
| `property_set` | Embedded Plugin | `PluginSecurity` | Edit | `AVAILABLE` | `MEDIUM` | Read-Back |
| `script_set_source` | Embedded Plugin | `PluginSecurity` | Edit | `AVAILABLE` | `HIGH` | Script Diff |
| `model.generate` | ModelingProvider | `PluginSecurity` | Edit | `AVAILABLE` | `MEDIUM` | 3D Quality |
| `material.generate` | ModelingProvider | `PluginSecurity` | Edit | `AVAILABLE` | `LOW` | Read-Back |
| `animation.create` | AnimationProvider | `PluginSecurity` | Edit | `AVAILABLE` | `MEDIUM` | Read-Back |
| `animation.integrate` | AnimationProvider | `PluginSecurity` | Edit | `AVAILABLE` | `MEDIUM` | VerificationEngine |
| `generate_mesh` | Official Roblox MCP | `LocalUserSecurity` | Edit | `OFFICIAL_ONLY` | `MEDIUM` | Screenshot |
| `generate_material` | Official Roblox MCP | `LocalUserSecurity` | Edit | `OFFICIAL_ONLY` | `LOW` | Read-Back |
| `screen_capture` | Official Roblox MCP | `LocalUserSecurity` | Playtest | `OFFICIAL_ONLY` | `READ_ONLY` | Screenshot |
| `orchestrator_execute` | AIOrchestrator | `SAFE` | Studio | `AVAILABLE` | `HIGH` | 5-State Verification |
| `ui_design_create` | UIDesignEngine | `PluginSecurity` | Edit | `AVAILABLE` | `MEDIUM` | Read-Back |
| `ui_theme_apply` | UIDesignTokens | `SAFE` | Studio | `AVAILABLE` | `READ_ONLY` | None |
| `ui_critique` | VisualQAEngine | `SAFE` | Studio | `AVAILABLE` | `READ_ONLY` | Geometric |
| `project_memory_inspect` | ProjectMemory | `SAFE` | Studio | `AVAILABLE` | `READ_ONLY` | None |
| `code_refactor_analyze` | RefactoringEngine | `SAFE` | Edit | `AVAILABLE` | `READ_ONLY` | AST Analysis |
| `mechanic_card_instantiate` | MechanicCardRegistry | `PluginSecurity` | Edit | `AVAILABLE` | `MEDIUM` | VerificationEngine |
| `asset_security_scan` | AssetSecurityEngine | `SAFE` | Studio | `AVAILABLE` | `READ_ONLY` | Static Analysis |
| `model_route_query` | ModelRouter | `SAFE` | Studio | `AVAILABLE` | `READ_ONLY` | None |

---

## Security Hierarchy
1. **`SAFE`**: Pure local computation or read-only analytical queries without side effects.
2. **`PluginSecurity`**: Operates within official Roblox Studio plugin execution boundaries (Identity 6 / Plugin level).
3. **`LocalUserSecurity`**: Executed by Studio IDE native process (official Roblox MCP actions).
4. **`RobloxScriptSecurity`**: Roblox internal sandbox (never bypassed; strictly protected).

---

## Risk Levels & Verification
* **`READ_ONLY`**: Zero mutations, immediate return.
* **`LOW`**: Safe cosmetic or metadata additions.
* **`MEDIUM`**: Instance creation, property assignment. Wrapped in `ChangeHistoryService` recording and verified via `VerificationEngine`.
* **`HIGH`**: Deletions, script source overwrites. Generates before/after diffs and requires explicit confirmation.
