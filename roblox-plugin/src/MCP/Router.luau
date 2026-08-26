--!strict
-- MCP Request Router: Dispatches incoming MCP commands to Adapters, Engines, and Workflow Processors

local State = require(script.Parent.Parent.Core.State)
local Errors = require(script.Parent.Parent.Core.Errors)
local StudioAdapter = require(script.Parent.Parent.Studio.StudioAdapter)
local InstanceAdapter = require(script.Parent.Parent.Studio.InstanceAdapter)
local PropertyAdapter = require(script.Parent.Parent.Studio.PropertyAdapter)
local AttributeAdapter = require(script.Parent.Parent.Studio.AttributeAdapter)
local ScriptAdapter = require(script.Parent.Parent.Studio.ScriptAdapter)
local SelectionAdapter = require(script.Parent.Parent.Studio.SelectionAdapter)
local ChangeHistoryAdapter = require(script.Parent.Parent.Studio.ChangeHistoryAdapter)
local TerrainAdapter = require(script.Parent.Parent.Studio.TerrainAdapter)
local CapabilityRegistry = require(script.Parent.Parent.Discovery.CapabilityRegistry)
local SearchEngine = require(script.Parent.Parent.Engine.SearchEngine)
local ContextEngine = require(script.Parent.Parent.Engine.ContextEngine)
local ScriptRegistry = require(script.Parent.Parent.Engine.ScriptRegistry)
local WorkflowEngine = require(script.Parent.Parent.Engine.WorkflowEngine)
local VerificationEngine = require(script.Parent.Parent.Engine.VerificationEngine)
local PlaytestAdapter = require(script.Parent.Parent.Adapters.PlaytestAdapter)
local OutputAdapter = require(script.Parent.Parent.Adapters.OutputAdapter)

local Router = {}

type HandlerFn = (params: any) -> (any, Errors.ErrorObject?)

