--!strict
-- VerificationEngine: Precondition checks, Postcondition verification, and Safe Transaction Rollback

local Errors = require(script.Parent.Parent.Core.Errors)
local InstanceAdapter = require(script.Parent.Parent.Studio.InstanceAdapter)
local PropertyAdapter = require(script.Parent.Parent.Studio.PropertyAdapter)

local VerificationEngine = {}

export type PreconditionSpec = {
	target: string,
	expectedClassName: string?,
	expectedParent: string?,
	expectedProperties: { [string]: any }?,
	expectedAttributes: { [string]: any }?,
}

export type PostconditionSpec = {
	target: string,
	expectedProperties: { [string]: any }?,
	expectedAttributes: { [string]: any }?,
	expectedParent: string?,
	shouldExist: boolean?,
}

export type VerificationResult = {
	verified: boolean,
	status: "VERIFIED" | "PARTIALLY_VERIFIED" | "UNVERIFIABLE" | "FAILED",
	details: { [string]: any },
	mismatches: { string }?,
}

-- 1. Validate Preconditions before mutation
function VerificationEngine.CheckPreconditions(spec: PreconditionSpec): (boolean, Errors.ErrorObject?)
	local inst, err = InstanceAdapter.Resolve(spec.target)
	if not inst then
		return false, Errors.Create(
			Errors.PRECONDITION_FAILED,
			string.format("Precondition failed: Target '%s' could not be resolved.", spec.target),
			err
		)
	end

	if spec.expectedClassName and inst.ClassName ~= spec.expectedClassName and not inst:IsA(spec.expectedClassName) then
		return false, Errors.Create(
			Errors.PRECONDITION_FAILED,
			string.format("Precondition failed: Expected Class '%s', but target is '%s'.", spec.expectedClassName, inst.ClassName)
		)
	end

	if spec.expectedParent and inst.Parent then
		if inst.Parent:GetFullName() ~= spec.expectedParent and inst.Parent.Name ~= spec.expectedParent then
			return false, Errors.Create(
				Errors.PRECONDITION_FAILED,
				string.format("Precondition failed: Expected parent '%s', but actual parent is '%s'.", spec.expectedParent, inst.Parent:GetFullName())
			)
		end
	end

	if spec.expectedProperties then
		for propName, expectedVal in pairs(spec.expectedProperties) do
			local actualVal = (inst :: any)[propName]
			if actualVal ~= expectedVal then
				return false, Errors.Create(
					Errors.PRECONDITION_FAILED,
					string.format("Precondition failed: Property '%s' expected '%s', but found '%s'.", propName, tostring(expectedVal), tostring(actualVal))
				)
			end
		end
	end

	if spec.expectedAttributes then
		for attrName, expectedVal in pairs(spec.expectedAttributes) do
			local actualVal = inst:GetAttribute(attrName)
			if actualVal ~= expectedVal then
				return false, Errors.Create(
					Errors.PRECONDITION_FAILED,
					string.format("Precondition failed: Attribute '%s' expected '%s', but found '%s'.", attrName, tostring(expectedVal), tostring(actualVal))
				)
			end
		end
	end

	return true, nil
end

-- 2. Verify Postconditions after mutation
function VerificationEngine.VerifyPostconditions(spec: PostconditionSpec): VerificationResult
	local inst = InstanceAdapter.Resolve(spec.target)

	if spec.shouldExist == false then
		if inst == nil then
			return {
				verified = true,
				status = "VERIFIED",
				details = { message = "Instance successfully deleted and no longer exists." },
			}
		else
			return {
				verified = false,
				status = "FAILED",
				details = { message = "Instance was expected to be deleted, but still exists in DataModel." },
				mismatches = { "Instance still exists" },
			}
		end
	end

	if not inst then
		return {
			verified = false,
			status = "FAILED",
			details = { message = string.format("Target '%s' not found after execution.", spec.target) },
			mismatches = { "Target not found" },
		}
	end

	local mismatches = {}

	if spec.expectedParent and inst.Parent then
		if inst.Parent:GetFullName() ~= spec.expectedParent and inst.Parent.Name ~= spec.expectedParent then
			table.insert(mismatches, string.format("Parent mismatch: expected '%s', actual '%s'", spec.expectedParent, inst.Parent:GetFullName()))
		end
	end

	if spec.expectedProperties then
		for propName, expectedVal in pairs(spec.expectedProperties) do
			local actualVal = (inst :: any)[propName]
			-- Allow fuzzy comparison for numbers and strings
			if tostring(actualVal) ~= tostring(expectedVal) then
				table.insert(mismatches, string.format("Property '%s' mismatch: expected '%s', actual '%s'", propName, tostring(expectedVal), tostring(actualVal)))
			end
		end
	end

	if spec.expectedAttributes then
		for attrName, expectedVal in pairs(spec.expectedAttributes) do
			local actualVal = inst:GetAttribute(attrName)
			if tostring(actualVal) ~= tostring(expectedVal) then
				table.insert(mismatches, string.format("Attribute '%s' mismatch: expected '%s', actual '%s'", attrName, tostring(expectedVal), tostring(actualVal)))
			end
		end
	end

	if #mismatches == 0 then
		return {
			verified = true,
			status = "VERIFIED",
			details = { verifiedTarget = inst:GetFullName(), checkedAt = os.time() },
		}
	else
		return {
			verified = false,
			status = "FAILED",
			details = { target = inst:GetFullName(), mismatchCount = #mismatches },
			mismatches = mismatches,
		}
	end
end

return VerificationEngine
