--!strict
-- ScriptRegistry: Live Script database and dependency Code Graph builder

local ScriptRegistry = {}

export type ScriptInfo = {
	name: string,
	className: string,
	path: string,
	lineCount: number,
	sizeBytes: number,
	requires: { string },
	remotesUsed: { string },
}

local function isScript(inst: Instance): boolean
	return inst:IsA("LuaSourceContainer") or inst:IsA("Script") or inst:IsA("LocalScript") or inst:IsA("ModuleScript")
end

local function extractDependencies(source: string): ({ string }, { string })
	local requires = {}
	local remotes = {}

	-- Find require calls
	for match in string.gmatch(source, "require%s*%(%s*([%w%._:]+)%s*%)") do
		table.insert(requires, match)
	end

	-- Find RemoteEvent/RemoteFunction usages
	for match in string.gmatch(source, "([%w_]+):FireServer") do
		table.insert(remotes, match)
	end
	for match in string.gmatch(source, "([%w_]+):FireClient") do
		table.insert(remotes, match)
	end
	for match in string.gmatch(source, "([%w_]+):FireAllClients") do
		table.insert(remotes, match)
	end
	for match in string.gmatch(source, "([%w_]+):InvokeServer") do
		table.insert(remotes, match)
	end

	return requires, remotes
end

function ScriptRegistry.Scan(scope: Instance?): { [string]: ScriptInfo }
	local root = scope or game
	local registry: { [string]: ScriptInfo } = {}

	for _, desc in ipairs(root:GetDescendants()) do
		if isScript(desc) then
			local source = ""
			pcall(function()
				source = (desc :: any).Source or ""
			end)

			local reqs, rems = extractDependencies(source)
			local lines = string.split(source, "\n")

			registry[desc:GetFullName()] = {
				name = desc.Name,
				className = desc.ClassName,
				path = desc:GetFullName(),
				lineCount = #lines,
				sizeBytes = #source,
				requires = reqs,
				remotesUsed = rems,
			}
		end
	end

	return registry
end

function ScriptRegistry.GetCodeGraph(): { [string]: any }
	local scripts = ScriptRegistry.Scan()
	local dependencyGraph: { [string]: { requires: { string }, dependedBy: { string } } } = {}

	for path, info in pairs(scripts) do
		dependencyGraph[path] = {
			requires = info.requires,
			dependedBy = {},
		}
	end

	-- Compute reverse dependencies (dependedBy)
	for path, info in pairs(scripts) do
		for _, reqTarget in ipairs(info.requires) do
			for otherPath, _ in pairs(scripts) do
				if string.find(otherPath, reqTarget) or string.find(reqTarget, scripts[otherPath].name) then
					if dependencyGraph[otherPath] then
						table.insert(dependencyGraph[otherPath].dependedBy, path)
					end
				end
			end
		end
	end

	return {
		totalScripts = 0,
		graph = dependencyGraph,
		scripts = scripts,
	}
end

return ScriptRegistry
