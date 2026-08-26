--!strict
local LuauTypeCoercion = require(script.Parent.Parent.Utils.LuauTypeCoercion)
local ErrorCodes = require(script.Parent.Parent.Utils.ErrorCodes)

local TerrainAdapter = {}

local function getTerrain(): Terrain?
	return workspace.Terrain
end

local function parseMaterial(matName: string): Enum.Material
	local enumObj = Enum.Material
	local item = (enumObj :: any)[matName]
	if item then
		return item
	end
	return Enum.Material.Grass
end

function TerrainAdapter.FillBlock(params: {
	cframe: { number },
	size: { number },
	material: string,
}): (any, ErrorCodes.ErrorObject?)
	local terrain = getTerrain()
	if not terrain then
		return nil, ErrorCodes.Create(ErrorCodes.INSTANCE_NOT_FOUND, "Workspace.Terrain not found.")
	end

	local cf: CFrame
	if #params.cframe == 3 then
		cf = CFrame.new(params.cframe[1], params.cframe[2], params.cframe[3])
	elseif #params.cframe == 12 then
		cf = CFrame.new(table.unpack(params.cframe))
	else
		return nil, ErrorCodes.Create(ErrorCodes.INVALID_ARGUMENT, "Invalid 'cframe' array.")
	end

	local sz = Vector3.new(params.size[1], params.size[2], params.size[3])
	local mat = parseMaterial(params.material)

	local success, err = pcall(function()
		terrain:FillBlock(cf, sz, mat)
	end)

	if not success then
		return nil, ErrorCodes.Create(ErrorCodes.EXECUTION_FAILED, string.format("Failed to FillBlock terrain: %s", tostring(err)))
	end

	return {
		success = true,
		material = mat.Name,
		size = { sz.X, sz.Y, sz.Z },
		position = { cf.Position.X, cf.Position.Y, cf.Position.Z },
	}, nil
end

function TerrainAdapter.FillBall(params: {
	center: { number },
	radius: number,
	material: string,
}): (any, ErrorCodes.ErrorObject?)
	local terrain = getTerrain()
	if not terrain then
		return nil, ErrorCodes.Create(ErrorCodes.INSTANCE_NOT_FOUND, "Workspace.Terrain not found.")
	end

	local center = Vector3.new(params.center[1], params.center[2], params.center[3])
	local mat = parseMaterial(params.material)

	local success, err = pcall(function()
		terrain:FillBall(center, params.radius, mat)
	end)

	if not success then
		return nil, ErrorCodes.Create(ErrorCodes.EXECUTION_FAILED, string.format("Failed to FillBall terrain: %s", tostring(err)))
	end

	return {
		success = true,
		material = mat.Name,
		radius = params.radius,
		center = { center.X, center.Y, center.Z },
	}, nil
end

function TerrainAdapter.Clear(params: { region: { min: { number }, max: { number } }? }): (any, ErrorCodes.ErrorObject?)
	local terrain = getTerrain()
	if not terrain then
		return nil, ErrorCodes.Create(ErrorCodes.INSTANCE_NOT_FOUND, "Workspace.Terrain not found.")
	end

	if params and params.region then
		local minV = Vector3.new(params.region.min[1], params.region.min[2], params.region.min[3])
		local maxV = Vector3.new(params.region.max[1], params.region.max[2], params.region.max[3])
		local region3 = Region3.new(minV, maxV)

		local success, err = pcall(function()
			terrain:FillRegion(region3:ExpandToGrid(4), 4, Enum.Material.Air)
		end)
		if not success then
			return nil, ErrorCodes.Create(ErrorCodes.EXECUTION_FAILED, string.format("Failed to clear terrain region: %s", tostring(err)))
		end
		return { success = true, clearedRegion = true }, nil
	else
		local success, err = pcall(function()
			terrain:Clear()
		end)
		if not success then
			return nil, ErrorCodes.Create(ErrorCodes.EXECUTION_FAILED, string.format("Failed to Clear terrain: %s", tostring(err)))
		end
		return { success = true, clearedEntireTerrain = true }, nil
	end
end

return TerrainAdapter
