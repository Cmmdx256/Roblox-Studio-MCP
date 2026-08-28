import { commandDispatcher } from '../dispatcher/commandDispatcher.js';
/**
 * IdempotencyGuard
 * Guarantees that repeating an operation in an autonomous loop does not duplicate entities
 * or corrupt script sources.
 */
export class IdempotencyGuard {
    /**
     * Checks whether an action (like instance creation or script patching) is already satisfied in DataModel.
     */
    async evaluateAction(action, params) {
        // 1. Instance Creation Idempotency (e.g. creating Folder or Model with same name under same parent)
        if (action === 'instance_create') {
            const parent = params.parent || params.parentPath || 'Workspace';
            const name = params.name || params.className;
            const targetPath = `${parent}.${name}`;
            if (commandDispatcher.isStudioConnected()) {
                try {
                    const existing = await commandDispatcher.executeCommand('instance_get_details', { path: targetPath, target: targetPath });
                    if (existing && !existing.error) {
                        return {
                            isAlreadySatisfied: true,
                            mode: 'SAFE',
                            existingInstancePath: targetPath,
                            actionAdvice: 'REUSE_EXISTING',
                            reason: `Instance ${targetPath} already exists in DataModel. Reusing existing instance to maintain idempotency.`
                        };
                    }
                }
                catch { }
            }
        }
        // 2. Script Patch Idempotency (e.g. search pattern already replaced by replacement)
        if (action === 'script_patch_source' || action === 'script_patch') {
            const path = params.path || params.target;
            const search = params.search;
            const replacement = params.replacement;
            if (commandDispatcher.isStudioConnected()) {
                try {
                    const res = await commandDispatcher.executeCommand('script_get_source', { path, target: path });
                    const src = typeof res === 'string' ? res : (res?.source || '');
                    if (replacement && src.includes(replacement) && (!search || !src.includes(search))) {
                        return {
                            isAlreadySatisfied: true,
                            mode: 'REPEATABLE',
                            existingInstancePath: path,
                            actionAdvice: 'SKIP',
                            reason: `Target script ${path} already contains the replacement content and lacks the search target. Skipping duplicate patch.`
                        };
                    }
                }
                catch { }
            }
        }
        // 3. Property & Attribute Set Idempotency
        if (action === 'property_set' || action === 'attribute_set') {
            const path = params.path || params.target;
            const key = params.property || params.attribute || params.name;
            const val = params.value;
            if (commandDispatcher.isStudioConnected()) {
                try {
                    const getterAction = action === 'property_set' ? 'property_get' : 'attribute_get';
                    const current = await commandDispatcher.executeCommand(getterAction, { path, [action === 'property_set' ? 'property' : 'attribute']: key });
                    const actualVal = current?.value !== undefined ? current.value : current;
                    if (JSON.stringify(actualVal) === JSON.stringify(val)) {
                        return {
                            isAlreadySatisfied: true,
                            mode: 'SAFE',
                            existingInstancePath: path,
                            actionAdvice: 'SKIP',
                            reason: `Property/Attribute ${key} on ${path} already has value ${JSON.stringify(val)}.`
                        };
                    }
                }
                catch { }
            }
        }
        // Default: Proceed with execution
        return {
            isAlreadySatisfied: false,
            mode: 'REPEATABLE',
            actionAdvice: 'EXECUTE',
            reason: 'State mutation required.'
        };
    }
}
export const idempotencyGuard = new IdempotencyGuard();
//# sourceMappingURL=IdempotencyGuard.js.map