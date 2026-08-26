--!strict
local ChangeHistoryService = game:GetService("ChangeHistoryService")
local Logger = require(script.Parent.Parent.Utils.Logger)

local TransactionManager = {}

local activeRecordingId: any = nil

function TransactionManager.BeginTransaction(name: string): any
	local identifier = name or "MCP Operation"

	-- Try modern ChangeHistoryService:TryBeginRecording
	local recordingId: any = nil
	local success = pcall(function()
		recordingId = (ChangeHistoryService :: any):TryBeginRecording(identifier)
	end)

	if success and recordingId then
		activeRecordingId = recordingId
		return recordingId
	end

	-- Fallback waypoint
	pcall(function()
		ChangeHistoryService:SetWaypoint(identifier)
	end)

	return nil
end

function TransactionManager.CommitTransaction(name: string, recordingId: any)
	if recordingId or activeRecordingId then
		local targetId = recordingId or activeRecordingId
		activeRecordingId = nil
		pcall(function()
			(ChangeHistoryService :: any):FinishRecording(targetId, Enum.FinishRecordingOperation.Commit)
		end)
	else
		pcall(function()
			ChangeHistoryService:SetWaypoint(name or "MCP Operation Complete")
		end)
	end
end

function TransactionManager.CancelTransaction(recordingId: any)
	if recordingId or activeRecordingId then
		local targetId = recordingId or activeRecordingId
		activeRecordingId = nil
		pcall(function()
			(ChangeHistoryService :: any):FinishRecording(targetId, Enum.FinishRecordingOperation.Cancel)
		end)
	end
end

return TransactionManager
