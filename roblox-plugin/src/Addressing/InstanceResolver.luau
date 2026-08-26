--!strict
local UuidRegistry = require(script.Parent.UuidRegistry)
local ErrorCodes = require(script.Parent.Parent.Utils.ErrorCodes)

local InstanceResolver = {}

-- Standard service shortcuts
local SERVICES: { [string]: string } = {
	Workspace = "Workspace",
	workspace = "Workspace",
	ReplicatedStorage = "ReplicatedStorage",
	ServerScriptService = "ServerScriptService",
	ServerStorage = "ServerStorage",
	StarterGui = "StarterGui",
	StarterPack = "StarterPack",
	StarterPlayer = "StarterPlayer",
	Lighting = "Lighting",
	SoundService = "SoundService",
	MaterialService = "MaterialService",
	Chat = "Chat",
	Players = "Players",
	Teams = "Teams",
	TestService = "TestService",
	CollectionService = "CollectionService",
}

function InstanceResolver.Resolve(target: string): (Instance?, ErrorCodes.ErrorObject?)
	if not target or type(target) ~= "string" or #target == 0 then
		return nil, ErrorCodes.Create(ErrorCodes.INVALID_ARGUMENT, "Target path or UUID must be a non-empty string.")
	end

	-- 1. Check UUID format
	if target:sub(1, 5) == "id://" or (target:find("^[%x%-]+$") and #target >= 8) then
		local instance = UuidRegistry.GetInstanceByUuid(target)
		if instance then
			return instance, nil
		else
			return nil, ErrorCodes.Create(ErrorCodes.INSTANCE_NOT_FOUND, "No instance found for UUID: " .. target, { target = target })
		end
	end

	-- 2. Clean root prefix
	local path = target
	if path == "game" or path == "DataModel" then
		return game, nil
	end

	if path:sub(1, 5) == "game." then
		path = path:sub(6)
	end

	-- Split path by dots
	local segments = string.split(path, ".")
	if #segments == 0 then
		return nil, ErrorCodes.Create(ErrorCodes.INVALID_ARGUMENT, "Invalid target path: " .. target)
	end

	local firstSegment = segments[1]
	local current: Instance? = nil

	-- Match root service
	local serviceName = SERVICES[firstSegment]
	if serviceName then
		local success, s = pcall(function()
			return game:GetService(serviceName)
		end)
		if success and s then
			current = s
		end
	end

	if not current then
		-- Fallback check on game child
		current = game:FindFirstChild(firstSegment)
	end

	if not current then
		return nil, ErrorCodes.Create(ErrorCodes.INSTANCE_NOT_FOUND, string.format("Root service or container '%s' not found.", firstSegment), { target = target, segment = firstSegment })
	end

	-- Traverse remaining segments
	for i = 2, #segments do
		local seg = segments[i]
		if not current then
			break
		end

		-- Check array index notation: e.g. "Part[2]"
		local name, indexStr = seg:match("^(.-)%[(%d+)%]$")
		if name and indexStr then
			local targetIndex = tonumber(indexStr) or 1
			local matches = {}
			for _, child in ipairs(current:GetChildren()) do
				if child.Name == name then
					table.insert(matches, child)
				end
			end
			current = matches[targetIndex]
		else
			current = current:FindFirstChild(seg)
		end

		if not current then
			return nil, ErrorCodes.Create(
				ErrorCodes.INSTANCE_NOT_FOUND,
				string.format("Child '%s' not found under '%s'.", seg, segments[i - 1]),
				{ target = target, failedAt = seg }
			)
		end
	end

	return current, nil
end

function InstanceResolver.GetPath(instance: Instance): string
	if instance == game then
		return "game"
	end
	return instance:GetFullName()
end

return InstanceResolver
