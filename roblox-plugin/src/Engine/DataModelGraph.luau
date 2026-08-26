--!strict
-- DataModelGraph: Live dynamic in-memory graph of the active Studio DataModel

local ObservationEngine = require(script.Parent.ObservationEngine)

local DataModelGraph = {}

export type NodeMetadata = {
	name: string,
	className: string,
	path: string,
	parentPath: string?,
	childrenCount: number,
	lastModified: number,
}

local graph: { [string]: NodeMetadata } = {}
local isInitialized = false

local MONITORED_SERVICES = {
	"Workspace",
	"ReplicatedStorage",
	"ServerScriptService",
	"ServerStorage",
	"StarterGui",
	"StarterPack",
	"StarterPlayer",
	"Lighting",
	"SoundService",
	"MaterialService",
	"Teams",
	"ReplicatedFirst",
}

function DataModelGraph.BuildGraph(scope: Instance?): { [string]: NodeMetadata }
	local root = scope or game
	graph = {}

	local function addNode(inst: Instance)
		local path = inst:GetFullName()
		graph[path] = {
			name = inst.Name,
			className = inst.ClassName,
			path = path,
			parentPath = inst.Parent and inst.Parent:GetFullName() or nil,
			childrenCount = #inst:GetChildren(),
			lastModified = os.time(),
		}
	end

	if root == game then
		for _, sName in ipairs(MONITORED_SERVICES) do
			pcall(function()
				local s = game:GetService(sName)
				if s then
					addNode(s)
					for _, desc in ipairs(s:GetDescendants()) do
						addNode(desc)
					end
				end
			end)
		end
	else
		addNode(root)
		for _, desc in ipairs(root:GetDescendants()) do
			addNode(desc)
		end
	end

	isInitialized = true
	return graph
end

function DataModelGraph.GetNode(path: string): NodeMetadata?
	if not isInitialized then
		DataModelGraph.BuildGraph()
	end
	return graph[path]
end

function DataModelGraph.GetStats(): { [string]: any }
	if not isInitialized then
		DataModelGraph.BuildGraph()
	end
	local count = 0
	local classCounts: { [string]: number } = {}
	for _, node in pairs(graph) do
		count += 1
		classCounts[node.className] = (classCounts[node.className] or 0) + 1
	end

	return {
		totalNodes = count,
		isLive = true,
		classDistribution = classCounts,
	}
end

return DataModelGraph
