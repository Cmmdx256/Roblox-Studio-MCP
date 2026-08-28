export interface ArchitectureAuditReport {
    framework: 'Knit' | 'Nevermore' | 'Flamework' | 'Vanilla' | 'Custom';
    confidence: number;
    serverClientSeparationValid: boolean;
    sharedModulesPath: string;
    remotesPath: string;
    servicesFound: string[];
    controllersFound: string[];
    potentialLeaks: string[];
    recommendations: string[];
}
export declare class CodeArchitectureEngine {
    /**
     * Inspects project hierarchy and scripts to identify underlying framework and architectural patterns.
     */
    auditArchitecture(knownPaths?: string[]): ArchitectureAuditReport;
}
export declare const codeArchitectureEngine: CodeArchitectureEngine;
//# sourceMappingURL=CodeArchitectureEngine.d.ts.map