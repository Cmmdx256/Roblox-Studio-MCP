export class CameraEngine {
    /**
     * Synthesizes client-side Luau Camera Controller for cinematic focus, NPC dialogues, and gameplay events.
     */
    generateCameraController(spec) {
        const offset = spec.offsetCFrame || [0, 4, -8];
        const fov = spec.fov || 65;
        const duration = spec.duration || 0.6;
        return `local TweenService = game:GetService("TweenService")
local RunService = game:GetService("RunService")
local camera = workspace.CurrentCamera
local player = game.Players.LocalPlayer

local CameraController = {}
local originalType = camera.CameraType
local originalFOV = camera.FieldOfView

function CameraController.FocusOnTarget(targetPart)
    if not targetPart then return end
    camera.CameraType = Enum.CameraType.Scriptable
    
    local targetCF = CFrame.new(targetPart.Position + Vector3.new(${offset[0]}, ${offset[1]}, ${offset[2]}), targetPart.Position)
    local tweenInfo = TweenInfo.new(${duration}, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
    
    TweenService:Create(camera, tweenInfo, {
        CFrame = targetCF,
        FieldOfView = ${fov}
    }):Play()
end

function CameraController.Shake(intensity, durationSec)
    intensity = intensity or ${spec.shakeIntensity || 0.5}
    durationSec = durationSec or 0.3
    local elapsed = 0
    local conn
    conn = RunService.RenderStepped:Connect(function(dt)
        elapsed = elapsed + dt
        if elapsed >= durationSec then
            conn:Disconnect()
            return
        end
        local shakeOffset = Vector3.new(
            (math.random() - 0.5) * intensity,
            (math.random() - 0.5) * intensity,
            0
        )
        camera.CFrame = camera.CFrame * CFrame.new(shakeOffset)
    end)
end

function CameraController.Reset()
    camera.CameraType = Enum.CameraType.Custom
    camera.FieldOfView = 70
end

return CameraController
`;
    }
}
export const cameraEngine = new CameraEngine();
//# sourceMappingURL=CameraEngine.js.map