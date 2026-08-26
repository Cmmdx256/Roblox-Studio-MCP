import { ToolIndex, toolIndex } from './ToolIndex.js';
import { ToolIndexEntry } from './types.js';

export class SmartToolSelector {
    private index: ToolIndex;

    constructor(index: ToolIndex = toolIndex) {
        this.index = index;
    }

    /**
     * Selects a focused, token-efficient subset of tools relevant to a task prompt.
     */
    public selectRelevantTools(prompt: string, maxTools = 12): ToolIndexEntry[] {
        const lowerPrompt = prompt.toLowerCase();
        const scoredTools = new Map<string, number>();

        // Domain Intent Heuristics
        const domainPatterns: Array<{ keywords: string[]; categoryBoost: string; score: number }> = [
            { keywords: ['anim', 'pose', 'character', 'dance', 'walk', 'rig', 'motor6d'], categoryBoost: 'animation', score: 10 },
            { keywords: ['mesh', 'model', 'part', 'geometry', 'build', '3d', 'scale'], categoryBoost: 'modeling', score: 10 },
            { keywords: ['script', 'code', 'function', 'luau', 'remote', 'event', 'bug', 'error'], categoryBoost: 'scripting', score: 10 },
            { keywords: ['terrain', 'water', 'mountain', 'sand', 'grass', 'voxel'], categoryBoost: 'terrain', score: 10 },
            { keywords: ['test', 'play', 'run', 'simulate', 'input', 'player'], categoryBoost: 'playtest', score: 10 },
            { keywords: ['asset', 'image', 'sound', 'texture', 'marketplace'], categoryBoost: 'assets', score: 10 },
            { keywords: ['ui', 'gui', 'screen', 'button', 'frame', 'hud'], categoryBoost: 'ui', score: 10 },
            { keywords: ['debug', 'fix', 'diagnose', 'repair', 'stack', 'trace'], categoryBoost: 'diagnostics', score: 10 }
        ];

        // Always include core studio inspection primitives
        const coreTools = ['studio_info', 'studio_inspect', 'studio_search', 'studio_get_tree'];
        for (const name of coreTools) {
            scoredTools.set(name, 5);
        }

        // Apply domain boosts
        for (const pattern of domainPatterns) {
            const matches = pattern.keywords.some(kw => lowerPrompt.includes(kw));
            if (matches) {
                const categoryTools = this.index.getByCategory(pattern.categoryBoost);
                for (const tool of categoryTools) {
                    const current = scoredTools.get(tool.name) || 0;
                    scoredTools.set(tool.name, current + pattern.score);
                }
            }
        }

        // Tokenized prompt word matching against keyword index
        const words = lowerPrompt.split(/\s+/).filter(w => w.length > 3);
        for (const word of words) {
            const matched = this.index.searchByKeyword(word);
            for (const tool of matched) {
                const current = scoredTools.get(tool.name) || 0;
                scoredTools.set(tool.name, current + 3);
            }
        }

        // Sort by score descending
        const allEntries = this.index.getAll();
        const sorted = allEntries
            .map(entry => ({ entry, score: scoredTools.get(entry.name) || 0 }))
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, maxTools)
            .map(item => item.entry);

        // Fallback: If no specialized match, return baseline studio and instance tools
        if (sorted.length < 4) {
            const baseline = allEntries.filter(e => 
                e.category === 'studio' || e.category === 'instance' || e.category === 'property'
            ).slice(0, maxTools);
            return baseline.length > 0 ? baseline : allEntries.slice(0, maxTools);
        }

        return sorted;
    }
}

export const smartToolSelector = new SmartToolSelector();
