/**
 * ScreenshotCaptureEngine.ts
 *
 * Coordinates screenshot capture across multiple providers:
 * 1. Official Roblox Studio MCP (screen_capture tool)
 * 2. Embedded Plugin HTTP bridge screenshot buffer (if available)
 * 3. Graceful fallback with truth-reporting (status: 'UNAVAILABLE' / 'BLOCKED_BY_PLATFORM')
 */

import { v4 as uuidv4 } from 'uuid';
import { commandDispatcher } from '../dispatcher/commandDispatcher.js';
import { providerRegistry } from '../providers/ProviderRegistry.js';
import { ScreenshotCapture, VerificationStatus, UIDevice } from './types.js';
import { studioSessionManager } from '../session/StudioSessionManager.js';

export interface CaptureOptions {
    device?: UIDevice;
    viewportWidth?: number;
    viewportHeight?: number;
    quality?: number; // 0-100
    targetInstancePath?: string;
}

export class ScreenshotCaptureEngine {
    /**
     * Capture a screenshot of the current Studio viewport.
     * Tries Official MCP first, then Plugin Bridge, then records platform unavailability.
     */
    public async captureScreenshot(options: CaptureOptions = {}): Promise<ScreenshotCapture> {
        const captureId = `cap_${uuidv4().slice(0, 8)}`;
        const capturedAt = Date.now();
        const device = options.device || 'Desktop';
        const viewportWidth = options.viewportWidth || 1920;
        const viewportHeight = options.viewportHeight || 1080;

        // 1. Try Official Roblox MCP Provider if registered and available
        try {
            const officialProvider = providerRegistry.get('official-roblox-mcp');
            if (officialProvider) {
                const health = await officialProvider.healthCheck();
                if (health.state === 'READY') {
                    const result = await officialProvider.execute('screen_capture', {
                        quality: options.quality || 80,
                    });
                    if (result.status === 'SUCCESS' && result.data?.image) {
                        return {
                            captureId,
                            capturedAt,
                            source: 'OFFICIAL_MCP',
                            data: result.data.image,
                            status: 'VERIFIED',
                            viewportWidth,
                            viewportHeight,
                            device,
                        };
                    }
                }
            }
        } catch {
            // Fall through to Plugin Bridge
        }

        // The embedded plugin currently has no capture_screen router action.
        // Do not dispatch an unsupported command and then mistake a bridge
        // acknowledgement for visual evidence.  A future plugin implementation
        // must advertise this capability through the session manager first.
        const session = studioSessionManager.getSession();
        if (commandDispatcher.isStudioConnected() && session.capabilities.canCaptureScreenshot) {
            // No embedded implementation is registered yet; intentionally fall
            // through to the honest BLOCKED_BY_PLATFORM result below.
        }

        // 3. Truthful fallback: Studio or Screen Capture capability is unavailable
        return {
            captureId,
            capturedAt,
            source: 'UNAVAILABLE',
            status: 'BLOCKED_BY_PLATFORM',
            viewportWidth,
            viewportHeight,
            device,
        };
    }
}

export const screenshotCaptureEngine = new ScreenshotCaptureEngine();
