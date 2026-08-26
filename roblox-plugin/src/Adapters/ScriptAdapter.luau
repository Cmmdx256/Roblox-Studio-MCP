--!strict
local ScriptEditorService = game:GetService("ScriptEditorService")
local InstanceResolver = require(script.Parent.Parent.Addressing.InstanceResolver)
local ErrorCodes = require(script.Parent.Parent.Utils.ErrorCodes)

local ScriptAdapter = {}

-- Helper to check if an instance is a script
local function isScriptInstance(inst: Instance): boolean
	return inst:IsA("LuaSourceContainer") or inst:IsA("Script") or inst:IsA("LocalScript") or inst:IsA("ModuleScript")
end

-- Read source safely with ScriptEditorService fallback
function ScriptAdapter.GetSource(params: { target: string }): (any, ErrorCodes.ErrorObject?)
	local inst, err = InstanceResolver.Resolve(params.target)
	if not inst then
		return nil, err
	end

	if not isScriptInstance(inst) then
		return nil, ErrorCodes.Create(
			ErrorCodes.INVALID_ARGUMENT,
			string.format("Instance '%s' of class '%s' is not a script.", inst.Name, inst.ClassName),
			{ target = params.target, className = inst.ClassName }
		)
	end

	local source: string? = nil

	-- 1. Try ScriptEditorService
	pcall(function()
		source = ScriptEditorService:GetEditorSource(inst :: any)
	end)

	-- 2. Fallback to Script.Source
	if source == nil then
		local success, readErr = pcall(function()
			source = (inst :: any).Source
		end)
		if not success or source == nil then
			return nil, ErrorCodes.Create(
				ErrorCodes.SCRIPT_NOT_EDITABLE,
				string.format("Cannot read source of '%s': %s", params.target, tostring(readErr)),
				{ target = params.target }
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

-- Write source safely with ScriptEditorService fallback
function ScriptAdapter.SetSource(params: { target: string, source: string }): (any, ErrorCodes.ErrorObject?)
	local inst, err = InstanceResolver.Resolve(params.target)
	if not inst then
		return nil, err
	end

	if not isScriptInstance(inst) then
		return nil, ErrorCodes.Create(ErrorCodes.INVALID_ARGUMENT, string.format("Instance '%s' is not a script.", inst.Name))
	end

	if params.source == nil or type(params.source) ~= "string" then
		return nil, ErrorCodes.Create(ErrorCodes.INVALID_ARGUMENT, "Parameter 'source' must be a string.")
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
		return nil, ErrorCodes.Create(
			ErrorCodes.SCRIPT_NOT_EDITABLE,
			string.format("Failed to update script source for '%s': %s", params.target, tostring(updateErr)),
			{ target = params.target }
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

-- Patch source (search & replace or regex)
function ScriptAdapter.PatchSource(params: {
	target: string,
	search: string,
	replacement: string,
	isRegex: boolean?,
	allowMultiple: boolean?,
}): (any, ErrorCodes.ErrorObject?)
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
		-- Escape Lua pattern characters for exact string match
		local pattern = string.gsub(params.search, "([%%%^%$%(%)%%.%[%]%*%+%-%?])", "%%%1")
		newSource, count = string.gsub(source, pattern, params.replacement, params.allowMultiple and 0 or 1)
	end

	if count == 0 then
		return nil, ErrorCodes.Create(
			ErrorCodes.SCRIPT_PATCH_FAILED,
			string.format("Search target not found in script '%s'.", params.target),
			{ target = params.target, search = params.search }
		)
	end

	return ScriptAdapter.SetSource({
		target = params.target,
		source = newSource,
	})
end

-- Project-wide code search
function ScriptAdapter.SearchCode(params: {
	query: string,
	scope: string?,
	caseSensitive: boolean?,
	isRegex: boolean?,
	maxResults: number?,
}): (any, ErrorCodes.ErrorObject?)
	if not params.query or #params.query == 0 then
		return nil, ErrorCodes.Create(ErrorCodes.INVALID_ARGUMENT, "Parameter 'query' cannot be empty.")
	end

	local scopeRoot: Instance = game
	if params.scope and params.scope ~= "game" then
		local sInst, sErr = InstanceResolver.Resolve(params.scope)
		if sInst then
			scopeRoot = sInst
		else
			return nil, sErr
		end
	end

	local maxResults = params.maxResults or 50
	local results = {}
	local totalMatches = 0

	local queryPattern = params.query
	if not params.isRegex then
		queryPattern = string.gsub(params.query, "([%%%^%$%(%)%%.%[%]%*%+%-%?])", "%%%1")
	end
	if not params.caseSensitive then
		queryPattern = string.lower(queryPattern)
	end

	local function processScript(scriptInst: Instance)
		if totalMatches >= maxResults then return end

		local source: string? = nil
		pcall(function()
			source = (scriptInst :: any).Source
		end)

		if not source or #source == 0 then return end

		local lines = string.split(source, "\n")
		local matchesInScript = {}

		for lineNum, line in ipairs(lines) do
			local testLine = params.caseSensitive and line or string.lower(line)
			if string.find(testLine, queryPattern) then
				table.insert(matchesInScript, {
					line = lineNum,
					content = line,
				})
				totalMatches += 1
				if totalMatches >= maxResults then break end
			end
		end

		if #matchesInScript > 0 then
			table.insert(results, {
				path = scriptInst:GetFullName(),
				name = scriptInst.Name,
				className = scriptInst.ClassName,
				matches = matchesInScript,
			})
		end
	end

	-- Traverse descendants
	for _, desc in ipairs(scopeRoot:GetDescendants()) do
		if isScriptInstance(desc) then
			processScript(desc)
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
