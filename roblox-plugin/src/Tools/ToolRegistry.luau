--!strict
-- ToolRegistry: Dynamic catalog and metadata manager for all low-level and high-level MCP tools

local ToolRegistry = {}

export type ToolDefinition = {
	id: string,
	name: string,
	level: number, -- 1: Primitive, 2: Studio Low-level, 3: Composite, 4: High-level, 5: Autonomous
	category: string,
	risk: "READ_ONLY" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
	description: string,
	requiredCapabilities: { string },
}

local registeredTools: { [string]: ToolDefinition } = {}

function ToolRegistry.Register(tool: ToolDefinition)
	registeredTools[tool.id] = tool
end

function ToolRegistry.Initialize()
	registeredTools = {}

	-- Level 1 & 2: Low-Level Primitives
	local primitives = {
		{ id = "instance.inspect", name = "Instance Inspect", level = 1, category = "Instances", risk = "READ_ONLY", desc = "Deep inspection of an instance (properties, attributes, tags, children)", caps = { "DataModel" } },
		{ id = "instance.create", name = "Instance Create", level = 2, category = "Instances", risk = "MEDIUM", desc = "Create a new Roblox instance with initial properties and attributes", caps = { "Instances" } },
		{ id = "instance.delete", name = "Instance Delete", level = 2, category = "Instances", risk = "HIGH", desc = "Safely delete a target instance with ambiguity checks", caps = { "Instances" } },
		{ id = "instance.clone", name = "Instance Clone", level = 2, category = "Instances", risk = "MEDIUM", desc = "Clone an instance hierarchy with optional new parent and name", caps = { "Instances" } },
		{ id = "instance.reparent", name = "Instance Reparent", level = 2, category = "Instances", risk = "MEDIUM", desc = "Reparent an instance with verified target checks", caps = { "Instances" } },
		{ id = "instance.rename", name = "Instance Rename", level = 2, category = "Instances", risk = "LOW", desc = "Rename an instance with conflict checks", caps = { "Instances" } },
		{ id = "instance.move", name = "Instance Move", level = 2, category = "Instances", risk = "LOW", desc = "Move a 3D BasePart or Model to new world coordinates", caps = { "Instances" } },
		{ id = "instance.get_children", name = "Get Children", level = 1, category = "Instances", risk = "READ_ONLY", desc = "List direct children of a target instance", caps = { "DataModel" } },
		{ id = "instance.get_descendants", name = "Get Descendants", level = 1, category = "Instances", risk = "READ_ONLY", desc = "List all recursive descendants under a scope", caps = { "DataModel" } },

		{ id = "property.get", name = "Property Get", level = 1, category = "Properties", risk = "READ_ONLY", desc = "Read a single property value with accurate type coercion", caps = { "Properties" } },
		{ id = "property.set", name = "Property Set", level = 2, category = "Properties", risk = "LOW", desc = "Set a property value with postcondition verification", caps = { "Properties" } },
		{ id = "property.get_all", name = "Property Get All", level = 1, category = "Properties", risk = "READ_ONLY", desc = "Reflect and read all common properties of an instance", caps = { "Properties" } },

		{ id = "attribute.get", name = "Attribute Get", level = 1, category = "Attributes", risk = "READ_ONLY", desc = "Read a Luau attribute value", caps = { "Attributes" } },
		{ id = "attribute.set", name = "Attribute Set", level = 2, category = "Attributes", risk = "LOW", desc = "Set a Luau attribute with verification", caps = { "Attributes" } },
		{ id = "attribute.delete", name = "Attribute Delete", level = 2, category = "Attributes", risk = "MEDIUM", desc = "Delete a Luau attribute from an instance", caps = { "Attributes" } },
		{ id = "attribute.get_all", name = "Attribute Get All", level = 1, category = "Attributes", risk = "READ_ONLY", desc = "Retrieve all attributes defined on an instance", caps = { "Attributes" } },

		{ id = "script.get_source", name = "Script Get Source", level = 1, category = "Scripts", risk = "READ_ONLY", desc = "Read exact Luau source code of a script", caps = { "Scripts" } },
		{ id = "script.set_source", name = "Script Set Source", level = 2, category = "Scripts", risk = "MEDIUM", desc = "Overwrite script source code with verification", caps = { "Scripts" } },
		{ id = "script.patch", name = "Script Patch", level = 2, category = "Scripts", risk = "MEDIUM", desc = "Apply diff patch with source change conflict detection", caps = { "Scripts" } },
		{ id = "script.search", name = "Script Code Search", level = 1, category = "Scripts", risk = "READ_ONLY", desc = "Search text/patterns across all scripts in the DataModel", caps = { "Scripts" } },

		{ id = "selection.get", name = "Selection Get", level = 1, category = "Selection", risk = "READ_ONLY", desc = "Get currently selected instances in Studio Viewport/Explorer", caps = { "Selection" } },
		{ id = "selection.set", name = "Selection Set", level = 2, category = "Selection", risk = "LOW", desc = "Set Studio selection to specific targets", caps = { "Selection" } },
		{ id = "selection.add", name = "Selection Add", level = 2, category = "Selection", risk = "LOW", desc = "Add instances to current Studio selection", caps = { "Selection" } },
		{ id = "selection.clear", name = "Selection Clear", level = 2, category = "Selection", risk = "LOW", desc = "Clear all active selections in Studio", caps = { "Selection" } },

		{ id = "terrain.fill_block", name = "Terrain Fill Block", level = 2, category = "Terrain", risk = "MEDIUM", desc = "Generate voxel terrain block with material", caps = { "Terrain" } },
		{ id = "terrain.fill_ball", name = "Terrain Fill Ball", level = 2, category = "Terrain", risk = "MEDIUM", desc = "Generate voxel terrain ball with material", caps = { "Terrain" } },
		{ id = "terrain.clear", name = "Terrain Clear", level = 2, category = "Terrain", risk = "HIGH", desc = "Clear all voxel terrain in Workspace", caps = { "Terrain" } },

		{ id = "batch.execute", name = "Batch Execute", level = 2, category = "Transactions", risk = "MEDIUM", desc = "Execute multiple actions atomically in a single ChangeHistory record", caps = { "ChangeHistory" } },
	}

	for _, p in ipairs(primitives) do
		ToolRegistry.Register({
			id = p.id,
			name = p.name,
			level = p.level,
			category = p.category,
			risk = p.risk :: any,
			description = p.desc,
			requiredCapabilities = p.caps,
		})
	end

	-- Level 3, 4 & 5: High-Level Composite Workflows
	local workflows = {
		{ id = "project.analyze", name = "Project Architecture Analyzer", level = 4, category = "Workflows", risk = "READ_ONLY", desc = "Full project analysis: services, remotes, scripts, dependencies, orphan remotes", caps = { "DataModel", "Scripts" } },
		{ id = "project.dependencies", name = "Code Graph Builder", level = 4, category = "Workflows", risk = "READ_ONLY", desc = "Static Luau dependency graph of require chains and remote calls", caps = { "Scripts" } },
		{ id = "system.create", name = "System Generator", level = 5, category = "Workflows", risk = "HIGH", desc = "Atomic generation of complete multi-script architecture with remotes and modules", caps = { "Instances", "Scripts", "ChangeHistory" } },
		{ id = "scene.optimize", name = "Scene Optimizer", level = 4, category = "Workflows", risk = "MEDIUM", desc = "Scan Workspace for unanchored parts and loose instances with auto-anchoring", caps = { "DataModel", "Instances" } },
		{ id = "debug.find_error", name = "Debug Diagnostic Engine", level = 4, category = "Workflows", risk = "READ_ONLY", desc = "Analyze Studio output logs, stack traces, and candidate error lines", caps = { "Scripts" } },
	}

	for _, w in ipairs(workflows) do
		ToolRegistry.Register({
			id = w.id,
			name = w.name,
			level = w.level,
			category = w.category,
			risk = w.risk :: any,
			description = w.desc,
			requiredCapabilities = w.caps,
		})
	end
end

function ToolRegistry.GetStats(): { total: number, lowLevel: number, highLevel: number }
	if next(registeredTools) == nil then
		ToolRegistry.Initialize()
	end

	local lowCount = 0
	local highCount = 0
	for _, tool in pairs(registeredTools) do
		if tool.level <= 2 then
			lowCount += 1
		else
			highCount += 1
		end
	end

	return {
		total = lowCount + highCount,
		lowLevel = lowCount,
		highLevel = highCount,
	}
end

function ToolRegistry.GetAll(): { [string]: ToolDefinition }
	if next(registeredTools) == nil then
		ToolRegistry.Initialize()
	end
	return registeredTools
end

return ToolRegistry
