--!strict
-- Plugin Bootstrap: Deterministic startup, daemon discovery, and capability initialization

local HttpService = game:GetService("HttpService")
local State = require(script.Parent.Core.State)
local Logger = require(script.Parent.Core.Logger)
local Toolbar = require(script.Parent.UI.Toolbar)
local Widget = require(script.Parent.UI.Widget)
local StudioAdapter = require(script.Parent.Studio.StudioAdapter)
local CapabilityRegistry = require(script.Parent.Discovery.CapabilityRegistry)
local ObservationEngine = require(script.Parent.Engine.ObservationEngine)
local DataModelGraph = require(script.Parent.Engine.DataModelGraph)
local ScriptRegistry = require(script.Parent.Engine.ScriptRegistry)
local ToolRegistry = require(script.Parent.Tools.ToolRegistry)
local DaemonManager = require(script.Parent.Bridge.DaemonManager)
local Transport = require(script.Parent.MCP.Transport)

local Bootstrap = {}

function Bootstrap.Init(pluginObj: Plugin): boolean
	-- 1. Prevent duplicate initialization
	if State.Lifecycle == "INITIALIZING" or State.Lifecycle == "READY" then
		Logger.Warn("Plugin is already initialized or initializing.")
		return true
	end

	State.SetLifecycle("INITIALIZING")

	-- 2. Validate Environment
	local isValidPlugin = false
	pcall(function()
		isValidPlugin = (pluginObj ~= nil) and (pluginObj:IsA("Plugin") or typeof(pluginObj) == "userdata" or typeof(pluginObj) == "Instance" or typeof(pluginObj) == "table")
	end)

	if not isValidPlugin then
		Logger.Error("Invalid environment: Bootstrap must receive a valid Roblox Plugin instance.")
		State.SetLifecycle("STOPPED")
		return false
	end

	State.SetSubsystem("Plugin", "OK")
	pcall(function()
		State.SessionId = "studio_" .. HttpService:GenerateGUID(false):lower():sub(1, 12)
	end)

	-- 3. Initialize Studio Adapters
	pcall(function()
		StudioAdapter.Initialize()
	end)

	-- 4. Dynamic Capability Discovery & Tool Registration
	local caps = CapabilityRegistry.Discover()
	ToolRegistry.Initialize()
	local toolStats = ToolRegistry.GetStats()
	local capCount = 0
	for _ in pairs(caps) do capCount += 1 end

	-- 5. Start Real-time Observation Engine
	pcall(function()
		ObservationEngine.Start()
	end)

	-- 6. Start Daemon Health Monitoring
	pcall(function()
		DaemonManager.StartMonitoring()
	end)

	-- 7. Build Initial DataModel Graph & Script Registry (Asynchronous)
	task.spawn(function()
		DataModelGraph.BuildGraph()
		ScriptRegistry.Scan()
	end)

	-- 8. Initialize Toolbar & Button
	local toolbarOk, toolbarErr = Toolbar.Create(pluginObj, function()
		Widget.Toggle()
	end)
	if not toolbarOk then
		Logger.Warn("Toolbar initialization notice:", toolbarErr)
	end

	-- 9. Initialize DockWidget
	local widget, widgetErr = Widget.Create(pluginObj, function()
		Transport.Handshake()
	end, function()
		StudioAdapter.Initialize()
		CapabilityRegistry.Discover()
	end)
	if not widget then
		Logger.Warn("Widget initialization notice:", widgetErr)
	end

	-- 10. Automated Lifecycle Startup Log (Section 135)
	Logger.PrintAutomatedStartup(capCount, toolStats.lowLevel, toolStats.highLevel)

	-- 11. Initialize MCP Transport
	pcall(function()
		Transport.Start()
	end)

	-- 12. Connect Plugin Unloading Lifecycle
	pcall(function()
		pluginObj.Unloading:Connect(function()
			Bootstrap.Shutdown()
		end)
	end)

	State.SetLifecycle("READY")
	return true
end

function Bootstrap.Shutdown()
	if State.Lifecycle == "STOPPING" or State.Lifecycle == "STOPPED" then return end
	State.SetLifecycle("STOPPING")

	Logger.Log("Shutting down Universal MCP Plugin...")
	Transport.Stop()
	DaemonManager.StopMonitoring()
	ObservationEngine.Stop()
	Toolbar.Destroy()
	Widget.Destroy()

	State.SetLifecycle("STOPPED")
	Logger.Log("Plugin unloaded cleanly.")
end

return Bootstrap
