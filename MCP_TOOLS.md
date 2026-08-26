# Universal MCP Tools Reference

Complete reference for all 35+ MCP tools exposed by the Roblox Studio Universal MCP Server.

---

## 1. Studio & DataModel Inspection

### `studio_info`
Returns metadata about the active Studio session.
* **Input**: None
* **Returns**:
  ```json
  {
    "connected": true,
    "session": {
      "sessionId": "studio_a1b2c3d4e5f6",
      "placeId": 0,
      "placeName": "My Place",
      "mode": "Edit",
      "studioVersion": "0.650.0.123"
    }
  }
  ```

### `studio_get_tree`
Traverses the DataModel hierarchy starting from a given root.
* **Parameters**:
  * `root` *(string, optional, default: "Workspace")*: Starting container path or UUID.
  * `depth` *(number, optional, default: 2, max: 10)*: Maximum traversal depth.
  * `includeProperties` *(string[], optional)*: List of properties to serialize per node (e.g. `["Size", "Anchored"]`).
  * `classNameFilter` *(string[], optional)*: Filter by ClassName.
  * `maxItems` *(number, optional, default: 100)*: Limit returned nodes.

### `studio_search`
Finds instances across the place matching multiple filter criteria.
* **Parameters**:
  * `query` *(string, optional)*: Case-insensitive substring to match in `Name`.
  * `className` *(string, optional)*: Exact `ClassName` filter (e.g. `"RemoteEvent"`).
  * `tag` *(string, optional)*: CollectionService tag.
  * `scope` *(string, optional, default: "game")*: Root container to search within.
  * `attributeName` *(string, optional)*: Filter by presence of an attribute.
  * `attributeValue` *(any, optional)*: Match exact attribute value.
  * `limit` *(number, optional, default: 50)*: Maximum results.

### `studio_inspect`
Deep inspection of an instance (all properties, attributes, tags, children summary, script preview, UUID).
* **Parameters**:
  * `target` *(string, required)*: Path or UUID.
  * `includeChildren` *(boolean, optional, default: true)*: Include immediate children.
  * `includeScriptSourceSnippet` *(boolean, optional, default: false)*: Preview first 20 lines if target is a script.

---

## 2. Instance Manipulation

### `instance_create`
Creates any valid Roblox ClassName under a target parent.
* **Parameters**:
  * `className` *(string, required)*: e.g. `"Part"`, `"Model"`, `"RemoteEvent"`, `"ModuleScript"`, `"Folder"`.
  * `parent` *(string, required)*: Path or UUID of the parent.
  * `name` *(string, optional)*: Name of the instance.
  * `properties` *(object, optional)*: Dictionary of initial properties (e.g. `{"Size": [10, 1, 10], "Anchored": true}`).
  * `attributes` *(object, optional)*: Initial attributes.
  * `tags` *(string[], optional)*: Tags to add via CollectionService.

### `instance_delete`
Destroys an instance safely.
* **Parameters**:
  * `target` *(string, required)*: Path or UUID.

### `instance_clone`
Clones an instance and its descendants.
* **Parameters**:
  * `target` *(string, required)*: Path or UUID.
  * `parent` *(string, optional)*: Target parent.
  * `newName` *(string, optional)*: New name.
  * `properties` *(object, optional)*: Property overrides.

### `instance_reparent`
Moves an instance to a new parent.
* **Parameters**:
  * `target` *(string, required)*: Target path or UUID.
  * `newParent` *(string, required)*: New parent path or UUID.

### `instance_rename`
Renames an instance.
* **Parameters**:
  * `target` *(string, required)*: Target path or UUID.
  * `newName` *(string, required)*: New name.

### `instance_move`
Moves a 3D Part or Model via CFrame / Position / PivotTo.
* **Parameters**:
  * `target` *(string, required)*: Target Part/Model path or UUID.
  * `position` *(number[3], optional)*: `[X, Y, Z]` position.
  * `cframe` *(number[], optional)*: `[X, Y, Z]` or full 12 components.
  * `pivot` *(boolean, optional, default: true)*: Use `PivotTo` for Models.

---

## 3. Properties & Attributes

### `property_get` / `property_set` / `property_get_all`
* Reads/writes any property with automatic type coercion for `Vector3`, `CFrame`, `Color3`, `BrickColor`, `UDim2`, `Enums`, etc.

### `attribute_get` / `attribute_set` / `attribute_delete` / `attribute_get_all`
* Full management of Luau attributes.

---

## 4. Script Management & Code Search

### `script_get_source`
Reads complete source code of a `Script`, `LocalScript`, or `ModuleScript`.
* **Parameters**:
  * `target` *(string, required)*: Path or UUID.

### `script_set_source`
Overwrites the full source code.
* **Parameters**:
  * `target` *(string, required)*: Path or UUID.
  * `source` *(string, required)*: Full Luau code.

### `script_patch_source`
Applies a search-and-replace or regex patch to script source without rewriting the entire file.
* **Parameters**:
  * `target` *(string, required)*: Path or UUID.
  * `search` *(string, required)*: Substring or regex pattern.
  * `replacement` *(string, required)*: Replacement string.
  * `isRegex` *(boolean, optional, default: false)*.
  * `allowMultiple` *(boolean, optional, default: false)*.

### `script_search_code`
Project-wide full-text search across all scripts.
* **Parameters**:
  * `query` *(string, required)*: Search string or regex.
  * `scope` *(string, optional, default: "game")*.
  * `caseSensitive` *(boolean, optional, default: false)*.
  * `isRegex` *(boolean, optional, default: false)*.
  * `maxResults` *(number, optional, default: 50)*.

---

## 5. Selection API

* `selection_get`: Returns array of currently selected objects in Studio.
* `selection_set`: Selects specified instances `{"targets": ["Workspace.Part1", "Workspace.Part2"]}`.
* `selection_add`: Appends instances to active selection.
* `selection_clear`: Clears Studio selection.

---

## 6. Output & Error Observation

* `output_get`: Returns recent prints, warnings, and errors captured from LogService.
* `output_get_errors`: Returns recent exceptions with stack traces captured from ScriptContext.
* `output_clear`: Clears log buffer.

---

## 7. Context & Architecture Engine

* `context_build`: Returns compact, LLM-optimized summary of place structure, services, remotes, and modules.
* `context_get_architecture`: Returns detailed map of RemoteEvents, RemoteFunctions, and shared modules.

---

## 8. Terrain Tools

* `terrain_fill_block`: Fills a block region with voxel terrain material.
* `terrain_fill_ball`: Fills a spherical region with voxel terrain material.
* `terrain_clear`: Clears terrain or a specific bounding box region.

---

## 9. Batch & Transaction Execution

### `batch_execute`
Runs a sequence of operations atomically within a single Studio Undo/Redo recording.
* **Parameters**:
  * `transactionName` *(string, optional, default: "MCP Batch Action")*.
  * `stopOnError` *(boolean, optional, default: true)*: Reverts changes if any step fails.
  * `operations` *(array of `{action, params}`)*.
