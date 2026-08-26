--!strict
local InstanceAdapter = require(script.Parent.Parent.Adapters.InstanceAdapter)
local PropertyAdapter = require(script.Parent.Parent.Adapters.PropertyAdapter)
local AttributeAdapter = require(script.Parent.Parent.Adapters.AttributeAdapter)
local TagAdapter = require(script.Parent.Parent.Adapters.TagAdapter)
local ScriptAdapter = require(script.Parent.Parent.Adapters.ScriptAdapter)
local SelectionAdapter = require(script.Parent.Parent.Adapters.SelectionAdapter)
local OutputAdapter = require(script.Parent.Parent.Adapters.OutputAdapter)
local PlaytestAdapter = require(script.Parent.Parent.Adapters.PlaytestAdapter)
local TerrainAdapter = require(script.Parent.Parent.Adapters.TerrainAdapter)
local HierarchyScanner = require(script.Parent.Parent.Context.HierarchyScanner)
local ContextEngine = require(script.Parent.Parent.Context.ContextEngine)
local TransactionManager = require(script.Parent.TransactionManager)
local InstanceResolver = require(script.Parent.Parent.Addressing.InstanceResolver)
local UuidRegistry = require(script.Parent.Parent.Addressing.UuidRegistry)
local ErrorCodes = require(script.Parent.Parent.Utils.ErrorCodes)

local CommandRouter = {}

type ActionHandler = (params: any) -> (any, ErrorCodes.ErrorObject?)

