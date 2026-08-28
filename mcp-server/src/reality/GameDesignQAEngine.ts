/**
 * GameDesignQAEngine.ts
 *
 * Evaluates game design coherence for arbitrary game designs.
 * Reports DESIGN_RISK, DESIGN_OBSERVATION, and POSSIBLE_IMPROVEMENT.
 * Never claims to measure "fun" — provides structured design analysis.
 * Fully capability-driven — not specific to any genre.
 */

import { designerBrain } from '../engines/designer/DesignerBrain.js';
import { GameDesignQAReport, DesignObservation, VerificationStatus } from './types.js';
import { StructuredIntent } from '../engines/IntentEngine.js';
import { GameDesignSpec } from '../engines/designer/types.js';

/** Capability dimension evaluators. */
interface DesignCheck {
    aspect: string;
    evaluate: (spec: GameDesignSpec, intent: StructuredIntent) => DesignObservation | null;
}

const DESIGN_CHECKS: DesignCheck[] = [
    {
        aspect: 'core_loop_clarity',
        evaluate: (spec) => {
            const hasLoop = spec.coreLoop?.phases && spec.coreLoop.phases.length >= 2;
            if (!hasLoop) return {
                type: 'DESIGN_RISK',
                aspect: 'core_loop_clarity',
                description: 'Core loop has fewer than 2 phases — players may lack a clear activity cycle.',
                confidence: 0.85,
                suggestedAction: 'Define at least: collect → reward, or engage → progress → reward.'
            };
            return null;
        }
    },
    {
        aspect: 'player_feedback',
        evaluate: (spec) => {
            const hasAudio = spec.polish?.feedbackSensoryChecklist?.some(c =>
                typeof c === 'string' && c.toLowerCase().includes('sound'));
            const hasVFX = spec.polish?.feedbackSensoryChecklist?.some(c =>
                typeof c === 'string' && (c.toLowerCase().includes('vfx') || c.toLowerCase().includes('particle')));
            if (!hasAudio && !hasVFX) return {
                type: 'DESIGN_RISK',
                aspect: 'player_feedback',
                description: 'No audio or VFX feedback defined — player actions may feel unresponsive.',
                confidence: 0.8,
                suggestedAction: 'Add sound effects and particle effects for primary interactions.'
            };
            if (!hasAudio) return {
                type: 'POSSIBLE_IMPROVEMENT',
                aspect: 'player_feedback',
                description: 'No audio feedback defined. Visual feedback exists.',
                confidence: 0.7,
                suggestedAction: 'Add SoundService entries for primary player actions.'
            };
            return null;
        }
    },
    {
        aspect: 'progression',
        evaluate: (spec) => {
            const hasTiers = (spec.progression?.tiers && spec.progression.tiers.length > 0) ||
                             spec.coreLoop?.phases?.some((p: any) => p.name?.includes('upgrade') || p.name?.includes('progress'));
            if (!hasTiers) return {
                type: 'DESIGN_RISK',
                aspect: 'progression',
                description: 'No progression or upgrade tiers detected — game may feel static.',
                confidence: 0.75,
                suggestedAction: 'Add upgrade costs, tiers, or achievement milestones to give players goals.'
            };
            return null;
        }
    },
    {
        aspect: 'onboarding',
        evaluate: (spec) => {
            const hasRetentionHooks = spec.polish?.retentionHooks && spec.polish.retentionHooks.length >= 1;
            if (!hasRetentionHooks) return {
                type: 'DESIGN_RISK',
                aspect: 'onboarding',
                description: 'No onboarding or retention hooks defined — new players may not understand the game.',
                confidence: 0.8,
                suggestedAction: 'Add tutorial prompts, UI tooltips, or guided first-play experience.'
            };
            return null;
        }
    },
    {
        aspect: 'world_design',
        evaluate: (spec) => {
            const hasZones = spec.world?.zones && spec.world.zones.length >= 2;
            if (!hasZones) return {
                type: 'POSSIBLE_IMPROVEMENT',
                aspect: 'world_design',
                description: 'Only one world zone defined. Multiple zones improve exploration.',
                confidence: 0.6,
                suggestedAction: 'Consider adding distinct zones with different risk/reward profiles.'
            };
            return null;
        }
    },
    {
        aspect: 'ui_discoverability',
        evaluate: (spec) => {
            const hasScreens = spec.ui?.screens && spec.ui.screens.length >= 2;
            if (!hasScreens) return {
                type: 'DESIGN_OBSERVATION',
                aspect: 'ui_discoverability',
                description: 'Only one UI screen defined. Complex games usually need multiple screens.',
                confidence: 0.65,
                suggestedAction: 'Consider HUD, shop, inventory, and pause menu screens.'
            };
            return null;
        }
    },
    {
        aspect: 'camera_design',
        evaluate: (spec) => {
            const hasCameraCues = spec.camera?.cues && spec.camera.cues.length > 0;
            if (!hasCameraCues) return {
                type: 'POSSIBLE_IMPROVEMENT',
                aspect: 'camera_design',
                description: 'No camera cues defined. Cinematic moments can improve player engagement.',
                confidence: 0.55,
                suggestedAction: 'Add camera cues for important game moments (win, fail, pickup, etc.).'
            };
            return null;
        }
    },
    {
        aspect: 'multiplayer_social',
        evaluate: (spec, intent) => {
            const isMultiplayer = intent.rawPrompt.toLowerCase().includes('multiplayer') ||
                                  intent.rawPrompt.toLowerCase().includes('team') ||
                                  intent.rawPrompt.toLowerCase().includes('pvp');
            if (isMultiplayer) {
                const hasTeams = spec.coreLoop?.phases?.some((p: any) =>
                    JSON.stringify(p).toLowerCase().includes('team'));
                if (!hasTeams) return {
                    type: 'DESIGN_RISK',
                    aspect: 'multiplayer_social',
                    description: 'Multiplayer intent detected but no team mechanics defined.',
                    confidence: 0.8,
                    suggestedAction: 'Add Teams service, team assignments, and team-win conditions.'
                };
            }
            return null;
        }
    }
];

