--!strict
local ExecutionQueue = {}

type QueuedTask = {
	execute: () -> (),
}

local queue: { QueuedTask } = {}
local isProcessing = false

function ExecutionQueue.Enqueue(taskFn: () -> ())
	table.insert(queue, { execute = taskFn })
	if not isProcessing then
		task.spawn(ExecutionQueue.ProcessNext)
	end
end

function ExecutionQueue.ProcessNext()
	if isProcessing or #queue == 0 then return end
	isProcessing = true

	while #queue > 0 do
		local currentTask = table.remove(queue, 1)
		if currentTask then
			local success, err = pcall(currentTask.execute)
			if not success then
				warn("[ExecutionQueue] Error executing queued task:", err)
			end
		end
		task.wait()
	end

	isProcessing = false
end

return ExecutionQueue
