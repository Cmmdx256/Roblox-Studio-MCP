import { Evidence, Change } from '../providers/types.js';
/**
 * Structured evidence collector for all mutations, playtests, and audits.
 */
export declare class EvidenceEngine {
    recordPropertySnapshot(target: string, properties: Record<string, any>, label?: string): Evidence;
    recordScriptDiff(target: string, beforeSource: string, afterSource: string): Evidence;
    recordConsoleOutput(logs: Array<{
        message: string;
        messageType: string;
    }>, errors?: Array<{
        message: string;
        traceback?: string;
    }>): Evidence;
    recordScreenshot(imageData: string, caption?: string): Evidence;
    recordTestResult(testName: string, passed: boolean, details?: Record<string, any>): Evidence;
    recordStateDiff(beforeState: Record<string, any>, afterState: Record<string, any>): Evidence;
    createExecutionEvidence(options: {
        target?: string;
        action: string;
        changes?: Change[];
        preState?: any;
        postState?: any;
        logs?: any[];
        screenshot?: string;
    }): Evidence[];
}
export declare const evidenceEngine: EvidenceEngine;
//# sourceMappingURL=EvidenceEngine.d.ts.map