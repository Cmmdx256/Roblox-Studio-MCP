# Roblox AI Platform — Tool & Primitive Inventory

## 1. Tool vs. Capability vs. Workflow Hierarchy

- **Low-Level Tool (Primitive)**: Direct, single-step executable operation on Roblox DataModel or runtime (e.g. `property_set`, `instance_create`, `script_patch_source`).
- **High-Level Capability**: Reusable outcome composing multiple primitives under a formal contract (e.g. `create_inventory_ui`, `calibrate_tool_grip`, `safe_repair`).
- **Workflow / Mechanic Card**: Multi-capability template orchestrating complete systems across DataModel, scripts, and UI (e.g. `mechanic_card_instantiate`, `game_create_from_spec`).

---

## 2. Low-Level Primitive Tools (36 Core Universal Tools)

| Tool Name | Category | Risk Level | Verification Method | Description |
|---|---|---|---|---|
| `studio_info` | Studio | `READ_ONLY` | `NONE` | Retrieves active place, session info, and simulation mode |
| `studio_get_tree` | Studio | `READ_ONLY` | `READ_BACK` | Queries hierarchy tree of DataModel from root |
| `studio_search` | Studio | `READ_ONLY` | `NONE` | Searches instances across DataModel by query/class |
| `studio_inspect` | Studio | `READ_ONLY` | `READ_BACK` | Deep inspection of an instance, properties, and attributes |
| `instance_create` | Instance | `LOW` | `READ_BACK` | Creates instance under target parent with initial properties |
| `instance_delete` | Instance | `HIGH` | `READ_BACK` | Destroys target instance from DataModel |
| `instance_clone` | Instance | `LOW` | `READ_BACK` | Clones target instance to new parent |
| `instance_reparent` | Instance | `LOW` | `READ_BACK` | Moves target instance to new parent |
| `instance_rename` | Instance | `LOW` | `READ_BACK` | Renames target instance |
| `instance_move` | Instance | `LOW` | `READ_BACK` | Updates CFrame/Position of target BasePart or Model |
| `property_get` | Property | `READ_ONLY` | `NONE` | Reads specific property value from target instance |
| `property_set` | Property | `MEDIUM` | `READ_BACK` | Mutates property value with type coercion and undo waypoint |
| `property_get_all` | Property | `READ_ONLY` | `NONE` | Reads all inspectable properties of target instance |
| `attribute_get` | Attribute | `READ_ONLY` | `NONE` | Reads custom attribute value |
| `attribute_set` | Attribute | `LOW` | `READ_BACK` | Sets or creates custom attribute value |
| `attribute_delete` | Attribute | `LOW` | `READ_BACK` | Deletes custom attribute |
| `attribute_get_all` | Attribute | `READ_ONLY` | `NONE` | Reads all custom attributes on target instance |
| `script_get_source` | Script | `READ_ONLY` | `NONE` | Reads full Lua/Luau source code of target script |
| `script_set_source` | Script | `HIGH` | `READ_BACK` | Overwrites full source code of target script |
| `script_patch_source`| Script | `MEDIUM` | `READ_BACK` | Targeted search-and-replace patch within target script |
| `script_search_code` | Script | `READ_ONLY` | `NONE` | Grep search across all scripts in DataModel |
| `selection_get` | Selection | `READ_ONLY` | `NONE` | Retrieves currently selected instances in Studio |
| `selection_set` | Selection | `LOW` | `READ_BACK` | Sets active Studio selection |
| `selection_add` | Selection | `LOW` | `READ_BACK` | Adds instances to current Studio selection |
| `selection_clear` | Selection | `LOW` | `READ_BACK` | Clears active Studio selection |
| `playtest_control` | Playtest | `HIGH` | `READ_BACK` | Controls Studio playtest (Start, Stop, Run, Pause, Resume) |
| `playtest_get_state` | Playtest | `READ_ONLY` | `NONE` | Inspects simulation state (Edit, Run, Play) |
| `output_get` | Output | `READ_ONLY` | `NONE` | Retrieves buffered console logs and messages |
| `output_get_errors` | Output | `READ_ONLY` | `NONE` | Retrieves recent Studio runtime error messages and tracebacks |
| `output_clear` | Output | `LOW` | `NONE` | Clears buffered logs in bridge |
| `context_build` | Context | `READ_ONLY` | `NONE` | Builds focused project context summary |
| `context_get_architecture` | Context | `READ_ONLY` | `NONE` | Summarizes DataModel architectural layout |
| `terrain_fill_block` | Terrain | `MEDIUM` | `READ_BACK` | Fills voxels in voxel terrain using block bounds |
| `terrain_fill_ball` | Terrain | `MEDIUM` | `READ_BACK` | Fills voxels in voxel terrain using sphere bounds |
| `terrain_clear` | Terrain | `HIGH` | `READ_BACK` | Clears all voxel terrain |
| `batch_execute` | Batch | `HIGH` | `COMPOSITE` | Atomically executes ordered batch of operations |