local handlers: { [string]: HandlerFn } = {
	-- 1. System, Health & Capabilities
	["system.diagnostics"] = function(_params)
		return State.GetDiagnostics(), nil
	end,
	["system.health"] = function(_params)
		return { status = "ok", lifecycle = State.Lifecycle, subsystems = State.Subsystems }, nil
	end,
	["studio.info"] = function(_params)
		return StudioAdapter.GetInfo()
	end,
	["studio_info"] = function(_params)
		return StudioAdapter.GetInfo()
	end,
	["studio.capabilities"] = function(_params)
		return { success = true, capabilities = CapabilityRegistry.GetAll() }, nil
	end,
	["studio_capabilities"] = function(_params)
		return { success = true, capabilities = CapabilityRegistry.GetAll() }, nil
	end,

	-- 2. DataModel & Tree & Search
	["studio.get_tree"] = function(params)
		return StudioAdapter.GetTree(params)
	end,
	["studio_get_tree"] = function(params)
		return StudioAdapter.GetTree(params)
	end,
	["studio.search"] = function(params)
		return SearchEngine.Search(params), nil
	end,
	["studio_search"] = function(params)
		return SearchEngine.Search(params), nil
	end,
	["search.instances"] = function(params)
		return SearchEngine.Search(params), nil
	end,
	["search.scripts"] = function(params)
		return ScriptAdapter.SearchCode(params)
	end,
	["search.project"] = function(params)
		local instMatches = SearchEngine.Search(params)
		local codeMatches = params.query and ScriptAdapter.SearchCode({ query = params.query }) or nil
		return { success = true, instances = instMatches.results, code = codeMatches and codeMatches.results or {} }, nil
	end,

	-- 3. Context & Architecture & Code Graph
	["context.project"] = function(_params)
		return ContextEngine.BuildProjectContext(), nil
	end,
	["context.build"] = function(_params)
		return ContextEngine.BuildProjectContext(), nil
	end,
	["context_build"] = function(_params)
		return ContextEngine.BuildProjectContext(), nil
	end,
	["context_get_architecture"] = function(_params)
		return ContextEngine.BuildProjectContext(), nil
	end,
	["context.scope"] = function(params)
		return ContextEngine.BuildScopeContext(params.target or "Workspace"), nil
	end,
	["context.selection"] = function(_params)
		return ContextEngine.BuildSelectionContext(), nil
	end,
	["context.codegraph"] = function(_params)
		return ScriptRegistry.GetCodeGraph(), nil
	end,

	-- 4. High-Level Workflows & Composite Operations
	["project.analyze"] = function(_params)
		return WorkflowEngine.AnalyzeProject(), nil
	end,
	["project_analyze"] = function(_params)
		return WorkflowEngine.AnalyzeProject(), nil
	end,
	["project.map"] = function(params)
		return WorkflowEngine.MapProject(params), nil
	end,
	["project_map"] = function(params)
		return WorkflowEngine.MapProject(params), nil
	end,
	["project.dependencies"] = function(_params)
		return ScriptRegistry.GetCodeGraph(), nil
	end,
	["project_dependencies"] = function(_params)
		return ScriptRegistry.GetCodeGraph(), nil
	end,
	["project.health"] = function(_params)
		return WorkflowEngine.AuditHealth(), nil
	end,
	["project_health"] = function(_params)
		return WorkflowEngine.AuditHealth(), nil
	end,
	["project.repair"] = function(params)
		return WorkflowEngine.RepairProject(params), nil
	end,
	["project_repair"] = function(params)
		return WorkflowEngine.RepairProject(params), nil
	end,

	["system.create"] = function(params)
		return WorkflowEngine.CreateSystem(params), nil
	end,
	["system_create"] = function(params)
		return WorkflowEngine.CreateSystem(params), nil
	end,
	["system.modify"] = function(params)
		return WorkflowEngine.ModifySystem(params), nil
	end,
	["system_modify"] = function(params)
		return WorkflowEngine.ModifySystem(params), nil
	end,
	["system.remove"] = function(params)
		return WorkflowEngine.RemoveSystem(params), nil
	end,
	["system_remove"] = function(params)
		return WorkflowEngine.RemoveSystem(params), nil
	end,

	["scene.analyze"] = function(_params)
		return WorkflowEngine.OptimizeScene({ fixUnanchored = false }), nil
	end,
	["scene_analyze"] = function(_params)
		return WorkflowEngine.OptimizeScene({ fixUnanchored = false }), nil
	end,
	["scene.organize"] = function(_params)
		return WorkflowEngine.OrganizeScene(), nil
	end,
	["scene_organize"] = function(_params)
		return WorkflowEngine.OrganizeScene(), nil
	end,
	["scene.optimize"] = function(params)
		return WorkflowEngine.OptimizeScene(params), nil
	end,
	["scene_optimize"] = function(params)
		return WorkflowEngine.OptimizeScene(params), nil
	end,

	["debug.find_error"] = function(params)
		return WorkflowEngine.FindError(params), nil
	end,
	["debug_find_error"] = function(params)
		return WorkflowEngine.FindError(params), nil
	end,
	["debug.propose_fix"] = function(params)
		return WorkflowEngine.ProposeFix(params), nil
	end,
	["debug_propose_fix"] = function(params)
		return WorkflowEngine.ProposeFix(params), nil
	end,

	["architecture.analyze"] = function(_params)
		return ContextEngine.BuildProjectContext(), nil
	end,
	["architecture_analyze"] = function(_params)
		return ContextEngine.BuildProjectContext(), nil
	end,
	["architecture.plan"] = function(params)
		return { success = true, goal = params.goal or "Feature", steps = { "1. Inspect Architecture", "2. Create Folders & Remotes", "3. Write Server & Client Modules", "4. Run Verification" } }, nil
	end,
	["architecture_plan"] = function(params)
		return { success = true, goal = params.goal or "Feature", steps = { "1. Inspect Architecture", "2. Create Folders & Remotes", "3. Write Server & Client Modules", "4. Run Verification" } }, nil
	end,

	["feature.implement"] = function(params)
		return WorkflowEngine.ImplementFeature(params), nil
	end,
	["feature_implement"] = function(params)
		return WorkflowEngine.ImplementFeature(params), nil
	end,
	["feature.verify"] = function(params)
		return WorkflowEngine.VerifyFeature(params), nil
	end,
	["feature_verify"] = function(params)
		return WorkflowEngine.VerifyFeature(params), nil
	end,
	["game.build_feature"] = function(params)
		return WorkflowEngine.ImplementFeature({
			featureName = params.featureName or "NewFeature",
			description = params.spec and params.spec.description or "",
			serverScript = params.spec and params.spec.serverScript or nil,
			moduleScript = params.spec and params.spec.moduleScript or nil,
			clientScript = params.spec and params.spec.clientScript or nil,
			remotes = params.spec and params.spec.remotes or nil,
		}), nil
	end,
	["game_build_feature"] = function(params)
		return WorkflowEngine.ImplementFeature({
			featureName = params.featureName or "NewFeature",
			description = params.spec and params.spec.description or "",
			serverScript = params.spec and params.spec.serverScript or nil,
			moduleScript = params.spec and params.spec.moduleScript or nil,
			clientScript = params.spec and params.spec.clientScript or nil,
			remotes = params.spec and params.spec.remotes or nil,
		}), nil
	end,

	-- 5. Instances (Verified Mutation)
	["instance.inspect"] = function(params)
		return InstanceAdapter.Inspect(params)
	end,
	["studio_inspect"] = function(params)
		return InstanceAdapter.Inspect(params)
	end,
	["instance.get_children"] = function(params)
		return InstanceAdapter.GetChildren(params)
	end,
	["instance_get_children"] = function(params)
		return InstanceAdapter.GetChildren(params)
	end,
	["instance.get_descendants"] = function(params)
		return InstanceAdapter.GetDescendants(params)
	end,
	["instance_get_descendants"] = function(params)
		return InstanceAdapter.GetDescendants(params)
	end,
	["instance.create"] = function(params)
		local tx = ChangeHistoryAdapter.BeginRecording("Create " .. (params.className or "Instance"))
		local res, err = InstanceAdapter.Create(params)
		ChangeHistoryAdapter.FinishRecording(tx, res ~= nil)
		return res, err
	end,
	["instance_create"] = function(params)
		local tx = ChangeHistoryAdapter.BeginRecording("Create " .. (params.className or "Instance"))
		local res, err = InstanceAdapter.Create(params)
		ChangeHistoryAdapter.FinishRecording(tx, res ~= nil)
		return res, err
	end,
	["instance.delete"] = function(params)
		local tx = ChangeHistoryAdapter.BeginRecording("Delete " .. (params.target or "Instance"))
		local res, err = InstanceAdapter.Delete(params)
		ChangeHistoryAdapter.FinishRecording(tx, res ~= nil)
		return res, err
	end,
	["instance_delete"] = function(params)
		local tx = ChangeHistoryAdapter.BeginRecording("Delete " .. (params.target or "Instance"))
		local res, err = InstanceAdapter.Delete(params)
		ChangeHistoryAdapter.FinishRecording(tx, res ~= nil)
		return res, err
	end,
	["instance.clone"] = function(params)
		local tx = ChangeHistoryAdapter.BeginRecording("Clone " .. (params.target or "Instance"))
		local res, err = InstanceAdapter.Clone(params)
		ChangeHistoryAdapter.FinishRecording(tx, res ~= nil)
		return res, err
	end,
	["instance_clone"] = function(params)
		local tx = ChangeHistoryAdapter.BeginRecording("Clone " .. (params.target or "Instance"))
		local res, err = InstanceAdapter.Clone(params)
		ChangeHistoryAdapter.FinishRecording(tx, res ~= nil)
		return res, err
	end,
	["instance.reparent"] = function(params)
		local tx = ChangeHistoryAdapter.BeginRecording("Reparent " .. (params.target or ""))
		local res, err = InstanceAdapter.Reparent(params)
		ChangeHistoryAdapter.FinishRecording(tx, res ~= nil)
		return res, err
	end,
	["instance_reparent"] = function(params)
		local tx = ChangeHistoryAdapter.BeginRecording("Reparent " .. (params.target or ""))
		local res, err = InstanceAdapter.Reparent(params)
		ChangeHistoryAdapter.FinishRecording(tx, res ~= nil)
		return res, err
	end,
	["instance.rename"] = function(params)
		local tx = ChangeHistoryAdapter.BeginRecording("Rename " .. (params.target or ""))
		local res, err = InstanceAdapter.Rename(params)
		ChangeHistoryAdapter.FinishRecording(tx, res ~= nil)
		return res, err
	end,
	["instance_rename"] = function(params)
		local tx = ChangeHistoryAdapter.BeginRecording("Rename " .. (params.target or ""))
		local res, err = InstanceAdapter.Rename(params)
		ChangeHistoryAdapter.FinishRecording(tx, res ~= nil)
		return res, err
	end,
	["instance.move"] = function(params)
		local tx = ChangeHistoryAdapter.BeginRecording("Move " .. (params.target or ""))
		local res, err = InstanceAdapter.Move(params)
		ChangeHistoryAdapter.FinishRecording(tx, res ~= nil)
		return res, err
	end,
	["instance_move"] = function(params)
		local tx = ChangeHistoryAdapter.BeginRecording("Move " .. (params.target or ""))
		local res, err = InstanceAdapter.Move(params)
		ChangeHistoryAdapter.FinishRecording(tx, res ~= nil)
		return res, err
	end,

	-- 6. Properties
	["property.get"] = function(params)
		return PropertyAdapter.Get(params)
	end,
	["property_get"] = function(params)
		return PropertyAdapter.Get(params)
	end,
	["property.get_all"] = function(params)
		return PropertyAdapter.GetAll(params)
	end,
	["property_get_all"] = function(params)
		return PropertyAdapter.GetAll(params)
	end,
	["property.list"] = function(params)
		return PropertyAdapter.GetAll(params)
	end,
	["property.set"] = function(params)
		local tx = ChangeHistoryAdapter.BeginRecording("Set Property " .. (params.property or ""))
		local res, err = PropertyAdapter.Set(params)
		ChangeHistoryAdapter.FinishRecording(tx, res ~= nil)
		return res, err
	end,
	["property_set"] = function(params)
		local tx = ChangeHistoryAdapter.BeginRecording("Set Property " .. (params.property or ""))
		local res, err = PropertyAdapter.Set(params)
		ChangeHistoryAdapter.FinishRecording(tx, res ~= nil)
		return res, err
	end,

	-- 7. Attributes
	["attribute.get"] = function(params)
		return AttributeAdapter.Get(params)
	end,
	["attribute_get"] = function(params)
		return AttributeAdapter.Get(params)
	end,
	["attribute.get_all"] = function(params)
		return AttributeAdapter.GetAll(params)
	end,
	["attribute_get_all"] = function(params)
		return AttributeAdapter.GetAll(params)
	end,
	["attribute.list"] = function(params)
		return AttributeAdapter.GetAll(params)
	end,
	["attribute.set"] = function(params)
		local tx = ChangeHistoryAdapter.BeginRecording("Set Attribute " .. (params.attributeName or ""))
		local res, err = AttributeAdapter.Set(params)
		ChangeHistoryAdapter.FinishRecording(tx, res ~= nil)
		return res, err
	end,
	["attribute_set"] = function(params)
		local tx = ChangeHistoryAdapter.BeginRecording("Set Attribute " .. (params.attributeName or ""))
		local res, err = AttributeAdapter.Set(params)
		ChangeHistoryAdapter.FinishRecording(tx, res ~= nil)
		return res, err
	end,
	["attribute.delete"] = function(params)
		local tx = ChangeHistoryAdapter.BeginRecording("Delete Attribute " .. (params.attributeName or ""))
		local res, err = AttributeAdapter.Delete(params)
		ChangeHistoryAdapter.FinishRecording(tx, res ~= nil)
		return res, err
	end,
	["attribute_delete"] = function(params)
		local tx = ChangeHistoryAdapter.BeginRecording("Delete Attribute " .. (params.attributeName or ""))
		local res, err = AttributeAdapter.Delete(params)
		ChangeHistoryAdapter.FinishRecording(tx, res ~= nil)
		return res, err
	end,

	-- 8. Selection
	["selection.get"] = function(_params)
		return SelectionAdapter.Get()
	end,
	["selection_get"] = function(_params)
		return SelectionAdapter.Get()
	end,
	["selection.set"] = function(params)
		local instances = {}
		if params.targets then
			for _, t in ipairs(params.targets) do
				local inst = InstanceAdapter.Resolve(t)
				if inst then table.insert(instances, inst) end
			end
		end
		return SelectionAdapter.Set(instances)
	end,
	["selection_set"] = function(params)
		local instances = {}
		if params.targets then
			for _, t in ipairs(params.targets) do
				local inst = InstanceAdapter.Resolve(t)
				if inst then table.insert(instances, inst) end
			end
		end
		return SelectionAdapter.Set(instances)
	end,
	["selection_add"] = function(params)
		local instances = {}
		if params.targets then
			for _, t in ipairs(params.targets) do
				local inst = InstanceAdapter.Resolve(t)
				if inst then table.insert(instances, inst) end
			end
		end
		return SelectionAdapter.Add(instances)
	end,
	["selection.clear"] = function(_params)
		return SelectionAdapter.Clear()
	end,
	["selection_clear"] = function(_params)
		return SelectionAdapter.Clear()
	end,

	-- 9. Scripts
	["script.get_source"] = function(params)
		return ScriptAdapter.GetSource(params)
	end,
	["script_get_source"] = function(params)
		return ScriptAdapter.GetSource(params)
	end,
	["script.set_source"] = function(params)
		local tx = ChangeHistoryAdapter.BeginRecording("Update Script " .. (params.target or ""))
		local res, err = ScriptAdapter.SetSource(params)
		ChangeHistoryAdapter.FinishRecording(tx, res ~= nil)
		return res, err
	end,
	["script_set_source"] = function(params)
		local tx = ChangeHistoryAdapter.BeginRecording("Update Script " .. (params.target or ""))
		local res, err = ScriptAdapter.SetSource(params)
		ChangeHistoryAdapter.FinishRecording(tx, res ~= nil)
		return res, err
	end,
	["script.patch"] = function(params)
		local tx = ChangeHistoryAdapter.BeginRecording("Patch Script " .. (params.target or ""))
		local res, err = ScriptAdapter.PatchSource(params)
		ChangeHistoryAdapter.FinishRecording(tx, res ~= nil)
		return res, err
	end,
	["script_patch_source"] = function(params)
		local tx = ChangeHistoryAdapter.BeginRecording("Patch Script " .. (params.target or ""))
		local res, err = ScriptAdapter.PatchSource(params)
		ChangeHistoryAdapter.FinishRecording(tx, res ~= nil)
		return res, err
	end,
	["script.search"] = function(params)
		return ScriptAdapter.SearchCode(params)
	end,
	["script_search_code"] = function(params)
		return ScriptAdapter.SearchCode(params)
	end,

	-- 10. Terrain
	["terrain_fill_block"] = function(params)
		local tx = ChangeHistoryAdapter.BeginRecording("Terrain FillBlock")
		local res, err = TerrainAdapter.FillBlock(params)
		ChangeHistoryAdapter.FinishRecording(tx, res ~= nil)
		return res, err
	end,
	["terrain_fill_ball"] = function(params)
		local tx = ChangeHistoryAdapter.BeginRecording("Terrain FillBall")
		local res, err = TerrainAdapter.FillBall(params)
		ChangeHistoryAdapter.FinishRecording(tx, res ~= nil)
		return res, err
	end,
	["terrain_clear"] = function(_params)
		local tx = ChangeHistoryAdapter.BeginRecording("Terrain Clear")
		local res, err = TerrainAdapter.Clear()
		ChangeHistoryAdapter.FinishRecording(tx, res ~= nil)
		return res, err
	end,

	-- 11. Playtest & Simulation Control
	["playtest.state"] = function(_params)
		return PlaytestAdapter.GetState()
	end,
	["playtest_get_state"] = function(_params)
		return PlaytestAdapter.GetState()
	end,
	["playtest.control"] = function(params)
		return PlaytestAdapter.Control(params)
	end,
	["playtest_control"] = function(params)
		return PlaytestAdapter.Control(params)
	end,

	-- 12. Studio Console Output & Diagnostics
	["output.get"] = function(params)
		return OutputAdapter.GetRecent(params)
	end,
	["output_get"] = function(params)
		return OutputAdapter.GetRecent(params)
	end,
	["output.errors"] = function(params)
		return OutputAdapter.GetRecent({ limit = params.limit or 50, filterType = "MessageError" })
	end,
	["output_get_errors"] = function(params)
		return OutputAdapter.GetRecent({ limit = params.limit or 50, filterType = "MessageError" })
	end,
	["output.clear"] = function(_params)
		return OutputAdapter.Clear()
	end,
	["output_clear"] = function(_params)
		return OutputAdapter.Clear()
	end,

	-- 13. Batch Operations
	["batch.execute"] = function(params)
		local actions = params.actions or {}
		local tx = ChangeHistoryAdapter.BeginRecording("Batch MCP Execution (" .. #actions .. " actions)")
		local results = {}
		local overallSuccess = true

		for i, item in ipairs(actions) do
			local h = handlers[item.action]
			if h then
				local res, err = h(item.params or {})
				table.insert(results, { index = i, action = item.action, success = (err == nil), result = res, error = err })
				if err and params.stopOnError then
					overallSuccess = false
					break
				end
			else
				table.insert(results, { index = i, action = item.action, success = false, error = { code = "UNSUPPORTED_API", message = "Action not supported: " .. tostring(item.action) } })
				if params.stopOnError then
					overallSuccess = false
					break
				end
			end
		end

		ChangeHistoryAdapter.FinishRecording(tx, overallSuccess)
		return { success = overallSuccess, count = #results, results = results }, nil
	end,
	["batch_execute"] = function(params)
		local actions = params.actions or {}
		local tx = ChangeHistoryAdapter.BeginRecording("Batch MCP Execution (" .. #actions .. " actions)")
		local results = {}
		local overallSuccess = true

		for i, item in ipairs(actions) do
			local h = handlers[item.action]
			if h then
				local res, err = h(item.params or {})
				table.insert(results, { index = i, action = item.action, success = (err == nil), result = res, error = err })
				if err and params.stopOnError then
					overallSuccess = false
					break
				end
			else
				table.insert(results, { index = i, action = item.action, success = false, error = { code = "UNSUPPORTED_API", message = "Action not supported: " .. tostring(item.action) } })
				if params.stopOnError then
					overallSuccess = false
					break
				end
			end
		end

		ChangeHistoryAdapter.FinishRecording(tx, overallSuccess)
		return { success = overallSuccess, count = #results, results = results }, nil
	end,
}

function Router.Dispatch(action: string, params: any): (any, Errors.ErrorObject?)
	local handler = handlers[action]
	if not handler then
		return nil, Errors.Create(
			Errors.UNSUPPORTED_API,
			string.format("Action '%s' is not supported by Universal Studio API.", action)
		)
	end

	local success, result, err = pcall(function()
		return handler(params or {})
	end)

	if not success then
		return nil, Errors.Create(
			Errors.INTERNAL_ERROR,
			string.format("Exception executing '%s': %s", action, tostring(result))
		)
	end

	return result, err
end

return Router
