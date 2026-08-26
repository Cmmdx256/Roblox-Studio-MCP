import { z } from 'zod';
export declare const outputTools: ({
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        limit: z.ZodDefault<z.ZodNumber>;
        filterType: z.ZodOptional<z.ZodEnum<["MessageOutput", "MessageInfo", "MessageWarning", "MessageError"]>>;
        query: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        limit: number;
        query?: string | undefined;
        filterType?: "MessageOutput" | "MessageInfo" | "MessageWarning" | "MessageError" | undefined;
    }, {
        query?: string | undefined;
        limit?: number | undefined;
        filterType?: "MessageOutput" | "MessageInfo" | "MessageWarning" | "MessageError" | undefined;
    }>;
    handler: (args: {
        limit?: number;
        filterType?: string;
        query?: string;
    }) => Promise<{
        count: number;
        logs: import("../types/rpc.js").StudioLogEntry[];
    }>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        limit: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        limit: number;
    }, {
        limit?: number | undefined;
    }>;
    handler: (args: {
        limit?: number;
    }) => Promise<{
        count: number;
        errors: import("../types/rpc.js").StudioLogEntry[];
    }>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
    handler: () => Promise<{
        success: boolean;
        message: string;
    }>;
})[];
//# sourceMappingURL=outputTools.d.ts.map