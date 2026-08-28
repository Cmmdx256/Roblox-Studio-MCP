import { designerBrain, GameDesignSpec } from './DesignerBrain.js';

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

export class IntentEngine {
    /**
     * Parses natural language user prompt into a structured technical intent specification.
     * Uses DesignerBrain to synthesize gameplay, data, networking, UI, animation, and world requirements across any genre.
     */
    public parseIntent(prompt: string): StructuredIntent {
        const spec = designerBrain.createGameDesignSpec(prompt);
        const requirements: StructuredRequirement[] = [];
        const requiredSubsystems: string[] = [];
        let reqIndex = 1;

        // 1. Data Requirements
        if (spec.economy && spec.economy.itemCatalog.length > 0) {
            requirements.push({
                id: `REQ-${String(reqIndex++).padStart(3, '0')}`,
                category: 'DATA',
                type: 'MODULE',
                title: `${spec.identity.theme} Item Data Catalog`,
                description: `Authoritative definition table containing ${spec.economy.itemCatalog.length} item definitions with IDs, rarities, and individual values.`,
                priority: 'MUST_HAVE',
                targetPath: 'ReplicatedStorage.Shared.ItemData',
                serverAuthoritative: true
            });
            requiredSubsystems.push('ItemData');
        }

        // 2. Systems Requirements
        for (const sys of spec.systems) {
            let cat: StructuredRequirement['category'] = 'GAMEPLAY';
            let reqType: StructuredRequirement['type'] = 'SCRIPT';

            if (sys.type === 'RemoteEvent' || sys.type === 'RemoteFunction') {
                cat = 'NETWORKING';
                reqType = 'REMOTE';
            } else if (sys.type === 'ModuleScript') {
                cat = 'DATA';
                reqType = 'MODULE';
            }

            requirements.push({
                id: `REQ-${String(reqIndex++).padStart(3, '0')}`,
                category: cat,
                type: reqType,
                title: sys.name,
                description: sys.responsibilities.join('; '),
                priority: 'MUST_HAVE',
                targetPath: sys.path,
                serverAuthoritative: sys.type.startsWith('Server') || sys.type === 'RemoteEvent'
            });
            requiredSubsystems.push(sys.name);
        }

        // 3. UI Requirements
        for (const screen of spec.ui.screens) {
            requirements.push({
                id: `REQ-${String(reqIndex++).padStart(3, '0')}`,
                category: 'UI',
                type: 'UI',
                title: screen.screenName,
                description: `${screen.purpose} (Layout: ${screen.layout}, Theme: ${screen.theme})`,
                priority: 'MUST_HAVE',
                targetPath: `StarterGui.${screen.screenName}`,
                serverAuthoritative: false
            });
            requiredSubsystems.push(screen.screenName);
        }

        // 4. Animation Requirements
        if (spec.animation.cues.length > 0) {
            const primaryCue = spec.animation.cues.find(c => c.priority === 'Action' || c.priority === 'ActionPriority') || spec.animation.cues[0];
            requirements.push({
                id: `REQ-${String(reqIndex++).padStart(3, '0')}`,
                category: 'ANIMATION',
                type: 'ANIMATION',
                title: `${primaryCue.name} Controller`,
                description: `Calibrated character animation sequence: ${primaryCue.characterAction}`,
                priority: 'SHOULD_HAVE',
                targetPath: 'StarterPlayer.StarterPlayerScripts.AnimationController',
                serverAuthoritative: false
            });
            requiredSubsystems.push('AnimationController');
        }

        // 5. World & Environment Requirement
        if (spec.world.zones.length > 0) {
            requirements.push({
                id: `REQ-${String(reqIndex++).padStart(3, '0')}`,
                category: 'ENVIRONMENT',
                type: 'WORLD',
                title: `${spec.world.zones[0].name} Layout`,
                description: `Spatial layout for ${spec.world.zones.length} zone(s) with ${spec.world.spatialPacing} pacing and ${spec.world.atmosphere.timeOfDay} time-of-day.`,
                priority: 'SHOULD_HAVE',
                targetPath: 'Workspace.WorldZones',
                serverAuthoritative: true
            });
            requiredSubsystems.push('WorldLayout');
        }

        const constraints: string[] = [
            'Server-authoritative economy and state verification with zero client trust for transactions',
            'Multiplayer safe: isolation between distinct player sessions to prevent race conditions',
            'Idempotent creation: check and reuse existing instances without duplicate generation'
        ];

        const assumptions: string[] = [
            `Target audience: ${spec.identity.targetAudience}`,
            `Tone: ${spec.identity.tone}`,
            `Spatial Pacing: ${spec.world.spatialPacing}`
        ];

        const domainTitle = `${spec.identity.theme} ${spec.identity.genre}`;

        return {
            rawPrompt: prompt,
            domain: domainTitle,
            summary: `Technical Specification for: ${domainTitle}`,
            requirements,
            constraints,
            assumptions,
            requiredSubsystems,
            suggestedTheme: spec.ui.themeId,
            designSpec: spec
        };
    }
}

export const intentEngine = new IntentEngine();
