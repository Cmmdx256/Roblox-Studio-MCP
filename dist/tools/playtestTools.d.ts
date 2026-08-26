import { z } from 'zod';
export declare const playtestTools: {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        studio_id: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        studio_id?: string | undefined;
    }, {
        studio_id?: string | undefined;
    }>;
    handler: (args: any) => Promise<import("../providers/types.js").ExecutionResult>;
}[];
//# sourceMappingURL=playtestTools.d.ts.map