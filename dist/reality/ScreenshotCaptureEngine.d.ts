/**
 * ScreenshotCaptureEngine.ts
 *
 * Coordinates screenshot capture across multiple providers:
 * 1. Official Roblox Studio MCP (screen_capture tool)
 * 2. Embedded Plugin HTTP bridge screenshot buffer (if available)
 * 3. Graceful fallback with truth-reporting (status: 'UNAVAILABLE' / 'BLOCKED_BY_PLATFORM')
 */
import { ScreenshotCapture, UIDevice } from './types.js';
export interface CaptureOptions {
    device?: UIDevice;
    viewportWidth?: number;
    viewportHeight?: number;
    quality?: number;
    targetInstancePath?: string;
}
export declare class ScreenshotCaptureEngine {
    /**
     * Capture a screenshot of the current Studio viewport.
     * Tries Official MCP first, then Plugin Bridge, then records platform unavailability.
     */
    captureScreenshot(options?: CaptureOptions): Promise<ScreenshotCapture>;
}
export declare const screenshotCaptureEngine: ScreenshotCaptureEngine;
//# sourceMappingURL=ScreenshotCaptureEngine.d.ts.map