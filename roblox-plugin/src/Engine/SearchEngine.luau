--!strict
-- SearchEngine: Universal dynamic search engine for instances, tags, attributes, and Luau source

local CollectionService = game:GetService("CollectionService")
local InstanceAdapter = require(script.Parent.Parent.Studio.InstanceAdapter)

local SearchEngine = {}

export type SearchParams = {
	query: string?,
	className: string?,
	tag: string?,
	attributeName: string?,
	attributeValue: any?,
	scope: string?,
	limit: number?,
}

function SearchEngine.Search(params: SearchParams): { [string]: any }
	local scopeInst: Instance = game
	if params.scope and params.scope ~= "game" then
		local resolved = InstanceAdapter.Resolve(params.scope)
		if resolved then
			scopeInst = resolved
		end
	end

	local maxResults = params.limit or 100
	local results = {}
	local qLower = params.query and string.lower(params.query) or nil

	for _, inst in ipairs(scopeInst:GetDescendants()) do
		local matched = true

		if qLower and not string.find(string.lower(inst.Name), qLower) then
			matched = false
		end

		if matched and params.className and inst.ClassName ~= params.className and not inst:IsA(params.className) then
			matched = false
		end

		if matched and params.tag then
			local hasTag = false
			pcall(function()
				hasTag = CollectionService:HasTag(inst, params.tag :: string)
			end)
			if not hasTag then
				matched = false
			end
		end

		if matched and params.attributeName then
			local attrVal = inst:GetAttribute(params.attributeName)
			if attrVal == nil then
				matched = false
			elseif params.attributeValue ~= nil and attrVal ~= params.attributeValue then
				matched = false
			end
		end

		if matched then
			table.insert(results, {
				name = inst.Name,
				className = inst.ClassName,
				path = inst:GetFullName(),
				parent = inst.Parent and inst.Parent:GetFullName() or "nil",
			})
			if #results >= maxResults then
				break
			end
		end
	end

	return {
		success = true,
		count = #results,
		results = results,
	}
end

return SearchEngine
