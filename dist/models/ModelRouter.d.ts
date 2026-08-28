import { ModelProfile, ModelRoutingDecision } from './types.js';
export declare const DEFAULT_MODEL_PROFILES: ModelProfile[];
export declare class ModelRouter {
    private profiles;
    private manualOverrideModelId?;
    constructor(initialProfiles?: ModelProfile[]);
    registerProfile(profile: ModelProfile): void;
    getProfile(id: string): ModelProfile | undefined;
    getAllProfiles(): ModelProfile[];
    setManualOverride(modelId?: string): void;
    /**
     * Determines the optimal model profile for a given task intent based on complexity,
     * required capabilities, latency, and cost trade-offs.
     */
    routeTask(intent: string, hints?: {
        requiresVision?: boolean;
        isArchitecturePlanning?: boolean;
        isSimpleProperty?: boolean;
    }): ModelRoutingDecision;
}
export declare const modelRouter: ModelRouter;
//# sourceMappingURL=ModelRouter.d.ts.map