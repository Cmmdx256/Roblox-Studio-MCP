export interface DeviceProfile {
    device: 'Desktop' | 'Mobile' | 'Tablet' | 'Console';
    resolution: [number, number];
    aspectRatio: number;
    safeAreaInsets: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
    defaultUIScale: number;
}
export declare const DEVICE_PROFILES: Record<string, DeviceProfile>;
export declare class ResponsiveLayoutEngine {
    /**
     * Synthesizes responsive constraints (UIAspectRatioConstraint, UIScale) to ensure cross-device consistency.
     */
    generateResponsiveConstraints(aspectRatio?: number, minScale?: number, maxScale?: number): any[];
    /**
     * Synthesizes client-side UI Animation controller (TweenService hover, click, and popup animations).
     */
    generateUIAnimationController(): string;
    getProfile(device: string): DeviceProfile;
}
export declare const responsiveLayoutEngine: ResponsiveLayoutEngine;
//# sourceMappingURL=ResponsiveLayoutEngine.d.ts.map