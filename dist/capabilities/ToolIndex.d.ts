import { ToolIndexEntry } from './types.js';
export declare class ToolIndex {
    private entries;
    private categoryMap;
    private keywordMap;
    indexTool(entry: ToolIndexEntry): void;
    searchByKeyword(keyword: string): ToolIndexEntry[];
    getByCategory(category: string): ToolIndexEntry[];
    getAll(): ToolIndexEntry[];
    size(): number;
}
export declare const toolIndex: ToolIndex;
//# sourceMappingURL=ToolIndex.d.ts.map