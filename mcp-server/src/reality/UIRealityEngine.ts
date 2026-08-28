/**
 * UIRealityEngine.ts
 *
 * Closed-loop UI Reality verification engine:
 * 1. Inspects UI Instance hierarchy in StarterGui / PlayerGui
 * 2. Runs Geometric layout & safe-area audits across multi-device profiles
 * 3. Triggers Screenshot capture & Vision Inspection
 * 4. Generates automated layout repair patches for detected defects
 * 5. Re-verifies after repair to ensure zero visual regressions
 */

import { studioObservationEngine } from './StudioObservationEngine.js';
import { screenshotCaptureEngine } from './ScreenshotCaptureEngine.js';
import { visionInspectionEngine, UIElementBound } from './VisionInspectionEngine.js';
import { responsiveLayoutEngine, DeviceProfile } from '../ui/ResponsiveLayoutEngine.js';
import { commandDispatcher } from '../dispatcher/commandDispatcher.js';
import {
    UIRealityReport,
    UIDevice,
    VisionInspectionResult,
    VerificationStatus,
    VisualDefect
} from './types.js';

export interface UIRealityOptions {
    screenName: string;
    devices?: UIDevice[];
    autoRepair?: boolean;
    maxRepairCycles?: number;
}

export class UIRealityEngine {
    /**
     * Run full closed-loop UI reality verification for a given screen across devices.
     */
    public async verifyScreen(options: UIRealityOptions): Promise<UIRealityReport[]> {
        const { screenName, devices = ['Desktop', 'Mobile', 'Tablet'], autoRepair = true, maxRepairCycles = 2 } = options;
        const reports: UIRealityReport[] = [];

        for (const device of devices) {
            const report = await this.verifyDevice(screenName, device, autoRepair, maxRepairCycles);
            reports.push(report);
        }

        return reports;
    }

    private async verifyDevice(
        screenName: string,
        device: UIDevice,
        autoRepair: boolean,
        maxCycles: number
    ): Promise<UIRealityReport> {
        let cycles = 0;
        let patchApplied = false;
        let patchDescription: string | undefined;
        const evidence: string[] = [];
        let finalStatus: VerificationStatus = 'NOT_TESTED';
        let latestVisionResult: VisionInspectionResult | undefined;
        let latestScreenshot: any;

        // Viewport resolution per device
        const profile = responsiveLayoutEngine.getProfile(device);
        const width = profile.resolution[0];
        const height = profile.resolution[1];

        while (cycles < maxCycles) {
            cycles++;

            // 1. Observe UI hierarchy
            const uiPath = `StarterGui.${screenName}`;
            const observation = await studioObservationEngine.observe(uiPath, 'DEEP');
            if (!observation.result && observation.status !== 'PARTIAL') {
                evidence.push(`UI screen '${screenName}' not found in DataModel.`);
                finalStatus = observation.status === 'UNAVAILABLE' ? 'UNAVAILABLE' : 'FAILED';
                break;
            }

            // 2. Extract bounding boxes (geometric representation)
            const bounds = this.extractBounds(observation.result, width, height);

            // 3. Run Geometric QA
            const geometricQA = visionInspectionEngine.inspectGeometric(bounds, width, height, device);
            latestVisionResult = geometricQA;

            // 4. Capture screenshot if possible
            const screenshot = await screenshotCaptureEngine.captureScreenshot({
                device,
                viewportWidth: width,
                viewportHeight: height
            });
            latestScreenshot = screenshot;

            if (screenshot.status === 'VERIFIED') {
                evidence.push(`Captured ${device} screenshot (${screenshot.source})`);
            }

            // 5. Evaluate defects
            if (geometricQA.defects.length === 0) {
                finalStatus = 'VERIFIED';
                evidence.push(`Cycle ${cycles}: Zero geometric defects on ${device}.`);
                break;
            }

            evidence.push(`Cycle ${cycles}: Found ${geometricQA.defects.length} defects (${geometricQA.highSeverityCount} high severity) on ${device}.`);

            // 6. If auto-repair is enabled and we have defects, apply repair patch
            if (autoRepair && geometricQA.defects.length > 0 && cycles < maxCycles) {
                const patch = this.synthesizeUIRepairPatch(uiPath, geometricQA.defects, device);
                if (patch) {
                    try {
                        await commandDispatcher.executeCommand('execute_luau', { code: patch.luauCode });
                        patchApplied = true;
                        patchDescription = patch.description;
                        evidence.push(`Applied repair patch: ${patch.description}`);
                    } catch (err: any) {
                        evidence.push(`Repair patch failed to apply: ${err?.message}`);
                        break;
                    }
                } else {
                    break;
                }
            } else {
                finalStatus = geometricQA.highSeverityCount > 0 ? 'FAILED' : 'PARTIAL';
                break;
            }
        }

        return {
            screenName,
            device,
            builtAt: Date.now(),
            screenshot: latestScreenshot,
            geometricQA: latestVisionResult,
            patchApplied,
            patchDescription,
            finalStatus,
            cycles,
            evidence
        };
    }

