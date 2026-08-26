--!strict
-- CapabilityRegistry: Automatically discovers and catalogs legitimate Studio Plugin capabilities

local CapabilityRegistry = {}

export type CapabilityStatus = "SUPPORTED" | "LIMITED" | "UNSUPPORTED" | "UNAVAILABLE"
export type SecurityLevel = "None" | "PluginSecurity" | "LocalUserSecurity" | "RobloxScriptSecurity" | "Unavailable"
export type RiskLevel = "READ_ONLY" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"

export type Capability = {
	name: string,
	category: string,
	status: CapabilityStatus,
	reason: string,
	securityLevel: SecurityLevel,
	riskLevel: RiskLevel,
	operations: { string },
}

local registry: { [string]: Capability } = {}

function CapabilityRegistry.Discover(): { [string]: Capability }
	registry = {}

	-- 1. DataModel Inspection
	registry["DataModel"] = {
		name = "DataModel Hierarchy & Inspection",
		category = "DataModel",
		status = "SUPPORTED",
		reason = "Full legitimate DataModel read access available",
		securityLevel = "None",
		riskLevel = "READ_ONLY",
		operations = { "get_tree", "get_children", "get_descendants", "inspect" },
	}

	-- 2. Instance Mutation
	registry["Instances"] = {
		name = "Instance Lifecycle & Hierarchy",
		category = "Instances",
		status = "SUPPORTED",
		reason = "Full legitimate Instance creation, deletion, cloning, reparenting, renaming",
		securityLevel = "None",
		riskLevel = "MEDIUM",
		operations = { "create", "delete", "clone", "reparent", "rename", "move" },
	}

	-- 3. Property Reflection
	registry["Properties"] = {
		name = "Property Introspection & Mutation",
		category = "Properties",
		status = "SUPPORTED",
		reason = "Safe reflection and writable property mutation with Luau type coercion",
		securityLevel = "None",
		riskLevel = "LOW",
		operations = { "get", "set", "get_all", "compare", "validate" },
	}

	-- 4. Attributes
	registry["Attributes"] = {
		name = "Luau Attributes",
		category = "Attributes",
		status = "SUPPORTED",
		reason = "Native GetAttribute/SetAttribute API available on all Instances",
		securityLevel = "None",
		riskLevel = "LOW",
		operations = { "get", "set", "delete", "get_all" },
	}

	-- 5. Selection Service
	local hasSel = pcall(function() return game:GetService("Selection") end)
	registry["Selection"] = {
		name = "Studio Selection Synchronization",
		category = "Selection",
		status = hasSel and "SUPPORTED" or "UNSUPPORTED",
		reason = hasSel and "Studio Selection service active" or "Selection service unavailable",
		securityLevel = "PluginSecurity",
		riskLevel = "LOW",
		operations = { "get", "set", "add", "clear" },
	}

	-- 6. Script Editing
	local sesAvailable = false
	pcall(function()
		sesAvailable = game:GetService("ScriptEditorService") ~= nil
	end)
	registry["Scripts"] = {
		name = "Script Source Editing & Inspection",
		category = "Scripts",
		status = sesAvailable and "SUPPORTED" or "LIMITED",
		reason = sesAvailable and "ScriptEditorService and Script.Source available" or "Script.Source fallback active",
		securityLevel = "PluginSecurity",
		riskLevel = "MEDIUM",
		operations = { "get_source", "set_source", "patch_source", "search_code", "refactor" },
	}

	-- 7. Change History (Undo/Redo)
	local chsAvailable = false
	pcall(function()
		chsAvailable = game:GetService("ChangeHistoryService") ~= nil
	end)
	registry["ChangeHistory"] = {
		name = "ChangeHistoryService Undo/Redo Recording",
		category = "History",
		status = chsAvailable and "SUPPORTED" or "UNSUPPORTED",
		reason = chsAvailable and "TryBeginRecording and FinishRecording supported" or "Waypoint fallback",
		securityLevel = "PluginSecurity",
		riskLevel = "READ_ONLY",
		operations = { "begin_recording", "finish_recording", "set_waypoint" },
	}

	-- 8. Search Engine
	registry["Search"] = {
		name = "Universal Search Engine",
		category = "Search",
		status = "SUPPORTED",
		reason = "Multi-criteria hierarchy, tag, attribute, and code search active",
		securityLevel = "None",
		riskLevel = "READ_ONLY",
		operations = { "instances", "scripts", "tags", "attributes", "project" },
	}

	-- 9. Context & Architecture Engine
	registry["Context"] = {
		name = "AI Context & Architecture Summarizer",
		category = "Context",
		status = "SUPPORTED",
		reason = "Dynamic architecture summarization and scope slicing active",
		securityLevel = "None",
		riskLevel = "READ_ONLY",
		operations = { "project", "scope", "selection", "codegraph" },
	}

	-- 10. Observation / Live Events
	registry["Observation"] = {
		name = "Real-time Studio Observation Engine",
		category = "Observation",
		status = "SUPPORTED",
		reason = "Real-time DescendantAdded, DescendantRemoving, and Selection signals",
		securityLevel = "None",
		riskLevel = "READ_ONLY",
		operations = { "subscribe", "drain_events" },
	}

	-- 11. Terrain Geometry
	local hasTerrain = workspace.Terrain ~= nil
	registry["Terrain"] = {
		name = "Terrain Voxel Geometry",
		category = "Terrain",
		status = hasTerrain and "SUPPORTED" or "UNSUPPORTED",
		reason = hasTerrain and "Workspace.Terrain accessible" or "No Terrain instance in Workspace",
		securityLevel = "None",
		riskLevel = "MEDIUM",
		operations = { "fill_block", "fill_ball", "clear" },
	}

	-- 12. Verification & Safety Engine
	registry["Verification"] = {
		name = "Pre/Post-condition Verification Engine",
		category = "Safety",
		status = "SUPPORTED",
		reason = "Automated state read-back and precondition validation active",
		securityLevel = "PluginSecurity",
		riskLevel = "READ_ONLY",
		operations = { "check_preconditions", "verify_postconditions" },
	}

	-- 13. High-Level Workflows
	registry["Workflows"] = {
		name = "High-Level Composite Workflows",
		category = "Workflows",
		status = "SUPPORTED",
		reason = "Composite system generator, scene optimizer, and debug diagnostic workflows active",
		securityLevel = "PluginSecurity",
		riskLevel = "HIGH",
		operations = { "analyze_project", "create_system", "optimize_scene", "find_error" },
	}

	-- 14. HTTP Service
	local httpAvailable = false
	pcall(function()
		httpAvailable = game:GetService("HttpService") ~= nil
	end)
	registry["HTTP"] = {
		name = "HttpService Bridge Transport",
		category = "Transport",
		status = httpAvailable and "SUPPORTED" or "UNSUPPORTED",
		reason = httpAvailable and "HttpService available (requires Allow HTTP Requests in Security settings)" or "HttpService not found",
		securityLevel = "PluginSecurity",
		riskLevel = "LOW",
		operations = { "request_async", "poll", "handshake" },
	}

	-- 15. Security Boundary Prohibitions (Honest Reporting)
	registry["LocalUserAPI"] = {
		name = "LocalUser IDE Internal APIs",
		category = "SecurityBoundary",
		status = "UNAVAILABLE",
		reason = "Restricted by Roblox IDE security level (LocalUserSecurity)",
		securityLevel = "LocalUserSecurity",
		riskLevel = "CRITICAL",
		operations = {},
	}

	registry["CoreScriptAPI"] = {
		name = "CoreScripts & CoreGui Internals",
		category = "SecurityBoundary",
		status = "UNAVAILABLE",
		reason = "Restricted by Roblox CoreScript security level (RobloxScriptSecurity)",
		securityLevel = "RobloxScriptSecurity",
		riskLevel = "CRITICAL",
		operations = {},
	}

	return registry
end

function CapabilityRegistry.GetAll(): { [string]: Capability }
	if next(registry) == nil then
		CapabilityRegistry.Discover()
	end
	return registry
end

function CapabilityRegistry.Get(name: string): Capability?
	return registry[name]
end

return CapabilityRegistry
