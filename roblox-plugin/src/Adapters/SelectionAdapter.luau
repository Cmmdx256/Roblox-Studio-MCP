--!strict
local Selection = game:GetService("Selection")
local InstanceResolver = require(script.Parent.Parent.Addressing.InstanceResolver)
local UuidRegistry = require(script.Parent.Parent.Addressing.UuidRegistry)
local ErrorCodes = require(script.Parent.Parent.Utils.ErrorCodes)

local SelectionAdapter = {}

function SelectionAdapter.Get(): (any, ErrorCodes.ErrorObject?)
	local selected = Selection:Get()
	local result = {}

	for _, inst in ipairs(selected) do
		table.insert(result, {
			uuid = UuidRegistry.GetOrCreateUuid(inst),
			name = inst.Name,
			className = inst.ClassName,
			path = inst:GetFullName(),
		})
	end

	return {
		success = true,
		count = #result,
		selection = result,
	}, nil
end

function SelectionAdapter.Set(params: { targets: { string } }): (any, ErrorCodes.ErrorObject?)
	local instancesToSelect = {}

	if params.targets then
		for _, targetStr in ipairs(params.targets) do
			local inst, err = InstanceResolver.Resolve(targetStr)
			if inst then
				table.insert(instancesToSelect, inst)
			else
				warn(string.format("[SelectionAdapter] Could not resolve '%s' for selection.", targetStr))
			end
		end
	end

	Selection:Set(instancesToSelect)

	return {
		success = true,
		selectedCount = #instancesToSelect,
	}, nil
end

function SelectionAdapter.Add(params: { targets: { string } }): (any, ErrorCodes.ErrorObject?)
	local current = Selection:Get()
	local setMap = {}
	for _, inst in ipairs(current) do
		setMap[inst] = true
	end

	if params.targets then
		for _, targetStr in ipairs(params.targets) do
			local inst = InstanceResolver.Resolve(targetStr)
			if inst and not setMap[inst] then
				table.insert(current, inst)
				setMap[inst] = true
			end
		end
	end

	Selection:Set(current)

	return {
		success = true,
		totalSelected = #current,
	}, nil
end

function SelectionAdapter.Clear(): (any, ErrorCodes.ErrorObject?)
	Selection:Set({})
	return {
		success = true,
		cleared = true,
	}, nil
end

return SelectionAdapter
