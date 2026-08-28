import { StructuredIntent } from './IntentEngine.js';
import { AcceptanceSuite } from './AcceptanceCriteriaEngine.js';
export type ChangeOperationType = 'CREATE_INSTANCE' | 'CREATE_SCRIPT' | 'PATCH_SCRIPT' | 'CREATE_REMOTE' | 'CREATE_UI' | 'CALIBRATE_ANIMATION' | 'CONNECT_NETWORK' | 'VERIFY_ACCEPTANCE' | 'RUN_PLAYTEST';
export interface ChangeOperation {
    id: string;
    stage: number;
    type: ChangeOperationType;
    targetPath: string;
    description: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    payload: Record<string, any>;
    status: 'PLANNED' | 'EXECUTING' | 'COMMITTED' | 'RECOVERED_PENDING_VERIFICATION' | 'ROLLED_BACK' | 'FAILED' | 'BLOCKED';
    resultEvidence?: any;
}
export interface StructuredChangePlan {
    planId: string;
    intentSummary: string;
    totalStages: number;
    operations: ChangeOperation[];
    acceptanceSuite: AcceptanceSuite;
    createdAt: number;
    status: 'DRY_RUN' | 'READY_TO_APPLY' | 'APPLYING' | 'COMPLETED' | 'ROLLED_BACK';
}
export declare class ChangePlanEngine {
    /**
     * Generates a comprehensive, dependency-aware, topologically-ordered change plan from structured intent.
     * Fully capability-driven — no genre-specific branches. Supports any Roblox game development request.
     *
     * Dependency order:
     *   DATA/ASSET → NETWORKING/MULTIPLAYER → SERVER_LOGIC/GAMEPLAY/ENVIRONMENT/PERSISTENCE
     *   → CLIENT_LOGIC/AUDIO → UI/ACCESSIBILITY → ANIMATION/CAMERA → PLAYTEST → VERIFY
     */
    generatePlan(intent: StructuredIntent, criteriaSuite: AcceptanceSuite): StructuredChangePlan;
}
export declare const changePlanEngine: ChangePlanEngine;
//# sourceMappingURL=ChangePlanEngine.d.ts.map