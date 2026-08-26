import { z } from 'zod';
export declare const batchTools: {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        transactionName: z.ZodDefault<z.ZodString>;
        stopOnError: z.ZodDefault<z.ZodBoolean>;
        operations: z.ZodArray<z.ZodObject<{
            action: z.ZodString;
            params: z.ZodRecord<z.ZodString, z.ZodAny>;
        }, "strip", z.ZodTypeAny, {
            action: string;
            params: Record<string, any>;
        }, {
            action: string;
            params: Record<string, any>;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        transactionName: string;
        stopOnError: boolean;
        operations: {
            action: string;
            params: Record<string, any>;
        }[];
    }, {
        operations: {
            action: string;
            params: Record<string, any>;
        }[];
        transactionName?: string | undefined;
        stopOnError?: boolean | undefined;
    }>;
    handler: (args: any) => Promise<any>;
}[];
//# sourceMappingURL=batchTools.d.ts.map