--!strict
local LogService = game:GetService("LogService")
local ScriptContext = game:GetService("ScriptContext")
local Config = require(script.Parent.Parent.Config)
local ErrorCodes = require(script.Parent.Parent.Utils.ErrorCodes)

local OutputAdapter = {}

export type LogItem = {
	message: string,
	messageType: string,
	timestamp: number,
	traceback: string?,
}

local buffer: { LogItem } = {}
local errorBuffer: { LogItem } = {}
local listeners: { (LogItem) -> () } = {}

local initialized = false

function OutputAdapter.Initialize()
	if initialized then return end
	initialized = true

	-- Connect LogService.MessageOut
	pcall(function()
		LogService.MessageOut:Connect(function(message: string, messageType: Enum.MessageType)
			local typeName = tostring(messageType):gsub("Enum.MessageType.", "")
			local item: LogItem = {
				message = message,
				messageType = typeName,
				timestamp = os.time(),
			}

			table.insert(buffer, item)
			if #buffer > Config.MaxLogBuffer then
				table.remove(buffer, 1)
			end

			if typeName == "MessageError" then
				table.insert(errorBuffer, item)
				if #errorBuffer > Config.MaxLogBuffer then
					table.remove(errorBuffer, 1)
				end
			end

			for _, listener in ipairs(listeners) do
				pcall(function()
					listener(item)
				end)
			end
		end)
	end)

	-- Connect ScriptContext.Error
	pcall(function()
		ScriptContext.Error:Connect(function(message: string, stackTrace: string, scriptInst: Instance?)
			local item: LogItem = {
				message = message,
				messageType = "MessageError",
				timestamp = os.time(),
				traceback = stackTrace,
			}

			table.insert(buffer, item)
			table.insert(errorBuffer, item)
			if #buffer > Config.MaxLogBuffer then table.remove(buffer, 1) end
			if #errorBuffer > Config.MaxLogBuffer then table.remove(errorBuffer, 1) end

			for _, listener in ipairs(listeners) do
				pcall(function()
					listener(item)
				end)
			end
		end)
	end)
end

function OutputAdapter.OnLog(callback: (LogItem) -> ())
	table.insert(listeners, callback)
end

function OutputAdapter.GetRecent(params: { limit: number?, filterType: string? }): (any, ErrorCodes.ErrorObject?)
	local limit = params.limit or 50
	local filter = params.filterType

	local results = {}
	for i = #buffer, 1, -1 do
		local item = buffer[i]
		if not filter or item.messageType == filter then
			table.insert(results, 1, item)
			if #results >= limit then
				break
			end
		end
	end

	return {
		success = true,
		count = #results,
		logs = results,
	}, nil
end

function OutputAdapter.GetErrors(params: { limit: number? }): (any, ErrorCodes.ErrorObject?)
	local limit = params.limit or 30
	local results = {}
	for i = #errorBuffer, 1, -1 do
		table.insert(results, 1, errorBuffer[i])
		if #results >= limit then
			break
		end
	end

	return {
		success = true,
		count = #results,
		errors = results,
	}, nil
end

function OutputAdapter.Clear(): (any, ErrorCodes.ErrorObject?)
	buffer = {}
	errorBuffer = {}
	return {
		success = true,
		cleared = true,
	}, nil
end

return OutputAdapter
