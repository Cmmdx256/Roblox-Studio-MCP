import { v4 as uuidv4 } from 'uuid';
/** Maps a requirement category to its stage number and operation type. Fully capability-driven — no genre coupling. */
function mapCategoryToStage(category) {
    const stageMap = {
        DATA: { stage: 1, opType: 'CREATE_SCRIPT', riskLevel: 'LOW' },
        ASSET: { stage: 1, opType: 'CREATE_INSTANCE', riskLevel: 'LOW' },
        NETWORKING: { stage: 2, opType: 'CREATE_REMOTE', riskLevel: 'LOW' },
        GAMEPLAY: { stage: 3, opType: 'CREATE_SCRIPT', riskLevel: 'MEDIUM' },
        SERVER_LOGIC: { stage: 3, opType: 'CREATE_SCRIPT', riskLevel: 'MEDIUM' },
        CLIENT_LOGIC: { stage: 4, opType: 'CREATE_SCRIPT', riskLevel: 'MEDIUM' },
        UI: { stage: 5, opType: 'CREATE_UI', riskLevel: 'MEDIUM' },
        ANIMATION: { stage: 6, opType: 'CALIBRATE_ANIMATION', riskLevel: 'LOW' },
        CAMERA: { stage: 6, opType: 'CREATE_SCRIPT', riskLevel: 'LOW' },
        ENVIRONMENT: { stage: 3, opType: 'CREATE_INSTANCE', riskLevel: 'LOW' },
        AUDIO: { stage: 4, opType: 'CREATE_INSTANCE', riskLevel: 'LOW' },
        PERFORMANCE: { stage: 7, opType: 'VERIFY_ACCEPTANCE', riskLevel: 'LOW' },
        SECURITY: { stage: 7, opType: 'VERIFY_ACCEPTANCE', riskLevel: 'LOW' },
        MULTIPLAYER: { stage: 3, opType: 'CREATE_REMOTE', riskLevel: 'HIGH' },
        PERSISTENCE: { stage: 3, opType: 'CREATE_SCRIPT', riskLevel: 'MEDIUM' },
        ACCESSIBILITY: { stage: 5, opType: 'CREATE_UI', riskLevel: 'LOW' },
    };
    return stageMap[category?.toUpperCase()] ?? { stage: 3, opType: 'CREATE_SCRIPT', riskLevel: 'MEDIUM' };
}
/** Derives a safe target path from a requirement. Never uses genre-specific hardcoded paths. */
function deriveTargetPath(req, opType) {
    const safeName = req.title.replace(/[^A-Za-z0-9_]/g, '').slice(0, 40) || 'Module';
    if (req.targetPath)
        return req.targetPath;
    switch (opType) {
        case 'CREATE_SCRIPT': return `ServerScriptService.Services.${safeName}`;
        case 'CREATE_REMOTE': return `ReplicatedStorage.Remotes.${safeName}`;
        case 'CREATE_UI': return `StarterGui.${safeName}`;
        case 'CREATE_INSTANCE': return `Workspace.Assets.${safeName}`;
        case 'CALIBRATE_ANIMATION': return `StarterPlayer.StarterPlayerScripts.${safeName}AnimationController`;
        default: return `ReplicatedStorage.${safeName}`;
    }
}
/** Generates a minimal but meaningful source scaffold for a given requirement. */
function generateScaffoldSource(req) {
    const safeName = req.title.replace(/[^A-Za-z0-9_]/g, '');
    return [
        `-- ${req.title}`,
        `-- Specification-only scaffold produced by ChangePlanEngine`,
        `-- Requirement: ${req.description || req.title}`,
        `local ${safeName} = {}`,
        ``,
        `-- IMPLEMENTATION REQUIRED: a code-generation provider must replace this scaffold before execution.`,
        ``,
        `return ${safeName}`,
    ].join('\n');
}
export class ChangePlanEngine {
    /**
     * Generates a comprehensive, dependency-aware, topologically-ordered change plan from structured intent.
     * Fully capability-driven — no genre-specific branches. Supports any Roblox game development request.
     *
     * Dependency order:
     *   DATA/ASSET → NETWORKING/MULTIPLAYER → SERVER_LOGIC/GAMEPLAY/ENVIRONMENT/PERSISTENCE
     *   → CLIENT_LOGIC/AUDIO → UI/ACCESSIBILITY → ANIMATION/CAMERA → PLAYTEST → VERIFY
     */
    generatePlan(intent, criteriaSuite) {
        const planId = `plan_${uuidv4().slice(0, 8)}`;
        const operations = [];
        let opCounter = 1;
        // Sort requirements by dependency-aware stage ordering
        const sortedRequirements = [...intent.requirements].sort((a, b) => {
            const stageA = mapCategoryToStage(a.category).stage;
            const stageB = mapCategoryToStage(b.category).stage;
            // Within same stage, higher priority first
            if (stageA !== stageB)
                return stageA - stageB;
            const priorityOrder = { MUST_HAVE: 0, SHOULD_HAVE: 1, NICE_TO_HAVE: 2 };
            return (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1);
        });
        for (const req of sortedRequirements) {
            const { stage, opType, riskLevel } = mapCategoryToStage(req.category);
            const targetPath = deriveTargetPath(req, opType);
            const payload = {
                requirementId: req.id,
                requirementTitle: req.title,
                name: req.title.replace(/[^A-Za-z0-9_]/g, '').slice(0, 40),
            };
            if (opType === 'CREATE_SCRIPT') {
                payload.parent = targetPath.split('.').slice(0, -1).join('.') || 'ServerScriptService';
                payload.type = stage <= 2 ? 'ModuleScript' : 'Script';
                payload.source = generateScaffoldSource(req);
                // Planning can generate a typed contract, but it must never
                // masquerade as runnable gameplay code. The orchestrator
                // refuses SPECIFICATION_ONLY scripts until a provider supplies
                // a concrete implementation and acceptance evidence.
                payload.implementationState = 'SPECIFICATION_ONLY';
            }
            else if (opType === 'CREATE_REMOTE') {
                payload.parent = 'ReplicatedStorage.Remotes';
                payload.className = req.description?.includes('Function') ? 'RemoteFunction' : 'RemoteEvent';
            }
            else if (opType === 'CREATE_UI') {
                payload.screenName = req.title.replace(/[^A-Za-z0-9_]/g, '');
                payload.theme = intent.suggestedTheme || 'modern_minimal';
                payload.layout = 'responsive';
                payload.uiRequirements = req.description;
            }
            else if (opType === 'CREATE_INSTANCE') {
                payload.parent = 'Workspace.Assets';
                payload.className = 'Model';
            }
            else if (opType === 'CALIBRATE_ANIMATION') {
                payload.description = req.description;
                payload.preset = 'Custom';
                payload.animationRequirements = req.title;
            }
            operations.push({
                id: `OP-${String(opCounter++).padStart(3, '0')}`,
                stage,
                type: opType,
                targetPath,
                description: req.title,
                riskLevel,
                payload,
                status: 'PLANNED'
            });
        }
        // Always add a final Playtest stage and Verification stage at the end
        const maxDataStage = operations.length > 0 ? Math.max(...operations.map(o => o.stage)) : 6;
        operations.push({
            id: `OP-${String(opCounter++).padStart(3, '0')}`,
            stage: maxDataStage + 1,
            type: 'RUN_PLAYTEST',
            targetPath: 'Project',
            description: 'Run automated playtest scenarios derived from acceptance criteria',
            riskLevel: 'LOW',
            payload: {
                scenarios: criteriaSuite.criteria
                    .filter(c => c.verificationType === 'RUNTIME_ASSERTION' || c.verificationType === 'DATAMODEL_INSPECTION')
                    .map(c => ({ criterionId: c.id, description: c.description }))
            },
            status: 'PLANNED'
        });
        operations.push({
            id: `OP-${String(opCounter++).padStart(3, '0')}`,
            stage: maxDataStage + 2,
            type: 'VERIFY_ACCEPTANCE',
            targetPath: 'Project',
            description: 'Evaluate all machine-checkable acceptance criteria against execution evidence',
            riskLevel: 'LOW',
            payload: {
                criteriaCount: criteriaSuite.criteria.length,
                criteriaIds: criteriaSuite.criteria.map(c => c.id)
            },
            status: 'PLANNED'
        });
        const maxStage = Math.max(...operations.map(o => o.stage));
        return {
            planId,
            intentSummary: intent.summary,
            totalStages: maxStage > 0 ? maxStage : 1,
            operations,
            acceptanceSuite: criteriaSuite,
            createdAt: Date.now(),
            status: 'READY_TO_APPLY'
        };
    }
}
export const changePlanEngine = new ChangePlanEngine();
//# sourceMappingURL=ChangePlanEngine.js.map