local actionHandlers: { [string]: ActionHandler } = {
	-- Studio / Info / Inspection
	studio_info = function(_params)
		return {
			success = true,
			placeId = game.PlaceId,
			placeName = game.Name,
			gameId = game.GameId,
			jobId = game.JobId,
			creatorId = game.CreatorId,
			creatorType = tostring(game.CreatorType),
		}, nil
	end,

	studio_get_tree = function(params)
		return HierarchyScanner.GetTree(params)
	end,

	studio_search = function(params)
		return HierarchyScanner.Search(params)
	end,

	studio_inspect = function(params)
		local inst, err = InstanceResolver.Resolve(params.target)
		if not inst then return nil, err end

		local propRes = PropertyAdapter.GetAll({ target = params.target })
		local attrRes = AttributeAdapter.GetAll({ target = params.target })
		local tagsRes = TagAdapter.GetTags({ target = params.target })

		local childSummary = {}
		for _, c in ipairs(inst:GetChildren()) do
			table.insert(childSummary, {
				name = c.Name,
				className = c.ClassName,
				uuid = UuidRegistry.GetOrCreateUuid(c),
			})
		end

		local scriptPreview: string? = nil
		if params.includeScriptSourceSnippet and (inst:IsA("LuaSourceContainer") or inst:IsA("Script") or inst:IsA("LocalScript") or inst:IsA("ModuleScript")) then
			local sRes = ScriptAdapter.GetSource({ target = params.target })
			if sRes and sRes.source then
				local lines = string.split(sRes.source, "\n")
				local previewLines = {}
				for i = 1, math.min(20, #lines) do
					table.insert(previewLines, lines[i])
				end
				scriptPreview = table.concat(previewLines, "\n")
			end
		end

		return {
			success = true,
			uuid = UuidRegistry.GetOrCreateUuid(inst),
			name = inst.Name,
			className = inst.ClassName,
			path = inst:GetFullName(),
			parent = inst.Parent and inst.Parent:GetFullName() or "nil",
			childrenCount = #childSummary,
			children = childSummary,
			properties = propRes and propRes.properties or {},
			attributes = attrRes and attrRes.attributes or {},
			tags = tagsRes and tagsRes.tags or {},
			scriptSourcePreview = scriptPreview,
		}, nil
	end,

	-- Instance Operations
	instance_create = function(params)
		local tx = TransactionManager.BeginTransaction("Create " .. (params.className or "Instance"))
		local res, err = InstanceAdapter.Create(params)
		if res then
			TransactionManager.CommitTransaction("Create " .. (params.className or "Instance"), tx)
		else
			TransactionManager.CancelTransaction(tx)
		end
		return res, err
	end,

	instance_delete = function(params)
		local tx = TransactionManager.BeginTransaction("Delete " .. (params.target or "Instance"))
		local res, err = InstanceAdapter.Delete(params)
		if res then
			TransactionManager.CommitTransaction("Delete " .. (params.target or "Instance"), tx)
		else
			TransactionManager.CancelTransaction(tx)
		end
		return res, err
	end,

	instance_clone = function(params)
		local tx = TransactionManager.BeginTransaction("Clone " .. (params.target or "Instance"))
		local res, err = InstanceAdapter.Clone(params)
		if res then
			TransactionManager.CommitTransaction("Clone " .. (params.target or "Instance"), tx)
		else
			TransactionManager.CancelTransaction(tx)
		end
		return res, err
	end,

	instance_reparent = function(params)
		local tx = TransactionManager.BeginTransaction("Reparent " .. (params.target or "Instance"))
		local res, err = InstanceAdapter.Reparent(params)
		if res then
			TransactionManager.CommitTransaction("Reparent " .. (params.target or "Instance"), tx)
		else
			TransactionManager.CancelTransaction(tx)
		end
		return res, err
	end,

	instance_rename = function(params)
		local tx = TransactionManager.BeginTransaction("Rename " .. (params.target or "Instance"))
		local res, err = InstanceAdapter.Rename(params)
		if res then
			TransactionManager.CommitTransaction("Rename " .. (params.target or "Instance"), tx)
		else
			TransactionManager.CancelTransaction(tx)
		end
		return res, err
	end,

	instance_move = function(params)
		local tx = TransactionManager.BeginTransaction("Move " .. (params.target or "Instance"))
		local res, err = InstanceAdapter.Move(params)
		if res then
			TransactionManager.CommitTransaction("Move " .. (params.target or "Instance"), tx)
		else
			TransactionManager.CancelTransaction(tx)
		end
		return res, err
	end,

	-- Property Operations
	property_get = function(params)
		return PropertyAdapter.Get(params)
	end,

	property_set = function(params)
		local tx = TransactionManager.BeginTransaction("Set " .. (params.property or "Property"))
		local res, err = PropertyAdapter.Set(params)
		if res then
			TransactionManager.CommitTransaction("Set " .. (params.property or "Property"), tx)
		else
			TransactionManager.CancelTransaction(tx)
		end
		return res, err
	end,

	property_get_all = function(params)
		return PropertyAdapter.GetAll(params)
	end,

	-- Attribute Operations
	attribute_get = function(params)
		return AttributeAdapter.Get(params)
	end,

	attribute_set = function(params)
		local tx = TransactionManager.BeginTransaction("Set Attribute " .. (params.attributeName or ""))
		local res, err = AttributeAdapter.Set(params)
		if res then
			TransactionManager.CommitTransaction("Set Attribute", tx)
		else
			TransactionManager.CancelTransaction(tx)
		end
		return res, err
	end,

	attribute_delete = function(params)
		local tx = TransactionManager.BeginTransaction("Delete Attribute " .. (params.attributeName or ""))
		local res, err = AttributeAdapter.Delete(params)
		if res then
			TransactionManager.CommitTransaction("Delete Attribute", tx)
		else
			TransactionManager.CancelTransaction(tx)
		end
		return res, err
	end,

	attribute_get_all = function(params)
		return AttributeAdapter.GetAll(params)
	end,

	-- Tag Operations
	tag_add = function(params)
		return TagAdapter.Add(params)
	end,

	tag_remove = function(params)
		return TagAdapter.Remove(params)
	end,

	tag_get_tags = function(params)
		return TagAdapter.GetTags(params)
	end,

	tag_get_tagged = function(params)
		return TagAdapter.GetTagged(params)
	end,

	-- Script Operations
	script_get_source = function(params)
		return ScriptAdapter.GetSource(params)
	end,

	script_set_source = function(params)
		local tx = TransactionManager.BeginTransaction("Update Script Source " .. (params.target or ""))
		local res, err = ScriptAdapter.SetSource(params)
		if res then
			TransactionManager.CommitTransaction("Update Script Source", tx)
		else
			TransactionManager.CancelTransaction(tx)
		end
		return res, err
	end,

	script_patch_source = function(params)
		local tx = TransactionManager.BeginTransaction("Patch Script " .. (params.target or ""))
		local res, err = ScriptAdapter.PatchSource(params)
		if res then
			TransactionManager.CommitTransaction("Patch Script", tx)
		else
			TransactionManager.CancelTransaction(tx)
		end
		return res, err
	end,

	script_search_code = function(params)
		return ScriptAdapter.SearchCode(params)
	end,

	-- Selection Operations
	selection_get = function(_params)
		return SelectionAdapter.Get()
	end,

	selection_set = function(params)
		return SelectionAdapter.Set(params)
	end,

	selection_add = function(params)
		return SelectionAdapter.Add(params)
	end,

	selection_clear = function(_params)
		return SelectionAdapter.Clear()
	end,

	-- Playtest & Simulation
	playtest_control = function(params)
		return PlaytestAdapter.Control(params)
	end,

	playtest_get_state = function(_params)
		return PlaytestAdapter.GetState()
	end,

	-- Output & Error Observation
	output_get = function(params)
		return OutputAdapter.GetRecent(params)
	end,

	output_get_errors = function(params)
		return OutputAdapter.GetErrors(params)
	end,

	output_clear = function(_params)
		return OutputAdapter.Clear()
	end,

	-- Context & Summary
	context_build = function(params)
		return ContextEngine.BuildSummary(params)
	end,

	context_get_architecture = function(_params)
		return ContextEngine.GetArchitecture()
	end,

	-- Terrain Operations
	terrain_fill_block = function(params)
		local tx = TransactionManager.BeginTransaction("Terrain FillBlock")
		local res, err = TerrainAdapter.FillBlock(params)
		if res then
			TransactionManager.CommitTransaction("Terrain FillBlock", tx)
		else
			TransactionManager.CancelTransaction(tx)
		end
		return res, err
	end,

	terrain_fill_ball = function(params)
		local tx = TransactionManager.BeginTransaction("Terrain FillBall")
		local res, err = TerrainAdapter.FillBall(params)
		if res then
			TransactionManager.CommitTransaction("Terrain FillBall", tx)
		else
			TransactionManager.CancelTransaction(tx)
		end
		return res, err
	end,

	terrain_clear = function(params)
		local tx = TransactionManager.BeginTransaction("Terrain Clear")
		local res, err = TerrainAdapter.Clear(params)
		if res then
			TransactionManager.CommitTransaction("Terrain Clear", tx)
		else
			TransactionManager.CancelTransaction(tx)
		end
		return res, err
	end,

	-- Batch / Transactional Execution
	batch_execute = function(params)
		local txName = params.transactionName or "MCP Batch"
		local stopOnError = params.stopOnError ~= false
		local operations = params.operations or {}

		local tx = TransactionManager.BeginTransaction(txName)
		local results = {}
		local hasError = false
		local failureIndex = -1

		for i, op in ipairs(operations) do
			local opAction = op.action
			local opParams = op.params or {}

			local res, err = CommandRouter.Dispatch(opAction, opParams)
			if err then
				hasError = true
				failureIndex = i
				table.insert(results, {
					index = i,
					action = opAction,
					success = false,
					error = err,
				})
				if stopOnError then
					break
				end
			else
				table.insert(results, {
					index = i,
					action = opAction,
					success = true,
					result = res,
				})
			end
		end

		if hasError and stopOnError then
			TransactionManager.CancelTransaction(tx)
		else
			TransactionManager.CommitTransaction(txName, tx)
		end

		return {
			success = not (hasError and stopOnError),
			totalOperations = #operations,
			executedCount = #results,
			hasError = hasError,
			failureIndex = failureIndex > 0 and failureIndex or nil,
			results = results,
		}, nil
	end,
}

function CommandRouter.Dispatch(action: string, params: any): (any, ErrorCodes.ErrorObject?)
	local handler = actionHandlers[action]
	if not handler then
		return nil, ErrorCodes.Create(
			ErrorCodes.UNSUPPORTED_OPERATION,
			string.format("Action '%s' is not supported by Universal Studio API.", action),
			{ action = action }
		)
	end

	local success, result, err = pcall(function()
		return handler(params or {})
	end)

	if not success then
		return nil, ErrorCodes.Create(
			ErrorCodes.INTERNAL_ERROR,
			string.format("Exception executing '%s': %s", action, tostring(result)),
			{ action = action, trace = debug.traceback() }
		)
	end

	return result, err
end

return CommandRouter
