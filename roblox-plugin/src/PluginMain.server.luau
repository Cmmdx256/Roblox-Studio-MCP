--!strict
-- Roblox Studio Universal MCP Plugin - Main Entry Point

local hasPlugin = false
pcall(function()
	hasPlugin = (typeof(plugin) == "Instance" and plugin:IsA("Plugin")) or (typeof(plugin) == "userdata") or (typeof(plugin) == "table")
end)

if not hasPlugin or not plugin then
	warn("===================================================================")
	warn("⚠️ [Universal MCP] This script must be executed as a Roblox Studio Plugin.")
	warn("Please save this script or file into your Roblox Studio Plugins folder.")
	warn("===================================================================")
	return
end

local Bootstrap = require(script.Bootstrap)
Bootstrap.Init(plugin)
