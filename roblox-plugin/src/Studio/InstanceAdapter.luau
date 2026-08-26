--!strict
-- Instance Adapter: Generic manipulation of Roblox Instances

local Errors = require(script.Parent.Parent.Core.Errors)
local Utils = require(script.Parent.Parent.Core.Utils)

local InstanceAdapter = {}

local SERVICES: { [string]: string } = {
	Workspace = "Workspace",
	workspace = "Workspace",
	ReplicatedStorage = "ReplicatedStorage",
	ServerScriptService = "ServerScriptService",
	ServerStorage = "ServerStorage",
	StarterGui = "StarterGui",
	StarterPack = "StarterPack",
	StarterPlayer = "StarterPlayer",
	Lighting = "Lighting",
	SoundService = "SoundService",
	MaterialService = "MaterialService",
	Chat = "Chat",
	Players = "Players",
	Teams = "Teams",
	TestService = "TestService",
	CollectionService = "CollectionService",
	ReplicatedFirst = "ReplicatedFirst",
}

function InstanceAdapter.Resolve(target: string): (Instance?, Errors.ErrorObject?)
	if not target or type(target) ~= "string" or #target == 0 then
		return nil, Errors.Create(Errors.INVALID_ARGUMENT, "Target path must be a non-empty string.")
	end

	if target == "game" or target == "DataModel" then
		return game, nil
	end

	local path = target
	if path:sub(1, 5) == "game." then
		path = path:sub(6)
	end

	local segments = string.split(path, ".")
	if #segments == 0 then
		return nil, Errors.Create(Errors.INVALID_ARGUMENT, "Invalid target path: " .. target)
	end

	local firstSegment = segments[1]
	local current: Instance? = nil

	local serviceName = SERVICES[firstSegment]
	if serviceName then
		pcall(function()
			current = game:GetService(serviceName)
		end)
	end

	if not current then
		current = game:FindFirstChild(firstSegment)
	end

	if not current then
		return nil, Errors.Create(Errors.INSTANCE_NOT_FOUND, string.format("Root container '%s' not found.", firstSegment), { target = target })
	end

	for i = 2, #segments do
		local seg = segments[i]
		if not current then break end

		local name, indexStr = seg:match("^(.-)%[(%d+)%]$")
		if name and indexStr then
			local targetIndex = tonumber(indexStr) or 1
			local matches = {}
			for _, child in ipairs(current:GetChildren()) do
				if child.Name == name then
					table.insert(matches, child)
				end
			end
			current = matches[targetIndex]
		else
			current = current:FindFirstChild(seg)
		end

		if not current then
			return nil, Errors.Create(
				Errors.INSTANCE_NOT_FOUND,
				string.format("Child '%s' not found under '%s'.", seg, segments[i - 1]),
				{ target = target, failedAt = seg }
			)
		end
	end

	return current, nil
end

function InstanceAdapter.Create(params: {
	className: string,
	parent: string,
	name: string?,
	properties: { [string]: any }?,
	attributes: { [string]: any }?,
	tags: { string }?,
}): (any, Errors.ErrorObject?)
	if not params.className or #params.className == 0 then
		return nil, Errors.Create(Errors.INVALID_ARGUMENT, "Parameter 'className' is required.")
	end
	if not params.parent or #params.parent == 0 then
		return nil, Errors.Create(Errors.INVALID_ARGUMENT, "Parameter 'parent' is required.")
	end

	local parentInst, parentErr = InstanceAdapter.Resolve(params.parent)
	if not parentInst then
		return nil, parentErr
	end

	local newInst: Instance
	local success, err = pcall(function()
		newInst = Instance.new(params.className)
	end)

	if not success or not newInst then
		return nil, Errors.Create(Errors.ROBLOX_API_ERROR, string.format("Cannot create Instance of ClassName '%s': %s", params.className, tostring(err)))
	end

	if params.name and #params.name > 0 then
		newInst.Name = params.name
	end

	if params.properties then
		for propName, rawVal in pairs(params.properties) do
			pcall(function()
				(newInst :: any)[propName] = Utils.Coerce(rawVal)
			end)
		end
	end

	if params.attributes then
		for attrName, val in pairs(params.attributes) do
			pcall(function()
				newInst:SetAttribute(attrName, Utils.Coerce(val))
			end)
		end
	end

	if params.tags then
		local cs: CollectionService? = nil
		pcall(function() cs = game:GetService("CollectionService") end)
		if cs then
			for _, tag in ipairs(params.tags) do
				cs:AddTag(newInst, tag)
			end
		end
	end

	local pSuccess, pErr = pcall(function()
		newInst.Parent = parentInst
	end)
	if not pSuccess then
		newInst:Destroy()
		return nil, Errors.Create(Errors.ROBLOX_API_ERROR, string.format("Failed to parent new instance to '%s': %s", params.parent, tostring(pErr)))
	end

	return {
		success = true,
		name = newInst.Name,
		className = newInst.ClassName,
		path = newInst:GetFullName(),
	}, nil
