import { FocusedScriptContext, StateDelta, TokenOptimizationMetrics } from './types.js';
import { ObservationCost } from '../providers/types.js';

export class ContextCompressor {
    private metrics: TokenOptimizationMetrics = {
        totalTokensSavedEstimate: 0,
        cacheHits: 0,
        compressedObservationsCount: 0
    };

    /**
     * Extracts a focused snippet of code around a target function or symbol instead of sending full 2000 lines.
     */
    public extractFocusedScriptContext(source: string, targetSymbol?: string, scriptPath = 'Script', windowSize = 25): FocusedScriptContext {
        const lines = source.split('\n');
        const totalLines = lines.length;

        if (!targetSymbol || totalLines <= windowSize) {
            return {
                scriptPath,
                targetSymbol,
                startLine: 1,
                endLine: totalLines,
                snippet: source,
                totalLines
            };
        }

        // Find line containing targetSymbol
        let matchIndex = -1;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(targetSymbol)) {
                matchIndex = i;
                break;
            }
        }

        if (matchIndex === -1) {
            // Return first windowSize lines
            const snippet = lines.slice(0, windowSize).join('\n') + `\n-- ... [${totalLines - windowSize} lines truncated for token efficiency]`;
            this.metrics.totalTokensSavedEstimate += Math.max(0, (totalLines - windowSize) * 8);
            return {
                scriptPath,
                targetSymbol,
                startLine: 1,
                endLine: windowSize,
                snippet,
                totalLines
            };
        }

        const half = Math.floor(windowSize / 2);
        const start = Math.max(0, matchIndex - half);
        const end = Math.min(totalLines, matchIndex + half);

        const snippet = (start > 0 ? `-- ... [${start} lines above]\n` : '') +
            lines.slice(start, end).join('\n') +
            (end < totalLines ? `\n-- ... [${totalLines - end} lines below]` : '');

        const tokensSaved = (totalLines - (end - start)) * 8;
        this.metrics.totalTokensSavedEstimate += Math.max(0, tokensSaved);
        this.metrics.compressedObservationsCount++;

        return {
            scriptPath,
            targetSymbol,
            startLine: start + 1,
            endLine: end,
            snippet,
            totalLines
        };
    }

    /**
     * Filters DataModel hierarchy according to ObservationCost level.
     */
    public compressObservation(data: Record<string, any>, cost: ObservationCost): Record<string, any> {
        switch (cost) {
            case ObservationCost.CHEAP:
                // Only return names and counts
                return {
                    summary: 'CHEAP_OBSERVATION',
                    keys: Object.keys(data),
                    childCount: data.children?.length || (Array.isArray(data) ? data.length : Object.keys(data).length)
                };

            case ObservationCost.NORMAL:
                // Return top-level objects without recursive deep properties
                if (Array.isArray(data)) {
                    return data.slice(0, 20).map(item => ({ name: item.name, className: item.className }));
                }
                return { ...data, properties: undefined };

            case ObservationCost.DEEP:
            case ObservationCost.VISUAL:
            case ObservationCost.FULL:
            default:
                return data;
        }
    }

    public getMetrics(): TokenOptimizationMetrics {
        return { ...this.metrics };
    }
}

export const contextCompressor = new ContextCompressor();
