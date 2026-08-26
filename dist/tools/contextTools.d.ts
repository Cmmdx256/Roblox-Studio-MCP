import { z } from 'zod';
export declare const contextTools: ({
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        maxDepth: z.ZodDefault<z.ZodNumber>;
        includeScriptSummaries: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        maxDepth: number;
        includeScriptSummaries: boolean;
    }, {
        maxDepth?: number | undefined;
        includeScriptSummaries?: boolean | undefined;
    }>;
    handler: (args: any) => Promise<any>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
    handler: () => Promise<any>;
})[];
//# sourceMappingURL=contextTools.d.ts.map