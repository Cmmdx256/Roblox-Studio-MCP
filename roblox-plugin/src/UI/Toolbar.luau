--!strict
-- UI Toolbar management

local Toolbar = {}

local activeToolbar: PluginToolbar? = nil
local activeButtons: { [string]: PluginToolbarButton } = {}

function Toolbar.Create(plugin: Plugin, onToggleWidget: () -> ()): (boolean, string?)
	if not plugin or typeof(plugin.CreateToolbar) ~= "function" then
		return false, "Invalid Plugin object passed to Toolbar"
	end

	local success, err = pcall(function()
		local toolbar = plugin:CreateToolbar("Universal MCP")
		activeToolbar = toolbar

		local button = toolbar:CreateButton(
			"MCP Status",
			"Open Universal MCP Diagnostics & Status",
			"rbxasset://textures/ui/Settings/MenuBar/SettingsButton.png"
		)
		button.ClickableWhenViewportHidden = true

		button.Click:Connect(function()
			if onToggleWidget then
				onToggleWidget()
			end
		end)

		activeButtons["Status"] = button
	end)

	if not success then
		return false, tostring(err)
	end

	return true, nil
end

function Toolbar.SetButtonActive(buttonName: string, active: boolean)
	local btn = activeButtons[buttonName]
	if btn then
		pcall(function()
			btn:SetActive(active)
		end)
	end
end

function Toolbar.Destroy()
	activeToolbar = nil
	activeButtons = {}
end

return Toolbar
