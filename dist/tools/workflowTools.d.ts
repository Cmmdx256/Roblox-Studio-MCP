import { z } from 'zod';
export declare const workflowTools: ({
    name: string;
    description: string;
    inputSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
    handler: () => Promise<any>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        maxDepth: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        maxDepth: number;
    }, {
        maxDepth?: number | undefined;
    }>;
    handler: (args: any) => Promise<any>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        fixPhysics: z.ZodDefault<z.ZodBoolean>;
        cleanOrphans: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        fixPhysics: boolean;
        cleanOrphans: boolean;
    }, {
        fixPhysics?: boolean | undefined;
        cleanOrphans?: boolean | undefined;
    }>;
    handler: (args: any) => Promise<any>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        systemName: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        systemName: string;
    }, {
        systemName: string;
    }>;
    handler: (args: any) => Promise<any>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        fixUnanchored: z.ZodOptional<z.ZodBoolean>;
        organizeLooseParts: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        fixUnanchored?: boolean | undefined;
        organizeLooseParts?: boolean | undefined;
    }, {
        fixUnanchored?: boolean | undefined;
        organizeLooseParts?: boolean | undefined;
    }>;
    handler: (args: any) => Promise<any>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        errorQuery: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        errorQuery?: string | undefined;
    }, {
        errorQuery?: string | undefined;
    }>;
    handler: (args: any) => Promise<any>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        scriptPath: z.ZodString;
        errorLine: z.ZodNumber;
        errorMessage: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        scriptPath: string;
        errorLine: number;
        errorMessage: string;
    }, {
        scriptPath: string;
        errorLine: number;
        errorMessage: string;
    }>;
    handler: (args: any) => Promise<any>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        goal: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        goal: string;
    }, {
        goal: string;
    }>;
    handler: (args: any) => Promise<any>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        featureName: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        featureName: string;
    }, {
        featureName: string;
    }>;
    handler: (args: any) => Promise<any>;
})[];
//# sourceMappingURL=workflowTools.d.ts.map