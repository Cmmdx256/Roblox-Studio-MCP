--!strict
local InstanceResolver = require(script.Parent.Parent.Addressing.InstanceResolver)
local UuidRegistry = require(script.Parent.Parent.Addressing.UuidRegistry)
local LuauTypeCoercion = require(script.Parent.Parent.Utils.LuauTypeCoercion)
local ErrorCodes = require(script.Parent.Parent.Utils.ErrorCodes)

local InstanceAdapter = {}

function InstanceAdapter.Create(params: {
	className: string,
	parent: string,
	name: string?,
	properties: { [string]: any }?,
	attributes: { [string]: any }?,
	tags: { string }?,
}): (any, ErrorCodes.ErrorObject?)
	if not params.className or #params.className == 0 then
		return nil, ErrorCodes.Create(ErrorCodes.INVALID_ARGUMENT, "Parameter 'className' is required.")
	end
	if not params.parent or #params.parent == 0 then
		return nil, ErrorCodes.Create(ErrorCodes.INVALID_ARGUMENT, "Parameter 'parent' is required.")
	end

	local parentInst, parentErr = InstanceResolver.Resolve(params.parent)
	if not parentInst then
		return nil, parentErr
	end

	local newInst: Instance
	local success, err = pcall(function()
		newInst = Instance.new(params.className)
	end)

	if not success or not newInst then
		return nil, ErrorCodes.Create(ErrorCodes.UNSUPPORTED_OPERATION, string.format("Cannot create Instance of ClassName '%s': %s", params.className, tostring(err)))
	end

	if params.name and #params.name > 0 then
		newInst.Name = params.name
	end

	-- Apply initial properties
	if params.properties then
		for propName, rawVal in pairs(params.properties) do
			local propSuccess, propErr = pcall(function()
				local coerced = LuauTypeCoercion.Coerce(rawVal)
				(newInst :: any)[propName] = coerced
			end)
			if not propSuccess then
				warn(string.format("[InstanceAdapter] Failed to set property '%s' on new '%s': %s", propName, params.className, tostring(propErr)))
			end
		end
	end

	-- Apply initial attributes
	if params.attributes then
		for attrName, val in pairs(params.attributes) do
			pcall(function()
				newInst:SetAttribute(attrName, LuauTypeCoercion.Coerce(val))
			end)
		end
	end

	-- Apply tags
	if params.tags then
		local CollectionService = game:GetService("CollectionService")
		for _, tag in ipairs(params.tags) do
			CollectionService:AddTag(newInst, tag)
		end
	end

	-- Reparent to destination
	local parentSuccess, parentSetErr = pcall(function()
		newInst.Parent = parentInst
	end)
	if not parentSuccess then
		newInst:Destroy()
		return nil, ErrorCodes.Create(ErrorCodes.EXECUTION_FAILED, string.format("Failed to parent new instance to '%s': %s", params.parent, tostring(parentSetErr)))
	end

	local uuid = UuidRegistry.GetOrCreateUuid(newInst)
	return {
		success = true,
		uuid = uuid,
		name = newInst.Name,
		className = newInst.ClassName,
		path = newInst:GetFullName(),
	}, nil
end

function InstanceAdapter.Delete(params: { target: string }): (any, ErrorCodes.ErrorObject?)
	local inst, err = InstanceResolver.Resolve(params.target)
	if not inst then
		return nil, err
	end

	if inst == game or inst == workspace then
		return nil, ErrorCodes.Create(ErrorCodes.PERMISSION_DENIED, "Cannot destroy root Game or Workspace container.")
	end

	local name = inst.Name
	local className = inst.ClassName
	local path = inst:GetFullName()

	local success, delErr = pcall(function()
		inst:Destroy()
	end)

	if not success then
		return nil, ErrorCodes.Create(ErrorCodes.EXECUTION_FAILED, string.format("Failed to destroy '%s': %s", path, tostring(delErr)))
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
}): (any, ErrorCodes.ErrorObject?)
	local inst, err = InstanceResolver.Resolve(params.target)
	if not inst then
		return nil, err
	end

	local cloned: Instance
	local success, cloneErr = pcall(function()
		cloned = inst:Clone()
	end)

	if not success or not cloned then
		return nil, ErrorCodes.Create(ErrorCodes.UNSUPPORTED_OPERATION, string.format("Failed to clone '%s' (Archivable might be false or type not cloneable): %s", params.target, tostring(cloneErr)))
	end

	if params.newName and #params.newName > 0 then
		cloned.Name = params.newName
	end

	if params.properties then
		for propName, rawVal in pairs(params.properties) do
			pcall(function()
				(cloned :: any)[propName] = LuauTypeCoercion.Coerce(rawVal)
			end)
		end
	end

	local targetParent: Instance = inst.Parent or workspace
	if params.parent then
		local pInst, pErr = InstanceResolver.Resolve(params.parent)
		if pInst then
			targetParent = pInst
		else
			cloned:Destroy()
			return nil, pErr
		end
	end

	cloned.Parent = targetParent
	local uuid = UuidRegistry.GetOrCreateUuid(cloned)

	return {
		success = true,
		uuid = uuid,
		name = cloned.Name,
		className = cloned.ClassName,
		path = cloned:GetFullName(),
	}, nil
