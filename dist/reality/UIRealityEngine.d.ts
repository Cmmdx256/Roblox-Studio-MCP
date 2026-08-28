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
import { UIRealityReport, UIDevice } from './types.js';
export interface UIRealityOptions {
    screenName: string;
    devices?: UIDevice[];
    autoRepair?: boolean;
    maxRepairCycles?: number;
}
export declare class UIRealityEngine {
    /**
     * Run full closed-loop UI reality verification for a given screen across devices.
     */
    verifyScreen(options: UIRealityOptions): Promise<UIRealityReport[]>;
    private verifyDevice;
    private extractBounds;
    private synthesizeUIRepairPatch;
}
export declare const uiRealityEngine: UIRealityEngine;
//# sourceMappingURL=UIRealityEngine.d.ts.map