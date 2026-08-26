--!strict
-- MessageBox and Toast Notification helper for Roblox Studio Universal MCP
local StarterGui = game:GetService("StarterGui")
local CoreGui = game:GetService("CoreGui")
local Config = require(script.Parent.Parent.Config)

local MessageBox = {}

function MessageBox.ShowNotification(title: string, message: string)
	-- 1. Native Studio Notification (Bottom-Right Toast)
	pcall(function()
		StarterGui:SetCore("SendNotification", {
			Title = title,
			Text = message,
			Duration = 8,
			Icon = "rbxasset://textures/ui/Settings/MenuBar/SettingsButton.png",
		})
	end)

	-- 2. Output Window Big ASCII Banner
	print([[

===================================================================
⚡ ROBLOX STUDIO UNIVERSAL MCP BRIDGE AKTİF EDİLDİ!
-------------------------------------------------------------------
🌐 Adres: ]] .. Config.GetBaseUrl() .. [[

🎯 Oturum: Hazır (Claude / Cursor / AI Agent dinleniyor)
🛡️ Güvenlik: Localhost (127.0.0.1)
===================================================================
]])
end

function MessageBox.ShowPopupModal(pluginObj: any, baseUrl: string, onOpenPanel: () -> ())
	-- If running with native Plugin object
	if pluginObj and typeof(pluginObj.CreateDockWidgetPluginGui) == "function" then
		local success, modal = pcall(function()
			local widgetInfo = DockWidgetPluginGuiInfo.new(
				Enum.InitialDockState.Float,
				true,  -- Enabled
				true,  -- Override previous state
				380,   -- Width
				200,   -- Height
				320,   -- Min width
				180    -- Min height
			)
			return pluginObj:CreateDockWidgetPluginGui("UniversalMCP_ConnectedModal_" .. tostring(os.time()), widgetInfo)
		end)

		if success and modal then
			modal.Title = "⚡ Universal MCP Aktif"

			local main = Instance.new("Frame")
			main.Size = UDim2.new(1, 0, 1, 0)
			main.BackgroundColor3 = Color3.fromRGB(24, 25, 29)
			main.BorderSizePixel = 0
			main.Parent = modal

			local padding = Instance.new("UIPadding")
			padding.PaddingTop = UDim.new(0, 16)
			padding.PaddingBottom = UDim.new(0, 16)
			padding.PaddingLeft = UDim.new(0, 16)
			padding.PaddingRight = UDim.new(0, 16)
			padding.Parent = main

			local layout = Instance.new("UIListLayout")
			layout.SortOrder = Enum.SortOrder.LayoutOrder
			layout.Padding = UDim.new(0, 10)
			layout.Parent = main

			local titleLabel = Instance.new("TextLabel")
			titleLabel.Size = UDim2.new(1, 0, 0, 24)
			titleLabel.BackgroundTransparency = 1
			titleLabel.Text = "⚡ Universal MCP Köprüsü Aktif Edildi!"
			titleLabel.TextColor3 = Color3.fromRGB(46, 204, 113)
			titleLabel.Font = Enum.Font.GothamBold
			titleLabel.TextSize = 16
			titleLabel.TextXAlignment = Enum.TextXAlignment.Left
			titleLabel.LayoutOrder = 1
			titleLabel.Parent = main

			local infoLabel = Instance.new("TextLabel")
			infoLabel.Size = UDim2.new(1, 0, 0, 48)
			infoLabel.BackgroundTransparency = 1
			infoLabel.Text = string.format("MCP Köprüsü %s üzerinde bağlandı.\nAI Agent (Claude / Cursor) projenizi yönetmeye hazır.", baseUrl)
			infoLabel.TextColor3 = Color3.fromRGB(220, 220, 230)
			infoLabel.Font = Enum.Font.Gotham
			infoLabel.TextSize = 13
			infoLabel.TextWrapped = true
			infoLabel.TextXAlignment = Enum.TextXAlignment.Left
			infoLabel.LayoutOrder = 2
			infoLabel.Parent = main

			local btnRow = Instance.new("Frame")
			btnRow.Size = UDim2.new(1, 0, 0, 36)
			btnRow.BackgroundTransparency = 1
			btnRow.LayoutOrder = 3
			btnRow.Parent = main

			local btnLayout = Instance.new("UIListLayout")
			btnLayout.FillDirection = Enum.FillDirection.Horizontal
			btnLayout.HorizontalAlignment = Enum.HorizontalAlignment.Right
			btnLayout.Padding = UDim.new(0, 10)
			btnLayout.Parent = btnRow

			local openBtn = Instance.new("TextButton")
			openBtn.Size = UDim2.new(0, 130, 1, 0)
			openBtn.BackgroundColor3 = Color3.fromRGB(0, 162, 255)
			openBtn.Text = "Paneli Aç"
			openBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
			openBtn.Font = Enum.Font.GothamMedium
			openBtn.TextSize = 13
			openBtn.Parent = btnRow

			local openCorner = Instance.new("UICorner")
			openCorner.CornerRadius = UDim.new(0, 6)
			openCorner.Parent = openBtn

			openBtn.MouseButton1Click:Connect(function()
				modal.Enabled = false
				if onOpenPanel then
					onOpenPanel()
				end
			end)

			local closeBtn = Instance.new("TextButton")
			closeBtn.Size = UDim2.new(0, 90, 1, 0)
			closeBtn.BackgroundColor3 = Color3.fromRGB(50, 52, 60)
			closeBtn.Text = "Tamam"
			closeBtn.TextColor3 = Color3.fromRGB(200, 200, 210)
			closeBtn.Font = Enum.Font.GothamMedium
			closeBtn.TextSize = 13
			closeBtn.Parent = btnRow

			local closeCorner = Instance.new("UICorner")
			closeCorner.CornerRadius = UDim.new(0, 6)
			closeCorner.Parent = closeBtn

			closeBtn.MouseButton1Click:Connect(function()
				modal.Enabled = false
			end)

			return modal
		end
	end

	-- Fallback ScreenGui Modal (for Command Bar / Live injection when plugin is nil)
	local screenGui = Instance.new("ScreenGui")
	screenGui.Name = "UniversalMCP_ModalGui"
	screenGui.ResetOnSpawn = false

	pcall(function()
		screenGui.Parent = CoreGui
	end)
	if not screenGui.Parent then
		pcall(function()
			screenGui.Parent = StarterGui
		end)
	end

	local modalFrame = Instance.new("Frame")
	modalFrame.Size = UDim2.new(0, 420, 0, 220)
	modalFrame.Position = UDim2.new(0.5, -210, 0.5, -110)
	modalFrame.BackgroundColor3 = Color3.fromRGB(24, 25, 29)
	modalFrame.BorderSizePixel = 0
	modalFrame.Parent = screenGui

	local frameCorner = Instance.new("UICorner")
	frameCorner.CornerRadius = UDim.new(0, 8)
	frameCorner.Parent = modalFrame

	local pad = Instance.new("UIPadding")
	pad.PaddingTop = UDim.new(0, 18)
	pad.PaddingBottom = UDim.new(0, 18)
	pad.PaddingLeft = UDim.new(0, 20)
	pad.PaddingRight = UDim.new(0, 20)
	pad.Parent = modalFrame

	local vLayout = Instance.new("UIListLayout")
	vLayout.SortOrder = Enum.SortOrder.LayoutOrder
	vLayout.Padding = UDim.new(0, 12)
	vLayout.Parent = modalFrame

	local tLabel = Instance.new("TextLabel")
	tLabel.Size = UDim2.new(1, 0, 0, 26)
	tLabel.BackgroundTransparency = 1
	tLabel.Text = "⚡ Universal MCP Köprüsü Aktif Edildi!"
	tLabel.TextColor3 = Color3.fromRGB(46, 204, 113)
	tLabel.Font = Enum.Font.GothamBold
	tLabel.TextSize = 17
	tLabel.TextXAlignment = Enum.TextXAlignment.Left
	tLabel.LayoutOrder = 1
	tLabel.Parent = modalFrame

	local iLabel = Instance.new("TextLabel")
	iLabel.Size = UDim2.new(1, 0, 0, 52)
	iLabel.BackgroundTransparency = 1
	iLabel.Text = string.format("MCP Köprüsü %s üzerinde aktif edildi!\nAI Agent (Claude / Cursor) projenizi yönetmeye hazır.", baseUrl)
	iLabel.TextColor3 = Color3.fromRGB(220, 220, 230)
	iLabel.Font = Enum.Font.Gotham
	iLabel.TextSize = 14
	iLabel.TextWrapped = true
	iLabel.TextXAlignment = Enum.TextXAlignment.Left
	iLabel.LayoutOrder = 2
	iLabel.Parent = modalFrame

	local bRow = Instance.new("Frame")
	bRow.Size = UDim2.new(1, 0, 0, 36)
	bRow.BackgroundTransparency = 1
	bRow.LayoutOrder = 3
	bRow.Parent = modalFrame

	local bLayout = Instance.new("UIListLayout")
	bLayout.FillDirection = Enum.FillDirection.Horizontal
	bLayout.HorizontalAlignment = Enum.HorizontalAlignment.Right
	bLayout.Padding = UDim.new(0, 10)
	bLayout.Parent = bRow

	local okBtn = Instance.new("TextButton")
	okBtn.Size = UDim2.new(0, 100, 1, 0)
	okBtn.BackgroundColor3 = Color3.fromRGB(0, 162, 255)
	okBtn.Text = "Tamam"
	okBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
	okBtn.Font = Enum.Font.GothamBold
	okBtn.TextSize = 14
	okBtn.Parent = bRow

	local okCorner = Instance.new("UICorner")
	okCorner.CornerRadius = UDim.new(0, 6)
	okCorner.Parent = okBtn

	okBtn.MouseButton1Click:Connect(function()
		screenGui:Destroy()
	end)

	return screenGui
end

return MessageBox
