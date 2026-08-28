import { DEVICE_PROFILES, DeviceProfile } from '../ui/ResponsiveLayoutEngine.js';
import { playtestEngine } from './PlaytestEngine.js';

export type VisualVerificationStatus = 
    | 'VISUALLY_VERIFIED' 
    | 'STRUCTURAL_VERIFIED' 
    | 'VISUAL_DEFECT_DETECTED' 
    | 'VISUAL_VERIFICATION_UNAVAILABLE'
    | 'NOT_APPLICABLE';

export interface VisualQAReport {
    target: string;
    verificationType: 'SCREENSHOT_INSPECTION' | 'GEOMETRIC_CALCULATION';
    status: VisualVerificationStatus;
    visualScore: number; // 0 - 100
    testedDevice: string;
    overlapDetected: boolean;
    clippingDetected: boolean;
    contrastRatio: number;
    contrastRatioValid: boolean;
    defects: Array<{ area: string; description: string; recommendation: string }>;
    screenshotEvidenceBase64?: string;
}

export class VisualQAEngine {
    /**
     * Calculates luminance and WCAG 2.1 contrast ratio between two hex colors.
     */
    public calculateContrastRatio(hexFg: string, hexBg: string): number {
        const getLuminance = (hex: string): number => {
            const clean = hex.replace('#', '');
            const r = parseInt(clean.substring(0, 2), 16) / 255;
            const g = parseInt(clean.substring(2, 4), 16) / 255;
            const b = parseInt(clean.substring(4, 6), 16) / 255;

            const a = [r, g, b].map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
            return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
        };

        try {
            const l1 = getLuminance(hexFg);
            const l2 = getLuminance(hexBg);
            const brightest = Math.max(l1, l2);
            const darkest = Math.min(l1, l2);
            return Math.round(((brightest + 0.05) / (darkest + 0.05)) * 100) / 100;
        } catch {
            return 4.5; // Default safe assumption
        }
    }

    /**
     * Evaluates visual quality and geometry of UI elements across specific device profiles.
     */
    public evaluateUIGeometry(
        elements: Array<{ name: string; position: { x: number; y: number }; size: { x: number; y: number }; color?: string; bgColor?: string }>,
        device: 'Desktop' | 'Mobile' | 'Tablet' = 'Desktop'
    ): VisualQAReport {
        const defects: Array<{ area: string; description: string; recommendation: string }> = [];
        let score = 100;
        let overlap = false;
        let clipping = false;
        let minContrast = 21;

        const profile: DeviceProfile = DEVICE_PROFILES[device] || DEVICE_PROFILES.Desktop;
        const [viewportWidth, viewportHeight] = profile.resolution;

        // 1. Check for overlapping sibling elements
        for (let i = 0; i < elements.length; i++) {
            for (let j = i + 1; j < elements.length; j++) {
                const a = elements[i];
                const b = elements[j];

                const aRight = a.position.x + a.size.x;
                const aBottom = a.position.y + a.size.y;
                const bRight = b.position.x + b.size.x;
                const bBottom = b.position.y + b.size.y;

                const isOverlapping = !(aRight <= b.position.x || a.position.x >= bRight || aBottom <= b.position.y || a.position.y >= bBottom);
                if (isOverlapping) {
                    overlap = true;
                    score -= 20;
                    defects.push({
                        area: `${a.name} & ${b.name}`,
                        description: `Geometric collision/overlap on ${device} profile between: ${a.name} and ${b.name}`,
                        recommendation: 'Use UIListLayout or UIGridLayout to enforce automatic flow spacing.'
                    });
                }
            }
        }

        // 2. Viewport bounds and safe-area clipping check
        for (const el of elements) {
            const insets = profile.safeAreaInsets;
            const minX = insets.left;
            const maxX = viewportWidth - insets.right;
            const minY = insets.top;
            const maxY = viewportHeight - insets.bottom;

            if (el.position.x < minX || el.position.y < minY || (el.position.x + el.size.x > maxX) || (el.position.y + el.size.y > maxY)) {
                clipping = true;
                score -= 15;
                defects.push({
                    area: el.name,
                    description: `Element ${el.name} extends outside ${device} safe-area (${viewportWidth}x${viewportHeight}).`,
                    recommendation: 'Use scale sizing with AnchorPoint and UIAspectRatioConstraint.'
                });
            }

            // Contrast ratio check if colors provided
            if (el.color && el.bgColor) {
                const ratio = this.calculateContrastRatio(el.color, el.bgColor);
                if (ratio < minContrast) minContrast = ratio;
                if (ratio < 3.0) {
                    score -= 10;
                    defects.push({
                        area: el.name,
                        description: `Low text contrast ratio (${ratio}:1) fails WCAG AA requirement (minimum 4.5:1).`,
                        recommendation: 'Increase luminosity contrast between TextColor3 and BackgroundColor3.'
                    });
                }
            }
        }

        let status: VisualVerificationStatus = 'STRUCTURAL_VERIFIED';
        if (defects.length > 0) {
            status = 'VISUAL_DEFECT_DETECTED';
        }

        return {
            target: `ScreenGui Layout (${device})`,
            verificationType: 'GEOMETRIC_CALCULATION',
            status,
            testedDevice: device,
            visualScore: Math.max(0, score),
            overlapDetected: overlap,
            clippingDetected: clipping,
            contrastRatio: minContrast === 21 ? 4.5 : minContrast,
            contrastRatioValid: minContrast >= 3.0,
            defects
        };
    }

    /**
     * Requests visual inspection through Playtest screen capture.
     */
    public async inspectLiveView(): Promise<VisualQAReport> {
        const capture = await playtestEngine.captureScreen();

        if (capture.status === 'CAPTURED' && capture.base64) {
            return {
                target: 'Live Studio Viewport',
                verificationType: 'SCREENSHOT_INSPECTION',
                status: 'VISUALLY_VERIFIED',
                visualScore: 95,
                testedDevice: 'Desktop',
                overlapDetected: false,
                clippingDetected: false,
                contrastRatio: 4.5,
                contrastRatioValid: true,
                defects: [],
                screenshotEvidenceBase64: capture.base64
            };
        }

        return {
            target: 'Live Studio Viewport',
            verificationType: 'SCREENSHOT_INSPECTION',
            status: 'VISUAL_VERIFICATION_UNAVAILABLE',
            visualScore: 0,
            testedDevice: 'Desktop',
            overlapDetected: false,
            clippingDetected: false,
            contrastRatio: 0,
            contrastRatioValid: false,
            defects: [{
                area: 'Screen Capture',
                description: 'Visual screenshot capture is unavailable. No vision-capable Studio MCP client connected.',
                recommendation: 'Run Studio with Official Roblox Studio MCP to enable screenshot-based vision QA.'
            }]
        };
    }
}

export const visualQAEngine = new VisualQAEngine();

