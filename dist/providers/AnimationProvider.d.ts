import { ExecutionResult, HealthStatus, ProviderCapability, ProviderToolDefinition, ProviderType } from './types.js';
import { IProvider } from './IProvider.js';
export declare class AnimationProvider implements IProvider {
    readonly name = "animation-provider";
    readonly type = ProviderType.ANIMATION;
    private cachedCapabilities;
    discover(): Promise<ProviderCapability[]>;
    initialize(): Promise<void>;
    healthCheck(): Promise<HealthStatus>;
    listTools(): Promise<ProviderToolDefinition[]>;
    getCapabilities(): Promise<ProviderCapability[]>;
    execute(action: string, params: Record<string, any>): Promise<ExecutionResult>;
    inspectAnimation(target: string): Promise<any>;
    createAnimation(name: string, animationId: string, parent?: string, priority?: string, looped?: boolean): Promise<ExecutionResult>;
    integrateAnimation(params: {
        characterOrRig: string;
        animationName: string;
        animationId: string;
        triggerEvent?: string;
        scriptType?: 'LocalScript' | 'Script';
    }): Promise<ExecutionResult>;
    validateAnimation(targetPath: string): Promise<{
        valid: boolean;
        errors: string[];
        warnings: string[];
    }>;
    planAnimationFromNL(naturalLanguagePrompt: string): Promise<{
        posePlan: any[];
        keyframePlan: any[];
        timing: any;
        priority: string;
    }>;
    shutdown(): Promise<void>;
}
export declare const animationProvider: AnimationProvider;
//# sourceMappingURL=AnimationProvider.d.ts.map