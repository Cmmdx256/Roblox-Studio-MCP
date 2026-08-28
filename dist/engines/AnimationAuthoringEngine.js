import { commandDispatcher } from '../dispatcher/commandDispatcher.js';
export class AnimationAuthoringEngine {
    /**
     * Calibrates and sets the Grip CFrame and GripAttachment for a Tool.
     */
    async calibrateToolGrip(spec) {
        const start = Date.now();
        let gripCFrameStr = 'CFrame.new(0, 0, 0)';
        switch (spec.gripPreset) {
            case 'Sword_Upright':
                // Standard upright sword grip (pointed straight up out of fist)
                gripCFrameStr = 'CFrame.new(0, 0, -1.5) * CFrame.Angles(math.rad(-90), 0, 0)';
                break;
            case 'Gun_Aim_Forward':
                // Gun aimed straight forward
                gripCFrameStr = 'CFrame.new(0, 0.2, 0.5) * CFrame.Angles(0, math.rad(180), 0)';
                break;
            case 'Shield_Forearm':
                // Shield mounted on forearm
                gripCFrameStr = 'CFrame.new(0, 0, -0.8) * CFrame.Angles(0, math.rad(90), math.rad(90))';
                break;
            case 'Lantern_Carry':
                // Lantern hanging down
                gripCFrameStr = 'CFrame.new(0, 1.2, 0) * CFrame.Angles(0, 0, 0)';
                break;
            case 'Staff_TwoHanded':
                // Long staff
                gripCFrameStr = 'CFrame.new(0, -1, 0) * CFrame.Angles(math.rad(-90), 0, 0)';
                break;
            case 'Custom':
            default:
                const off = spec.offset || [0, 0, 0];
                const ang = spec.anglesDeg || [0, 0, 0];
                gripCFrameStr = `CFrame.new(${off[0]}, ${off[1]}, ${off[2]}) * CFrame.Angles(math.rad(${ang[0]}), math.rad(${ang[1]}), math.rad(${ang[2]}))`;
                break;
        }
        const luauCode = `
local ChangeHistoryService = game:GetService("ChangeHistoryService")
local recording = ChangeHistoryService:TryBeginRecording("CalibrateToolGrip")

local tool = ${spec.toolPath}
if not tool or not tool:IsA("Tool") then
    error("Target instance is not a Tool: " .. tostring(${spec.toolPath}))
end

local handle = tool:FindFirstChild("Handle")
if not handle then
    error("Tool does not contain a Handle part")
end

local gripCF = ${gripCFrameStr}
tool.Grip = gripCF

-- Also ensure RightGripAttachment exists on handle for modern avatar consistency
local gripAtt = handle:FindFirstChild("RightGripAttachment")
if not gripAtt then
    gripAtt = Instance.new("Attachment")
    gripAtt.Name = "RightGripAttachment"
    gripAtt.Parent = handle
end
gripAtt.CFrame = gripCF:Inverse()

if recording then
    ChangeHistoryService:FinishRecording(recording, Enum.FinishRecordingOperation.Commit)
end

return {
    success = true,
    toolName = tool.Name,
    appliedGrip = tostring(tool.Grip),
    gripPreset = "${spec.gripPreset}"
}
`;
        try {
            const res = await commandDispatcher.executeCommand('execute_luau', {
                code: luauCode,
                datamodel_type: 'Edit'
            });
            return {
                status: 'SUCCESS',
                verified: false,
                provider: 'animation-authoring-engine',
                tool: 'tool_grip_calibrate',
                data: res,
                duration: Date.now() - start
            };
        }
        catch (err) {
            return {
                status: 'ERROR',
                message: `Failed to calibrate tool grip: ${err.message || String(err)}`,
                duration: Date.now() - start
            };
        }
    }
    /**
     * Safely poses an R15/R6 rig without throwing read-only Motor6D errors.
     */
    async poseRig(spec) {
        const start = Date.now();
        const posesJson = JSON.stringify(spec.poses);
        const luauCode = `
local HttpService = game:GetService("HttpService")
local ChangeHistoryService = game:GetService("ChangeHistoryService")
local recording = ChangeHistoryService:TryBeginRecording("PoseRig")

local rig = ${spec.targetRigPath}
if not rig or not rig:IsA("Model") then
    error("Target instance is not a Model rig: " .. tostring(${spec.targetRigPath}))
end

local poses = HttpService:JSONDecode('${posesJson}')
local modifiedJoints = {}

-- Safe joint lookup helper for R15 / R6
local function findMotor(jointName)
    -- Search in UpperTorso (R15 shoulders/waist), LowerTorso, HumanoidRootPart, or rig descendants
    for _, desc in ipairs(rig:GetDescendants()) do
        if desc:IsA("Motor6D") and desc.Name == jointName then
            return desc
        end
    end
    return nil
end

for jointName, rot in pairs(poses) do
    local motor = findMotor(jointName)
    if motor and motor:IsA("Motor6D") then
        local x = math.rad(rot.cframeAnglesDeg and rot.cframeAnglesDeg[1] or (rot.x or 0))
        local y = math.rad(rot.cframeAnglesDeg and rot.cframeAnglesDeg[2] or (rot.y or 0))
        local z = math.rad(rot.cframeAnglesDeg and rot.cframeAnglesDeg[3] or (rot.z or 0))
        
        -- Safe transformation on Motor6D
        motor.C0 = motor.C0 * CFrame.Angles(x, y, z)
        table.insert(modifiedJoints, jointName)
    end
end

if recording then
    ChangeHistoryService:FinishRecording(recording, Enum.FinishRecordingOperation.Commit)
end

return {
    success = true,
    rigName = rig.Name,
    modifiedJoints = modifiedJoints
}
`;
        try {
            const res = await commandDispatcher.executeCommand('execute_luau', {
                code: luauCode,
                datamodel_type: 'Edit'
            });
            return {
                status: 'SUCCESS',
                verified: false,
                provider: 'animation-authoring-engine',
                tool: 'rig_pose_and_animate',
                data: res,
                duration: Date.now() - start
            };
        }
        catch (err) {
            return {
                status: 'ERROR',
                message: `Failed to pose rig: ${err.message || String(err)}`,
                duration: Date.now() - start
            };
        }
    }
    /**
     * Synthesizes a KeyframeSequence asset in Studio.
     */
    async createKeyframeSequence(spec) {
        const start = Date.now();
        const parent = spec.parentPath || 'game:GetService("ServerStorage")';
        const kfJson = JSON.stringify(spec.keyframes);
        const luauCode = `
local HttpService = game:GetService("HttpService")
local ChangeHistoryService = game:GetService("ChangeHistoryService")
local recording = ChangeHistoryService:TryBeginRecording("CreateKeyframeSequence")

local parent = ${parent}
local kfs = Instance.new("KeyframeSequence")
kfs.Name = "${spec.name}"
kfs.Loop = ${spec.loop}
kfs.Priority = Enum.AnimationPriority.${spec.priority}

local keyframesData = HttpService:JSONDecode('${kfJson}')

for _, kfData in ipairs(keyframesData) do
    local kf = Instance.new("Keyframe")
    kf.Time = kfData.time
    
    local rootPose = Instance.new("Pose")
    rootPose.Name = "HumanoidRootPart"
    rootPose.Weight = 1
    rootPose.Parent = kf
    
    for jointName, angles in pairs(kfData.poses) do
        local pose = Instance.new("Pose")
        pose.Name = jointName
        pose.Weight = 1
        pose.CFrame = CFrame.Angles(math.rad(angles[1]), math.rad(angles[2]), math.rad(angles[3]))
        pose.EasingStyle = Enum.PoseEasingStyle.Quad
        pose.EasingDirection = Enum.PoseEasingDirection.Out
        pose.Parent = rootPose
    end
    
    kf.Parent = kfs
end

kfs.Parent = parent

if recording then
    ChangeHistoryService:FinishRecording(recording, Enum.FinishRecordingOperation.Commit)
end

return {
    success = true,
    sequenceName = kfs.Name,
    keyframeCount = #keyframesData,
    parent = tostring(kfs.Parent)
}
`;
        try {
            const res = await commandDispatcher.executeCommand('execute_luau', {
                code: luauCode,
                datamodel_type: 'Edit'
            });
            return {
                status: 'SUCCESS',
                verified: false,
                provider: 'animation-authoring-engine',
                tool: 'keyframe_sequence_create',
                data: res,
                duration: Date.now() - start
            };
        }
        catch (err) {
            return {
                status: 'ERROR',
                message: `Failed to create KeyframeSequence: ${err.message || String(err)}`,
                duration: Date.now() - start
            };
        }
    }
}
export const animationAuthoringEngine = new AnimationAuthoringEngine();
//# sourceMappingURL=AnimationAuthoringEngine.js.map