end

function InstanceAdapter.Reparent(params: { target: string, newParent: string }): (any, ErrorCodes.ErrorObject?)
	local inst, err = InstanceResolver.Resolve(params.target)
	if not inst then
		return nil, err
	end
	local parentInst, pErr = InstanceResolver.Resolve(params.newParent)
	if not parentInst then
		return nil, pErr
	end

	local success, reparentErr = pcall(function()
		inst.Parent = parentInst
	end)

	if not success then
		return nil, ErrorCodes.Create(ErrorCodes.EXECUTION_FAILED, string.format("Failed to reparent '%s' to '%s': %s", params.target, params.newParent, tostring(reparentErr)))
	end

	return {
		success = true,
		name = inst.Name,
		newPath = inst:GetFullName(),
		parent = parentInst:GetFullName(),
	}, nil
end

function InstanceAdapter.Rename(params: { target: string, newName: string }): (any, ErrorCodes.ErrorObject?)
	local inst, err = InstanceResolver.Resolve(params.target)
	if not inst then
		return nil, err
	end

	if not params.newName or #params.newName == 0 then
		return nil, ErrorCodes.Create(ErrorCodes.INVALID_ARGUMENT, "Parameter 'newName' cannot be empty.")
	end

	local oldName = inst.Name
	local success, renameErr = pcall(function()
		inst.Name = params.newName
	end)

	if not success then
		return nil, ErrorCodes.Create(ErrorCodes.EXECUTION_FAILED, string.format("Failed to rename '%s': %s", params.target, tostring(renameErr)))
	end

	return {
		success = true,
		oldName = oldName,
		newName = inst.Name,
		path = inst:GetFullName(),
	}, nil
end

function InstanceAdapter.Move(params: {
	target: string,
	position: { number }?,
	cframe: { number }?,
	pivot: boolean?,
}): (any, ErrorCodes.ErrorObject?)
	local inst, err = InstanceResolver.Resolve(params.target)
	if not inst then
		return nil, err
	end

	local targetCFrame: CFrame? = nil

	if params.cframe then
		if #params.cframe == 3 then
			targetCFrame = CFrame.new(params.cframe[1], params.cframe[2], params.cframe[3])
		elseif #params.cframe == 12 then
			targetCFrame = CFrame.new(table.unpack(params.cframe))
		end
	elseif params.position and #params.position == 3 then
		targetCFrame = CFrame.new(params.position[1], params.position[2], params.position[3])
	end

	if not targetCFrame then
		return nil, ErrorCodes.Create(ErrorCodes.INVALID_ARGUMENT, "Must provide valid 'position' [X, Y, Z] or 'cframe'.")
	end

	local success, moveErr = pcall(function()
		if inst:IsA("Model") then
			if params.pivot ~= false then
				inst:PivotTo(targetCFrame)
			else
				inst:MoveTo(targetCFrame.Position)
			end
		elseif inst:IsA("BasePart") then
			inst.CFrame = targetCFrame
		elseif inst:IsA("Attachment") then
			inst.CFrame = targetCFrame
		else
			error("Target instance must be a Model, BasePart, or Attachment to be moved.")
		end
	end)

	if not success then
		return nil, ErrorCodes.Create(ErrorCodes.EXECUTION_FAILED, string.format("Failed to move '%s': %s", params.target, tostring(moveErr)))
	end

	return {
		success = true,
		path = inst:GetFullName(),
		position = { targetCFrame.Position.X, targetCFrame.Position.Y, targetCFrame.Position.Z },
	}, nil
end

return InstanceAdapter