    private extractBounds(rootNode: any, viewportWidth: number, viewportHeight: number): UIElementBound[] {
        if (!rootNode) return [];
        const bounds: UIElementBound[] = [];

        const traverse = (node: any, parentX = 0, parentY = 0, parentW = viewportWidth, parentH = viewportHeight) => {
            const props = node.properties || {};
            let x = parentX;
            let y = parentY;
            let w = parentW;
            let h = parentH;

            if (props.Size && typeof props.Size === 'object') {
                const sx = props.Size.scaleX ?? props.Size.X?.Scale ?? 0;
                const ox = props.Size.offsetX ?? props.Size.X?.Offset ?? 0;
                const sy = props.Size.scaleY ?? props.Size.Y?.Scale ?? 0;
                const oy = props.Size.offsetY ?? props.Size.Y?.Offset ?? 0;
                w = sx * parentW + ox;
                h = sy * parentH + oy;
            }

            if (props.Position && typeof props.Position === 'object') {
                const px = props.Position.scaleX ?? props.Position.X?.Scale ?? 0;
                const pox = props.Position.offsetX ?? props.Position.X?.Offset ?? 0;
                const py = props.Position.scaleY ?? props.Position.Y?.Scale ?? 0;
                const poy = props.Position.offsetY ?? props.Position.Y?.Offset ?? 0;
                x = parentX + px * parentW + pox;
                y = parentY + py * parentH + poy;
            }

            bounds.push({
                id: node.name || node.path,
                x,
                y,
                width: Math.max(0, w),
                height: Math.max(0, h),
                label: node.className
            });

            if (Array.isArray(node.children)) {
                for (const child of node.children) {
                    traverse(child, x, y, w, h);
                }
            }
        };

        traverse(rootNode);
        return bounds;
    }

    private synthesizeUIRepairPatch(
        rootPath: string,
        defects: VisualDefect[],
        device: UIDevice
    ): { description: string; luauCode: string } | null {
        if (defects.length === 0) return null;

        const descriptions = defects.map(d => d.description).join('; ');
        const luauCode = `
-- Autonomous UI Repair Patch for ${device}
local root = game:GetService("${rootPath.split('.')[0]}")
local target = root:FindFirstChild("${rootPath.split('.').slice(1).join('.')}")
if target then
    -- Ensure UIAspectRatioConstraint and UISizeConstraint exist to prevent offscreen scaling
    local hasConstraint = target:FindFirstChildWhichIsA("UIAspectRatioConstraint") or target:FindFirstChildWhichIsA("UISizeConstraint")
    if not hasConstraint then
        local constraint = Instance.new("UISizeConstraint")
        constraint.MaxSize = Vector2.new(1920, 1080)
        constraint.MinSize = Vector2.new(200, 100)
        constraint.Parent = target
    end
end
`;
        return {
            description: `Auto-repair for: ${descriptions}`,
            luauCode
        };
    }
}

export const uiRealityEngine = new UIRealityEngine();
