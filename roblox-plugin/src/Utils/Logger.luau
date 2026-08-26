--!strict
local Config = require(script.Parent.Parent.Config)

local Logger = {}
local PREFIX = "[Roblox MCP Bridge]"

function Logger.Log(...)
	if Config.DebugMode then
		print(PREFIX, ...)
	end
end

function Logger.Warn(...)
	warn(PREFIX, ...)
end

function Logger.Error(...)
	warn(PREFIX, "ERROR:", ...)
end

return Logger