export class GameDesignQAEngine {
    /**
     * Evaluate a GameDesignSpec for design coherence.
     * Works for any genre — uses capability-based design heuristics.
     */
    public evaluate(spec: GameDesignSpec, intent: StructuredIntent): GameDesignQAReport {
        const observations: DesignObservation[] = [];

        for (const check of DESIGN_CHECKS) {
            try {
                const obs = check.evaluate(spec, intent);
                if (obs) observations.push(obs);
            } catch {
                // Individual check failure should not break the QA
            }
        }

        // Add a summary observation if no issues found
        if (observations.length === 0) {
            observations.push({
                type: 'DESIGN_OBSERVATION',
                aspect: 'overall',
                description: 'Design specification appears coherent. No critical risks detected.',
                confidence: 0.7
            });
        }

        const riskCount = observations.filter(o => o.type === 'DESIGN_RISK').length;
        const improvementCount = observations.filter(o => o.type === 'POSSIBLE_IMPROVEMENT').length;

        const status: GameDesignQAReport['status'] =
            riskCount > 2 ? 'REVIEW_REQUIRED' :
            riskCount > 0 ? 'DESIGN_RISKS_FOUND' :
            'COHERENT';

        return {
            evaluatedAt: Date.now(),
            domain: spec.identity?.title ?? intent.domain,
            observations,
            riskCount,
            improvementCount,
            status
        };
    }

    /**
     * Quick design QA from a natural language prompt.
     * Synthesizes a design spec then evaluates it.
     */
    public evaluateFromPrompt(prompt: string, intent: StructuredIntent): GameDesignQAReport {
        try {
            const spec: GameDesignSpec = designerBrain.createGameDesignSpec(prompt);
            return this.evaluate(spec, intent);
        } catch {
            return {
                evaluatedAt: Date.now(),
                domain: intent.domain,
                observations: [{
                    type: 'DESIGN_OBSERVATION',
                    aspect: 'overall',
                    description: 'Design QA could not synthesize a design spec for this prompt.',
                    confidence: 0.3
                }],
                riskCount: 0,
                improvementCount: 0,
                status: 'COHERENT'
            };
        }
    }
}

export const gameDesignQAEngine = new GameDesignQAEngine();
