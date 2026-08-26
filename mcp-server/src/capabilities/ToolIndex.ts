import { ExecutionContext, RiskLevel, SecurityLevel } from '../providers/types.js';
import { ToolIndexEntry } from './types.js';

export class ToolIndex {
    private entries = new Map<string, ToolIndexEntry>();
    private categoryMap = new Map<string, Set<string>>();
    private keywordMap = new Map<string, Set<string>>();

    public indexTool(entry: ToolIndexEntry): void {
        this.entries.set(entry.name, entry);

        // Category index
        if (!this.categoryMap.has(entry.category)) {
            this.categoryMap.set(entry.category, new Set());
        }
        this.categoryMap.get(entry.category)!.add(entry.name);

        // Keyword index
        const allKeywords = [
            ...entry.keywords,
            ...entry.name.toLowerCase().split(/[._-]/),
            entry.category.toLowerCase()
        ];

        for (const kw of allKeywords) {
            const cleanKw = kw.trim();
            if (cleanKw.length > 2) {
                if (!this.keywordMap.has(cleanKw)) {
                    this.keywordMap.set(cleanKw, new Set());
                }
                this.keywordMap.get(cleanKw)!.add(entry.name);
            }
        }
    }

    public searchByKeyword(keyword: string): ToolIndexEntry[] {
        const lower = keyword.toLowerCase();
        const matchedNames = new Set<string>();

        for (const [kw, names] of this.keywordMap.entries()) {
            if (kw.includes(lower) || lower.includes(kw)) {
                for (const n of names) matchedNames.add(n);
            }
        }

        return Array.from(matchedNames)
            .map(name => this.entries.get(name))
            .filter((e): e is ToolIndexEntry => e !== undefined);
    }

    public getByCategory(category: string): ToolIndexEntry[] {
        const names = this.categoryMap.get(category);
        if (!names) return [];
        return Array.from(names)
            .map(name => this.entries.get(name))
            .filter((e): e is ToolIndexEntry => e !== undefined);
    }

    public getAll(): ToolIndexEntry[] {
        return Array.from(this.entries.values());
    }

    public size(): number {
        return this.entries.size;
    }
}

export const toolIndex = new ToolIndex();
