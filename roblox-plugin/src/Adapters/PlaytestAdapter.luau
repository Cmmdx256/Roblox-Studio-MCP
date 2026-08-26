--!strict
-- PlaytestAdapter: Safe Playtest Simulation & Runtime State Inspection
local RunService = game:GetService("RunService")
local Errors = require(script.Parent.Parent.Core.Errors)

local PlaytestAdapter = {}

function PlaytestAdapter.GetState(): (any, Errors.ErrorObject?)
	local isEdit = true
	local isRunMode = false
	local isRunning = false

	pcall(function()
		isEdit = RunService:IsEdit()
		isRunMode = RunService:IsRunMode()
		isRunning = RunService:IsRunning()
	end)

	local currentMode = "Edit"
	if isRunning then
		currentMode = "Play"
	elseif isRunMode then
		currentMode = "Run"
	end

	return {
		success = true,
		mode = currentMode,
		isEdit = isEdit,
		isRunMode = isRunMode,
		isRunning = isRunning,
	}, nil
end

function PlaytestAdapter.Control(params: { action: string }): (any, Errors.ErrorObject?)
	local action = string.lower(params.action or "")
	if action ~= "start" and action ~= "stop" and action ~= "pause" and action ~= "resume" then
		return nil, Errors.Create(Errors.INVALID_ARGUMENT, "Action must be 'start', 'stop', 'pause', or 'resume'.")
	end

	local success, err = pcall(function()
		if action == "start" or action == "resume" then
			if RunService:IsEdit() then
				RunService:Run()
			end
		elseif action == "stop" then
			if not RunService:IsEdit() then
				RunService:Stop()
			end
		elseif action == "pause" then
			RunService:Pause()
		end
	end)

	if not success then
		-- Graceful fallback if Studio security policy restricts script-initiated playtest
		local state, _ = PlaytestAdapter.GetState()
		return {
			success = false,
			action = action,
			warning = string.format("Studio Security Note: Direct programmatic simulation '%s' is restricted by Roblox Studio's current execution identity. Current mode: %s. Error: %s", action, state.mode, tostring(err)),
			currentState = state,
		}, nil
	end

	return PlaytestAdapter.GetState()
end

return PlaytestAdapter
