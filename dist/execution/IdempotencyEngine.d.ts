/**
 * IdempotencyEngine.ts  (P4 — Phase 17)
 *
 * Semantic duplicate detection to prevent creating Inventory, Inventory2, Inventory3
 * when the user says "Add an inventory system" twice.
 *
 * Detection is based on: hierarchy, names, attributes, scripts, Knowledge Graph + semantic signatures.
 */
export type IdempotencyAction = 'CREATE' | 'UPDATE' | 'REPAIR' | 'MERGE' | 'SKIP' | 'REPLACE';
export interface IdempotencyDecision {
    decisionId: string;
    operationTarget: string;
    action: IdempotencyAction;
    reason: string;
    existingPath?: string;
    confidence: number;
}
export interface SystemSignature {
    semanticKey: string;
    paths: string[];
    scripts: string[];
    remoteEvents: string[];
    attributes: Record<string, any>;
}
export declare class IdempotencyEngine {
    /**
     * Determine whether a system already exists and what action should be taken.
     */
    decide(systemName: string, targetPath: string, knownScripts?: string[], knownRemotes?: string[]): IdempotencyDecision;
    /**
     * Record a system signature after creation for future idempotency checks.
     */
    recordSignature(systemName: string, signature: SystemSignature): void;
    private normalizeKey;
    private findBySemanticKey;
}
export declare const idempotencyEngine: IdempotencyEngine;
//# sourceMappingURL=IdempotencyEngine.d.ts.map