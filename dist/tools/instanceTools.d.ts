import { z } from 'zod';
export declare const instanceTools: ({
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        className: z.ZodString;
        parent: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        attributes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        className: string;
        parent: string;
        name?: string | undefined;
        properties?: Record<string, any> | undefined;
        attributes?: Record<string, any> | undefined;
        tags?: string[] | undefined;
    }, {
        className: string;
        parent: string;
        name?: string | undefined;
        properties?: Record<string, any> | undefined;
        attributes?: Record<string, any> | undefined;
        tags?: string[] | undefined;
    }>;
    handler: (args: any) => Promise<any>;
} | {
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
        newParent: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        target: string;
        newParent: string;
    }, {
        target: string;
        newParent: string;
    }>;
    handler: (args: {
        target: string;
        newParent: string;
    }) => Promise<any>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        target: z.ZodString;
        newName: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        target: string;
        newName: string;
    }, {
        target: string;
        newName: string;
    }>;
    handler: (args: {
        target: string;
        newName: string;
    }) => Promise<any>;
})[];
//# sourceMappingURL=instanceTools.d.ts.map