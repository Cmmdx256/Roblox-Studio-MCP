export interface ArchitectureAuditReport {
    framework: 'Knit' | 'Nevermore' | 'Flamework' | 'Vanilla' | 'Custom';
    confidence: number;
    serverClientSeparationValid: boolean;
    sharedModulesPath: string;
    remotesPath: string;
    servicesFound: string[];
    controllersFound: string[];
    potentialLeaks: string[];
    recommendations: string[];
}

export class CodeArchitectureEngine {
    /**
     * Inspects project hierarchy and scripts to identify underlying framework and architectural patterns.
     */
    public auditArchitecture(knownPaths: string[] = []): ArchitectureAuditReport {
        let isKnit = false;
        let isNevermore = false;
        let isFlamework = false;
        const services: string[] = [];
        const controllers: string[] = [];
        const potentialLeaks: string[] = [];
        const recommendations: string[] = [];

        for (const path of knownPaths) {
            const lower = path.toLowerCase();
            if (lower.includes('knit') || lower.includes('createservice') || lower.includes('createcontroller')) {
                isKnit = true;
            }
            if (lower.includes('nevermore')) {
                isNevermore = true;
            }
            if (lower.includes('flamework')) {
                isFlamework = true;
            }

            if (path.includes('ServerScriptService') && path.includes('Service')) {
                services.push(path);
            }
            if ((path.includes('StarterPlayerScripts') || path.includes('StarterGui')) && path.includes('Controller')) {
                controllers.push(path);
            }

            // Detect server logic leaked into client space
            if ((path.includes('StarterGui') || path.includes('StarterPlayerScripts') || path.includes('ReplicatedStorage')) &&
                (lower.includes('datastore') || lower.includes('serverstorage') || lower.includes('ban') || lower.includes('secret'))) {
                potentialLeaks.push(`Potential server/sensitive data reference in client-accessible path: ${path}`);
            }
        }

        let framework: 'Knit' | 'Nevermore' | 'Flamework' | 'Vanilla' | 'Custom' = 'Vanilla';
        let confidence = 0.9;

        if (isKnit) {
            framework = 'Knit';
            confidence = 0.95;
            recommendations.push('Maintain Knit Single-Script Architecture with Knit.CreateService and Knit.CreateController.');
        } else if (isNevermore) {
            framework = 'Nevermore';
            confidence = 0.95;
        } else if (isFlamework) {
            framework = 'Flamework';
            confidence = 0.95;
        } else if (services.length > 3 || controllers.length > 3) {
            framework = 'Custom';
            recommendations.push('Follow existing Service/Controller modular pattern.');
        } else {
            recommendations.push('Standardize shared code in ReplicatedStorage.Shared and events in ReplicatedStorage.Events.');
        }

        return {
            framework,
            confidence,
            serverClientSeparationValid: potentialLeaks.length === 0,
            sharedModulesPath: 'ReplicatedStorage.Shared',
            remotesPath: 'ReplicatedStorage.Events',
            servicesFound: services,
            controllersFound: controllers,
            potentialLeaks,
            recommendations
        };
    }
}

export const codeArchitectureEngine = new CodeArchitectureEngine();
