--!strict
-- Attribute Adapter: Luau Attribute CRUD

local Errors = require(script.Parent.Parent.Core.Errors)
local Utils = require(script.Parent.Parent.Core.Utils)
local InstanceAdapter = require(script.Parent.InstanceAdapter)

local AttributeAdapter = {}

function AttributeAdapter.Get(params: { target: string, attributeName: string }): (any, Errors.ErrorObject?)
	local inst, err = InstanceAdapter.Resolve(params.target)
	if not inst then
		return nil, err
	end

	local val = inst:GetAttribute(params.attributeName)
	return {
		success = true,
		attributeName = params.attributeName,
		value = Utils.Serialize(val),
	}, nil
end

function AttributeAdapter.GetAll(params: { target: string }): (any, Errors.ErrorObject?)
	local inst, err = InstanceAdapter.Resolve(params.target)
	if not inst then
		return nil, err
	end

	local attributes: { [string]: any } = {}
	for k, v in pairs(inst:GetAttributes()) do
		attributes[k] = Utils.Serialize(v)
	end

	return {
		success = true,
		target = inst:GetFullName(),
		attributes = attributes,
	}, nil
end

function AttributeAdapter.Set(params: { target: string, attributeName: string, value: any }): (any, Errors.ErrorObject?)
	local inst, err = InstanceAdapter.Resolve(params.target)
	if not inst then
		return nil, err
	end

	local coerced = Utils.Coerce(params.value)
	local success, setErr = pcall(function()
		inst:SetAttribute(params.attributeName, coerced)
	end)

	if not success then
		return nil, Errors.Create(Errors.ROBLOX_API_ERROR, string.format("Failed to set attribute '%s': %s", params.attributeName, tostring(setErr)))
	end

	return {
		success = true,
		attributeName = params.attributeName,
		newValue = Utils.Serialize(inst:GetAttribute(params.attributeName)),
	}, nil
end

function AttributeAdapter.Delete(params: { target: string, attributeName: string }): (any, Errors.ErrorObject?)
	local inst, err = InstanceAdapter.Resolve(params.target)
	if not inst then
		return nil, err
	end

	local success, delErr = pcall(function()
		inst:SetAttribute(params.attributeName, nil)
	end)

	if not success then
		return nil, Errors.Create(Errors.ROBLOX_API_ERROR, string.format("Failed to delete attribute '%s': %s", params.attributeName, tostring(delErr)))
	end

	return {
		success = true,
		deleted = true,
		attributeName = params.attributeName,
	}, nil
end

return AttributeAdapter
