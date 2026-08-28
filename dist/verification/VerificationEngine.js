import { commandDispatcher } from '../dispatcher/commandDispatcher.js';
/**
 * Real VerificationEngine 2.0
 * Deep, evidence-based post-condition and pre-condition inspection of Studio state.
 * Never conflates command execution with verified state.
 */
export class VerificationEngine {
    /**
     * Verifies an array of formal ConditionSpecs against live Studio DataModel.
     */
    async verifyConditions(conditions, options = {}) {
        const startTime = Date.now();
        const evidence = [];
        const mismatches = [];
        let passedCount = 0;
        if (conditions.length === 0) {
            return {
                status: 'NOT_VERIFIABLE',
                verified: false,
                confidence: 0,
                evidence: [],
                mismatches: [],
                durationMs: Date.now() - startTime,
                checkedConditionsCount: 0,
                passedConditionsCount: 0
            };
        }
        for (const cond of conditions) {
            const now = Date.now();
            try {
                switch (cond.type) {
                    case 'EXISTENCE': {
                        const exists = await this.queryInstanceExistence(cond.target);
                        const expected = cond.expected !== false;
                        const matched = exists === expected;
                        if (matched)
                            passedCount++;
                        else
                            mismatches.push({ field: `${cond.target}:existence`, expected, actual: exists, reason: `Existence expected ${expected} but was ${exists}` });
                        evidence.push({ target: cond.target, field: 'existence', expected, actual: exists, matched, confidence: 1.0, timestamp: now });
                        break;
                    }
                    case 'CLASS_NAME': {
                        const meta = await this.queryInstanceMeta(cond.target);
                        const actualClass = meta?.className ?? null;
                        const matched = actualClass === cond.expected;
                        if (matched)
                            passedCount++;
                        else
                            mismatches.push({ field: `${cond.target}:className`, expected: cond.expected, actual: actualClass, reason: `ClassName mismatch` });
                        evidence.push({ target: cond.target, field: 'className', expected: cond.expected, actual: actualClass, matched, confidence: 1.0, timestamp: now });
                        break;
                    }
                    case 'PARENT': {
                        const meta = await this.queryInstanceMeta(cond.target);
                        const actualParent = meta?.parent ?? null;
                        const matched = actualParent === cond.expected;
                        if (matched)
                            passedCount++;
                        else
                            mismatches.push({ field: `${cond.target}:parent`, expected: cond.expected, actual: actualParent, reason: `Parent mismatch` });
                        evidence.push({ target: cond.target, field: 'parent', expected: cond.expected, actual: actualParent, matched, confidence: 1.0, timestamp: now });
                        break;
                    }
                    case 'PROPERTY': {
                        const propName = cond.property || 'Value';
                        const actualProp = await this.queryProperty(cond.target, propName);
                        const matched = this.compareValues(cond.expected, actualProp, cond.tolerance ?? options.tolerance);
                        if (matched)
                            passedCount++;
                        else
                            mismatches.push({ field: `${cond.target}.${propName}`, expected: cond.expected, actual: actualProp, reason: `Property value mismatch` });
                        evidence.push({ target: cond.target, field: `property:${propName}`, expected: cond.expected, actual: actualProp, matched, confidence: 0.95, timestamp: now });
                        break;
                    }
                    case 'ATTRIBUTE': {
                        const attrName = cond.attribute || 'Value';
                        const actualAttr = await this.queryAttribute(cond.target, attrName);
                        const matched = this.compareValues(cond.expected, actualAttr);
                        if (matched)
                            passedCount++;
                        else
                            mismatches.push({ field: `${cond.target}#${attrName}`, expected: cond.expected, actual: actualAttr, reason: `Attribute value mismatch` });
                        evidence.push({ target: cond.target, field: `attribute:${attrName}`, expected: cond.expected, actual: actualAttr, matched, confidence: 0.95, timestamp: now });
                        break;
                    }
                    case 'TAG': {
                        const tagName = cond.tag || cond.expected;
                        const hasTag = await this.queryHasTag(cond.target, tagName);
                        const matched = hasTag === (cond.expected !== false);
                        if (matched)
                            passedCount++;
                        else
                            mismatches.push({ field: `${cond.target}:tag:${tagName}`, expected: cond.expected, actual: hasTag, reason: `CollectionService tag mismatch` });
                        evidence.push({ target: cond.target, field: `tag:${tagName}`, expected: cond.expected, actual: hasTag, matched, confidence: 1.0, timestamp: now });
                        break;
                    }
                    case 'SCRIPT_PATTERN':
                    case 'SCRIPT_EXACT': {
                        const source = await this.queryScriptSource(cond.target);
                        let matched = false;
                        if (cond.type === 'SCRIPT_EXACT') {
                            matched = source === cond.expected;
                        }
                        else {
                            matched = typeof source === 'string' && (source.includes(cond.pattern || cond.expected) || (cond.pattern ? new RegExp(cond.pattern).test(source) : false));
                        }
                        if (matched)
                            passedCount++;
                        else
                            mismatches.push({ field: `${cond.target}:source`, expected: cond.expected || cond.pattern, actual: source ? `${source.slice(0, 100)}...` : null, reason: 'Script source did not match pattern' });
                        evidence.push({ target: cond.target, field: 'script_source', expected: cond.expected || cond.pattern, actual: source ? 'Source present' : 'None', matched, confidence: 1.0, timestamp: now });
                        break;
                    }
                    default:
                        // A custom condition has no trusted evaluator in this process.
                        // Treating it as true is exactly the fake-completion path P4 forbids.
                        mismatches.push({ field: cond.target, expected: cond.expected, actual: 'UNVERIFIED', reason: `No live evaluator is registered for condition type ${cond.type}` });
                        evidence.push({ target: cond.target, field: cond.type, expected: cond.expected, actual: 'UNVERIFIED', matched: false, confidence: 0, timestamp: now, reason: `No live evaluator is registered for condition type ${cond.type}` });
                        break;
                }
            }
            catch (err) {
                mismatches.push({ field: cond.target, expected: cond.expected, actual: null, reason: `Query error: ${err.message || err}` });
                evidence.push({ target: cond.target, field: cond.type, expected: cond.expected, actual: null, matched: false, confidence: 0.0, reason: err.message, timestamp: now });
            }
        }
        const total = conditions.length;
        let status = 'UNKNOWN';
        if (passedCount === total && mismatches.length === 0) {
            status = 'VERIFIED';
        }
        else if (passedCount > 0 && mismatches.length > 0) {
            status = 'PARTIALLY_VERIFIED';
        }
        else if (passedCount === 0 && mismatches.length > 0) {
            status = 'FAILED';
        }
        const confidence = total > 0 ? passedCount / total : 1.0;
        return {
            status,
            verified: status === 'VERIFIED',
            confidence,
            evidence,
            mismatches,
            durationMs: Date.now() - startTime,
            checkedConditionsCount: total,
            passedConditionsCount: passedCount
        };
    }
    /**
     * Backward-compatible Precondition Spec Checker
     */
    async checkPreconditions(spec) {
        const conditions = [];
        if (spec.shouldExist !== undefined) {
            conditions.push({ type: 'EXISTENCE', target: spec.target, expected: spec.shouldExist });
        }
        if (spec.expectedClassName) {
            conditions.push({ type: 'CLASS_NAME', target: spec.target, expected: spec.expectedClassName });
        }
        if (spec.expectedParent) {
            conditions.push({ type: 'PARENT', target: spec.target, expected: spec.expectedParent });
        }
        if (spec.expectedProperties) {
            for (const [k, v] of Object.entries(spec.expectedProperties)) {
                conditions.push({ type: 'PROPERTY', target: spec.target, property: k, expected: v });
            }
        }
        if (spec.expectedAttributes) {
            for (const [k, v] of Object.entries(spec.expectedAttributes)) {
                conditions.push({ type: 'ATTRIBUTE', target: spec.target, attribute: k, expected: v });
            }
        }
        return await this.verifyConditions(conditions);
    }
    /**
     * Backward-compatible Postcondition Spec Checker with retries for Studio replication.
     */
    async verifyPostconditions(spec, maxRetries = 3, delayMs = 50) {
        const conditions = [];
        if (spec.shouldExist !== undefined) {
            conditions.push({ type: 'EXISTENCE', target: spec.target, expected: spec.shouldExist });
        }
        if (spec.expectedParent) {
            conditions.push({ type: 'PARENT', target: spec.target, expected: spec.expectedParent });
        }
        if (spec.expectedProperties) {
            for (const [k, v] of Object.entries(spec.expectedProperties)) {
                conditions.push({ type: 'PROPERTY', target: spec.target, property: k, expected: v });
            }
        }
        if (spec.expectedAttributes) {
            for (const [k, v] of Object.entries(spec.expectedAttributes)) {
                conditions.push({ type: 'ATTRIBUTE', target: spec.target, attribute: k, expected: v });
            }
        }
        if (spec.expectedTags) {
            for (const tag of spec.expectedTags) {
                conditions.push({ type: 'TAG', target: spec.target, tag, expected: true });
            }
        }
        if (spec.expectedSourceContains) {
            conditions.push({ type: 'SCRIPT_PATTERN', target: spec.target, pattern: spec.expectedSourceContains });
        }
        let report = {
            status: 'FAILED',
            verified: false,
            confidence: 0,
            evidence: [],
            mismatches: [],
            durationMs: 0,
            checkedConditionsCount: conditions.length,
            passedConditionsCount: 0
        };
        for (let i = 0; i <= maxRetries; i++) {
            report = await this.verifyConditions(conditions);
            if (report.verified)
                break;
            if (i < maxRetries) {
                await new Promise(r => setTimeout(r, delayMs));
            }
        }
        return report;
    }
    /**
     * Wraps execution with pre-checks, execution, and real post-condition verification.
     */
    async wrapWithVerification(action, params, preSpec, postSpec) {
        // 1. Precondition Verification
        if (preSpec) {
            const preReport = Array.isArray(preSpec)
                ? await this.verifyConditions(preSpec)
                : await this.checkPreconditions(preSpec);
            if (!preReport.verified) {
                return { result: null, verification: preReport };
            }
        }
        // 2. Action Execution
        let result = null;
        try {
            result = await commandDispatcher.executeCommand(action, params);
        }
        catch (error) {
            return {
                result: null,
                verification: {
                    status: 'FAILED',
                    verified: false,
                    confidence: 0,
                    evidence: [{ target: params?.target || action, field: 'execution', expected: 'success', actual: 'exception', matched: false, confidence: 0, reason: error.message || String(error), timestamp: Date.now() }],
                    mismatches: [{ field: 'execution', expected: 'success', actual: 'failure', reason: error.message || String(error) }],
                    durationMs: 0,
                    checkedConditionsCount: 1,
                    passedConditionsCount: 0
                }
            };
        }
        // 3. Postcondition Verification
        if (postSpec) {
            const postReport = Array.isArray(postSpec)
                ? await this.verifyConditions(postSpec)
                : await this.verifyPostconditions(postSpec);
            return { result, verification: postReport };
        }
        // A successful transport response proves only that a command was
        // dispatched.  It does not prove that Studio reached the requested
        // state, so callers must supply postconditions to receive VERIFIED.
        return {
            result,
            verification: {
                status: 'NOT_VERIFIABLE',
                verified: false,
                confidence: 0,
                evidence: [{ target: action, field: 'dispatch', expected: 'independent Studio read-back', actual: 'executed', matched: false, confidence: 0, timestamp: Date.now(), reason: 'No postconditions were supplied for an independent Studio observation.' }],
                mismatches: [{ field: 'read_back', expected: 'real Studio observation', actual: 'not requested', reason: 'Postconditions are required for VERIFIED status.' }],
                durationMs: 0,
                checkedConditionsCount: 1,
                passedConditionsCount: 0
            }
        };
    }
    // --- Internal DataModel Query Helpers ---
    async queryInstanceExistence(target) {
        if (!commandDispatcher.isStudioConnected())
            return false;
        try {
            const res = await commandDispatcher.executeCommand('instance_get_details', { path: target, target });
            return !!res && !res.error;
        }
        catch {
            return false;
        }
    }
    async queryInstanceMeta(target) {
        if (!commandDispatcher.isStudioConnected())
            return null;
        try {
            const res = await commandDispatcher.executeCommand('instance_get_details', { path: target, target });
            if (res && !res.error) {
                return { className: res.className || res.ClassName, parent: res.parent || res.Parent };
            }
        }
        catch { }
        return null;
    }
    async queryProperty(target, property) {
        if (!commandDispatcher.isStudioConnected())
            return null;
        try {
            const res = await commandDispatcher.executeCommand('property_get', { target, property });
            return res?.value ?? res;
        }
        catch {
            return null;
        }
    }
    async queryAttribute(target, attribute) {
        if (!commandDispatcher.isStudioConnected())
            return null;
        try {
            const res = await commandDispatcher.executeCommand('attribute_get', { path: target, attribute, target });
            return res?.value ?? res;
        }
        catch {
            return null;
        }
    }
    async queryHasTag(target, tag) {
        if (!commandDispatcher.isStudioConnected())
            return false;
        try {
            const res = await commandDispatcher.executeCommand('tag_get_all', { path: target, target });
            if (Array.isArray(res))
                return res.includes(tag);
            if (res?.tags && Array.isArray(res.tags))
                return res.tags.includes(tag);
        }
        catch { }
        return false;
    }
    async queryScriptSource(target) {
        if (!commandDispatcher.isStudioConnected())
            return null;
        try {
            const res = await commandDispatcher.executeCommand('script_get_source', { path: target, target });
            return typeof res === 'string' ? res : (res?.source || null);
        }
        catch {
            return null;
        }
    }
    compareValues(expected, actual, tolerance = 0.001) {
        if (expected === actual)
            return true;
        if (typeof expected === 'number' && typeof actual === 'number') {
            return Math.abs(expected - actual) <= tolerance;
        }
        return JSON.stringify(expected) === JSON.stringify(actual);
    }
}
export const verificationEngine = new VerificationEngine();
//# sourceMappingURL=VerificationEngine.js.map