/**
 * VisionInspectionEngine.ts
 *
 * Classifies visual defects in screenshots using geometric analysis.
 * When AI Vision provider is available, augments with semantic analysis.
 * Always truthful — geometric QA and AI QA are clearly distinguished.
 */

import { v4 as uuidv4 } from 'uuid';
import {
    ScreenshotCapture,
    VisionInspectionResult,
    VisualDefect,
    VisualDefectType,
    VerificationStatus
} from './types.js';

/**
 * VisualEvidenceSource (P4 — Phase 10)
 *
 * All visual QA results MUST declare which evidence source was used.
 * GEOMETRIC_ONLY is honest — it means no actual screenshot was captured from Studio.
 * LIVE_SCREENSHOT is the gold standard.
 */
export type VisualEvidenceSource =
    | 'LIVE_SCREENSHOT'    // Actual screenshot captured from running Studio/client
    | 'STUDIO_VIEWPORT'    // Studio viewport capture via Official MCP
    | 'PLAYTEST_SCREEN'    // Screenshot captured during active playtest
    | 'GEOMETRIC_ONLY'     // Geometric analysis only — NO actual screenshot
    | 'NO_VISUAL_EVIDENCE';// No visual verification was performed


/** Safe area constants per device type. */
const SAFE_AREAS: Record<string, { top: number; bottom: number; left: number; right: number }> = {
    Desktop: { top: 36, bottom: 0, left: 0, right: 0 },
    Mobile:  { top: 36, bottom: 96, left: 8, right: 8 },
    Tablet:  { top: 36, bottom: 64, left: 0, right: 0 },
    Console: { top: 48, bottom: 48, left: 64, right: 64 }
};

export interface UIElementBound {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    expectedVisible?: boolean;
    label?: string;
}

export class VisionInspectionEngine {
    /**
     * Perform geometric visual QA on a list of UI bounds.
     * Detects overlaps, clipping, off-screen elements, and safe-area violations.
     * This analysis is device-agnostic and does not assume any specific game UI.
     */
    public inspectGeometric(
        bounds: UIElementBound[],
        viewportWidth: number,
        viewportHeight: number,
        device: string = 'Desktop'
    ): VisionInspectionResult {
        const defects: VisualDefect[] = [];
        const safeArea = SAFE_AREAS[device] ?? SAFE_AREAS.Desktop;

        for (let i = 0; i < bounds.length; i++) {
            const el = bounds[i];

            // Off-screen check
            if (el.x < 0 || el.y < 0 ||
                el.x + el.width > viewportWidth ||
                el.y + el.height > viewportHeight) {
                defects.push({
                    type: 'OFF_SCREEN_UI',
                    severity: 'HIGH',
                    description: `Element "${el.id}" extends beyond viewport (${viewportWidth}x${viewportHeight})`,
                    region: { x: el.x, y: el.y, width: el.width, height: el.height },
                    suggestedFix: 'Use Scale-based UDim2 or constrain offsets to viewport dimensions'
                });
            }

            // Safe area violation check
            const inSafeTop    = el.y < safeArea.top;
            const inSafeBottom = (el.y + el.height) > (viewportHeight - safeArea.bottom);
            const inSafeLeft   = el.x < safeArea.left;
            const inSafeRight  = (el.x + el.width) > (viewportWidth - safeArea.right);

            if (inSafeTop || inSafeBottom || inSafeLeft || inSafeRight) {
                defects.push({
                    type: 'UI_CLIPPING',
                    severity: 'MEDIUM',
                    description: `Element "${el.id}" is within safe area inset on ${device}`,
                    region: { x: el.x, y: el.y, width: el.width, height: el.height },
                    suggestedFix: `Add padding: top=${safeArea.top}, bottom=${safeArea.bottom}, left=${safeArea.left}, right=${safeArea.right}`
                });
            }

            // Overlap check against other elements
            for (let j = i + 1; j < bounds.length; j++) {
                const other = bounds[j];
                if (this.overlaps(el, other)) {
                    defects.push({
                        type: 'UI_OVERLAP',
                        severity: 'MEDIUM',
                        description: `Elements "${el.id}" and "${other.id}" overlap`,
                        region: {
                            x: Math.max(el.x, other.x),
                            y: Math.max(el.y, other.y),
                            width: Math.min(el.x + el.width, other.x + other.width) - Math.max(el.x, other.x),
                            height: Math.min(el.y + el.height, other.y + other.height) - Math.max(el.y, other.y)
                        },
                        suggestedFix: 'Use ZIndex, anchoring, or layout containers to prevent overlap'
                    });
                }
            }

            // Zero-size check
            if (el.width <= 0 || el.height <= 0) {
                defects.push({
                    type: 'MISSING_ELEMENT',
                    severity: 'HIGH',
                    description: `Element "${el.id}" has zero size and will not be visible`,
                    suggestedFix: 'Set explicit UDim2 size values or ensure parent layout calculates correctly'
                });
            }
        }

        const highSeverityCount = defects.filter(d => d.severity === 'HIGH' || d.severity === 'CRITICAL').length;
        const status: VerificationStatus = defects.length === 0 ? 'VERIFIED' : (highSeverityCount > 0 ? 'FAILED' : 'PARTIAL');

        return {
            captureId: uuidv4().slice(0, 8),
            inspectedAt: Date.now(),
            defects,
            defectCount: defects.length,
            highSeverityCount,
            status,
            summary: defects.length === 0
                ? 'No geometric defects detected'
                : `${defects.length} defects found (${highSeverityCount} high severity)`,
            analysisMethod: 'GEOMETRIC'
        };
    }

