--!strict
-- Terrain Adapter: Safe interaction with Terrain APIs

local Errors = require(script.Parent.Parent.Core.Errors)
local Utils = require(script.Parent.Parent.Core.Utils)

local TerrainAdapter = {}

local function getTerrain(): Terrain?
	return workspace.Terrain
end

function TerrainAdapter.FillBlock(params: {
	cframe: any,
	size: any,
	material: string,
}): (any, Errors.ErrorObject?)
	local terrain = getTerrain()
	if not terrain then
		return nil, Errors.Create(Errors.INSTANCE_NOT_FOUND, "Workspace.Terrain not found.")
	end

	local cf = Utils.Coerce(params.cframe, "CFrame")
	local sz = Utils.Coerce(params.size, "Vector3")
	local matEnum = (Enum.Material :: any)[params.material] or Enum.Material.Grass

	local success, err = pcall(function()
		terrain:FillBlock(cf, sz, matEnum)
	end)

	if not success then
		return nil, Errors.Create(Errors.ROBLOX_API_ERROR, "FillBlock failed: " .. tostring(err))
	end

	return {
		success = true,
		material = matEnum.Name,
	}, nil
end

function TerrainAdapter.FillBall(params: {
	center: any,
	radius: number,
	material: string,
}): (any, Errors.ErrorObject?)
	local terrain = getTerrain()
	if not terrain then
		return nil, Errors.Create(Errors.INSTANCE_NOT_FOUND, "Workspace.Terrain not found.")
	end

	local center = Utils.Coerce(params.center, "Vector3")
	local matEnum = (Enum.Material :: any)[params.material] or Enum.Material.Grass

	local success, err = pcall(function()
		terrain:FillBall(center, params.radius, matEnum)
	end)

	if not success then
		return nil, Errors.Create(Errors.ROBLOX_API_ERROR, "FillBall failed: " .. tostring(err))
	end

	return {
		success = true,
		radius = params.radius,
		material = matEnum.Name,
	}, nil
end

function TerrainAdapter.Clear(): (any, Errors.ErrorObject?)
	local terrain = getTerrain()
	if not terrain then
		return nil, Errors.Create(Errors.INSTANCE_NOT_FOUND, "Workspace.Terrain not found.")
	end

	local success, err = pcall(function()
		terrain:Clear()
	end)

	if not success then
		return nil, Errors.Create(Errors.ROBLOX_API_ERROR, "Terrain clear failed: " .. tostring(err))
	end

	return {
		success = true,
		cleared = true,
	}, nil
end

return TerrainAdapter
