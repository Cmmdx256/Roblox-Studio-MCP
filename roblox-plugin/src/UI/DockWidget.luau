--!strict
local Config = require(script.Parent.Parent.Config)
local Session = require(script.Parent.Parent.Bridge.Session)
local HttpClient = require(script.Parent.Parent.Bridge.HttpClient)
local CoreGui = game:GetService("CoreGui")
local StarterGui = game:GetService("StarterGui")

local DockWidget = {}

function DockWidget.Create(pluginObj: any): any
	local container: any = nil

	if pluginObj and typeof(pluginObj.CreateDockWidgetPluginGui) == "function" then
		local success, widget = pcall(function()
			local widgetInfo = DockWidgetPluginGuiInfo.new(
				Enum.InitialDockState.Right,
				false, -- Initially enabled
				false, -- Override previous enabled state
				320,   -- Default width
				450,   -- Default height
				280,   -- Min width
				300    -- Min height
			)
			return pluginObj:CreateDockWidgetPluginGui("RobloxUniversalMCPWidget_v2", widgetInfo)
		end)
		if success and widget then
			widget.Title = "Roblox Universal MCP"
			container = widget
		end
	end

	if not container then
		local screenGui = Instance.new("ScreenGui")
		screenGui.Name = "RobloxUniversalMCP_ScreenGui"
		screenGui.ResetOnSpawn = false
		screenGui.Enabled = false

		pcall(function() screenGui.Parent = CoreGui end)
		if not screenGui.Parent then
			pcall(function() screenGui.Parent = StarterGui end)
		end
		container = screenGui
	end

	-- Main Background Frame
	local mainFrame = Instance.new("Frame")
	if container:IsA("ScreenGui") then
		mainFrame.Size = UDim2.new(0, 320, 0, 460)
		mainFrame.Position = UDim2.new(1, -340, 0.5, -230)
		local frameCorner = Instance.new("UICorner")
		frameCorner.CornerRadius = UDim.new(0, 8)
		frameCorner.Parent = mainFrame
	else
		mainFrame.Size = UDim2.new(1, 0, 1, 0)
	end
	mainFrame.BackgroundColor3 = Color3.fromRGB(36, 37, 41)
	mainFrame.BorderSizePixel = 0
	mainFrame.Parent = container

	local layout = Instance.new("UIListLayout")
	layout.SortOrder = Enum.SortOrder.LayoutOrder
	layout.Padding = UDim.new(0, 8)
	layout.Parent = mainFrame

	local padding = Instance.new("UIPadding")
	padding.PaddingTop = UDim.new(0, 10)
	padding.PaddingBottom = UDim.new(0, 10)
	padding.PaddingLeft = UDim.new(0, 10)
	padding.PaddingRight = UDim.new(0, 10)
	padding.Parent = mainFrame

	-- Title / Header
	local header = Instance.new("TextLabel")
	header.Size = UDim2.new(1, 0, 0, 24)
	header.BackgroundTransparency = 1
	header.Text = "⚡ Universal MCP Bridge"
	header.TextColor3 = Color3.fromRGB(240, 240, 240)
	header.Font = Enum.Font.GothamBold
	header.TextSize = 16
	header.TextXAlignment = Enum.TextXAlignment.Left
	header.LayoutOrder = 1
	header.Parent = mainFrame

	-- Status Card
	local statusCard = Instance.new("Frame")
	statusCard.Size = UDim2.new(1, 0, 0, 75)
	statusCard.BackgroundColor3 = Color3.fromRGB(46, 47, 52)
	statusCard.BorderSizePixel = 0
	statusCard.LayoutOrder = 2
	statusCard.Parent = mainFrame

	local cardCorner = Instance.new("UICorner")
	cardCorner.CornerRadius = UDim.new(0, 6)
	cardCorner.Parent = statusCard

	local statusIndicator = Instance.new("Frame")
	statusIndicator.Size = UDim2.new(0, 12, 0, 12)
	statusIndicator.Position = UDim2.new(0, 12, 0, 14)
	statusIndicator.BackgroundColor3 = Color3.fromRGB(235, 87, 87)
	statusIndicator.BorderSizePixel = 0
	statusIndicator.Parent = statusCard

	local dotCorner = Instance.new("UICorner")
	dotCorner.CornerRadius = UDim.new(1, 0)
	dotCorner.Parent = statusIndicator

	local statusText = Instance.new("TextLabel")
	statusText.Size = UDim2.new(1, -35, 0, 20)
	statusText.Position = UDim2.new(0, 32, 0, 10)
	statusText.BackgroundTransparency = 1
	statusText.Text = "Disconnected"
	statusText.TextColor3 = Color3.fromRGB(240, 240, 240)
	statusText.Font = Enum.Font.GothamMedium
	statusText.TextSize = 14
	statusText.TextXAlignment = Enum.TextXAlignment.Left
	statusText.Parent = statusCard

	local bridgeInfo = Instance.new("TextLabel")
	bridgeInfo.Size = UDim2.new(1, -24, 0, 32)
	bridgeInfo.Position = UDim2.new(0, 12, 0, 34)
	bridgeInfo.BackgroundTransparency = 1
	bridgeInfo.Text = "Target: " .. Config.GetBaseUrl() .. "\nSession: " .. Session.GetSessionId()
	bridgeInfo.TextColor3 = Color3.fromRGB(160, 160, 170)
	bridgeInfo.Font = Enum.Font.Code
	bridgeInfo.TextSize = 10
	bridgeInfo.TextXAlignment = Enum.TextXAlignment.Left
	bridgeInfo.Parent = statusCard

	-- Buttons Frame
	local buttonFrame = Instance.new("Frame")
	buttonFrame.Size = UDim2.new(1, 0, 0, 32)
	buttonFrame.BackgroundTransparency = 1
	buttonFrame.LayoutOrder = 3
	buttonFrame.Parent = mainFrame

	local btnLayout = Instance.new("UIListLayout")
	btnLayout.FillDirection = Enum.FillDirection.Horizontal
	btnLayout.HorizontalAlignment = Enum.HorizontalAlignment.Left
	btnLayout.Padding = UDim.new(0, 8)
	btnLayout.Parent = buttonFrame

	local reconnectBtn = Instance.new("TextButton")
	reconnectBtn.Size = UDim2.new(0, 100, 1, 0)
	reconnectBtn.BackgroundColor3 = Color3.fromRGB(0, 162, 255)
	reconnectBtn.Text = "Reconnect"
	reconnectBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
	reconnectBtn.Font = Enum.Font.GothamMedium
	reconnectBtn.TextSize = 12
	reconnectBtn.Parent = buttonFrame

	local btnCorner = Instance.new("UICorner")
	btnCorner.CornerRadius = UDim.new(0, 4)
	btnCorner.Parent = reconnectBtn

	reconnectBtn.MouseButton1Click:Connect(function()
		statusText.Text = "Connecting..."
		statusIndicator.BackgroundColor3 = Color3.fromRGB(242, 201, 76)
		task.spawn(function()
			HttpClient.Handshake()
		end)
	end)

	-- Log Viewer Header
	local logHeader = Instance.new("TextLabel")
	logHeader.Size = UDim2.new(1, 0, 0, 18)
	logHeader.BackgroundTransparency = 1
	logHeader.Text = "Live Activity & Command Stream"
	logHeader.TextColor3 = Color3.fromRGB(180, 180, 190)
	logHeader.Font = Enum.Font.GothamMedium
	logHeader.TextSize = 12
	logHeader.TextXAlignment = Enum.TextXAlignment.Left
	logHeader.LayoutOrder = 4
	logHeader.Parent = mainFrame

	-- Scrolling Log Box
	local scrollLogs = Instance.new("ScrollingFrame")
	scrollLogs.Size = UDim2.new(1, 0, 1, -170)
	scrollLogs.BackgroundColor3 = Color3.fromRGB(24, 24, 27)
	scrollLogs.BorderSizePixel = 0
	scrollLogs.CanvasSize = UDim2.new(0, 0, 0, 0)
	scrollLogs.AutomaticCanvasSize = Enum.AutomaticSize.Y
	scrollLogs.ScrollBarThickness = 6
	scrollLogs.LayoutOrder = 5
	scrollLogs.Parent = mainFrame

	local scrollCorner = Instance.new("UICorner")
	scrollCorner.CornerRadius = UDim.new(0, 4)
	scrollCorner.Parent = scrollLogs

	local logListLayout = Instance.new("UIListLayout")
	logListLayout.SortOrder = Enum.SortOrder.LayoutOrder
	logListLayout.Padding = UDim.new(0, 4)
	logListLayout.Parent = scrollLogs

	local logPadding = Instance.new("UIPadding")
	logPadding.PaddingTop = UDim.new(0, 6)
	logPadding.PaddingBottom = UDim.new(0, 6)
	logPadding.PaddingLeft = UDim.new(0, 6)
	logPadding.PaddingRight = UDim.new(0, 6)
	logPadding.Parent = scrollLogs

	local function addLogEntry(text: string, isError: boolean?)
		local entry = Instance.new("TextLabel")
		entry.Size = UDim2.new(1, -10, 0, 0)
		entry.AutomaticSize = Enum.AutomaticSize.Y
		entry.BackgroundTransparency = 1
		entry.Text = string.format("[%s] %s", os.date("%X"), text)
		entry.TextColor3 = isError and Color3.fromRGB(255, 100, 100) or Color3.fromRGB(200, 200, 210)
		entry.Font = Enum.Font.Code
		entry.TextSize = 11
		entry.TextWrapped = true
		entry.TextXAlignment = Enum.TextXAlignment.Left
		entry.Parent = scrollLogs
	end

	-- Connect status callbacks
	HttpClient.OnStatusChanged(function(connected, message)
		if connected then
			statusIndicator.BackgroundColor3 = Color3.fromRGB(39, 174, 96)
			statusText.Text = "● Connected to AI Runtime"
			addLogEntry("Connected to MCP Bridge at " .. Config.GetBaseUrl())
		else
			statusIndicator.BackgroundColor3 = Color3.fromRGB(235, 87, 87)
			statusText.Text = "○ Disconnected"
			if message then
				addLogEntry(message, true)
			end
		end
	end)

	return container
end

return DockWidget
