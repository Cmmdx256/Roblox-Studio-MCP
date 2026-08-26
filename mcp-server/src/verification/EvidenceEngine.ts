import { Evidence, Change } from '../providers/types.js';

/**
 * Structured evidence collector for all mutations, playtests, and audits.
 */
export class EvidenceEngine {
    public recordPropertySnapshot(target: string, properties: Record<string, any>, label?: string): Evidence {
        return {
            type: 'PROPERTY_SNAPSHOT',
            description: label || `Snapshot of ${target}`,
            data: { target, properties },
            timestamp: new Date().toISOString()
        } as unknown as Evidence;
    }

    public recordScriptDiff(target: string, beforeSource: string, afterSource: string): Evidence {
        return {
            type: 'SCRIPT_DIFF',
            description: `Diff of script ${target}`,
            data: { target, beforeSource, afterSource },
            timestamp: new Date().toISOString()
        } as unknown as Evidence;
    }

    public recordConsoleOutput(logs: Array<{ message: string, messageType: string }>, errors?: Array<{ message: string, traceback?: string }>): Evidence {
        return {
            type: 'CONSOLE_OUTPUT',
            description: `Console output logs`,
            data: { logs, errors },
            timestamp: new Date().toISOString()
        } as unknown as Evidence;
    }

    public recordScreenshot(imageData: string, caption?: string): Evidence {
        return {
            type: 'SCREENSHOT',
            description: caption || 'Screenshot captured',
            data: { imageData },
            timestamp: new Date().toISOString()
        } as unknown as Evidence;
    }

    public recordTestResult(testName: string, passed: boolean, details?: Record<string, any>): Evidence {
        return {
            type: 'TEST_RESULT',
            description: `Test result for ${testName}`,
            data: { testName, passed, details },
            timestamp: new Date().toISOString()
        } as unknown as Evidence;
    }

    public recordStateDiff(beforeState: Record<string, any>, afterState: Record<string, any>): Evidence {
         return {
            type: 'STATE_DIFF',
            description: `State difference recorded`,
            data: { beforeState, afterState },
            timestamp: new Date().toISOString()
        } as unknown as Evidence;
    }

    public createExecutionEvidence(options: { target?: string, action: string, changes?: Change[], preState?: any, postState?: any, logs?: any[], screenshot?: string }): Evidence[] {
        const evidences: Evidence[] = [];
        
        if (options.preState || options.postState) {
            evidences.push(this.recordStateDiff(options.preState || {}, options.postState || {}));
        }
        
        if (options.logs && options.logs.length > 0) {
            evidences.push(this.recordConsoleOutput(options.logs));
        }
        
        if (options.screenshot) {
            evidences.push(this.recordScreenshot(options.screenshot, `Screenshot after ${options.action}`));
        }
        
        if (options.changes) {
            for (const change of options.changes) {
                // If it's a property change mapped via Change interface
                if (change.type === 'PROPERTY' && change.target) {
                    evidences.push(this.recordPropertySnapshot(change.target, (change as any).properties || {}, `Property change on ${change.target}`));
                }
            }
        }
        
        return evidences;
    }
}

export const evidenceEngine = new EvidenceEngine();
