import { z } from 'zod';
export declare const selectionTools: ({
    name: string;
    description: string;
    inputSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
    handler: () => Promise<any>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        targets: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        targets: string[];
    }, {
        targets: string[];
    }>;
    handler: (args: {
        targets: string[];
    }) => Promise<any>;
})[];
//# sourceMappingURL=selectionTools.d.ts.map