--!strict
local HttpService = game:GetService("HttpService")

local UuidRegistry = {}

-- Table with weak keys to prevent preventing garbage collection
local instanceToUuid = setmetatable({}, { __mode = "k" })
local uuidToInstance = setmetatable({}, { __mode = "v" })

function UuidRegistry.GetOrCreateUuid(instance: Instance): string
	local existingUuid = instanceToUuid[instance]
	if existingUuid then
		return existingUuid
	end

	local newUuid = "id://" .. HttpService:GenerateGUID(false):lower():sub(1, 12)
	instanceToUuid[instance] = newUuid
	uuidToInstance[newUuid] = instance
	return newUuid
end

function UuidRegistry.GetInstanceByUuid(uuid: string): Instance?
	-- Clean prefix if present
	local cleanUuid = uuid
	if cleanUuid:sub(1, 5) ~= "id://" then
		cleanUuid = "id://" .. cleanUuid
	end
	return uuidToInstance[cleanUuid]
end

function UuidRegistry.Register(instance: Instance, uuid: string)
	instanceToUuid[instance] = uuid
	uuidToInstance[uuid] = instance
end

return UuidRegistry
