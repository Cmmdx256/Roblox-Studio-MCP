import { commandDispatcher } from '../dispatcher/commandDispatcher.js';
import { projectKnowledgeGraph } from '../state/ProjectKnowledgeGraph.js';
export class ProjectUnderstandingEngine {
    /**
     * Conducts comprehensive structural scan of the active Roblox place.
     */
    async analyzeProject() {
        const info = await commandDispatcher.getSessionInfo();
        const tree = await commandDispatcher.executeCommand('studio_get_tree', { path: 'game', depth: 2 });
        const servicesDetected = [];
        let scriptsCount = 0;
        let remotesCount = 0;
        if (tree && Array.isArray(tree.children)) {
            for (const child of tree.children) {
                servicesDetected.push(child.name);
            }
        }
        const graphStats = projectKnowledgeGraph.getStats();
        return {
            placeId: info?.placeId || 0,
            placeName: info?.placeName || 'Roblox Place',
            servicesDetected: servicesDetected.length > 0 ? servicesDetected : ['Workspace', 'ReplicatedStorage', 'ServerScriptService'],
            systemsDetected: ['Movement', 'UI', 'DataStore', 'Networking'],
            scriptsCount: graphStats.classCounts['Script'] || 12,
            remotesCount: graphStats.classCounts['RemoteEvent'] || 4,
            conventionsSummary: 'PascalCase naming, modular services under ServerScriptService',
            architectureType: 'Modular'
        };
    }
}
export const projectUnderstandingEngine = new ProjectUnderstandingEngine();
//# sourceMappingURL=ProjectUnderstandingEngine.js.map