---

## 3. High-Level Master Platform Tools

| Platform Tool | Engine | Description |
|---|---|---|
| `orchestrator_execute` | `AIOrchestrator` | End-to-end autonomous development loop (Intent $\to$ DAG $\to$ Execution $\to$ Verification $\to$ Recovery) |
| `ui_design_create` | `UIDesignEngine` | Compiles intermediate UI specification with design tokens into Roblox GUIs |
| `ui_theme_apply` | `UIDesignTokens` | Lists and applies design token palettes, typography, spacing, radius, and strokes |
| `ui_critique` | `VisualQAEngine` | Evaluates UI geometry, detecting overlapping siblings, viewport clipping, and contrast issues |
| `project_memory_inspect` | `ProjectMemory` | Inspects structured project memory, system registry, and error memory |
| `code_refactor_analyze` | `RefactoringEngine` | Scans scripts for monolithic structures (>250 lines), deprecated `wait()`, and Knit/Vanilla architecture |
| `mechanic_card_instantiate` | `MechanicCardRegistry` | Customizes and instantiates pre-built mechanics (`kill_brick`, `coin_pickup`, `interactive_door`, `sprint_stamina`) |
| `asset_security_scan` | `AssetSecurityEngine` | Scans 3D models and scripts for malicious backdoors, obfuscation, and suspicious requires |
| `model_route_query` | `ModelRouter` | Determines optimal AI model profile for task intent based on capability ratings |
| `transaction_manage` | `TransactionEngine` | Coordinates atomic transactions with Studio `ChangeHistoryService` recording and rollback |
| `autonomous_recovery` | `RecoveryEngine` | Diagnoses runtime errors, correlates tracebacks, and applies verified self-healing patches |
| `context_focus` | `ProjectContextEngine` | Extracts relevance-ranked instance nodes and 35-line compressed script windows |
| `system_health` | `HealthMonitor` | Returns live health, latency, and capability counts across all 11 providers |
| `world_build` | `WorldBuildingEngine` | Constructs spatial layout, zones, spawn points, lighting, and roads |
| `playtest_run_scenario` | `PlaytestEngine` | Executes multi-step simulated gameplay scenario with input and output assertions |
| `diagnostics_safe_repair`| `DiagnosticsEngine` | Correlates Studio errors to scripts and generates verified repair diffs |
| `completeness_audit` | `CompletenessEngine` | Audits requested requirements against DataModel to verify completion score |
| `capability_resolve` | `UniversalCapabilityEngine` | Resolves intent across 4-tier hierarchy (Direct $\to$ Provider $\to$ Composition $\to$ Unavailable) |
| `mode_set` / `mode_get` | `MultiModeEngine` | Switches active operating mode (`CHAT`, `OBSERVE`, `PLAN`, `BUILD`, `PLAYTEST`, `AUTONOMOUS`) |
