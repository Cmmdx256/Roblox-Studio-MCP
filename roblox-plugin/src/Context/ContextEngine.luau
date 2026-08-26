--!strict
local ErrorCodes = require(script.Parent.Parent.Utils.ErrorCodes)

local ContextEngine = {}

local KEY_SERVICES = {
	"Workspace",
	"ReplicatedStorage",
	"ServerScriptService",
	"ServerStorage",
	"StarterGui",
	"StarterPlayer",
	"Lighting",
	"SoundService",
}

function ContextEngine.BuildSummary(params: { maxDepth: number?, includeScriptSummaries: boolean? }): (any, ErrorCodes.ErrorObject?)
	local maxDepth = params.maxDepth or 3
	local includeScripts = params.includeScriptSummaries ~= false

	local servicesOverview: { [string]: any } = {}
	local scriptCount = 0
	local moduleCount = 0
	local remoteEventCount = 0
	local remoteFunctionCount = 0
	local modelCount = 0
	local totalInstances = 0

	local remotes = {}
	local scripts = {}

	local function scanService(serviceName: string)
		local service: Instance? = nil
		pcall(function()
			service = game:GetService(serviceName)
		end)
		if not service then return end

		local function summarizeNode(inst: Instance, depth: number): any
			totalInstances += 1

			if inst:IsA("Script") then
				scriptCount += 1
				if includeScripts and #scripts < 30 then
					table.insert(scripts, { path = inst:GetFullName(), className = inst.ClassName })
				end
			elseif inst:IsA("LocalScript") then
				scriptCount += 1
				if includeScripts and #scripts < 30 then
					table.insert(scripts, { path = inst:GetFullName(), className = inst.ClassName })
				end
			elseif inst:IsA("ModuleScript") then
				moduleCount += 1
				if includeScripts and #scripts < 30 then
					table.insert(scripts, { path = inst:GetFullName(), className = inst.ClassName })
				end
			elseif inst:IsA("RemoteEvent") then
				remoteEventCount += 1
				if #remotes < 25 then
					table.insert(remotes, { name = inst.Name, path = inst:GetFullName(), type = "RemoteEvent" })
				end
			elseif inst:IsA("RemoteFunction") then
				remoteFunctionCount += 1
				if #remotes < 25 then
					table.insert(remotes, { name = inst.Name, path = inst:GetFullName(), type = "RemoteFunction" })
				end
			elseif inst:IsA("Model") then
				modelCount += 1
			end

			if depth >= maxDepth then
				local childCount = #inst:GetChildren()
				if childCount > 0 then
					return { _summary = string.format("%d children", childCount) }
				else
					return nil
				end
			end

			local children = inst:GetChildren()
			if #children == 0 then
				return nil
			end

			local childMap: { [string]: any } = {}
			for _, child in ipairs(children) do
				-- Only detail containers, models, folders, scripts, remotes
				if child:IsA("Folder") or child:IsA("Model") or child:IsA("LuaSourceContainer") or child:IsA("RemoteEvent") or child:IsA("RemoteFunction") or child:IsA("ScreenGui") then
					childMap[child.Name .. " (" .. child.ClassName .. ")"] = summarizeNode(child, depth + 1)
				end
			end

			return childMap
		end

		servicesOverview[serviceName] = summarizeNode(service, 1)
	end

	for _, sName in ipairs(KEY_SERVICES) do
		scanService(sName)
	end

	return {
		success = true,
		placeInfo = {
			placeId = game.PlaceId,
			gameId = game.GameId,
		},
		metrics = {
			totalInstancesScanned = totalInstances,
			serverScripts = scriptCount,
			moduleScripts = moduleCount,
			remoteEvents = remoteEventCount,
			remoteFunctions = remoteFunctionCount,
			models = modelCount,
		},
		remotes = remotes,
		keyScripts = scripts,
		hierarchy = servicesOverview,
	}, nil
end

function ContextEngine.GetArchitecture(): (any, ErrorCodes.ErrorObject?)
	local remotes = {}
	local sharedModules = {}
	local serverModules = {}

	local repStorage: Instance? = nil
	pcall(function() repStorage = game:GetService("ReplicatedStorage") end)
	if repStorage then
		for _, desc in ipairs(repStorage:GetDescendants()) do
			if desc:IsA("RemoteEvent") or desc:IsA("RemoteFunction") or desc:IsA("BindableEvent") then
				table.insert(remotes, { name = desc.Name, className = desc.ClassName, path = desc:GetFullName() })
			elseif desc:IsA("ModuleScript") then
				table.insert(sharedModules, { name = desc.Name, path = desc:GetFullName() })
			end
		end
	end

	local sss: Instance? = nil
	pcall(function() sss = game:GetService("ServerScriptService") end)
	if sss then
		for _, desc in ipairs(sss:GetDescendants()) do
			if desc:IsA("ModuleScript") then
				table.insert(serverModules, { name = desc.Name, path = desc:GetFullName() })
			end
		end
	end

	return {
		success = true,
		remotes = remotes,
		sharedModules = sharedModules,
		serverModules = serverModules,
	}, nil
end

return ContextEngine
