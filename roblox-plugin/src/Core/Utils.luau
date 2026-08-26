--!strict
-- Core Utilities for Roblox type coercion and JSON serialization

local Utils = {}

function Utils.Serialize(val: any): any
	local valType = typeof(val)

	if valType == "number" or valType == "string" or valType == "boolean" then
		return val
	elseif valType == "nil" then
		return nil
	elseif valType == "Vector3" then
		return { _type = "Vector3", x = val.X, y = val.Y, z = val.Z }
	elseif valType == "Vector2" then
		return { _type = "Vector2", x = val.X, y = val.Y }
	elseif valType == "CFrame" then
		local comp = { val:GetComponents() }
		return { _type = "CFrame", components = comp, position = { val.Position.X, val.Position.Y, val.Position.Z } }
	elseif valType == "Color3" then
		return { _type = "Color3", r = val.R, g = val.G, b = val.B, hex = val:ToHex() }
	elseif valType == "BrickColor" then
		return { _type = "BrickColor", name = val.Name, number = val.Number }
	elseif valType == "UDim" then
		return { _type = "UDim", scale = val.Scale, offset = val.Offset }
	elseif valType == "UDim2" then
		return { _type = "UDim2", x = { scale = val.X.Scale, offset = val.X.Offset }, y = { scale = val.Y.Scale, offset = val.Y.Offset } }
	elseif valType == "NumberRange" then
		return { _type = "NumberRange", min = val.Min, max = val.Max }
	elseif valType == "EnumItem" then
		return { _type = "EnumItem", enum = tostring(val.EnumType), name = val.Name, value = val.Value }
	elseif valType == "Instance" then
		return { _type = "Instance", name = val.Name, className = val.ClassName, path = val:GetFullName() }
	elseif valType == "table" then
		local result = {}
		for k, v in pairs(val) do
			result[tostring(k)] = Utils.Serialize(v)
		end
		return result
	else
		return tostring(val)
	end
end

local function parseHexColor(hex: string): Color3?
	local cleaned = hex:gsub("#", "")
	if #cleaned == 6 then
		local r = tonumber(cleaned:sub(1, 2), 16)
		local g = tonumber(cleaned:sub(3, 4), 16)
		local b = tonumber(cleaned:sub(5, 6), 16)
		if r and g and b then
			return Color3.fromRGB(r, g, b)
		end
	end
	return nil
end

function Utils.Coerce(rawVal: any, targetPropertyType: string?): any
	if rawVal == nil then
		return nil
	end

	local rawType = typeof(rawVal)
	if rawType == "number" or rawType == "boolean" then
		return rawVal
	end

	if rawType == "string" then
		if targetPropertyType and string.find(targetPropertyType, "Enum") then
			local enumName = targetPropertyType:gsub("Enum%.", "")
			local enumObj = (Enum :: any)[enumName]
			if enumObj then
				local item = enumObj[rawVal]
				if item then return item end
			end
		end

		if rawVal:sub(1, 5) == "Enum." then
			local parts = string.split(rawVal, ".")
			if #parts >= 3 then
				local enumObj = (Enum :: any)[parts[2]]
				if enumObj and enumObj[parts[3]] then
					return enumObj[parts[3]]
				end
			end
		end

		if rawVal:sub(1, 1) == "#" and targetPropertyType == "Color3" then
			local c = parseHexColor(rawVal)
			if c then return c end
		end

		return rawVal
	end

	if rawType == "table" then
		if rawVal._type == "Vector3" or (rawVal.x and rawVal.y and rawVal.z and not rawVal.r) then
			return Vector3.new(rawVal.x or rawVal.X or 0, rawVal.y or rawVal.Y or 0, rawVal.z or rawVal.Z or 0)
		end
		if rawVal._type == "Vector2" or (rawVal.x and rawVal.y and not rawVal.z) then
			return Vector2.new(rawVal.x or rawVal.X or 0, rawVal.y or rawVal.Y or 0)
		end
		if rawVal._type == "Color3" or (rawVal.r and rawVal.g and rawVal.b) then
			local r = rawVal.r or rawVal.R or 0
			local g = rawVal.g or rawVal.G or 0
			local b = rawVal.b or rawVal.B or 0
			if r > 1 or g > 1 or b > 1 then
				return Color3.fromRGB(r, g, b)
			else
				return Color3.new(r, g, b)
			end
		end
		if rawVal._type == "UDim2" then
			local sx = (rawVal.x and (rawVal.x.scale or rawVal.x.Scale)) or rawVal[1] or 0
			local ox = (rawVal.x and (rawVal.x.offset or rawVal.x.Offset)) or rawVal[2] or 0
			local sy = (rawVal.y and (rawVal.y.scale or rawVal.y.Scale)) or rawVal[3] or 0
			local oy = (rawVal.y and (rawVal.y.offset or rawVal.y.Offset)) or rawVal[4] or 0
			return UDim2.new(sx, ox, sy, oy)
		end
		if rawVal._type == "CFrame" and rawVal.components then
			return CFrame.new(table.unpack(rawVal.components))
		end
		if #rawVal == 3 and (targetPropertyType == "Vector3" or targetPropertyType == nil) then
			return Vector3.new(rawVal[1], rawVal[2], rawVal[3])
		end
		if #rawVal == 3 and targetPropertyType == "Color3" then
			if rawVal[1] > 1 or rawVal[2] > 1 or rawVal[3] > 1 then
				return Color3.fromRGB(rawVal[1], rawVal[2], rawVal[3])
			else
				return Color3.new(rawVal[1], rawVal[2], rawVal[3])
			end
		end
		if #rawVal == 2 and targetPropertyType == "Vector2" then
			return Vector2.new(rawVal[1], rawVal[2])
		end
		if #rawVal == 4 and targetPropertyType == "UDim2" then
			return UDim2.new(rawVal[1], rawVal[2], rawVal[3], rawVal[4])
		end
		if #rawVal == 12 and targetPropertyType == "CFrame" then
			return CFrame.new(table.unpack(rawVal))
		end
	end

	return rawVal
end

return Utils
