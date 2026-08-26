import { z } from 'zod';
export declare const studioTools: ({
    name: string;
    description: string;
    inputSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
    handler: () => Promise<{
        connected: boolean;
        message: string;
        session?: undefined;
        studioData?: undefined;
        error?: undefined;
    } | {
        connected: boolean;
        session: import("../types/rpc.js").StudioSessionInfo;
        studioData: any;
        message?: undefined;
        error?: undefined;
    } | {
        connected: boolean;
        session: import("../types/rpc.js").StudioSessionInfo;
        error: unknown;
        message?: undefined;
        studioData?: undefined;
    }>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        root: z.ZodDefault<z.ZodString>;
        depth: z.ZodDefault<z.ZodNumber>;
        includeProperties: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        classNameFilter: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        maxItems: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        root: string;
        depth: number;
        maxItems: number;
        includeProperties?: string[] | undefined;
        classNameFilter?: string[] | undefined;
    }, {
        root?: string | undefined;
        depth?: number | undefined;
        includeProperties?: string[] | undefined;
        classNameFilter?: string[] | undefined;
        maxItems?: number | undefined;
    }>;
    handler: (args: {
        root?: string;
        depth?: number;
        includeProperties?: string[];
        classNameFilter?: string[];
        maxItems?: number;
    }) => Promise<any>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        query: z.ZodOptional<z.ZodString>;
        className: z.ZodOptional<z.ZodString>;
        tag: z.ZodOptional<z.ZodString>;
        scope: z.ZodDefault<z.ZodString>;
        attributeName: z.ZodOptional<z.ZodString>;
        attributeValue: z.ZodOptional<z.ZodAny>;
        limit: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        scope: string;
        limit: number;
        query?: string | undefined;
        className?: string | undefined;
        tag?: string | undefined;
        attributeName?: string | undefined;
        attributeValue?: any;
    }, {
        query?: string | undefined;
        className?: string | undefined;
        tag?: string | undefined;
        scope?: string | undefined;
        attributeName?: string | undefined;
        attributeValue?: any;
        limit?: number | undefined;
    }>;
    handler: (args: any) => Promise<any>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        target: z.ZodString;
        includeChildren: z.ZodDefault<z.ZodBoolean>;
        includeScriptSourceSnippet: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        target: string;
        includeChildren: boolean;
        includeScriptSourceSnippet: boolean;
    }, {
        target: string;
        includeChildren?: boolean | undefined;
        includeScriptSourceSnippet?: boolean | undefined;
    }>;
    handler: (args: {
        target: string;
        includeChildren?: boolean;
        includeScriptSourceSnippet?: boolean;
    }) => Promise<any>;
})[];
//# sourceMappingURL=studioTools.d.ts.map