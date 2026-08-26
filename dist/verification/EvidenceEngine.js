/**
 * Structured evidence collector for all mutations, playtests, and audits.
 */
export class EvidenceEngine {
    recordPropertySnapshot(target, properties, label) {
        return {
            type: 'PROPERTY_SNAPSHOT',
            description: label || `Snapshot of ${target}`,
            data: { target, properties },
            timestamp: new Date().toISOString()
        };
    }
    recordScriptDiff(target, beforeSource, afterSource) {
        return {
            type: 'SCRIPT_DIFF',
            description: `Diff of script ${target}`,
            data: { target, beforeSource, afterSource },
            timestamp: new Date().toISOString()
        };
    }
    recordConsoleOutput(logs, errors) {
        return {
            type: 'CONSOLE_OUTPUT',
            description: `Console output logs`,
            data: { logs, errors },
            timestamp: new Date().toISOString()
        };
    }
    recordScreenshot(imageData, caption) {
        return {
            type: 'SCREENSHOT',
            description: caption || 'Screenshot captured',
            data: { imageData },
            timestamp: new Date().toISOString()
        };
    }
    recordTestResult(testName, passed, details) {
        return {
            type: 'TEST_RESULT',
            description: `Test result for ${testName}`,
            data: { testName, passed, details },
            timestamp: new Date().toISOString()
        };
    }
    recordStateDiff(beforeState, afterState) {
        return {
            type: 'STATE_DIFF',
            description: `State difference recorded`,
            data: { beforeState, afterState },
            timestamp: new Date().toISOString()
        };
    }
    createExecutionEvidence(options) {
        const evidences = [];
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
                    evidences.push(this.recordPropertySnapshot(change.target, change.properties || {}, `Property change on ${change.target}`));
                }
            }
        }
        return evidences;
    }
}
export const evidenceEngine = new EvidenceEngine();
//# sourceMappingURL=EvidenceEngine.js.map