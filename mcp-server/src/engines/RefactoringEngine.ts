export interface RefactoringOpportunity {
    type: 'GIANT_SCRIPT' | 'DEPRECATED_CALLS' | 'DUPLICATE_REMOTES' | 'CLIENT_AUTHORITATIVE_RISK';
    scriptPath: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    proposedRefactor: {
        strategy: string;
        targetModulesToExtract: string[];
        patchDiff?: { search: string; replacement: string };
    };
}

export interface RefactoringPlan {
    scriptPath: string;
    opportunities: RefactoringOpportunity[];
    recommendedNewModules: Array<{ name: string; parent: string; purpose: string }>;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export class RefactoringEngine {
    /**
     * Analyzes script source code for modularization and refactoring opportunities.
     */
    public analyzeScriptForRefactoring(scriptPath: string, source: string): RefactoringPlan {
        const lines = source.split('\n');
        const opportunities: RefactoringOpportunity[] = [];
        const recommendedNewModules: Array<{ name: string; parent: string; purpose: string }> = [];

        // 1. Monolithic Script (>250 lines)
        if (lines.length > 250) {
            const baseName = scriptPath.split('.').pop() || 'Script';
            opportunities.push({
                type: 'GIANT_SCRIPT',
                scriptPath,
                description: `Script has ${lines.length} lines. Monolithic scripts increase coupling and risk in collaborative environments.`,
                severity: 'MEDIUM',
                proposedRefactor: {
                    strategy: 'Extract pure logic/data tables into ModuleScripts in ReplicatedStorage.Shared',
                    targetModulesToExtract: [`${baseName}Data`, `${baseName}Helper`]
                }
            });
            recommendedNewModules.push({
                name: `${baseName}Data`,
                parent: 'ReplicatedStorage.Shared',
                purpose: 'Pure configuration tables and state constants'
            });
        }

        // 2. Legacy globals: wait() / spawn()
        if (source.includes('wait(') && !source.includes('task.wait')) {
            opportunities.push({
                type: 'DEPRECATED_CALLS',
                scriptPath,
                description: 'Legacy global wait() detected. May cause 30Hz throttle stutter.',
                severity: 'LOW',
                proposedRefactor: {
                    strategy: 'Replace wait(...) with task.wait(...)',
                    targetModulesToExtract: [],
                    patchDiff: { search: 'wait(', replacement: 'task.wait(' }
                }
            });
        }

        // 3. Client Authoritative Vulnerabilities
        if (source.includes('.OnServerEvent:Connect') && (source.includes('gold') || source.includes('currency') || source.includes('damage')) && !source.includes('type(')) {
            opportunities.push({
                type: 'CLIENT_AUTHORITATIVE_RISK',
                scriptPath,
                description: 'Remote event accepts raw numerical values from client without server validation.',
                severity: 'HIGH',
                proposedRefactor: {
                    strategy: 'Add type check and server-side validation boundary',
                    targetModulesToExtract: []
                }
            });
        }

        const maxSev = opportunities.some(o => o.severity === 'HIGH') ? 'HIGH' : (opportunities.some(o => o.severity === 'MEDIUM') ? 'MEDIUM' : 'LOW');

        return {
            scriptPath,
            opportunities,
            recommendedNewModules,
            riskLevel: maxSev
        };
    }
}

export const refactoringEngine = new RefactoringEngine();
