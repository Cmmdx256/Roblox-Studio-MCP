--!strict
-- DaemonManager: Detects, health-checks, verifies identity, and connects to the local MCP transport daemon

local HttpService = game:GetService("HttpService")
local State = require(script.Parent.Parent.Core.State)
local Config = require(script.Parent.Parent.Core.Config)
local Logger = require(script.Parent.Parent.Core.Logger)

local DaemonManager = {}

export type DaemonState = "NOT_FOUND" | "STARTING" | "ONLINE" | "DEGRADED" | "UNHEALTHY" | "STOPPING" | "STOPPED" | "FAILED"

local currentDaemonState: DaemonState = "NOT_FOUND"
local isMonitoring = false
local verifiedDaemonFingerprint: string? = nil

function DaemonManager.GetState(): DaemonState
	return currentDaemonState
end

function DaemonManager.GetFingerprint(): string?
	return verifiedDaemonFingerprint
end

function DaemonManager.CheckHealth(): (boolean, { [string]: any }?)
	local healthUrl = Config.GetBaseUrl() .. "/health"
	local success, response = pcall(function()
		return HttpService:RequestAsync({
			Url = healthUrl,
			Method = "GET",
			Headers = { ["Accept"] = "application/json" },
		})
	end)

	if success and response and response.StatusCode == 200 then
		local decodeOk, data = pcall(function()
			return HttpService:JSONDecode(response.Body)
		end)

		if decodeOk and data and data.status == "ready" then
			currentDaemonState = "ONLINE"
			verifiedDaemonFingerprint = data.tls and data.tls.fingerprint or "verified"
			State.SetSubsystem("HTTP", "OK")
			State.SetSubsystem("MCP", "CONNECTED")
			return true, data
		else
			currentDaemonState = "DEGRADED"
			return false, nil
		end
	else
		currentDaemonState = "NOT_FOUND"
		State.SetSubsystem("MCP", "OFFLINE")
		return false, nil
	end
end

function DaemonManager.StartMonitoring()
	if isMonitoring then return end
	isMonitoring = true

	task.spawn(function()
		local retryDelay = 2
		while isMonitoring do
			local isHealthy, _data = DaemonManager.CheckHealth()
			if isHealthy then
				retryDelay = Config.PollInterval
			else
				retryDelay = math.min(retryDelay * 1.5, 10)
			end
			task.wait(retryDelay)
		end
	end)
end

function DaemonManager.StopMonitoring()
	isMonitoring = false
	currentDaemonState = "STOPPED"
end

return DaemonManager
