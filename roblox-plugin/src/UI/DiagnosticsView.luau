--!strict
-- DiagnosticsView: Embedded Studio DockWidget displaying live runtime metrics, capabilities, and workflow states

local Selection = game:GetService("Selection")
local HttpService = game:GetService("HttpService")
local State = require(script.Parent.Parent.Core.State)
local Config = require(script.Parent.Parent.Core.Config)
local Logger = require(script.Parent.Parent.Core.Logger)
local CapabilityRegistry = require(script.Parent.Parent.Discovery.CapabilityRegistry)
local ObservationEngine = require(script.Parent.Parent.Engine.ObservationEngine)
local ToolRegistry = require(script.Parent.Parent.Tools.ToolRegistry)

local DiagnosticsView = {}

function DiagnosticsView.Render(parent: Instance, onConnectRequest: () -> (), onRefreshRequest: () -> ()): Frame
	local frame = Instance.new("Frame")
	frame.Size = UDim2.new(1, 0, 1, 0)
	frame.BackgroundColor3 = Color3.fromRGB(24, 25, 29)
	frame.BorderSizePixel = 0
	frame.Parent = parent

	local padding = Instance.new("UIPadding")
	padding.PaddingTop = UDim.new(0, 10)
	padding.PaddingBottom = UDim.new(0, 10)
	padding.PaddingLeft = UDim.new(0, 12)
	padding.PaddingRight = UDim.new(0, 12)
	padding.Parent = frame

	local layout = Instance.new("UIListLayout")
	layout.SortOrder = Enum.SortOrder.LayoutOrder
	layout.Padding = UDim.new(0, 8)
	layout.Parent = frame

	-- Header
	local header = Instance.new("TextLabel")
	header.Size = UDim2.new(1, 0, 0, 22)
	header.BackgroundTransparency = 1
	header.Text = "⚡ UNIVERSAL ROBLOX MCP RUNTIME"
	header.TextColor3 = Color3.fromRGB(245, 245, 245)
	header.Font = Enum.Font.GothamBold
	header.TextSize = 13
	header.TextXAlignment = Enum.TextXAlignment.Left
	header.LayoutOrder = 1
	header.Parent = frame

	-- Metrics Card
	local metricsCard = Instance.new("Frame")
	metricsCard.Size = UDim2.new(1, 0, 0, 195)
	metricsCard.BackgroundColor3 = Color3.fromRGB(33, 35, 41)
	metricsCard.BorderSizePixel = 0
	metricsCard.LayoutOrder = 2
	metricsCard.Parent = frame

	local mCorner = Instance.new("UICorner")
	mCorner.CornerRadius = UDim.new(0, 6)
	mCorner.Parent = metricsCard

	local mPad = Instance.new("UIPadding")
	mPad.PaddingTop = UDim.new(0, 8)
	mPad.PaddingBottom = UDim.new(0, 8)
	mPad.PaddingLeft = UDim.new(0, 10)
	mPad.PaddingRight = UDim.new(0, 10)
	mPad.Parent = metricsCard

	local mLayout = Instance.new("UIListLayout")
	mLayout.SortOrder = Enum.SortOrder.LayoutOrder
	mLayout.Padding = UDim.new(0, 3)
	mLayout.Parent = metricsCard

	local statusLabels: { [string]: TextLabel } = {}

	local function addRow(title: string, defaultVal: string, order: number, color: Color3?)
		local row = Instance.new("Frame")
		row.Size = UDim2.new(1, 0, 0, 16)
		row.BackgroundTransparency = 1
		row.LayoutOrder = order
		row.Parent = metricsCard

		local nameLbl = Instance.new("TextLabel")
		nameLbl.Size = UDim2.new(0, 150, 1, 0)
		nameLbl.BackgroundTransparency = 1
		nameLbl.Text = title .. ":"
		nameLbl.TextColor3 = Color3.fromRGB(160, 165, 175)
		nameLbl.Font = Enum.Font.GothamMedium
		nameLbl.TextSize = 11
		nameLbl.TextXAlignment = Enum.TextXAlignment.Left
		nameLbl.Parent = row

		local valLbl = Instance.new("TextLabel")
		valLbl.Size = UDim2.new(1, -155, 1, 0)
		valLbl.Position = UDim2.new(0, 155, 0, 0)
		valLbl.BackgroundTransparency = 1
		valLbl.Text = defaultVal
		valLbl.TextColor3 = color or Color3.fromRGB(46, 204, 113)
		valLbl.Font = Enum.Font.Code
		valLbl.TextSize = 11
		valLbl.TextXAlignment = Enum.TextXAlignment.Left
		valLbl.Parent = row

		statusLabels[title] = valLbl
	end

	addRow("Plugin Runtime", "ONLINE", 1)
	addRow("Place Info", State.PlaceInfo.PlaceName or "Local Place", 2, Color3.fromRGB(52, 152, 219))
	addRow("Capabilities Discovered", "Discovering...", 3)
	addRow("Low-Level Tools", "Discovering...", 4)
	addRow("High-Level Workflows", "Discovering...", 5)
	addRow("Total Universal Tools", "Discovering...", 6)
	addRow("Active Mode", "CHAT", 7, Color3.fromRGB(155, 89, 182))
	addRow("Observation Engine", "ACTIVE (Streaming)", 8)
	addRow("Verification Engine", "ACTIVE (Pre/Post)", 9)
	addRow("MCP Bridge", State.GetSubsystem("MCP"), 10)

	-- Selection Preview Card
	local selCard = Instance.new("Frame")
	selCard.Size = UDim2.new(1, 0, 0, 24)
	selCard.BackgroundColor3 = Color3.fromRGB(30, 32, 38)
	selCard.BorderSizePixel = 0
	selCard.LayoutOrder = 3
	selCard.Parent = frame

	local selCorner = Instance.new("UICorner")
	selCorner.CornerRadius = UDim.new(0, 4)
	selCorner.Parent = selCard

	local selText = Instance.new("TextLabel")
	selText.Size = UDim2.new(1, -12, 1, 0)
	selText.Position = UDim2.new(0, 8, 0, 0)
	selText.BackgroundTransparency = 1
	selText.Text = "Selection: None"
	selText.TextColor3 = Color3.fromRGB(200, 200, 210)
	selText.Font = Enum.Font.Code
	selText.TextSize = 11
	selText.TextXAlignment = Enum.TextXAlignment.Left
	selText.TextTruncate = Enum.TextTruncate.AtEnd
	selText.Parent = selCard

	-- Buttons Row
	local btnRow = Instance.new("Frame")
	btnRow.Size = UDim2.new(1, 0, 0, 28)
	btnRow.BackgroundTransparency = 1
	btnRow.LayoutOrder = 4
	btnRow.Parent = frame

	local btnLayout = Instance.new("UIListLayout")
	btnLayout.FillDirection = Enum.FillDirection.Horizontal
	btnLayout.Padding = UDim.new(0, 6)
	btnLayout.Parent = btnRow

	local function makeBtn(text: string, bgColor: Color3, onClick: () -> ())
		local b = Instance.new("TextButton")
		b.Size = UDim2.new(0, 80, 1, 0)
		b.BackgroundColor3 = bgColor
		b.Text = text
		b.TextColor3 = Color3.fromRGB(255, 255, 255)
		b.Font = Enum.Font.GothamMedium
		b.TextSize = 11
		b.Parent = btnRow

		local c = Instance.new("UICorner")
		c.CornerRadius = UDim.new(0, 4)
		c.Parent = b

		b.MouseButton1Click:Connect(onClick)
		return b
	end

	makeBtn("Connect", Color3.fromRGB(0, 162, 255), function()
		if onConnectRequest then onConnectRequest() end
	end)

	makeBtn("Refresh", Color3.fromRGB(55, 58, 68), function()
		if onRefreshRequest then onRefreshRequest() end
	end)

	makeBtn("Print Diag", Color3.fromRGB(55, 58, 68), function()
		Logger.PrintStartupDiagnostic(State.Subsystems)
	end)

	-- Live Activity Stream
	local scrollLogs = Instance.new("ScrollingFrame")
	scrollLogs.Size = UDim2.new(1, 0, 1, -295)
	scrollLogs.BackgroundColor3 = Color3.fromRGB(18, 19, 22)
	scrollLogs.BorderSizePixel = 0
	scrollLogs.CanvasSize = UDim2.new(0, 0, 0, 0)
	scrollLogs.AutomaticCanvasSize = Enum.AutomaticSize.Y
	scrollLogs.ScrollBarThickness = 5
	scrollLogs.LayoutOrder = 5
	scrollLogs.Parent = frame

	local sCorner = Instance.new("UICorner")
	sCorner.CornerRadius = UDim.new(0, 4)
	sCorner.Parent = scrollLogs

	local logList = Instance.new("UIListLayout")
	logList.SortOrder = Enum.SortOrder.LayoutOrder
	logList.Padding = UDim.new(0, 3)
	logList.Parent = scrollLogs

	local logPad = Instance.new("UIPadding")
	logPad.PaddingTop = UDim.new(0, 6)
	logPad.PaddingBottom = UDim.new(0, 6)
	logPad.PaddingLeft = UDim.new(0, 6)
	logPad.PaddingRight = UDim.new(0, 6)
	logPad.Parent = scrollLogs

	local function addLog(msg: string, msgType: string)
		local l = Instance.new("TextLabel")
		l.Size = UDim2.new(1, -6, 0, 0)
		l.AutomaticSize = Enum.AutomaticSize.Y
		l.BackgroundTransparency = 1
		l.Text = string.format("[%s] %s", os.date("%X"), msg)
		l.TextColor3 = msgType == "Error" and Color3.fromRGB(255, 100, 100) or (msgType == "Warning" and Color3.fromRGB(241, 196, 15) or Color3.fromRGB(200, 205, 215))
		l.Font = Enum.Font.Code
		l.TextSize = 11
		l.TextWrapped = true
		l.TextXAlignment = Enum.TextXAlignment.Left
		l.Parent = scrollLogs
	end

	Logger.OnLog(function(msg, msgType)
		addLog(msg, msgType)
	end)

	-- Dynamic Real-Time Update Loop
	task.spawn(function()
		local lastServerSync = 0
		local liveMetrics: { [string]: any }? = nil

		while frame.Parent do
			-- 1. Selection update
			local sel = Selection:Get()
			if #sel == 0 then
				selText.Text = "Selection: None"
			elseif #sel == 1 then
				selText.Text = "Selection: " .. sel[1]:GetFullName()
			else
				selText.Text = string.format("Selection: %d instances (%s...)", #sel, sel[1].Name)
			end

			-- 2. Local dynamic discovery calculations
			local localToolStats = ToolRegistry.GetStats()
			local localCaps = CapabilityRegistry.GetAll()
			local localCapCount = 0
			for _ in pairs(localCaps) do localCapCount += 1 end

			-- 3. Live Server Telemetry Sync (Every 2 seconds when MCP bridge is active)
			local mcpVal = State.GetSubsystem("MCP")
			local now = os.clock()
			if (mcpVal == "CONNECTED" or mcpVal == "ONLINE") and (now - lastServerSync >= 2) then
				lastServerSync = now
				task.spawn(function()
					local success, response = pcall(function()
						return HttpService:RequestAsync({
							Url = Config.GetBaseUrl() .. "/telemetry",
							Method = "GET",
							Headers = { ["Content-Type"] = "application/json" },
						})
					end)
					if success and response and response.StatusCode == 200 then
						local decodeOk, data = pcall(function()
							return HttpService:JSONDecode(response.Body)
						end)
						if decodeOk and data then
							liveMetrics = data.metrics or data
						end
					end
				end)
			end

			-- 4. Dynamic UI Label Updates (Never hardcoded)
			local capCount = (liveMetrics and liveMetrics.liveCapabilitiesCount and liveMetrics.liveCapabilitiesCount > 0) and liveMetrics.liveCapabilitiesCount or localCapCount
			local lowTools = (liveMetrics and liveMetrics.lowLevelToolsCount and liveMetrics.lowLevelToolsCount > 0) and liveMetrics.lowLevelToolsCount or localToolStats.lowLevel
			local highWorkflows = (liveMetrics and liveMetrics.highLevelWorkflowsCount and liveMetrics.highLevelWorkflowsCount > 0) and liveMetrics.highLevelWorkflowsCount or localToolStats.highLevel
			local totalTools = (liveMetrics and liveMetrics.totalUniversalTools and liveMetrics.totalUniversalTools > 0) and liveMetrics.totalUniversalTools or (lowTools + highWorkflows)
			local activeMode = (liveMetrics and liveMetrics.activeMode) or "CHAT"

			if statusLabels["Capabilities Discovered"] then
				statusLabels["Capabilities Discovered"].Text = string.format("%d Live Capabilities", capCount)
			end
			if statusLabels["Low-Level Tools"] then
				statusLabels["Low-Level Tools"].Text = string.format("%d Primitive Tools", lowTools)
			end
			if statusLabels["High-Level Workflows"] then
				statusLabels["High-Level Workflows"].Text = string.format("%d Composite Workflows", highWorkflows)
			end
			if statusLabels["Total Universal Tools"] then
				statusLabels["Total Universal Tools"].Text = string.format("%d Universal Tools", totalTools)
			end
			if statusLabels["Active Mode"] then
				statusLabels["Active Mode"].Text = string.format("%s Mode", activeMode)
			end
			if statusLabels["MCP Bridge"] then
				statusLabels["MCP Bridge"].Text = mcpVal
				statusLabels["MCP Bridge"].TextColor3 = (mcpVal == "CONNECTED" or mcpVal == "ONLINE") and Color3.fromRGB(46, 204, 113) or Color3.fromRGB(231, 76, 60)
			end
			if statusLabels["Place Info"] then
				statusLabels["Place Info"].Text = State.PlaceInfo.PlaceName or "Local Place"
			end
			if statusLabels["Plugin Runtime"] then
				statusLabels["Plugin Runtime"].Text = (mcpVal == "CONNECTED" or mcpVal == "ONLINE") and "ONLINE" or "STANDALONE"
			end

			task.wait(0.5)
		end
	end)

	return frame
end

return DiagnosticsView
