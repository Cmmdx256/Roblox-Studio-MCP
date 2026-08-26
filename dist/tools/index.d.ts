export interface MCPToolDefinition {
    name: string;
    description: string;
    inputSchema: any;
    handler: (args: any) => Promise<any>;
}
export declare const allTools: MCPToolDefinition[];
export declare const toolMap: Map<string, MCPToolDefinition>;
//# sourceMappingURL=index.d.ts.map