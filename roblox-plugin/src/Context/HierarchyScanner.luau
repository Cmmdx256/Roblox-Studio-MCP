--!strict
local InstanceResolver = require(script.Parent.Parent.Addressing.InstanceResolver)
local UuidRegistry = require(script.Parent.Parent.Addressing.UuidRegistry)
local LuauTypeCoercion = require(script.Parent.Parent.Utils.LuauTypeCoercion)
local ErrorCodes = require(script.Parent.Parent.Utils.ErrorCodes)

local HierarchyScanner = {}

export type TreeNode = {
	name: string,
	className: string,
	path: string,
	uuid: string,
	childrenCount: number,
	properties: { [string]: any }?,
	children: { TreeNode }?,
}

function HierarchyScanner.GetTree(params: {
	root: string?,
	depth: number?,
	includeProperties: { string }?,
	classNameFilter: { string }?,
	maxItems: number?,
}): (any, ErrorCodes.ErrorObject?)
	local rootStr = params.root or "Workspace"
	local rootInst, err = InstanceResolver.Resolve(rootStr)
	if not rootInst then
		return nil, err
	end

	local maxDepth = params.depth or 2
	local maxItems = params.maxItems or 100
	local itemCount = 0

	local filterMap: { [string]: boolean }? = nil
	if params.classNameFilter and #params.classNameFilter > 0 then
		filterMap = {}
		for _, name in ipairs(params.classNameFilter) do
			filterMap[name] = true
		end
	end

	local function scanNode(inst: Instance, currentDepth: number): TreeNode?
		if itemCount >= maxItems then
			return nil
		end
		itemCount += 1

		local node: TreeNode = {
			name = inst.Name,
			className = inst.ClassName,
			path = inst:GetFullName(),
			uuid = UuidRegistry.GetOrCreateUuid(inst),
			childrenCount = #inst:GetChildren(),
		}

		if params.includeProperties and #params.includeProperties > 0 then
			node.properties = {}
			for _, prop in ipairs(params.includeProperties) do
				pcall(function()
					local val = (inst :: any)[prop]
					if val ~= nil then
						node.properties[prop] = LuauTypeCoercion.Serialize(val)
					end
				end)
			end
		end

		if currentDepth < maxDepth then
			local childNodes = {}
			for _, child in ipairs(inst:GetChildren()) do
				if not filterMap or filterMap[child.ClassName] then
					local cNode = scanNode(child, currentDepth + 1)
					if cNode then
						table.insert(childNodes, cNode)
					end
					if itemCount >= maxItems then
						break
					end
				end
			end
			node.children = childNodes
		end

		return node
	end

	local tree = scanNode(rootInst, 0)

	return {
		success = true,
		totalItemsReturned = itemCount,
		tree = tree,
	}, nil
end

function HierarchyScanner.Search(params: {
	query: string?,
	className: string?,
	tag: string?,
	scope: string?,
	attributeName: string?,
	attributeValue: any?,
	limit: number?,
}): (any, ErrorCodes.ErrorObject?)
	local scopeStr = params.scope or "game"
	local scopeInst: Instance = game
	if scopeStr ~= "game" then
		local sInst, sErr = InstanceResolver.Resolve(scopeStr)
		if sInst then
			scopeInst = sInst
		else
			return nil, sErr
		end
	end

	local limit = params.limit or 50
	local queryLower = params.query and string.lower(params.query)
	local CollectionService = game:GetService("CollectionService")
	local results = {}

	local function checkInstance(inst: Instance)
		if #results >= limit then return end

		-- ClassName filter
		if params.className and inst.ClassName ~= params.className then
			return
		end

		-- Query name pattern
		if queryLower and not string.find(string.lower(inst.Name), queryLower) then
			return
		end

		-- Tag filter
		if params.tag and not CollectionService:HasTag(inst, params.tag) then
			return
		end

		-- Attribute filter
		if params.attributeName then
			local attr = inst:GetAttribute(params.attributeName)
			if attr == nil then return end
			if params.attributeValue ~= nil and attr ~= params.attributeValue then
				return
			end
		end

		table.insert(results, {
			name = inst.Name,
			className = inst.ClassName,
			path = inst:GetFullName(),
			uuid = UuidRegistry.GetOrCreateUuid(inst),
		})
	end

	for _, desc in ipairs(scopeInst:GetDescendants()) do
		checkInstance(desc)
		if #results >= limit then
			break
		end
	end

	return {
		success = true,
		count = #results,
		results = results,
	}, nil
end

return HierarchyScanner
