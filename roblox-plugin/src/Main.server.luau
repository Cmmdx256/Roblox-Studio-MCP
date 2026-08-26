--!strict
-- Roblox Studio Universal MCP Plugin Entrypoint
local pluginObj: any = nil
pcall(function()
	if plugin ~= nil then
		pluginObj = plugin
	end
end)

local DockWidget = require(script.Parent.UI.DockWidget)
local MessageBox = require(script.Parent.UI.MessageBox)
local HttpClient = require(script.Parent.Bridge.HttpClient)
local EventObserver = require(script.Parent.Observation.EventObserver)
local Config = require(script.Parent.Config)
local Logger = require(script.Parent.Utils.Logger)

-- 1. Create Main UI (Handles both Plugin & ScreenGui fallback)
local widget = DockWidget.Create(pluginObj)

-- Toolbar button only if running as a real Studio plugin
if pluginObj and typeof(pluginObj.CreateToolbar) == "function" then
	pcall(function()
		local toolbar = pluginObj:CreateToolbar("Universal MCP")
		local toggleButton = toolbar:CreateButton(
			"MCP Status",
			"Open Universal MCP Bridge Status & Logs",
			"rbxasset://textures/ui/Settings/MenuBar/SettingsButton.png"
		)
		toggleButton.ClickableWhenViewportHidden = true

		toggleButton.Click:Connect(function()
			widget.Enabled = not widget.Enabled
		end)

		widget:GetPropertyChangedSignal("Enabled"):Connect(function()
			toggleButton:SetActive(widget.Enabled)
		end)
	end)
end

-- 2. Connected Alert / MessageBox (fires on successful activation)
local hasShownInitialAlert = false
HttpClient.OnStatusChanged(function(connected: boolean, message: string?)
	if connected and not hasShownInitialAlert then
		hasShownInitialAlert = true
		MessageBox.ShowNotification(
			"⚡ Universal MCP Aktif!",
			string.format("%s üzerinde aktif edildi!", Config.GetBaseUrl())
		)
		MessageBox.ShowPopupModal(pluginObj, Config.GetBaseUrl(), function()
			widget.Enabled = true
		end)
	end
end)

-- 3. Initialize Observers & Start HTTP Bridge
EventObserver.Initialize()
HttpClient.Start()

Logger.Log(string.format("Roblox Studio Universal MCP Plugin started. Target: %s", Config.GetBaseUrl()))

-- 4. Teardown
if pluginObj and typeof(pluginObj.Unloading) == "userdata" then
	pcall(function()
		pluginObj.Unloading:Connect(function()
			HttpClient.Stop()
			Logger.Log("Roblox Studio Universal MCP Plugin unloaded.")
		end)
	end)
end
