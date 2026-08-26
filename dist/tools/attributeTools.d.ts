import { z } from 'zod';
export declare const attributeTools: ({
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        target: z.ZodString;
        attributeName: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        attributeName: string;
        target: string;
    }, {
        attributeName: string;
        target: string;
    }>;
    handler: (args: {
        target: string;
        attributeName: string;
    }) => Promise<any>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        target: z.ZodString;
        attributeName: z.ZodString;
        value: z.ZodAny;
    }, "strip", z.ZodTypeAny, {
        attributeName: string;
        target: string;
        value?: any;
    }, {
        attributeName: string;
        target: string;
        value?: any;
    }>;
    handler: (args: {
        target: string;
        attributeName: string;
        value: any;
    }) => Promise<any>;
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
})[];
//# sourceMappingURL=attributeTools.d.ts.map