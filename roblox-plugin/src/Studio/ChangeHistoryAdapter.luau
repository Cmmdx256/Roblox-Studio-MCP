--!strict
-- ChangeHistory Adapter for native Studio Undo/Redo recording

local Errors = require(script.Parent.Parent.Core.Errors)

local ChangeHistoryAdapter = {}

local activeRecordings = {}

local function getService(): ChangeHistoryService?
	local success, s = pcall(function()
		return game:GetService("ChangeHistoryService")
	end)
	return success and s or nil
end

function ChangeHistoryAdapter.BeginRecording(name: string): any
	local s = getService()
	if not s then return nil end

	local recordingId = nil
	local success = pcall(function()
		recordingId = (s :: any):TryBeginRecording(name or "MCP Operation")
	end)

	if success and recordingId then
		table.insert(activeRecordings, recordingId)
		return recordingId
	else
		-- Fallback to waypoint
		pcall(function()
			s:SetWaypoint(name or "MCP Operation")
		end)
		return nil
	end
end

function ChangeHistoryAdapter.FinishRecording(recordingId: any, commit: boolean?)
	local s = getService()
	if not s then return end

	if recordingId then
		local op = commit ~= false and Enum.FinishRecordingOperation.Commit or Enum.FinishRecordingOperation.Cancel
		pcall(function()
			(s :: any):FinishRecording(recordingId, op)
		end)
	else
		if commit ~= false then
			pcall(function()
				s:SetWaypoint("MCP Operation Complete")
			end)
		end
	end
end

return ChangeHistoryAdapter
