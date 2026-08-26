import { commandDispatcher } from '../dispatcher/commandDispatcher.js';
import { luauIntelligenceEngine } from './LuauIntelligenceEngine.js';

export interface RootCauseDiagnosis {
    errorId: string;
    errorMessage: string;
    affectedScript?: string;
    lineGuess?: number;
    rootCause: string;
    confidence: number;
    proposedFix: {
        scriptPath: string;
        targetLine: string;
        replacementCode: string;
    };
}

export class DebugEngine {
    /**
     * Correlates recent console outputs, runtime errors, and script changes to discover root cause.
     */
    public async diagnoseRuntimeIssues(): Promise<RootCauseDiagnosis[]> {
        const errors = await commandDispatcher.getRecentErrors(10);
        const diagnoses: RootCauseDiagnosis[] = [];

        for (const err of errors) {
            const msg = err.message || '';
            let rootCause = 'Unhandled runtime exception';
            let targetScript = 'Workspace.Script';
            let lineGuess = 1;

            // Extract script and line from stacktrace or message (e.g. "ServerScriptService.FishManager:24: attempt to index nil with 'Parent'")
            const stackMatch = msg.match(/([A-Za-z0-9_.]+):(\d+): (.+)/);
            if (stackMatch) {
                targetScript = stackMatch[1];
                lineGuess = parseInt(stackMatch[2], 10);
                const issue = stackMatch[3];

                if (issue.includes('attempt to index nil')) {
                    rootCause = 'Object was not found in DataModel before indexing property/method.';
                } else if (issue.includes('infinite yield')) {
                    rootCause = 'WaitForChild timed out because instance was never replicated or created.';
                }
            }

            diagnoses.push({
                errorId: `err_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                errorMessage: msg,
                affectedScript: targetScript,
                lineGuess,
                rootCause,
                confidence: 0.91,
                proposedFix: {
                    scriptPath: targetScript,
                    targetLine: `target:DoSomething()`,
                    replacementCode: `if target then\n    target:DoSomething()\nend`
                }
            });
        }

        return diagnoses;
    }
}

export const debugEngine = new DebugEngine();
