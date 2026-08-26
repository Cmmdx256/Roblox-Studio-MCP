--!strict
local HttpService = game:GetService("HttpService")
local RunService = game:GetService("RunService")

local Session = {}

local sessionId = "studio_" .. HttpService:GenerateGUID(false):lower():sub(1, 16)
local connected = false

function Session.GetSessionId(): string
	return sessionId
end

function Session.IsConnected(): boolean
	return connected
end

function Session.SetConnected(status: boolean)
	connected = status
end

function Session.GetHandshakePayload(): { [string]: any }
	local mode = "Edit"
	if RunService:IsRunning() then
		mode = "Play"
	elseif RunService:IsRunMode() then
		mode = "Run"
	end

	return {
		sessionId = sessionId,
		placeId = game.PlaceId,
		placeName = game.Name,
		gameId = game.GameId,
		mode = mode,
		studioVersion = version(),
	}
end

return Session