end

function InstanceAdapter.Delete(params: { target: string }): (any, Errors.ErrorObject?)
	local inst, err = InstanceAdapter.Resolve(params.target)
	if not inst then
		return nil, err
	end

	if inst == game or inst == workspace then
		return nil, Errors.Create(Errors.SECURITY_RESTRICTION, "Cannot destroy root Game or Workspace container.")
	end

	local name = inst.Name
	local className = inst.ClassName
	local path = inst:GetFullName()

	local success, delErr = pcall(function()
		inst:Destroy()
	end)

	if not success then
		return nil, Errors.Create(Errors.ROBLOX_API_ERROR, string.format("Failed to destroy '%s': %s", path, tostring(delErr)))
	end

	return {
		success = true,
		deleted = true,
		name = name,
		className = className,
		path = path,
	}, nil
end

function InstanceAdapter.Clone(params: {
	target: string,
	parent: string?,
	newName: string?,
	properties: { [string]: any }?,
}): (any, Errors.ErrorObject?)
	local inst, err = InstanceAdapter.Resolve(params.target)
	if not inst then
		return nil, err
	end

	local cloned: Instance
	local success, cloneErr = pcall(function()
		cloned = inst:Clone()
	end)

	if not success or not cloned then
		return nil, Errors.Create(Errors.ROBLOX_API_ERROR, string.format("Failed to clone '%s': %s", params.target, tostring(cloneErr)))
	end

	if params.newName and #params.newName > 0 then
		cloned.Name = params.newName
	end

	if params.properties then
		for propName, rawVal in pairs(params.properties) do
			pcall(function()
				(cloned :: any)[propName] = Utils.Coerce(rawVal)
			end)
		end
	end

	local targetParent = inst.Parent or workspace
	if params.parent then
		local pInst, pErr = InstanceAdapter.Resolve(params.parent)
		if pInst then
			targetParent = pInst
		else
			cloned:Destroy()
			return nil, pErr
		end
	end

	cloned.Parent = targetParent

	return {
		success = true,
		name = cloned.Name,
		className = cloned.ClassName,
		path = cloned:GetFullName(),
	}, nil
end

function InstanceAdapter.Reparent(params: { target: string, newParent: string }): (any, Errors.ErrorObject?)
	local inst, err = InstanceAdapter.Resolve(params.target)
	if not inst then return nil, err end

	local parentInst, parentErr = InstanceAdapter.Resolve(params.newParent)
	if not parentInst then return nil, parentErr end

	local success, setErr = pcall(function()
		inst.Parent = parentInst
	end)

	if not success then
		return nil, Errors.Create(Errors.ROBLOX_API_ERROR, string.format("Failed to reparent '%s' to '%s': %s", params.target, params.newParent, tostring(setErr)))
	end

	return {
		success = true,
		target = inst:GetFullName(),
		newParent = parentInst:GetFullName(),
	}, nil
end

