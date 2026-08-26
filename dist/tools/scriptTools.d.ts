import { z } from 'zod';
export declare const scriptTools: ({
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        target: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        target: string;
    }, {
        target: string;
    }>;
    handler: (args: {
        target: string;
    }) => Promise<any>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        target: z.ZodString;
        source: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        target: string;
        source: string;
    }, {
        target: string;
        source: string;
    }>;
    handler: (args: {
        target: string;
        source: string;
    }) => Promise<any>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        target: z.ZodString;
        search: z.ZodString;
        replacement: z.ZodString;
        isRegex: z.ZodDefault<z.ZodBoolean>;
        allowMultiple: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        target: string;
        search: string;
        replacement: string;
        isRegex: boolean;
        allowMultiple: boolean;
    }, {
        target: string;
        search: string;
        replacement: string;
        isRegex?: boolean | undefined;
        allowMultiple?: boolean | undefined;
    }>;
    handler: (args: {
        target: string;
        search: string;
        replacement: string;
        isRegex?: boolean;
        allowMultiple?: boolean;
    }) => Promise<any>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        query: z.ZodString;
        caseSensitive: z.ZodDefault<z.ZodBoolean>;
        isRegex: z.ZodDefault<z.ZodBoolean>;
        scope: z.ZodDefault<z.ZodString>;
        maxResults: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        query: string;
        scope: string;
        isRegex: boolean;
        caseSensitive: boolean;
        maxResults: number;
    }, {
        query: string;
        scope?: string | undefined;
        isRegex?: boolean | undefined;
        caseSensitive?: boolean | undefined;
        maxResults?: number | undefined;
    }>;
    handler: (args: any) => Promise<any>;
})[];
//# sourceMappingURL=scriptTools.d.ts.map