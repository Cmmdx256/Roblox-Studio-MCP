export const DEVICE_PROFILES = {
    Desktop: {
        device: 'Desktop',
        resolution: [1920, 1080],
        aspectRatio: 1.777,
        safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 },
        defaultUIScale: 1.0
    },
    Mobile: {
        device: 'Mobile',
        resolution: [667, 375],
        aspectRatio: 1.778,
        safeAreaInsets: { top: 20, bottom: 20, left: 44, right: 44 },
        defaultUIScale: 0.85
    },
    Tablet: {
        device: 'Tablet',
        resolution: [1024, 768],
        aspectRatio: 1.333,
        safeAreaInsets: { top: 10, bottom: 10, left: 10, right: 10 },
        defaultUIScale: 0.95
    },
    Console: {
        device: 'Console',
        resolution: [1920, 1080],
        aspectRatio: 1.777,
        safeAreaInsets: { top: 40, bottom: 40, left: 60, right: 60 },
        defaultUIScale: 1.1
    }
};
export class ResponsiveLayoutEngine {
    /**
     * Synthesizes responsive constraints (UIAspectRatioConstraint, UIScale) to ensure cross-device consistency.
     */
    generateResponsiveConstraints(aspectRatio = 1.6, minScale = 0.7, maxScale = 1.3) {
        return [
            {
                className: 'UIAspectRatioConstraint',
                name: 'AspectRatioConstraint',
                properties: {
                    AspectRatio: aspectRatio,
                    AspectType: 'FitWithinMaxSize',
                    DominantAxis: 'Width'
                }
            },
            {
                className: 'UISizeConstraint',
                name: 'SizeConstraint',
                properties: {
                    MinSize: { _type: 'Vector2', x: 280, y: 180 },
                    MaxSize: { _type: 'Vector2', x: 1200, y: 900 }
                }
            }
        ];
    }
    /**
     * Synthesizes client-side UI Animation controller (TweenService hover, click, and popup animations).
     */
    generateUIAnimationController() {
        return `local TweenService = game:GetService("TweenService")

local UIAnimationController = {}
local hoverTweenInfo = TweenInfo.new(0.12, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
local pressTweenInfo = TweenInfo.new(0.08, Enum.EasingStyle.Quad, Enum.EasingDirection.In)

function UIAnimationController.AttachButtonAnimations(button)
    local originalSize = button.Size
    
    button.MouseEnter:Connect(function()
        TweenService:Create(button, hoverTweenInfo, {
            Size = UDim2.new(originalSize.X.Scale, originalSize.X.Offset * 1.05, originalSize.Y.Scale, originalSize.Y.Offset * 1.05)
        }):Play()
    end)
    
    button.MouseLeave:Connect(function()
        TweenService:Create(button, hoverTweenInfo, { Size = originalSize }):Play()
    end)
    
    button.MouseButton1Down:Connect(function()
        TweenService:Create(button, pressTweenInfo, {
            Size = UDim2.new(originalSize.X.Scale, originalSize.X.Offset * 0.95, originalSize.Y.Scale, originalSize.Y.Offset * 0.95)
        }):Play()
    end)
    
    button.MouseButton1Up:Connect(function()
        TweenService:Create(button, hoverTweenInfo, { Size = originalSize }):Play()
    end)
end

return UIAnimationController
`;
    }
    getProfile(device) {
        return DEVICE_PROFILES[device] || DEVICE_PROFILES.Desktop;
    }
}
export const responsiveLayoutEngine = new ResponsiveLayoutEngine();
//# sourceMappingURL=ResponsiveLayoutEngine.js.map