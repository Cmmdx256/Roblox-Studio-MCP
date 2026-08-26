import { z } from 'zod';
export declare const propertyTools: ({
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        target: z.ZodString;
        property: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        target: string;
        property: string;
    }, {
        target: string;
        property: string;
    }>;
    handler: (args: {
        target: string;
        property: string;
    }) => Promise<any>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        target: z.ZodString;
        property: z.ZodString;
        value: z.ZodAny;
    }, "strip", z.ZodTypeAny, {
        target: string;
        property: string;
        value?: any;
    }, {
        target: string;
        property: string;
        value?: any;
    }>;
    handler: (args: {
        target: string;
        property: string;
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
//# sourceMappingURL=propertyTools.d.ts.map