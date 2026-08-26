--!strict
-- Studio Adapter: Deep inspection, Tree traversal, Architecture mapping, and Service validation

local State = require(script.Parent.Parent.Core.State)
local Logger = require(script.Parent.Parent.Core.Logger)
local Errors = require(script.Parent.Parent.Core.Errors)
local Utils = require(script.Parent.Parent.Core.Utils)
local CollectionService = game:GetService("CollectionService")
local MarketplaceService = game:GetService("MarketplaceService")

local StudioAdapter = {}

local KEY_SERVICES = {
	"Workspace",
	"ReplicatedStorage",
	"ServerScriptService",
	"ServerStorage",
	"StarterGui",
	"StarterPack",
	"StarterPlayer",
	"Lighting",
	"SoundService",
	"MaterialService",
	"Teams",
	"ReplicatedFirst",
	"TextChatService",
}

function StudioAdapter.ResolvePlaceName(): (string, string?, boolean)
	local placeName = game.Name
	local creatorName: string? = nil
	local isPublished = false

	if game.PlaceId > 0 then
		isPublished = true
		local success, info = pcall(function()
			return MarketplaceService:GetProductInfo(game.PlaceId, Enum.InfoType.Asset)
		end)

		if success and info and info.Name and #info.Name > 0 then
			placeName = info.Name
			if info.Creator and info.Creator.Name then
				creatorName = info.Creator.Name
			end
		end
	else
		-- Unsaved / Local project
		if placeName == "Place1" or placeName == "Game" or placeName == "DataModel" then
			placeName = "Local Place (Unpublished)"
		end
	end

	return placeName, creatorName, isPublished
end

function StudioAdapter.Initialize(): boolean
	local realPlaceName, creatorName, isPublished = StudioAdapter.ResolvePlaceName()

	State.SetSubsystem("DataModel", "OK")
	State.PlaceInfo.PlaceName = realPlaceName
	State.PlaceInfo.PlaceId = game.PlaceId
	State.PlaceInfo.GameId = game.GameId

	-- 2. Validate Selection Service
	local successSel, selService = pcall(function()
		return game:GetService("Selection")
	end)
	if successSel and selService then
		State.SetSubsystem("Selection", "OK")
	else
		State.SetSubsystem("Selection", "UNAVAILABLE")
	end

	-- 3. Validate ChangeHistoryService
	local successHistory, histService = pcall(function()
		return game:GetService("ChangeHistoryService")
	end)
	if successHistory and histService then
		State.SetSubsystem("ChangeHistory", "OK")
	else
		State.SetSubsystem("ChangeHistory", "UNAVAILABLE")
	end

	-- 4. Validate ScriptEditorService
	local successScriptEditor, ses = pcall(function()
		return game:GetService("ScriptEditorService")
	end)
	if successScriptEditor and ses then
		State.SetSubsystem("ScriptAPI", "FULL")
	else
		State.SetSubsystem("ScriptAPI", "FALLBACK")
	end

	-- 5. Validate HttpService
	local successHttp, httpService = pcall(function()
		return game:GetService("HttpService")
	end)
	if successHttp and httpService then
		local testSuccess, testRes = pcall(function()
			return httpService:GetAsync("http://127.0.0.1:38883/api/status")
		end)
		if testSuccess then
			State.SetSubsystem("HTTP", "OK")
		else
			local errStr = tostring(testRes or "")
			if string.find(errStr:lower(), "not allowed") or string.find(errStr:lower(), "http") then
				State.SetSubsystem("HTTP", "BLOCKED")
			else
				State.SetSubsystem("HTTP", "READY")
			end
		end
	else
		State.SetSubsystem("HTTP", "UNAVAILABLE")
	end

	State.SetSubsystem("StudioAPI", "OK")
	return true
end

function StudioAdapter.GetInfo(): (any, Errors.ErrorObject?)
	local realPlaceName, creatorName, isPublished = StudioAdapter.ResolvePlaceName()

	local serviceStats = {}
	for _, sName in ipairs(KEY_SERVICES) do
		pcall(function()
			local s = game:GetService(sName)
			if s then
				serviceStats[sName] = #s:GetChildren()
			end
		end)
	end

	return {
		success = true,
		placeId = game.PlaceId,
		placeName = realPlaceName,
		gameId = game.GameId,
		jobId = game.JobId,
		isPublished = isPublished,
		creatorId = game.CreatorId,
		creatorName = creatorName,
		creatorType = tostring(game.CreatorType),
		placeVersion = game.PlaceVersion,
		diagnostics = State.GetDiagnostics(),
		serviceStats = serviceStats,
	}, nil
end

