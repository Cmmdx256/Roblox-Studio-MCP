--!strict
-- MCP Transport: Polling HTTP communication with local MCP Bridge and live event streaming

local HttpService = game:GetService("HttpService")
local StarterGui = game:GetService("StarterGui")
local State = require(script.Parent.Parent.Core.State)
local Config = require(script.Parent.Parent.Core.Config)
local Logger = require(script.Parent.Parent.Core.Logger)
local Router = require(script.Parent.Router)
local ObservationEngine = require(script.Parent.Parent.Engine.ObservationEngine)
local StudioAdapter = require(script.Parent.Parent.Studio.StudioAdapter)

local Transport = {}

local isRunning = false
local hasShownActivationAlert = false
local bridgeToken: string? = nil

function Transport.ShowActivationAlert(baseUrl: string)
	if hasShownActivationAlert then return end
	hasShownActivationAlert = true

	-- 1. Studio Bottom-Right Notification Toast
	pcall(function()
		StarterGui:SetCore("SendNotification", {
			Title = "⚡ Universal MCP Aktif!",
			Text = string.format("%s üzerinde bağlandı!", baseUrl),
			Duration = 8,
			Icon = "rbxasset://textures/ui/Settings/MenuBar/SettingsButton.png",
		})
	end)

	-- 2. Console Big Banner
	print(string.format([[

===================================================================
⚡ ROBLOX STUDIO UNIVERSAL MCP BRIDGE AKTİF EDİLDİ!
-------------------------------------------------------------------
🌐 Adres: %s
🎯 Durum: AI Agent (Claude / Cursor) projenizi yönetmeye hazır!
===================================================================
]], baseUrl))
end

function Transport.Handshake(): boolean
	local realPlaceName = StudioAdapter.ResolvePlaceName()
	local url = Config.GetBaseUrl() .. "/api/handshake"
	local payload = {
		sessionId = State.SessionId,
		placeId = game.PlaceId,
		placeName = realPlaceName,
		gameId = game.GameId,
		studioVersion = version(),
		mode = "Edit",
	}

	local success, response = pcall(function()
		return HttpService:RequestAsync({
			Url = url,
			Method = "POST",
			Headers = { ["Content-Type"] = "application/json" },
			Body = HttpService:JSONEncode(payload),
		})
	end)

	if success and response and response.StatusCode == 200 then
		local decodeSuccess, data = pcall(function()
			return HttpService:JSONDecode(response.Body)
		end)
		if not decodeSuccess or type(data) ~= "table" or type(data.bridgeToken) ~= "string" then
			State.SetSubsystem("MCP", "OFFLINE")
			Logger.Warn("MCP Bridge handshake did not return a session token")
			return false
		end
		bridgeToken = data.bridgeToken
		State.SetSubsystem("HTTP", "OK")
		State.SetSubsystem("MCP", "CONNECTED")
		Logger.Log("Connected to MCP Bridge at", Config.GetBaseUrl())
		Transport.ShowActivationAlert(Config.GetBaseUrl())
		return true
	else
		local rawErr = tostring(response and response.StatusMessage or response or "")
		if string.find(rawErr:lower(), "not allowed") or string.find(rawErr:lower(), "http") then
			State.SetSubsystem("HTTP", "BLOCKED")
			Logger.Warn("⚠️ Please enable 'Allow HTTP Requests' in Game Settings > Security!")
		else
			State.SetSubsystem("HTTP", "READY")
		end
		State.SetSubsystem("MCP", "OFFLINE")
		return false
	end
end

function Transport.SendResponse(payload: { [string]: any })
	if not bridgeToken then
		Logger.Warn("Refusing to send command response before bridge session authentication")
		return
	end
	payload.sessionId = State.SessionId
	payload.bridgeToken = bridgeToken
	local url = Config.GetBaseUrl() .. "/api/response"
	pcall(function()
		HttpService:RequestAsync({
			Url = url,
			Method = "POST",
			Headers = { ["Content-Type"] = "application/json" },
			Body = HttpService:JSONEncode(payload),
		})
	end)
end

function Transport.Start()
	if isRunning then return end
	isRunning = true

	task.spawn(function()
		while isRunning and not Transport.Handshake() do
			task.wait(Config.HandshakeRetryInterval)
		end

		local pollUrl = Config.GetBaseUrl() .. "/api/poll"

		while isRunning do
			local events = ObservationEngine.DrainEvents(25)
			local pollPayload = {
				sessionId = State.SessionId,
				bridgeToken = bridgeToken,
				events = events,
			}

			local success, response = pcall(function()
				return HttpService:RequestAsync({
					Url = pollUrl,
					Method = "POST",
					Headers = { ["Content-Type"] = "application/json" },
					Body = HttpService:JSONEncode(pollPayload),
				})
			end)

			if success and response and response.StatusCode == 200 then
				State.SetSubsystem("MCP", "CONNECTED")
				local decodeSuccess, data = pcall(function()
					return HttpService:JSONDecode(response.Body)
				end)

				if decodeSuccess and data and data.commands and #data.commands > 0 then
					for _, cmd in ipairs(data.commands) do
						task.spawn(function()
							Logger.Log(string.format("Executing '%s' (ID: %s)", cmd.action, cmd.id))
							local result, err = Router.Dispatch(cmd.action, cmd.params)
							if err then
								Logger.Warn(string.format("Command '%s' failed: %s", cmd.action, err.message))
								Transport.SendResponse({ id = cmd.id, success = false, error = err })
							else
								Logger.Log(string.format("Command '%s' succeeded", cmd.action))
								Transport.SendResponse({ id = cmd.id, success = true, result = result })
							end
						end)
					end
					task.wait(Config.ActivePollInterval)
					continue
				end

				task.wait(Config.PollInterval)
			else
				State.SetSubsystem("MCP", "OFFLINE")
				task.wait(Config.HandshakeRetryInterval)
				Transport.Handshake()
			end
		end
	end)
end

function Transport.Stop()
	isRunning = false
	State.SetSubsystem("MCP", "OFFLINE")
end

return Transport
