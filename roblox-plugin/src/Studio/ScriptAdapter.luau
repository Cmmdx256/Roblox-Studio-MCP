--!strict
-- Script Adapter: Verified reading and writing of Script, LocalScript, ModuleScript source

local ScriptEditorService = game:GetService("ScriptEditorService")
local Errors = require(script.Parent.Parent.Core.Errors)
local InstanceAdapter = require(script.Parent.InstanceAdapter)

local ScriptAdapter = {}

local function isScriptInstance(inst: Instance): boolean
	return inst:IsA("LuaSourceContainer") or inst:IsA("Script") or inst:IsA("LocalScript") or inst:IsA("ModuleScript")
end

function ScriptAdapter.GetSource(params: { target: string }): (any, Errors.ErrorObject?)
	local inst, err = InstanceAdapter.Resolve(params.target)
	if not inst then
		return nil, err
	end

	if not isScriptInstance(inst) then
		return nil, Errors.Create(
			Errors.INVALID_ARGUMENT,
			string.format("Instance '%s' (%s) is not a Script, LocalScript, or ModuleScript.", inst.Name, inst.ClassName),
			nil,
			params.target
		)
	end

	local source: string? = nil

	-- 1. Try modern ScriptEditorService
	pcall(function()
		source = ScriptEditorService:GetEditorSource(inst :: any)
	end)

	-- 2. Fallback to Script.Source
	if source == nil then
		local success, readErr = pcall(function()
			source = (inst :: any).Source
		end)
		if not success or source == nil then
			return nil, Errors.Create(
				Errors.SCRIPT_NOT_EDITABLE,
				string.format("Cannot read source of '%s': %s", params.target, tostring(readErr)),
				nil,
				params.target
			)
		end
	end

	local lines = string.split(source, "\n")

	return {
		success = true,
		target = inst:GetFullName(),
		className = inst.ClassName,
		lineCount = #lines,
		characterCount = #source,
		source = source,
	}, nil
end

function ScriptAdapter.SetSource(params: { target: string, source: string }): (any, Errors.ErrorObject?)
	local inst, err = InstanceAdapter.Resolve(params.target)
	if not inst then
		return nil, err
	end

	if not isScriptInstance(inst) then
		return nil, Errors.Create(Errors.INVALID_ARGUMENT, string.format("Instance '%s' is not a script.", inst.Name), nil, params.target)
	end

	if params.source == nil or type(params.source) ~= "string" then
		return nil, Errors.Create(Errors.INVALID_ARGUMENT, "Parameter 'source' must be a string.")
	end

	local updated = false
	local updateErr: any = nil

	-- 1. Try ScriptEditorService:UpdateSourceAsync
	pcall(function()
		ScriptEditorService:UpdateSourceAsync(inst :: any, function(_oldSource)
			return params.source
		end)
		updated = true
	end)

	-- 2. Fallback to direct Source property
	if not updated then
		local success, setErr = pcall(function()
			(inst :: any).Source = params.source
		end)
		if success then
			updated = true
		else
			updateErr = setErr
		end
	end

	if not updated then
		return nil, Errors.Create(
			Errors.SCRIPT_NOT_EDITABLE,
			string.format("Failed to update script source for '%s': %s", params.target, tostring(updateErr)),
			nil,
			params.target
		)
	end

	local lines = string.split(params.source, "\n")

	return {
		success = true,
		target = inst:GetFullName(),
		className = inst.ClassName,
		lineCount = #lines,
		characterCount = #params.source,
	}, nil
end

function ScriptAdapter.PatchSource(params: {
	target: string,
	search: string,
	replacement: string,
	isRegex: boolean?,
	allowMultiple: boolean?,
}): (any, Errors.ErrorObject?)
	local currentData, readErr = ScriptAdapter.GetSource({ target = params.target })
	if not currentData then
		return nil, readErr
	end

	local source = currentData.source
	local newSource: string
	local count = 0

	if params.isRegex then
		newSource, count = string.gsub(source, params.search, params.replacement, params.allowMultiple and 0 or 1)
	else
		local pattern = string.gsub(params.search, "([%%%^%$%(%)%%.%[%]%*%+%-%?])", "%%%1")
		newSource, count = string.gsub(source, pattern, params.replacement, params.allowMultiple and 0 or 1)
	end

	if count == 0 then
		return nil, Errors.Create(
			Errors.SCRIPT_PATCH_FAILED,
			string.format("Search pattern not found in script '%s'.", params.target),
			{ target = params.target, search = params.search }
		)
	end

	return ScriptAdapter.SetSource({
		target = params.target,
		source = newSource,
	})
end

function ScriptAdapter.SearchCode(params: {
	query: string,
	scope: string?,
	caseSensitive: boolean?,
	maxResults: number?,
}): (any, Errors.ErrorObject?)
	if not params.query or #params.query == 0 then
		return nil, Errors.Create(Errors.INVALID_ARGUMENT, "Parameter 'query' cannot be empty.")
	end

	local scopeRoot: Instance = game
	if params.scope and params.scope ~= "game" then
		local sInst, sErr = InstanceAdapter.Resolve(params.scope)
		if sInst then
			scopeRoot = sInst
		else
			return nil, sErr
		end
	end

	local maxResults = params.maxResults or 50
	local results = {}
	local totalMatches = 0

	local pattern = string.gsub(params.query, "([%%%^%$%(%)%%.%[%]%*%+%-%?])", "%%%1")
	if not params.caseSensitive then
		pattern = string.lower(pattern)
	end

	for _, desc in ipairs(scopeRoot:GetDescendants()) do
		if isScriptInstance(desc) then
			local source: string? = nil
			pcall(function() source = (desc :: any).Source end)

			if source and #source > 0 then
				local lines = string.split(source, "\n")
				local scriptMatches = {}

				for lineNum, line in ipairs(lines) do
					local testLine = params.caseSensitive and line or string.lower(line)
					if string.find(testLine, pattern) then
						table.insert(scriptMatches, {
							line = lineNum,
							content = line,
						})
						totalMatches += 1
						if totalMatches >= maxResults then break end
					end
				end

				if #scriptMatches > 0 then
					table.insert(results, {
						path = desc:GetFullName(),
						className = desc.ClassName,
						matches = scriptMatches,
					})
				end
			end

			if totalMatches >= maxResults then break end
		end
	end

	return {
		success = true,
		query = params.query,
		totalMatches = totalMatches,
		matchingScriptsCount = #results,
		results = results,
	}, nil
end

return ScriptAdapter
