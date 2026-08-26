--!strict
local CollectionService = game:GetService("CollectionService")
local InstanceResolver = require(script.Parent.Parent.Addressing.InstanceResolver)
local ErrorCodes = require(script.Parent.Parent.Utils.ErrorCodes)

local TagAdapter = {}

function TagAdapter.Add(params: { target: string, tag: string }): (any, ErrorCodes.ErrorObject?)
	local inst, err = InstanceResolver.Resolve(params.target)
	if not inst then
		return nil, err
	end

	CollectionService:AddTag(inst, params.tag)
	return {
		success = true,
		tag = params.tag,
		target = inst:GetFullName(),
	}, nil
end

function TagAdapter.Remove(params: { target: string, tag: string }): (any, ErrorCodes.ErrorObject?)
	local inst, err = InstanceResolver.Resolve(params.target)
	if not inst then
		return nil, err
	end

	CollectionService:RemoveTag(inst, params.tag)
	return {
		success = true,
		removed = true,
		tag = params.tag,
		target = inst:GetFullName(),
	}, nil
end

function TagAdapter.GetTags(params: { target: string }): (any, ErrorCodes.ErrorObject?)
	local inst, err = InstanceResolver.Resolve(params.target)
	if not inst then
		return nil, err
	end

	return {
		success = true,
		target = inst:GetFullName(),
		tags = CollectionService:GetTags(inst),
	}, nil
end

function TagAdapter.GetTagged(params: { tag: string }): (any, ErrorCodes.ErrorObject?)
	local instances = CollectionService:GetTagged(params.tag)
	local result = {}
	for _, inst in ipairs(instances) do
		table.insert(result, {
			name = inst.Name,
			className = inst.ClassName,
			path = inst:GetFullName(),
		})
	end

	return {
		success = true,
		tag = params.tag,
		count = #result,
		instances = result,
	}, nil
end

return TagAdapter
