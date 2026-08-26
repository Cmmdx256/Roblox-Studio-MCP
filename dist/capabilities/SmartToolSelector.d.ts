import { ToolIndex } from './ToolIndex.js';
import { ToolIndexEntry } from './types.js';
export declare class SmartToolSelector {
    private index;
    constructor(index?: ToolIndex);
    /**
     * Selects a focused, token-efficient subset of tools relevant to a task prompt.
     */
    selectRelevantTools(prompt: string, maxTools?: number): ToolIndexEntry[];
}
export declare const smartToolSelector: SmartToolSelector;
//# sourceMappingURL=SmartToolSelector.d.ts.map