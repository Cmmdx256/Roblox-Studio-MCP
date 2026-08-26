--!strict
-- Property Adapter: Safe reflection, type checking, and coercion

local Errors = require(script.Parent.Parent.Core.Errors)
local Utils = require(script.Parent.Parent.Core.Utils)
local InstanceAdapter = require(script.Parent.InstanceAdapter)

local PropertyAdapter = {}

local COMMON_PROPERTIES = {
	"Name", "ClassName", "Archivable",
	-- BasePart
	"Position", "CFrame", "Orientation", "Size", "PivotOffset",
	"Color", "BrickColor", "Material", "Transparency", "Reflectance",
	"Anchored", "CanCollide", "CanTouch", "CanQuery", "Massless", "CastShadow",
	-- Model
	"PrimaryPart", "WorldPivot",
	-- GuiObject
	"Position", "Size", "AnchorPoint", "Visible", "ZIndex", "LayoutOrder",
	"BackgroundColor3", "BackgroundTransparency", "BorderSizePixel", "BorderColor3",
	"Text", "TextColor3", "TextSize", "Font", "TextWrapped", "TextScaled", "TextXAlignment", "TextYAlignment",
	"Image", "ImageColor3", "ImageTransparency",
	-- Light
	"Brightness", "Color", "Range", "Shadows", "Angle",
	-- Sound
	"SoundId", "Volume", "PlaybackSpeed", "Playing", "Looped", "TimePosition",
	-- Values
	"Value",
	-- ParticleEmitter
	"Texture", "Rate", "Lifetime", "Speed", "SpreadAngle", "Enabled",
	-- Highlight
	"FillColor", "FillTransparency", "OutlineColor", "OutlineTransparency", "DepthMode",
}

function PropertyAdapter.Get(params: { target: string, property: string }): (any, Errors.ErrorObject?)
	local inst, err = InstanceAdapter.Resolve(params.target)
	if not inst then
		return nil, err
	end

	if not params.property or #params.property == 0 then
		return nil, Errors.Create(Errors.INVALID_ARGUMENT, "Parameter 'property' is required.")
	end

	local rawVal: any
	local success, readErr = pcall(function()
		rawVal = (inst :: any)[params.property]
	end)

	if not success then
		return nil, Errors.Create(
			Errors.PROPERTY_NOT_FOUND,
			string.format("Property '%s' does not exist or is not readable on '%s': %s", params.property, inst.ClassName, tostring(readErr)),
			{ property = params.property, className = inst.ClassName },
			params.target
		)
	end

	return {
		success = true,
		property = params.property,
		value = Utils.Serialize(rawVal),
		rawType = typeof(rawVal),
	}, nil
end

function PropertyAdapter.GetAll(params: { target: string }): (any, Errors.ErrorObject?)
	local inst, err = InstanceAdapter.Resolve(params.target)
	if not inst then
		return nil, err
	end

	local properties: { [string]: any } = {}

	for _, propName in ipairs(COMMON_PROPERTIES) do
		pcall(function()
			local val = (inst :: any)[propName]
			if val ~= nil then
				properties[propName] = Utils.Serialize(val)
			end
		end)
	end

	return {
		success = true,
		target = inst:GetFullName(),
		className = inst.ClassName,
		properties = properties,
	}, nil
end

function PropertyAdapter.Set(params: { target: string, property: string, value: any }): (any, Errors.ErrorObject?)
	local inst, err = InstanceAdapter.Resolve(params.target)
	if not inst then
		return nil, err
	end

	if not params.property or #params.property == 0 then
		return nil, Errors.Create(Errors.INVALID_ARGUMENT, "Parameter 'property' is required.")
	end

	local existingType: string? = nil
	pcall(function()
		local val = (inst :: any)[params.property]
		if val ~= nil then
			existingType = typeof(val)
		end
	end)

	local coercedVal = Utils.Coerce(params.value, existingType)

	local success, setErr = pcall(function()
		(inst :: any)[params.property] = coercedVal
	end)

	if not success then
		return nil, Errors.Create(
			Errors.PROPERTY_NOT_WRITABLE,
			string.format("Failed to set property '%s' on '%s' (%s): %s", params.property, inst.Name, inst.ClassName, tostring(setErr)),
			{ property = params.property, value = params.value, className = inst.ClassName },
			params.target
		)
	end

	local updatedVal: any = nil
	pcall(function()
		updatedVal = (inst :: any)[params.property]
	end)

	return {
		success = true,
		property = params.property,
		newValue = Utils.Serialize(updatedVal),
	}, nil
end

return PropertyAdapter
