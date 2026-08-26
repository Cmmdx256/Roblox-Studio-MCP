--!strict
-- Widget: Manages creation and lifecycle of the Studio DockWidget

local DiagnosticsView = require(script.Parent.DiagnosticsView)

local Widget = {}

local activeWidget: DockWidgetPluginGui? = nil

function Widget.Create(plugin: Plugin, onConnectRequest: () -> (), onRefreshRequest: () -> ()): (DockWidgetPluginGui?, string?)
	if not plugin or typeof(plugin.CreateDockWidgetPluginGui) ~= "function" then
		return nil, "Invalid Plugin object passed to Widget.Create"
	end

	local widgetInfo = DockWidgetPluginGuiInfo.new(
		Enum.InitialDockState.Right,
		false, -- Initially enabled
		false, -- Override previous enabled state
		320,   -- Default width
		480,   -- Default height
		280,   -- Min width
		300    -- Min height
	)

	local success, widget = pcall(function()
		return plugin:CreateDockWidgetPluginGui("UniversalMCP_Widget_V3", widgetInfo)
	end)

	if not success or not widget then
		return nil, tostring(widget or "Failed to create DockWidgetPluginGui")
	end

	widget.Title = "Universal MCP"
	activeWidget = widget

	-- Render diagnostics view inside widget
	DiagnosticsView.Render(widget, onConnectRequest, onRefreshRequest)

	return widget, nil
end

function Widget.Toggle()
	if activeWidget then
		activeWidget.Enabled = not activeWidget.Enabled
	end
end

function Widget.SetEnabled(enabled: boolean)
	if activeWidget then
		activeWidget.Enabled = enabled
	end
end

function Widget.Destroy()
	activeWidget = nil
end

return Widget