local function serializeTreeNode(inst: Instance, currentDepth: number, maxDepth: number, classFilterMap: { [string]: boolean }?, limitRef: { count: number, max: number }): any
	if limitRef.count >= limitRef.max then
		return nil
	end
	limitRef.count += 1

	local node: { [string]: any } = {
		name = inst.Name,
		className = inst.ClassName,
		path = inst:GetFullName(),
		childrenCount = #inst:GetChildren(),
	}

	if inst:IsA("BasePart") then
		node.position = { math.floor(inst.Position.X * 100) / 100, math.floor(inst.Position.Y * 100) / 100, math.floor(inst.Position.Z * 100) / 100 }
		node.size = { math.floor(inst.Size.X * 100) / 100, math.floor(inst.Size.Y * 100) / 100, math.floor(inst.Size.Z * 100) / 100 }
		node.material = inst.Material.Name
		node.transparency = inst.Transparency
		node.anchored = inst.Anchored
		node.canCollide = inst.CanCollide
	elseif inst:IsA("Model") and inst.PrimaryPart then
		node.primaryPart = inst.PrimaryPart.Name
	elseif inst:IsA("LuaSourceContainer") or inst:IsA("Script") or inst:IsA("LocalScript") or inst:IsA("ModuleScript") then
		local s = ""
		pcall(function() s = (inst :: any).Source end)
		node.scriptLines = s and #string.split(s, "\n") or 0
	end

	if currentDepth < maxDepth and #inst:GetChildren() > 0 then
		local children = {}
		for _, child in ipairs(inst:GetChildren()) do
			if limitRef.count >= limitRef.max then break end
			if not classFilterMap or classFilterMap[child.ClassName] or (child:IsA("Folder") or child:IsA("Model")) then
				local childNode = serializeTreeNode(child, currentDepth + 1, maxDepth, classFilterMap, limitRef)
				if childNode then
					table.insert(children, childNode)
				end
			end
		end
		node.children = children
	end

	return node
end

function StudioAdapter.GetTree(params: {
	root: string?,
	depth: number?,
	limit: number?,
	classFilter: { string }?,
}): (any, Errors.ErrorObject?)
	local rootInst: Instance = workspace
	if params.root and params.root ~= "game" and params.root ~= "DataModel" then
		local InstanceAdapter = require(script.Parent.InstanceAdapter)
		local resolved, err = InstanceAdapter.Resolve(params.root)
		if not resolved then
			return nil, err
		end
		rootInst = resolved
	elseif params.root == "game" or params.root == "DataModel" then
		rootInst = game
	end

	local maxDepth = params.depth or 3
	local maxLimit = params.limit or 200

	local classFilterMap: { [string]: boolean }? = nil
	if params.classFilter and #params.classFilter > 0 then
		classFilterMap = {}
		for _, c in ipairs(params.classFilter) do
			classFilterMap[c] = true
		end
	end

	local limitRef = { count = 0, max = maxLimit }
	local tree = serializeTreeNode(rootInst, 0, maxDepth, classFilterMap, limitRef)

	return {
		success = true,
		root = rootInst:GetFullName(),
		totalNodes = limitRef.count,
		tree = tree,
	}, nil
end

function StudioAdapter.Search(params: {
	query: string?,
	className: string?,
	tag: string?,
	attributeName: string?,
	attributeValue: any?,
	scope: string?,
	limit: number?,
}): (any, Errors.ErrorObject?)
	local scopeInst: Instance = game
	if params.scope and params.scope ~= "game" then
		local InstanceAdapter = require(script.Parent.InstanceAdapter)
		local resolved, err = InstanceAdapter.Resolve(params.scope)
		if not resolved then
			return nil, err
		end
		scopeInst = resolved
	end

	local maxResults = params.limit or 100
	local results = {}

	local qLower = params.query and string.lower(params.query) or nil

	for _, inst in ipairs(scopeInst:GetDescendants()) do
		local matched = true

		if qLower and not string.find(string.lower(inst.Name), qLower) then
			matched = false
		end

		if matched and params.className and inst.ClassName ~= params.className and not inst:IsA(params.className) then
			matched = false
		end

		if matched and params.tag then
			local hasTag = false
			pcall(function()
				hasTag = CollectionService:HasTag(inst, params.tag :: string)
			end)
			if not hasTag then
				matched = false
			end
		end

		if matched and params.attributeName then
			local attrVal = inst:GetAttribute(params.attributeName)
			if attrVal == nil then
				matched = false
			elseif params.attributeValue ~= nil and attrVal ~= params.attributeValue then
				matched = false
			end
		end

		if matched then
			table.insert(results, {
				name = inst.Name,
				className = inst.ClassName,
				path = inst:GetFullName(),
				parent = inst.Parent and inst.Parent:GetFullName() or "nil",
			})
			if #results >= maxResults then
				break
			end
		end
	end

	return {
		success = true,
		count = #results,
		results = results,
	}, nil
end

function StudioAdapter.GetArchitecture(): (any, Errors.ErrorObject?)
	local realPlaceName = StudioAdapter.ResolvePlaceName()
	local remotes = {}
	local scripts = {}
	local serviceSummary = {}

	for _, sName in ipairs(KEY_SERVICES) do
		pcall(function()
			local s = game:GetService(sName)
			if s then
				serviceSummary[sName] = {
					childCount = #s:GetChildren(),
					descendantCount = #s:GetDescendants(),
				}

				for _, desc in ipairs(s:GetDescendants()) do
					if desc:IsA("RemoteEvent") or desc:IsA("RemoteFunction") or desc:IsA("BindableEvent") or desc:IsA("BindableFunction") then
						table.insert(remotes, {
							name = desc.Name,
							className = desc.ClassName,
							path = desc:GetFullName(),
						})
					elseif desc:IsA("LuaSourceContainer") or desc:IsA("Script") or desc:IsA("LocalScript") or desc:IsA("ModuleScript") then
						table.insert(scripts, {
							name = desc.Name,
							className = desc.ClassName,
							path = desc:GetFullName(),
						})
					end
				end
			end
		end)
	end

	return {
		success = true,
		placeName = realPlaceName,
		placeId = game.PlaceId,
		services = serviceSummary,
		remotesCount = #remotes,
		remotes = remotes,
		scriptsCount = #scripts,
		scripts = scripts,
	}, nil
end

return StudioAdapter
