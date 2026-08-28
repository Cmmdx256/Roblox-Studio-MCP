import { commandDispatcher } from '../dispatcher/commandDispatcher.js';
/**
 * RecoveryEngine
 * Real autonomous recovery and self-healing engine.
 * Synthesizes repairs, executes them against Studio, and re-verifies state.
 */
export class RecoveryEngine {
    /**
     * Analyzes an error and attempts autonomous self-healing recovery.
     */
    async attemptRecovery(errorStr, sourceContext) {
        const classification = this.classifyError(errorStr);
        const rootCause = this.determineRootCause(classification, errorStr);
        const options = this.generateRecoveryOptions(classification, errorStr, sourceContext);
        if (options.length === 0) {
            return {
                error: errorStr,
                classification,
                diagnosisType: 'RULE_BASED_DIAGNOSTIC',
                rootCause,
                success: false,
                verification: {
                    status: 'NOT_VERIFIABLE',
                    verified: false,
                    confidence: 0,
                    evidence: [],
                    mismatches: [{ field: 'recovery', expected: 'applicable_repair', actual: 'none', reason: 'No automated recovery options available.' }],
                    durationMs: 0,
                    checkedConditionsCount: 1,
                    passedConditionsCount: 0
                },
                remainingErrors: [errorStr]
            };
        }
        // Recovery is a live mutation workflow.  Planning a repair from the
        // supplied source context is useful, but that context is never proof
        // of the current Studio source.  Refuse to patch or report success
        // until this process can observe the bridge-owned Studio session.
        const session = await commandDispatcher.refreshSessionInfo();
        if (!session) {
            return {
                error: errorStr,
                classification,
                diagnosisType: 'AUTONOMOUS_RECOVERY',
                rootCause,
                appliedStrategy: options[0].strategy,
                success: false,
                verification: this.notVerifiableReport(options[0].targetScript || options[0].action || 'recovery', 'A live Roblox Studio session is required before a recovery can be applied or verified.'),
                remainingErrors: [errorStr]
            };
        }
        // Apply highest confidence option
        const bestOption = options[0];
        console.error(`[RecoveryEngine] Applying recovery option: ${bestOption.description} (confidence: ${bestOption.confidence})`);
        try {
            if (bestOption.strategy === 'PATCH_SOURCE' && bestOption.targetScript && bestOption.patchSearch && bestOption.patchReplacement) {
                // 1. Fetch the authoritative Studio source.  Never patch from
                // caller-provided text alone: it may be stale or fabricated.
                const currentRes = await commandDispatcher.executeCommand('script_get_source', { target: bestOption.targetScript });
                const currentSrc = typeof currentRes === 'string' ? currentRes : (currentRes?.source || '');
                if (currentSrc && currentSrc.includes(bestOption.patchSearch)) {
                    const newSrc = currentSrc.replace(bestOption.patchSearch, bestOption.patchReplacement);
                    await commandDispatcher.executeCommand('script_set_source', { target: bestOption.targetScript, source: newSrc });
                    // Re-read after writing.  Dispatch acknowledgement is not
                    // evidence; the patch is successful only when Studio
                    // returns the exact expected source.
                    const readBackRes = await commandDispatcher.executeCommand('script_get_source', { target: bestOption.targetScript });
                    const readBackSrc = typeof readBackRes === 'string' ? readBackRes : (readBackRes?.source || '');
                    const verified = readBackSrc === newSrc;
                    const verifyReport = {
                        status: verified ? 'VERIFIED' : 'FAILED',
                        verified,
                        confidence: verified ? 1 : 0,
                        evidence: [{ target: bestOption.targetScript, field: 'script_source', expected: newSrc, actual: readBackSrc, matched: verified, confidence: verified ? 1 : 0, timestamp: Date.now(), reason: 'Live Studio source read-back after recovery patch.' }],
                        mismatches: verified ? [] : [{ field: 'script_source', expected: newSrc, actual: readBackSrc, reason: 'Live Studio read-back did not match the recovery patch.' }],
                        durationMs: 0,
                        checkedConditionsCount: 1,
                        passedConditionsCount: verified ? 1 : 0
                    };
                    return {
                        error: errorStr,
                        classification,
                        diagnosisType: 'AUTONOMOUS_RECOVERY',
                        rootCause,
                        appliedStrategy: bestOption.strategy,
                        success: verified,
                        verification: verifyReport,
                        remainingErrors: verified ? [] : [errorStr]
                    };
                }
            }
            if (bestOption.action && bestOption.params) {
                await commandDispatcher.executeCommand(bestOption.action, bestOption.params);
                return {
                    error: errorStr,
                    classification,
                    diagnosisType: 'AUTONOMOUS_RECOVERY',
                    rootCause,
                    appliedStrategy: bestOption.strategy,
                    success: false,
                    verification: this.notVerifiableReport(bestOption.action, 'Recovery command dispatched, but this strategy has no independent Studio postcondition.'),
                    remainingErrors: [errorStr]
                };
            }
        }
        catch (err) {
            console.error(`[RecoveryEngine] Recovery execution failed:`, err.message || err);
        }
        return {
            error: errorStr,
            classification,
            diagnosisType: 'AUTONOMOUS_RECOVERY',
            rootCause,
            appliedStrategy: bestOption.strategy,
            success: false,
            verification: {
                status: 'FAILED',
                verified: false,
                confidence: 0,
                evidence: [],
                mismatches: [{ field: 'recovery', expected: 'success', actual: 'failed', reason: 'Repair action executed but state failed verification.' }],
                durationMs: 0,
                checkedConditionsCount: 1,
                passedConditionsCount: 0
            },
            remainingErrors: [errorStr]
        };
    }
    classifyError(errorStr) {
        const lower = errorStr.toLowerCase();
        if (lower.includes('property is read only') || lower.includes('unable to assign property c0') || lower.includes('unable to assign property')) {
            return 'PROPERTY_RESTRICTION';
        }
        if (lower.includes('attempt to index nil') || lower.includes('is not a valid member')) {
            return 'NIL_INDEXING';
        }
        if (lower.includes('security context') || lower.includes('identity')) {
            return 'SECURITY_RESTRICTION';
        }
        if (lower.includes('httprequests not enabled') || lower.includes('http')) {
            return 'HTTP_RESTRICTION';
        }
        if (lower.includes('syntax error') || lower.includes('expected') || lower.includes('got')) {
            return 'SYNTAX_ERROR';
        }
        if (lower.includes('timeout')) {
            return 'TIMEOUT';
        }
        return 'UNKNOWN';
    }
    determineRootCause(classification, errorStr) {
        switch (classification) {
            case 'PROPERTY_RESTRICTION':
                return 'Direct assignment to a read-only or restricted property (e.g. Motor6D.C0 in non-standard hierarchy).';
            case 'NIL_INDEXING':
                return 'Accessed an instance child before it was replicated or created. Missing FindFirstChild guard.';
            case 'SECURITY_RESTRICTION':
                return 'API requires elevated RobloxScriptSecurity or PluginSecurity context.';
            case 'HTTP_RESTRICTION':
                return 'HttpService is disabled in Studio Game Settings.';
            default:
                return `Runtime exception: ${errorStr}`;
        }
    }
    generateRecoveryOptions(classification, errorStr, sourceContext) {
        const options = [];
        if (classification === 'PROPERTY_RESTRICTION' && sourceContext?.sourceCode && sourceContext?.scriptPath) {
            // The former implementation replaced one exact "dummy" rig line.
            // That was neither a general Luau transform nor safe to apply to an
            // arbitrary hierarchy, so it has intentionally been removed. A
            // future recovery option must supply an AST-aware transformation,
            // an inverse operation, and explicit read-back postconditions.
            return options;
        }
        if (classification === 'NIL_INDEXING' && sourceContext?.sourceCode && sourceContext?.scriptPath) {
            options.push({
                id: 'wrap_find_first_child',
                strategy: 'PATCH_SOURCE',
                description: 'Wrap potential nil instance index in FindFirstChild / WaitForChild check.',
                targetScript: sourceContext.scriptPath,
                confidence: 0.7
            });
        }
        return options;
    }
    notVerifiableReport(target, reason) {
        return {
            status: 'NOT_VERIFIABLE',
            verified: false,
            confidence: 0,
            evidence: [{ target, field: 'recovery', expected: 'independent Studio read-back', actual: 'not_observed', matched: false, confidence: 0, reason, timestamp: Date.now() }],
            mismatches: [{ field: 'recovery', expected: 'verified Studio state', actual: 'not_observed', reason }],
            durationMs: 0,
            checkedConditionsCount: 1,
            passedConditionsCount: 0
        };
    }
}
export const recoveryEngine = new RecoveryEngine();
//# sourceMappingURL=RecoveryEngine.js.map