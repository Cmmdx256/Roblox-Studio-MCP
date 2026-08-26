export interface ProjectComprehension {
    placeId: number | string;
    placeName: string;
    servicesDetected: string[];
    systemsDetected: string[];
    scriptsCount: number;
    remotesCount: number;
    conventionsSummary: string;
    architectureType: 'Modular' | 'Monolithic' | 'FrameworkBased' | 'Standard';
}
export declare class ProjectUnderstandingEngine {
    /**
     * Conducts comprehensive structural scan of the active Roblox place.
     */
    analyzeProject(): Promise<ProjectComprehension>;
}
export declare const projectUnderstandingEngine: ProjectUnderstandingEngine;
//# sourceMappingURL=ProjectUnderstandingEngine.d.ts.map