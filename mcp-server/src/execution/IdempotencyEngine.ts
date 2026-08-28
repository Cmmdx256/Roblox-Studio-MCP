/**
 * IdempotencyEngine.ts  (P4 — Phase 17)
 *
 * Semantic duplicate detection to prevent creating Inventory, Inventory2, Inventory3
 * when the user says "Add an inventory system" twice.
 *
 * Detection is based on: hierarchy, names, attributes, scripts, Knowledge Graph + semantic signatures.
 */

import { v4 as uuidv4 } from 'uuid';
import { projectKnowledgeGraph } from '../state/ProjectKnowledgeGraph.js';
import { studioStateGraph } from '../state/StudioStateGraph.js';

export type IdempotencyAction = 'CREATE' | 'UPDATE' | 'REPAIR' | 'MERGE' | 'SKIP' | 'REPLACE';

export interface IdempotencyDecision {
    decisionId: string;
    operationTarget: string;
    action: IdempotencyAction;
    reason: string;
    existingPath?: string;
    confidence: number; // 0-1
}

export interface SystemSignature {
    semanticKey: string;
    paths: string[];
    scripts: string[];
    remoteEvents: string[];
    attributes: Record<string, any>;
}

export class IdempotencyEngine {
    /**
     * Determine whether a system already exists and what action should be taken.
     */
    public decide(
        systemName: string,
        targetPath: string,
        knownScripts?: string[],
        knownRemotes?: string[]
    ): IdempotencyDecision {
        const decisionId = uuidv4();
        const semanticKey = this.normalizeKey(systemName);

        // 1. Check Knowledge Graph for existing system
        const existingNode = this.findBySemanticKey(semanticKey);
        if (existingNode) {
            return {
                decisionId,
                operationTarget: targetPath,
                action: 'UPDATE',
                reason: `System "${systemName}" already exists in Knowledge Graph at "${existingNode.path}" (confidence: ${existingNode.confidence}).`,
                existingPath: existingNode.path,
                confidence: existingNode.confidence,
            };
        }

        // 2. Check StudioStateGraph cache for existing instance
        const allNodes = studioStateGraph.getAllNodes();
        const matchingNode = allNodes.find(n => {
            const nameLower = n.name.toLowerCase();
            const keyLower = semanticKey;
            return nameLower.includes(keyLower) || keyLower.includes(nameLower.replace(/\s/g, ''));
        });

        if (matchingNode) {
            return {
                decisionId,
                operationTarget: targetPath,
                action: 'MERGE',
                reason: `Similar instance "${matchingNode.name}" found in cached DataModel at "${matchingNode.path}". Merging is recommended.`,
                existingPath: matchingNode.path,
                confidence: 0.7,
            };
        }

        // 3. Check for script name conflicts
        if (knownScripts && knownScripts.length > 0) {
            for (const scriptName of knownScripts) {
                const scriptNode = allNodes.find(n =>
                    n.className === 'Script' || n.className === 'ModuleScript' || n.className === 'LocalScript'
                );
                if (scriptNode && scriptNode.name === scriptName) {
                    return {
                        decisionId,
                        operationTarget: targetPath,
                        action: 'REPAIR',
                        reason: `Script "${scriptName}" already exists at "${scriptNode.path}". Repair/update is recommended.`,
                        existingPath: scriptNode.path,
                        confidence: 0.85,
                    };
                }
            }
        }

        // 4. No conflict detected — safe to create
        return {
            decisionId,
            operationTarget: targetPath,
            action: 'CREATE',
            reason: `No existing system matching "${systemName}" detected. Safe to create.`,
            confidence: 0.9,
        };
    }

    /**
     * Record a system signature after creation for future idempotency checks.
     */
    public recordSignature(systemName: string, signature: SystemSignature): void {
        const semanticKey = this.normalizeKey(systemName);
        for (const path of signature.paths) {
            projectKnowledgeGraph.addNode(path, 'SYSTEM', {
                semanticKey,
                scripts: signature.scripts,
                remotes: signature.remoteEvents,
                attributes: signature.attributes,
            });
        }
    }

    private normalizeKey(name: string): string {
        return name
            .toLowerCase()
            .replace(/\s+(system|manager|service|engine|controller|handler)$/i, '')
            .replace(/[^a-z0-9]/g, '');
    }

    private findBySemanticKey(key: string): { path: string; confidence: number } | null {
        try {
            const stats = projectKnowledgeGraph.getStats();
            if (!stats || stats.totalNodes === 0) return null;

            const results = projectKnowledgeGraph.searchNodes(key);
            if (results && results.length > 0) {
                const first = results[0];
                return {
                    path: first.id ?? key,
                    // Knowledge graph matches are inference, not observed evidence.
                    confidence: 0.5,
                };
            }
        } catch {
            // Knowledge graph may not support these fields yet
        }
        return null;
    }
}

export const idempotencyEngine = new IdempotencyEngine();
