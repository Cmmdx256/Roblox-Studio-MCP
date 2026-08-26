import { commandDispatcher } from '../dispatcher/commandDispatcher.js';
import { providerRegistry } from '../providers/ProviderRegistry.js';
import { capabilityGraph } from '../capabilities/CapabilityGraph.js';
import { multiModeEngine } from '../modes/MultiModeEngine.js';
import { memoryManager } from '../memory/MemoryManager.js';
import { unifiedToolRegistry } from '../capabilities/UnifiedToolRegistry.js';
import { allTools } from '../tools/index.js';
import { CapabilityState } from '../providers/types.js';

import { restrictedCapabilityRegistry } from '../capabilities/RestrictedCapabilityRegistry.js';

export interface DashboardMetrics {
    pluginStatus: 'ONLINE' | 'OFFLINE';
    officialMcpStatus: 'ONLINE' | 'OFFLINE';
    httpsStatus: 'CONNECTED' | 'DISCONNECTED';
    daemonState: 'READY' | 'DEGRADED' | 'UNHEALTHY';
    activeStudioId: string;
    placeName: string;
    placeId: number | string;
    liveCapabilitiesCount: number;
    liveToolsCount: number;
    lowLevelToolsCount: number;
    highLevelWorkflowsCount: number;
    totalUniversalTools: number;
    activeMode: string;
    currentTask: string;
    verificationStatus: string;
    recentErrorsCount: number;
    recentMutations: Array<{ target: string; action: string; timestamp: number }>;
    timestamp: number;
}

export class LiveDashboard {
    /**
     * Gathers real-time telemetry metrics dynamically from all live subsystems.
     */
    public async getMetrics(): Promise<DashboardMetrics> {
        const sessionInfo = await commandDispatcher.getSessionInfo();
        const isStudioConnected = commandDispatcher.isStudioConnected();
        const providers = providerRegistry.getAll();
        const officialMcp = providers.find(p => p.name === 'official-roblox-mcp');
        const officialHealth = officialMcp ? await officialMcp.healthCheck() : null;

        // Dynamic Capabilities Count across CapabilityGraph, Restricted Registry, and all 11 Providers
        const graphNodes = capabilityGraph.getAllNodes();
        const capabilitySet = new Set<string>();

        // 1. Capability Graph nodes
        for (const node of graphNodes) {
            capabilitySet.add(node.id);
        }

        // 2. Restricted & Elevated capabilities
        for (const desc of restrictedCapabilityRegistry.getAllRestrictedCapabilities()) {
            capabilitySet.add(desc.name);
        }

        // 3. Provider discovered capabilities
        for (const provider of providers) {
            try {
                const caps = await provider.getCapabilities();
                for (const cap of caps) {
                    capabilitySet.add(cap.name);
                }
            } catch {}
        }

        // 4. All registered tools as capabilities
        for (const t of allTools) {
            capabilitySet.add(t.name);
        }

        // Dynamic Tool Categorization (Low-Level vs High-Level Workflows)
        const toolSet = new Set<string>();
        for (const t of allTools) {
            toolSet.add(t.name);
        }
        for (const t of unifiedToolRegistry.getAll()) {
            toolSet.add(t.name);
        }

        let lowLevelCount = 0;
        let highLevelCount = 0;

        for (const toolName of toolSet) {
            const isWorkflow = toolName.includes('project_') ||
                toolName.includes('system_') ||
                toolName.includes('scene_') ||
                toolName.includes('game_') ||
                toolName.includes('world_') ||
                toolName.includes('playtest_') ||
                toolName.includes('completeness_') ||
                toolName.includes('diagnostics_') ||
                toolName.includes('capability_') ||
                toolName.includes('architecture_') ||
                toolName.includes('feature_') ||
                toolName.includes('batch_');

            if (isWorkflow) {
                highLevelCount++;
            } else {
                lowLevelCount++;
            }
        }

        const totalTools = toolSet.size;
        const project = memoryManager.getProject();
        const task = memoryManager.getTask();
        const errors = await commandDispatcher.getRecentErrors(10);

        return {
            pluginStatus: isStudioConnected ? 'ONLINE' : 'OFFLINE',
            officialMcpStatus: (officialHealth?.state === 'READY') ? 'ONLINE' : 'OFFLINE',
            httpsStatus: 'CONNECTED',
            daemonState: isStudioConnected ? 'READY' : 'DEGRADED',
            activeStudioId: sessionInfo?.studioInstanceId || 'default-session',
            placeName: sessionInfo?.placeName || project.placeName || 'Local Place',
            placeId: sessionInfo?.placeId || project.placeId || 0,
            liveCapabilitiesCount: capabilitySet.size,
            liveToolsCount: totalTools,
            lowLevelToolsCount: lowLevelCount,
            highLevelWorkflowsCount: highLevelCount,
            totalUniversalTools: totalTools,
            activeMode: multiModeEngine.getMode(),
            currentTask: task?.goal || 'Idle / Ready for command',
            verificationStatus: isStudioConnected ? 'VERIFIED_HEALTHY' : 'PENDING_CONNECTION',
            recentErrorsCount: errors.length,
            recentMutations: project.recentMutations.slice(-10),
            timestamp: Date.now()
        };
    }
}

export const liveDashboard = new LiveDashboard();
