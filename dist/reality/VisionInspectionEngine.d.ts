/**
 * VisionInspectionEngine.ts
 *
 * Classifies visual defects in screenshots using geometric analysis.
 * When AI Vision provider is available, augments with semantic analysis.
 * Always truthful — geometric QA and AI QA are clearly distinguished.
 */
import { ScreenshotCapture, VisionInspectionResult } from './types.js';
/**
 * VisualEvidenceSource (P4 — Phase 10)
 *
 * All visual QA results MUST declare which evidence source was used.
 * GEOMETRIC_ONLY is honest — it means no actual screenshot was captured from Studio.
 * LIVE_SCREENSHOT is the gold standard.
 */
export type VisualEvidenceSource = 'LIVE_SCREENSHOT' | 'STUDIO_VIEWPORT' | 'PLAYTEST_SCREEN' | 'GEOMETRIC_ONLY' | 'NO_VISUAL_EVIDENCE';
export interface UIElementBound {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    expectedVisible?: boolean;
    label?: string;
}
export declare class VisionInspectionEngine {
    /**
     * Perform geometric visual QA on a list of UI bounds.
     * Detects overlaps, clipping, off-screen elements, and safe-area violations.
     * This analysis is device-agnostic and does not assume any specific game UI.
     */
    inspectGeometric(bounds: UIElementBound[], viewportWidth: number, viewportHeight: number, device?: string): VisionInspectionResult;
    /**
     * WCAG 2.1 relative luminance contrast check.
     * Returns false (insufficient contrast) when ratio < 4.5:1 for normal text.
     */
    checkContrast(foreground: [number, number, number], background: [number, number, number], isLargeText?: boolean): {
        ratio: number;
        passes: boolean;
        level: 'AA' | 'AAA' | 'FAIL';
    };
    /**
     * Inspect a screenshot capture for semantic defects.
     * Returns UNAVAILABLE when no screenshot data is present.
     * AI Vision analysis is marked as UNAVAILABLE when no vision provider is configured.
     */
    inspectScreenshot(capture: ScreenshotCapture): Promise<VisionInspectionResult>;
    private overlaps;
    private relativeLuminance;
}
export declare const visionInspectionEngine: VisionInspectionEngine;
//# sourceMappingURL=VisionInspectionEngine.d.ts.map