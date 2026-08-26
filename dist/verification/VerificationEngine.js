import { commandDispatcher } from '../dispatcher/commandDispatcher.js';
/**
 * Server-side pre- and post-condition verification framework.
 */
export class VerificationEngine {
    async checkInstanceProperties(target, expectedProperties, mismatches) {
        for (const [key, expectedValue] of Object.entries(expectedProperties)) {
            try {
                const result = await commandDispatcher.executeCommand('GetProperties', { target, properties: [key] });
                const actualValue = result?.[key];
                if (typeof expectedValue === 'number' && typeof actualValue === 'number') {
                    if (Math.abs(expectedValue - actualValue) > 0.001) {
                        mismatches.push({ field: `property:${key}`, expected: expectedValue, actual: actualValue, reason: 'Value outside tolerance' });
                    }
                }
                else if (JSON.stringify(expectedValue) !== JSON.stringify(actualValue)) {
                    mismatches.push({ field: `property:${key}`, expected: expectedValue, actual: actualValue, reason: 'Value mismatch' });
                }
            }
            catch (error) {
                mismatches.push({ field: `property:${key}`, expected: expectedValue, actual: null, reason: `Error retrieving property: ${error instanceof Error ? error.message : String(error)}` });
            }
        }
    }
    /**
     * Queries instance / properties / attributes via commandDispatcher.
     * Checks existence, className, parent, property values.
     */
    async checkPreconditions(spec) {
        const startTime = Date.now();
        const mismatches = [];
        try {
            const result = await commandDispatcher.executeCommand('GetInstanceMetadata', { target: spec.target });
            const exists = !!result;
            if (spec.shouldExist !== undefined) {
                if (exists !== spec.shouldExist) {
                    mismatches.push({ field: 'existence', expected: spec.shouldExist, actual: exists, reason: 'Existence mismatch' });
                }
            }
            if (exists) {
                if (spec.expectedClassName && result.className !== spec.expectedClassName) {
                    mismatches.push({ field: 'className', expected: spec.expectedClassName, actual: result.className, reason: 'ClassName mismatch' });
                }
                if (spec.expectedParent && result.parent !== spec.expectedParent) {
                    mismatches.push({ field: 'parent', expected: spec.expectedParent, actual: result.parent, reason: 'Parent mismatch' });
                }
                if (spec.expectedProperties) {
                    await this.checkInstanceProperties(spec.target, spec.expectedProperties, mismatches);
                }
                if (spec.expectedAttributes) {
                    const attrs = await commandDispatcher.executeCommand('GetAttributes', { target: spec.target });
                    for (const [key, expectedValue] of Object.entries(spec.expectedAttributes)) {
                        const actualValue = attrs?.[key];
                        if (JSON.stringify(expectedValue) !== JSON.stringify(actualValue)) {
                            mismatches.push({ field: `attribute:${key}`, expected: expectedValue, actual: actualValue, reason: 'Attribute mismatch' });
                        }
                    }
                }
            }
        }
        catch (error) {
            mismatches.push({ field: 'system', expected: 'no error', actual: 'error', reason: `Execution failed: ${error instanceof Error ? error.message : String(error)}` });
        }
        const durationMs = Date.now() - startTime;
        return {
            verified: mismatches.length === 0,
            status: mismatches.length === 0 ? 'VERIFIED' : 'FAILED_VERIFICATION',
            mismatches,
            durationMs
        };
    }
    /**
     * Queries instance after mutation and validates properties.
     * If property doesn't match immediately, retries up to 3 times with 50ms delay.
     */
    async verifyPostconditions(spec) {
        const startTime = Date.now();
        const maxRetries = 3;
        const delayMs = 50;
        let report = { verified: false, status: 'FAILED_VERIFICATION', mismatches: [], durationMs: 0 };
        for (let i = 0; i <= maxRetries; i++) {
            report = await this.checkPreconditions({
                target: spec.target,
                shouldExist: spec.shouldExist,
                expectedParent: spec.expectedParent,
                expectedProperties: spec.expectedProperties,
                expectedAttributes: spec.expectedAttributes
            });
            if (report.verified) {
                break;
            }
            if (i < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        }
        report.durationMs = Date.now() - startTime;
        return report;
    }
    /**
     * Wraps an action execution with pre- and post-condition checks.
     */
    async wrapWithVerification(action, params, preSpec, postSpec) {
        if (preSpec) {
            const preReport = await this.checkPreconditions(preSpec);
            if (!preReport.verified) {
                return { result: null, verification: preReport };
            }
        }
        let result = null;
        try {
            result = await commandDispatcher.executeCommand(action, params);
        }
        catch (error) {
            return {
                result: null,
                verification: { verified: false, status: 'FAILED_VERIFICATION', mismatches: [{ field: 'execution', expected: 'success', actual: 'failure', reason: String(error) }], durationMs: 0 }
            };
        }
        if (postSpec) {
            const postReport = await this.verifyPostconditions(postSpec);
            return { result, verification: postReport };
        }
        return {
            result,
            verification: { verified: true, status: 'VERIFIED', mismatches: [], durationMs: 0 }
        };
    }
}
export const verificationEngine = new VerificationEngine();
//# sourceMappingURL=VerificationEngine.js.map