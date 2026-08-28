import { GameDesignSpec } from './DesignerBrain.js';
export interface StructuredRequirement {
    id: string;
    category: 'GAMEPLAY' | 'DATA' | 'NETWORKING' | 'UI' | 'ANIMATION' | 'SECURITY' | 'ENVIRONMENT';
    title: string;
    description: string;
    priority: 'MUST_HAVE' | 'SHOULD_HAVE' | 'NICE_TO_HAVE';
    targetPath?: string;
    type?: 'SCRIPT' | 'MODULE' | 'REMOTE' | 'UI' | 'LOGIC' | 'ANIMATION' | 'WORLD';
    serverAuthoritative: boolean;
}
export interface StructuredIntent {
    rawPrompt: string;
    domain: string;
    summary: string;
    requirements: StructuredRequirement[];
    constraints: string[];
    assumptions: string[];
    requiredSubsystems: string[];
    suggestedTheme: string;
    designSpec?: GameDesignSpec;
}
export declare class IntentEngine {
    /**
     * Parses natural language user prompt into a structured technical intent specification.
     * Uses DesignerBrain to synthesize gameplay, data, networking, UI, animation, and world requirements across any genre.
     */
    parseIntent(prompt: string): StructuredIntent;
}
export declare const intentEngine: IntentEngine;
//# sourceMappingURL=IntentEngine.d.ts.map