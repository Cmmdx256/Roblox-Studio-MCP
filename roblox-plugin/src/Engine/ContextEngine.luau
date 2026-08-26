--!strict
-- ContextEngine: Generates compact, adaptive, LLM-ready project summaries and architecture maps

local Selection = game:GetService("Selection")
local ScriptRegistry = require(script.Parent.ScriptRegistry)
local InstanceAdapter = require(script.Parent.Parent.Studio.InstanceAdapter)

local ContextEngine = {}

local KEY_SERVICES = {
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

function ContextEngine.BuildProjectContext(): { [string]: any }
	local services: { [string]: any } = {}
	local remotes = {}

	for _, sName in ipairs(KEY_SERVICES) do
		pcall(function()
			local s = game:GetService(sName)
			if s then
				local directChildren = {}
				for _, c in ipairs(s:GetChildren()) do
					table.insert(directChildren, { name = c.Name, className = c.ClassName })
				end

				services[sName] = {
					childCount = #s:GetChildren(),
					descendantCount = #s:GetDescendants(),
					children = directChildren,
				}

				for _, desc in ipairs(s:GetDescendants()) do
					if desc:IsA("RemoteEvent") or desc:IsA("RemoteFunction") or desc:IsA("BindableEvent") or desc:IsA("BindableFunction") then
						table.insert(remotes, {
							name = desc.Name,
							className = desc.ClassName,
							path = desc:GetFullName(),
						})
					end
				end
			end
		end)
	end

	local scripts = ScriptRegistry.Scan()
	local scriptList = {}
	for path, sInfo in pairs(scripts) do
		table.insert(scriptList, {
			name = sInfo.name,
			className = sInfo.className,
			path = path,
			lineCount = sInfo.lineCount,
			requires = sInfo.requires,
			remotesUsed = sInfo.remotesUsed,
		})
	end

	return {
		placeName = game.Name,
		placeId = game.PlaceId,
		services = services,
		remotesCount = #remotes,
		remotes = remotes,
		scriptsCount = #scriptList,
		scripts = scriptList,
	}
end

function ContextEngine.BuildScopeContext(scopePath: string): { [string]: any }
	local inst, err = InstanceAdapter.Resolve(scopePath)
	if not inst then
		return { success = false, error = err }
	end

	local children = {}
	for _, c in ipairs(inst:GetChildren()) do
		table.insert(children, {
			name = c.Name,
			className = c.ClassName,
			childrenCount = #c:GetChildren(),
		})
	end

	local attributes = {}
	pcall(function()
		for k, v in pairs(inst:GetAttributes()) do
			attributes[k] = tostring(v)
		end
	end)

	return {
		success = true,
		target = inst:GetFullName(),
		className = inst.ClassName,
		childrenCount = #inst:GetChildren(),
		descendantCount = #inst:GetDescendants(),
		children = children,
		attributes = attributes,
	}
end

function ContextEngine.BuildSelectionContext(): { [string]: any }
	local selected = Selection:Get()
	local items = {}

	for _, inst in ipairs(selected) do
		local inspectRes = InstanceAdapter.Inspect({ target = inst:GetFullName() })
		if inspectRes then
			table.insert(items, inspectRes)
		end
	end

	return {
		success = true,
		count = #items,
		selection = items,
	}
end

return ContextEngine
