import { z } from 'zod';
export declare const terrainTools: ({
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        cframe: z.ZodArray<z.ZodNumber, "many">;
        size: z.ZodArray<z.ZodNumber, "many">;
        material: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        cframe: number[];
        size: number[];
        material: string;
    }, {
        cframe: number[];
        size: number[];
        material: string;
    }>;
    handler: (args: any) => Promise<any>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        center: z.ZodArray<z.ZodNumber, "many">;
        radius: z.ZodNumber;
        material: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        material: string;
        center: number[];
        radius: number;
    }, {
        material: string;
        center: number[];
        radius: number;
    }>;
    handler: (args: any) => Promise<any>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        region: z.ZodOptional<z.ZodObject<{
            min: z.ZodArray<z.ZodNumber, "many">;
            max: z.ZodArray<z.ZodNumber, "many">;
        }, "strip", z.ZodTypeAny, {
            min: number[];
            max: number[];
        }, {
            min: number[];
            max: number[];
        }>>;
    }, "strip", z.ZodTypeAny, {
        region?: {
            min: number[];
            max: number[];
        } | undefined;
    }, {
        region?: {
            min: number[];
            max: number[];
        } | undefined;
    }>;
    handler: (args: any) => Promise<any>;
})[];
//# sourceMappingURL=terrainTools.d.ts.map