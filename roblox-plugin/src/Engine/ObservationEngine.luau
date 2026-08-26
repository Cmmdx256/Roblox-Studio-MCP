--!strict
-- ObservationEngine: Real-time event monitoring for DataModel, Selection, and Log changes

local Selection = game:GetService("Selection")
local LogService = game:GetService("LogService")

local ObservationEngine = {}

type StudioChangeEvent = {
	type: string,
	path: string?,
	className: string?,
	name: string?,
	details: { [string]: any }?,
	timestamp: number,
}

local eventBuffer: { StudioChangeEvent } = {}
local connections: { RBXScriptConnection } = {}
local isRunning = false
local totalEventsObserved = 0

local MONITORED_SERVICES = {
	"Workspace",
	"ReplicatedStorage",
	"ServerScriptService",
	"ServerStorage",
	"StarterGui",
	"StarterPlayer",
	"Lighting",
}

local function pushEvent(eventType: string, inst: Instance?, details: { [string]: any }?)
	totalEventsObserved += 1
	local evt: StudioChangeEvent = {
		type = eventType,
		path = inst and inst:GetFullName() or nil,
		className = inst and inst.ClassName or nil,
		name = inst and inst.Name or nil,
		details = details,
		timestamp = os.time(),
	}

	table.insert(eventBuffer, evt)
	if #eventBuffer > 300 then
		table.remove(eventBuffer, 1)
	end
end

function ObservationEngine.Start()
	if isRunning then return end
	isRunning = true

	-- 1. Selection Changed
	pcall(function()
		local selConn = Selection.SelectionChanged:Connect(function()
			local selected = Selection:Get()
			local paths = {}
			for _, item in ipairs(selected) do
				table.insert(paths, item:GetFullName())
			end
			pushEvent("selection_changed", nil, { count = #selected, selection = paths })
		end)
		table.insert(connections, selConn)
	end)

	-- 2. DataModel Changes across Services
	for _, serviceName in ipairs(MONITORED_SERVICES) do
		pcall(function()
			local s = game:GetService(serviceName)
			if s then
				local addedConn = s.DescendantAdded:Connect(function(desc)
					pushEvent("instance_added", desc, { parent = desc.Parent and desc.Parent:GetFullName() or "nil" })
				end)
				local removedConn = s.DescendantRemoving:Connect(function(desc)
					pushEvent("instance_removed", desc, { parent = desc.Parent and desc.Parent:GetFullName() or "nil" })
				end)
				table.insert(connections, addedConn)
				table.insert(connections, removedConn)
			end
		end)
	end

	-- 3. LogService message output
	pcall(function()
		local logConn = LogService.MessageOut:Connect(function(message, messageType)
			local msgTypeStr = tostring(messageType)
			if msgTypeStr:find("Error") then
				pushEvent("studio_error", nil, { message = message, messageType = msgTypeStr })
			end
		end)
		table.insert(connections, logConn)
	end)
end

function ObservationEngine.DrainEvents(maxCount: number?): { StudioChangeEvent }
	local limit = maxCount or 50
	local batch = {}
	local count = math.min(limit, #eventBuffer)

	for _ = 1, count do
		table.insert(batch, table.remove(eventBuffer, 1))
	end

	return batch
end

function ObservationEngine.GetStats(): { [string]: any }
	return {
		active = isRunning,
		bufferedCount = #eventBuffer,
		totalObserved = totalEventsObserved,
		activeConnections = #connections,
	}
end

function ObservationEngine.Stop()
	isRunning = false
	for _, conn in ipairs(connections) do
		pcall(function()
			conn:Disconnect()
		end)
	end
	connections = {}
	eventBuffer = {}
end

return ObservationEngine
