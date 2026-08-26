export interface MCPResourceDefinition {
    uri: string;
    name: string;
    description: string;
    mimeType: string;
    read: (uri: string) => Promise<string>;
}
export declare const projectResources: MCPResourceDefinition[];
export declare function readResourceByUri(uri: string): Promise<{
    contents: Array<{
        uri: string;
        mimeType: string;
        text: string;
    }>;
}>;
//# sourceMappingURL=projectResources.d.ts.map