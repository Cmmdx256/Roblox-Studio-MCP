--!strict
-- Selection Adapter: Safe integration with Selection service

local Errors = require(script.Parent.Parent.Core.Errors)

local SelectionAdapter = {}

local function getSelectionService(): Selection?
	local success, service = pcall(function()
		return game:GetService("Selection")
	end)
	return success and service or nil
end

function SelectionAdapter.Get(): (any, Errors.ErrorObject?)
	local service = getSelectionService()
	if not service then
		return nil, Errors.Create(Errors.UNSUPPORTED_API, "Selection service is not available.")
	end

	local selected = service:Get()
	local items = {}
	for _, inst in ipairs(selected) do
		table.insert(items, {
			name = inst.Name,
			className = inst.ClassName,
			path = inst:GetFullName(),
		})
	end

	return {
		success = true,
		count = #items,
		selection = items,
	}, nil
end

function SelectionAdapter.Set(instances: { Instance }): (any, Errors.ErrorObject?)
	local service = getSelectionService()
	if not service then
		return nil, Errors.Create(Errors.UNSUPPORTED_API, "Selection service is not available.")
	end

	service:Set(instances)
	return {
		success = true,
		count = #instances,
	}, nil
end

function SelectionAdapter.Add(instances: { Instance }): (any, Errors.ErrorObject?)
	local service = getSelectionService()
	if not service then
		return nil, Errors.Create(Errors.UNSUPPORTED_API, "Selection service is not available.")
	end

	local current = service:Get()
	for _, inst in ipairs(instances) do
		if not table.find(current, inst) then
			table.insert(current, inst)
		end
	end

	service:Set(current)
	return {
		success = true,
		count = #current,
	}, nil
end

function SelectionAdapter.Clear(): (any, Errors.ErrorObject?)
	local service = getSelectionService()
	if not service then
		return nil, Errors.Create(Errors.UNSUPPORTED_API, "Selection service is not available.")
	end

	service:Set({})
	return {
		success = true,
		cleared = true,
	}, nil
end

return SelectionAdapter
