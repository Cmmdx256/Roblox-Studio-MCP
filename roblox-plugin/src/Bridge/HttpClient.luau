--!strict
local HttpService = game:GetService("HttpService")
local Config = require(script.Parent.Parent.Config)
local Session = require(script.Parent.Session)
local CommandRouter = require(script.Parent.Parent.Core.CommandRouter)
local ExecutionQueue = require(script.Parent.Parent.Core.ExecutionQueue)
local EventObserver = require(script.Parent.Parent.Observation.EventObserver)
local Logger = require(script.Parent.Parent.Utils.Logger)

local HttpClient = {}

local isRunning = false
local onStatusChangedCallbacks: { (boolean, string?) -> () } = {}

function HttpClient.OnStatusChanged(callback: (boolean, string?) -> ())
	table.insert(onStatusChangedCallbacks, callback)
end

local function notifyStatus(connected: boolean, message: string?)
	Session.SetConnected(connected)
	for _, cb in ipairs(onStatusChangedCallbacks) do
		pcall(function()
			cb(connected, message)
		end)
	end
end

-- Perform initial handshake with local bridge
function HttpClient.Handshake(): boolean
	local url = Config.GetBaseUrl() .. "/api/handshake"
	local payload = Session.GetHandshakePayload()

	local success, response = pcall(function()
		return HttpService:RequestAsync({
			Url = url,
			Method = "POST",
			Headers = {
				["Content-Type"] = "application/json",
			},
			Body = HttpService:JSONEncode(payload),
		})
	end)

	if success and response and response.StatusCode == 200 then
		Logger.Log("Connected to MCP Bridge at", Config.GetBaseUrl())
		notifyStatus(true, "Connected to MCP Bridge")
		return true
	else
		local rawErr = tostring(response and response.StatusMessage or response or "")
		local friendlyMsg = "Bridge unreachable at " .. Config.GetBaseUrl()
		if string.find(rawErr:lower(), "not allowed") or string.find(rawErr:lower(), "security") or string.find(rawErr:lower(), "http") then
			friendlyMsg = "⚠️ Please enable 'Allow HTTP Requests' in Game Settings > Security!"
			Logger.Warn(friendlyMsg)
		else
			Logger.Log("Polling MCP server... (" .. rawErr .. ")")
		end
		notifyStatus(false, friendlyMsg)
		return false
	end
end

-- Send command execution response back to bridge
function HttpClient.SendResponse(responsePayload: { [string]: any })
	local url = Config.GetBaseUrl() .. "/api/response"
	pcall(function()
		HttpService:RequestAsync({
			Url = url,
			Method = "POST",
			Headers = {
				["Content-Type"] = "application/json",
			},
			Body = HttpService:JSONEncode(responsePayload),
		})
	end)
end

-- Process an incoming command
local function processCommand(cmd: { id: string, action: string, params: any })
	ExecutionQueue.Enqueue(function()
		local startTime = os.clock()
		Logger.Log(string.format("Executing command '%s' (ID: %s)", cmd.action, cmd.id))

		local result, err = CommandRouter.Dispatch(cmd.action, cmd.params)
		local elapsed = math.floor((os.clock() - startTime) * 1000)

		if err then
			Logger.Warn(string.format("Command '%s' failed in %dms: %s", cmd.action, elapsed, err.message))
			HttpClient.SendResponse({
				id = cmd.id,
				success = false,
				error = err,
			})
		else
			Logger.Log(string.format("Command '%s' succeeded in %dms", cmd.action, elapsed))
			HttpClient.SendResponse({
				id = cmd.id,
				success = true,
				result = result,
			})
		end
	end)
end

-- Polling loop
function HttpClient.Start()
	if isRunning then return end
	isRunning = true

	task.spawn(function()
		-- Initial handshake
		while isRunning and not HttpClient.Handshake() do
			task.wait(Config.HandshakeRetryInterval)
		end

		local pollUrl = Config.GetBaseUrl() .. "/api/poll"

		while isRunning do
			local events = EventObserver.FlushEvents()
			local pollPayload = {
				sessionId = Session.GetSessionId(),
				events = events,
			}

			local pollSuccess, response = pcall(function()
				return HttpService:RequestAsync({
					Url = pollUrl,
					Method = "POST",
					Headers = {
						["Content-Type"] = "application/json",
					},
					Body = HttpService:JSONEncode(pollPayload),
				})
			end)

			if pollSuccess and response.Success and response.StatusCode == 200 then
				notifyStatus(true, "Connected")
				local decodeSuccess, data = pcall(function()
					return HttpService:JSONDecode(response.Body)
				end)

				if decodeSuccess and data and data.commands then
					local commands = data.commands
					if #commands > 0 then
						for _, cmd in ipairs(commands) do
							processCommand(cmd)
						end
						-- Fast poll when active
						task.wait(Config.ActivePollInterval)
						continue
					end
				end

				task.wait(Config.PollInterval)
			else
				notifyStatus(false, "Connection lost, retrying...")
				task.wait(Config.HandshakeRetryInterval)
				-- Attempt re-handshake
				HttpClient.Handshake()
			end
		end
	end)
end

function HttpClient.Stop()
	isRunning = false
	notifyStatus(false, "Stopped")
end

return HttpClient