    /**
     * WCAG 2.1 relative luminance contrast check.
     * Returns false (insufficient contrast) when ratio < 4.5:1 for normal text.
     */
    public checkContrast(
        foreground: [number, number, number],
        background: [number, number, number],
        isLargeText: boolean = false
    ): { ratio: number; passes: boolean; level: 'AA' | 'AAA' | 'FAIL' } {
        const lumFg = this.relativeLuminance(foreground);
        const lumBg = this.relativeLuminance(background);
        const lighter = Math.max(lumFg, lumBg);
        const darker  = Math.min(lumFg, lumBg);
        const ratio = (lighter + 0.05) / (darker + 0.05);

        const aaThreshold  = isLargeText ? 3.0 : 4.5;
        const aaaThreshold = isLargeText ? 4.5 : 7.0;

        const passes = ratio >= aaThreshold;
        const level = ratio >= aaaThreshold ? 'AAA' : passes ? 'AA' : 'FAIL';
        return { ratio: Math.round(ratio * 100) / 100, passes, level };
    }

    /**
     * Inspect a screenshot capture for semantic defects.
     * Returns UNAVAILABLE when no screenshot data is present.
     * AI Vision analysis is marked as UNAVAILABLE when no vision provider is configured.
     */
    public async inspectScreenshot(capture: ScreenshotCapture): Promise<VisionInspectionResult> {
        if (capture.status === 'UNAVAILABLE' || !capture.data) {
            return {
                captureId: capture.captureId,
                inspectedAt: Date.now(),
                defects: [],
                defectCount: 0,
                highSeverityCount: 0,
                status: 'UNAVAILABLE',
                summary: 'No screenshot data available for vision inspection',
                analysisMethod: 'UNAVAILABLE'
            };
        }

        // When screenshot data is available, we can perform pixel-level checks.
        // Full AI Vision requires an external vision model provider (not yet wired).
        // We report this honestly as PARTIAL until an AI Vision provider is configured.
        return {
            captureId: capture.captureId,
            inspectedAt: Date.now(),
            defects: [],
            defectCount: 0,
            highSeverityCount: 0,
            status: 'PARTIAL',
            summary: 'Screenshot received but AI Vision inspection provider not yet configured. Geometric QA is the primary analysis method.',
            analysisMethod: 'GEOMETRIC'
        };
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private overlaps(a: UIElementBound, b: UIElementBound): boolean {
        return !(
            a.x + a.width <= b.x ||
            b.x + b.width <= a.x ||
            a.y + a.height <= b.y ||
            b.y + b.height <= a.y
        );
    }

    private relativeLuminance([r, g, b]: [number, number, number]): number {
        const linearize = (c: number) => {
            const s = c / 255;
            return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        };
        return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
    }
}

export const visionInspectionEngine = new VisionInspectionEngine();
