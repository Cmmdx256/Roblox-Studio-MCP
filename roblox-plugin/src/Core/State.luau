--!strict
-- Core Lifecycle State & Diagnostic Status Registry

export type LifecycleState = "CREATED" | "INITIALIZING" | "READY" | "STOPPING" | "STOPPED"

local State = {
	Lifecycle = "CREATED" :: LifecycleState,
	Subsystems = {
		Plugin = "UNINITIALIZED",
		StudioAPI = "UNINITIALIZED",
		DataModel = "UNINITIALIZED",
		Selection = "UNINITIALIZED",
		ChangeHistory = "UNINITIALIZED",
		ScriptAPI = "UNINITIALIZED",
		HTTP = "UNINITIALIZED",
		MCP = "OFFLINE",
	},
	PlaceInfo = {
		PlaceId = 0,
		PlaceName = "Unknown",
		GameId = 0,
	},
	SessionId = "",
}

function State.SetLifecycle(newState: LifecycleState)
	State.Lifecycle = newState
end

function State.IsReady(): boolean
	return State.Lifecycle == "READY"
end

function State.SetSubsystem(name: string, status: string)
	(State.Subsystems :: any)[name] = status
end

function State.GetSubsystem(name: string): string
	return (State.Subsystems :: any)[name] or "UNKNOWN"
end

function State.GetDiagnostics(): { [string]: any }
	return {
		lifecycle = State.Lifecycle,
		subsystems = State.Subsystems,
		placeInfo = State.PlaceInfo,
		sessionId = State.SessionId,
	}
end

return State
