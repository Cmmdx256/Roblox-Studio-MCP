export type VisualVerificationStatus = 'VISUALLY_VERIFIED' | 'STRUCTURAL_VERIFIED' | 'VISUAL_DEFECT_DETECTED' | 'VISUAL_VERIFICATION_UNAVAILABLE' | 'NOT_APPLICABLE';
export interface VisualQAReport {
    target: string;
    verificationType: 'SCREENSHOT_INSPECTION' | 'GEOMETRIC_CALCULATION';
    status: VisualVerificationStatus;
    visualScore: number;
    testedDevice: string;
    overlapDetected: boolean;
    clippingDetected: boolean;
    contrastRatio: number;
    contrastRatioValid: boolean;
    defects: Array<{
        area: string;
        description: string;
        recommendation: string;
    }>;
    screenshotEvidenceBase64?: string;
}
export declare class VisualQAEngine {
    /**
     * Calculates luminance and WCAG 2.1 contrast ratio between two hex colors.
     */
    calculateContrastRatio(hexFg: string, hexBg: string): number;
    /**
     * Evaluates visual quality and geometry of UI elements across specific device profiles.
     */
    evaluateUIGeometry(elements: Array<{
        name: string;
        position: {
            x: number;
            y: number;
        };
        size: {
            x: number;
            y: number;
        };
        color?: string;
        bgColor?: string;
    }>, device?: 'Desktop' | 'Mobile' | 'Tablet'): VisualQAReport;
    /**
     * Requests visual inspection through Playtest screen capture.
     */
    inspectLiveView(): Promise<VisualQAReport>;
}
export declare const visualQAEngine: VisualQAEngine;
//# sourceMappingURL=VisualQAEngine.d.ts.map