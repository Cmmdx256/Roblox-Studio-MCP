--!strict
local Selection = game:GetService("Selection")
local OutputAdapter = require(script.Parent.Parent.Adapters.OutputAdapter)
local UuidRegistry = require(script.Parent.Parent.Addressing.UuidRegistry)
local Logger = require(script.Parent.Parent.Utils.Logger)

local EventObserver = {}

export type StudioEvent = {
	type: string,
	timestamp: number,
	data: { [string]: any },
}

local eventQueue: { StudioEvent } = {}
local isInitialized = false

function EventObserver.Initialize()
	if isInitialized then return end
	isInitialized = true

	-- 1. Initialize Output/Error observation
	OutputAdapter.Initialize()
	OutputAdapter.OnLog(function(logItem)
		EventObserver.PushEvent("log", {
			message = logItem.message,
			messageType = logItem.messageType,
			traceback = logItem.traceback,
		})
	end)

	-- 2. Selection Changed Observer
	pcall(function()
		Selection.SelectionChanged:Connect(function()
			local selected = Selection:Get()
			local items = {}
			for _, inst in ipairs(selected) do
				table.insert(items, {
					path = inst:GetFullName(),
					className = inst.ClassName,
					name = inst.Name,
					uuid = UuidRegistry.GetOrCreateUuid(inst),
				})
			end
			EventObserver.PushEvent("selection_changed", {
				count = #items,
				selection = items,
			})
		end)
	end)

	-- 3. Descendant Added / Removed (limited to key top-level services to prevent engine spam)
	local function observeService(serviceName: string)
		pcall(function()
			local s = game:GetService(serviceName)
			s.DescendantAdded:Connect(function(desc: Instance)
				-- Ignore CoreGui or internal instances
				if not desc:IsDescendantOf(game) then return end
				EventObserver.PushEvent("instance_added", {
					path = desc:GetFullName(),
					className = desc.ClassName,
					name = desc.Name,
					parent = desc.Parent and desc.Parent:GetFullName() or "nil",
				})
			end)

			s.DescendantRemoving:Connect(function(desc: Instance)
				EventObserver.PushEvent("instance_removing", {
					path = desc:GetFullName(),
					className = desc.ClassName,
					name = desc.Name,
				})
			end)
		end)
	end

	observeService("Workspace")
	observeService("ReplicatedStorage")
	observeService("ServerScriptService")
	observeService("StarterGui")

	Logger.Log("Event observers active.")
end

function EventObserver.PushEvent(eventType: string, data: { [string]: any })
	local ev: StudioEvent = {
		type = eventType,
		timestamp = os.time(),
		data = data,
	}
	table.insert(eventQueue, ev)
	-- Keep buffer bounded
	if #eventQueue > 100 then
		table.remove(eventQueue, 1)
	end
end

function EventObserver.FlushEvents(): { StudioEvent }
	if #eventQueue == 0 then
		return {}
	end
	local flushed = eventQueue
	eventQueue = {}
	return flushed
end

return EventObserver
