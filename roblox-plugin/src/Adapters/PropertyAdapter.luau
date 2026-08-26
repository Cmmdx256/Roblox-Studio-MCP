--!strict
local InstanceResolver = require(script.Parent.Parent.Addressing.InstanceResolver)
local LuauTypeCoercion = require(script.Parent.Parent.Utils.LuauTypeCoercion)
local ErrorCodes = require(script.Parent.Parent.Utils.ErrorCodes)

local PropertyAdapter = {}

-- Common properties to scan for getAll
local COMMON_PROPERTIES = {
	"Name", "ClassName", "Archivable",
	-- BasePart
	"Size", "Position", "CFrame", "Orientation", "Anchored", "CanCollide", "CanTouch", "CanQuery",
	"Transparency", "Reflectance", "Material", "Color", "CastShadow", "Massless",
	-- Model
	"PrimaryPart", "WorldPivot",
	-- Light
	"Brightness", "Range", "Shadows", "Enabled",
	-- Script
	"Disabled", "RunContext",
	-- GuiObject
	"Visible", "Active", "AnchorPoint", "BackgroundColor3", "BackgroundTransparency",
	"BorderSizePixel", "BorderColor3", "ClipsDescendants", "LayoutOrder", "ZIndex",
	"Text", "TextColor3", "TextSize", "Font", "TextScaled", "Image", "ImageColor3", "ImageTransparency",
	-- ValueObjects
	"Value",
	-- Sound
	"SoundId", "Volume", "Pitch", "PlaybackSpeed", "Playing", "Looped",
	-- ParticleEmitter
	"Rate", "Speed", "Lifetime", "Texture",
	-- Humanoid
	"Health", "MaxHealth", "WalkSpeed", "JumpPower", "JumpHeight", "DisplayName",
}

function PropertyAdapter.Get(params: { target: string, property: string }): (any, ErrorCodes.ErrorObject?)
	local inst, err = InstanceResolver.Resolve(params.target)
	if not inst then
		return nil, err
	end

	if not params.property or #params.property == 0 then
		return nil, ErrorCodes.Create(ErrorCodes.INVALID_ARGUMENT, "Parameter 'property' is required.")
	end

	local rawVal: any
	local success, readErr = pcall(function()
		rawVal = (inst :: any)[params.property]
	end)

	if not success then
		return nil, ErrorCodes.Create(
			ErrorCodes.PROPERTY_NOT_FOUND,
			string.format("Property '%s' does not exist or is not readable on '%s': %s", params.property, inst.ClassName, tostring(readErr)),
			{ property = params.property, className = inst.ClassName }
		)
	end

	return {
		success = true,
		property = params.property,
		value = LuauTypeCoercion.Serialize(rawVal),
		rawType = typeof(rawVal),
	}, nil
end

function PropertyAdapter.Set(params: { target: string, property: string, value: any }): (any, ErrorCodes.ErrorObject?)
	local inst, err = InstanceResolver.Resolve(params.target)
	if not inst then
		return nil, err
	end

	if not params.property or #params.property == 0 then
		return nil, ErrorCodes.Create(ErrorCodes.INVALID_ARGUMENT, "Parameter 'property' is required.")
	end

	-- Check existing property type if accessible
	local existingType: string? = nil
	pcall(function()
		local val = (inst :: any)[params.property]
		if val ~= nil then
			existingType = typeof(val)
		end
	end)

	local coercedVal = LuauTypeCoercion.Coerce(params.value, existingType)

	local success, setErr = pcall(function()
		(inst :: any)[params.property] = coercedVal
	end)

	if not success then
		return nil, ErrorCodes.Create(
			ErrorCodes.EXECUTION_FAILED,
			string.format("Failed to set property '%s' on '%s' (%s): %s", params.property, inst.Name, inst.ClassName, tostring(setErr)),
			{ property = params.property, value = params.value, className = inst.ClassName }
		)
	end

	-- Read back verified value
	local updatedVal: any = nil
	pcall(function()
		updatedVal = (inst :: any)[params.property]
	end)

	return {
		success = true,
		property = params.property,
		newValue = LuauTypeCoercion.Serialize(updatedVal),
	}, nil
end

function PropertyAdapter.GetAll(params: { target: string }): (any, ErrorCodes.ErrorObject?)
	local inst, err = InstanceResolver.Resolve(params.target)
	if not inst then
		return nil, err
	end

	local properties: { [string]: any } = {}
	for _, propName in ipairs(COMMON_PROPERTIES) do
		local success, val = pcall(function()
			return (inst :: any)[propName]
		end)
		if success and val ~= nil then
			properties[propName] = LuauTypeCoercion.Serialize(val)
		end
	end

	return {
		success = true,
		target = inst:GetFullName(),
		className = inst.ClassName,
		properties = properties,
	}, nil
end

return PropertyAdapter