function InstanceAdapter.Rename(params: { target: string, newName: string }): (any, Errors.ErrorObject?)
	local inst, err = InstanceAdapter.Resolve(params.target)
	if not inst then return nil, err end

	if not params.newName or #params.newName == 0 then
		return nil, Errors.Create(Errors.INVALID_ARGUMENT, "Parameter 'newName' is required.")
	end

	local oldName = inst.Name
	local success, renErr = pcall(function()
		inst.Name = params.newName
	end)

	if not success then
		return nil, Errors.Create(Errors.ROBLOX_API_ERROR, string.format("Failed to rename '%s': %s", oldName, tostring(renErr)))
	end

	return {
		success = true,
		oldName = oldName,
		newName = inst.Name,
		path = inst:GetFullName(),
	}, nil
end

function InstanceAdapter.Move(params: { target: string, position: any?, cframe: any? }): (any, Errors.ErrorObject?)
	local inst, err = InstanceAdapter.Resolve(params.target)
	if not inst then return nil, err end

	if params.cframe then
		local cf = Utils.Coerce(params.cframe, "CFrame")
		if inst:IsA("PVInstance") then
			inst:PivotTo(cf)
		elseif inst:IsA("BasePart") then
			inst.CFrame = cf
		end
	elseif params.position then
		local pos = Utils.Coerce(params.position, "Vector3")
		if inst:IsA("Model") then
			inst:MoveTo(pos)
		elseif inst:IsA("BasePart") then
			inst.Position = pos
		end
	end

	return {
		success = true,
		target = inst:GetFullName(),
	}, nil
end

function InstanceAdapter.Inspect(params: { target: string, includeChildren: boolean? }): (any, Errors.ErrorObject?)
	local inst, err = InstanceAdapter.Resolve(params.target)
	if not inst then
		return nil, err
	end

	local children = {}
	if params.includeChildren ~= false then
		for _, c in ipairs(inst:GetChildren()) do
			table.insert(children, {
				name = c.Name,
				className = c.ClassName,
			})
		end
	end

	local attributes = {}
	pcall(function()
		for k, v in pairs(inst:GetAttributes()) do
			attributes[k] = Utils.Serialize(v)
		end
	end)

	local tags = {}
	pcall(function()
		local cs = game:GetService("CollectionService")
		tags = cs:GetTags(inst)
	end)

	local PropertyAdapter = require(script.Parent.PropertyAdapter)
	local propResult = PropertyAdapter.GetAll({ target = params.target })

	return {
		success = true,
		name = inst.Name,
		className = inst.ClassName,
		path = inst:GetFullName(),
		parent = inst.Parent and inst.Parent:GetFullName() or "nil",
		childrenCount = #inst:GetChildren(),
		children = children,
		attributes = attributes,
		tags = tags,
		properties = propResult and propResult.properties or {},
	}, nil
end

function InstanceAdapter.GetChildren(params: { target: string }): (any, Errors.ErrorObject?)
	local inst, err = InstanceAdapter.Resolve(params.target)
	if not inst then
		return nil, err
	end

	local children = {}
	for _, c in ipairs(inst:GetChildren()) do
		table.insert(children, {
			name = c.Name,
			className = c.ClassName,
			path = c:GetFullName(),
		})
	end

	return {
		success = true,
		target = inst:GetFullName(),
		count = #children,
		children = children,
	}, nil
end

function InstanceAdapter.GetDescendants(params: { target: string, limit: number? }): (any, Errors.ErrorObject?)
	local inst, err = InstanceAdapter.Resolve(params.target)
	if not inst then
		return nil, err
	end

	local maxCount = params.limit or 200
	local descendants = {}

	for _, d in ipairs(inst:GetDescendants()) do
		table.insert(descendants, {
			name = d.Name,
			className = d.ClassName,
			path = d:GetFullName(),
		})
		if #descendants >= maxCount then break end
	end

	return {
		success = true,
		target = inst:GetFullName(),
		count = #descendants,
		descendants = descendants,
	}, nil
end

return InstanceAdapter
