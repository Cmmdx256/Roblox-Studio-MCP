--!strict
local InstanceResolver = require(script.Parent.Parent.Addressing.InstanceResolver)
local LuauTypeCoercion = require(script.Parent.Parent.Utils.LuauTypeCoercion)
local ErrorCodes = require(script.Parent.Parent.Utils.ErrorCodes)

local AttributeAdapter = {}

function AttributeAdapter.Get(params: { target: string, attributeName: string }): (any, ErrorCodes.ErrorObject?)
	local inst, err = InstanceResolver.Resolve(params.target)
	if not inst then
		return nil, err
	end

	local val = inst:GetAttribute(params.attributeName)
	return {
		success = true,
		attributeName = params.attributeName,
		value = LuauTypeCoercion.Serialize(val),
	}, nil
end

function AttributeAdapter.Set(params: { target: string, attributeName: string, value: any }): (any, ErrorCodes.ErrorObject?)
	local inst, err = InstanceResolver.Resolve(params.target)
	if not inst then
		return nil, err
	end

	local coerced = LuauTypeCoercion.Coerce(params.value)
	local success, setErr = pcall(function()
		inst:SetAttribute(params.attributeName, coerced)
	end)

	if not success then
		return nil, ErrorCodes.Create(ErrorCodes.EXECUTION_FAILED, string.format("Failed to set attribute '%s': %s", params.attributeName, tostring(setErr)))
	end

	return {
		success = true,
		attributeName = params.attributeName,
		newValue = LuauTypeCoercion.Serialize(inst:GetAttribute(params.attributeName)),
	}, nil
end

function AttributeAdapter.Delete(params: { target: string, attributeName: string }): (any, ErrorCodes.ErrorObject?)
	local inst, err = InstanceResolver.Resolve(params.target)
	if not inst then
		return nil, err
	end

	local success, delErr = pcall(function()
		inst:SetAttribute(params.attributeName, nil)
	end)

	if not success then
		return nil, ErrorCodes.Create(ErrorCodes.EXECUTION_FAILED, string.format("Failed to delete attribute '%s': %s", params.attributeName, tostring(delErr)))
	end

	return {
		success = true,
		deleted = true,
		attributeName = params.attributeName,
	}, nil
end

function AttributeAdapter.GetAll(params: { target: string }): (any, ErrorCodes.ErrorObject?)
	local inst, err = InstanceResolver.Resolve(params.target)
	if not inst then
		return nil, err
	end

	local rawAttributes = inst:GetAttributes()
	local serialized: { [string]: any } = {}
	for k, v in pairs(rawAttributes) do
		serialized[k] = LuauTypeCoercion.Serialize(v)
	end

	return {
		success = true,
		target = inst:GetFullName(),
		attributes = serialized,
	}, nil
end

return AttributeAdapter
