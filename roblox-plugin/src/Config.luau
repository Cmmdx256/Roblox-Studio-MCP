--!strict
local Config = {
	Host = "http://127.0.0.1",
	Port = 38883,
	PollInterval = 0.15, -- Seconds between polls when idle
	ActivePollInterval = 0.02, -- Fast poll interval when commands are active
	HandshakeRetryInterval = 3.0,
	MaxBatchSize = 50,
	DebugMode = true,
	EventBatchInterval = 0.1, -- Window for debouncing/batching events
	MaxLogBuffer = 200,
}

function Config.GetBaseUrl(): string
	return string.format("%s:%d", Config.Host, Config.Port)
end

return Config
