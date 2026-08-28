/**
 * PerformanceRealityEngine.ts
 *
 * Observes live DataModel performance metrics:
 * 1. Live Instance, Part, and unanchored part counts
 * 2. Script and UI node counts
 * 3. Runtime error/warning frequency
 * 4. Truthful FPS & Memory reporting (always 'UNAVAILABLE' unless live Stats service is queried)
 */
import { commandDispatcher } from '../dispatcher/commandDispatcher.js';
import { runtimeObservationEngine } from './RuntimeObservationEngine.js';
export class PerformanceRealityEngine {
    /**
     * Measure performance metrics from live Studio session.
     */
    async measurePerformance() {
        const measuredAt = Date.now();
        const observations = [];
        let instanceCount = 'UNAVAILABLE';
        let partCount = 'UNAVAILABLE';
        let unanchoredPartCount = 'UNAVAILABLE';
        let scriptCount = 'UNAVAILABLE';
        let uiObjectCount = 'UNAVAILABLE';
        let status = 'UNAVAILABLE';
        try {
            if (commandDispatcher.isStudioConnected()) {
                const response = await commandDispatcher.executeCommand('execute_luau', {
                    code: `
local ws = workspace
local sg = game:GetService("StarterGui")
local sss = game:GetService("ServerScriptService")
local sp = game:GetService("StarterPlayer")
local rs = game:GetService("ReplicatedStorage")

local all = game:GetDescendants()
local parts = 0
local unanchored = 0
local scripts = 0
local uis = 0

for _, inst in ipairs(all) do
    if inst:IsA("BasePart") then
        parts = parts + 1
        if not inst.Anchored then
            unanchored = unanchored + 1
        end
    elseif inst:IsA("LuaSourceContainer") then
        scripts = scripts + 1
    elseif inst:IsA("GuiObject") then
        uis = uis + 1
    end
end

return {
    totalInstances = #all,
    parts = parts,
    unanchored = unanchored,
    scripts = scripts,
    uis = uis
}
`
                });
                if (response?.result) {
                    const r = response.result;
                    instanceCount = r.totalInstances ?? 0;
                    partCount = r.parts ?? 0;
                    unanchoredPartCount = r.unanchored ?? 0;
                    scriptCount = r.scripts ?? 0;
                    uiObjectCount = r.uis ?? 0;
                    status = 'VERIFIED';
                }
            }
        }
        catch {
            status = 'PARTIAL';
        }
        const recentErrors = runtimeObservationEngine.getRecentErrors(20);
        const runtimeErrors = recentErrors.length;
        const memoryIndicators = [];
        if (typeof instanceCount === 'number' && instanceCount > 10000) {
            memoryIndicators.push(`High instance count (${instanceCount}) may increase memory footprint.`);
        }
        if (typeof unanchoredPartCount === 'number' && unanchoredPartCount > 50) {
            memoryIndicators.push(`${unanchoredPartCount} unanchored parts may cause physics engine overhead.`);
        }
        const riskLevel = (typeof instanceCount === 'number' && instanceCount > 20000) || runtimeErrors > 5 ? 'HIGH' :
            (typeof instanceCount === 'number' && instanceCount > 8000) || (typeof unanchoredPartCount === 'number' && unanchoredPartCount > 30) ? 'MEDIUM' :
                'LOW';
        if (status === 'VERIFIED') {
            observations.push(`Scanned ${instanceCount} instances (${partCount} parts, ${unanchoredPartCount} unanchored, ${scriptCount} scripts, ${uiObjectCount} UI nodes).`);
        }
        else {
            observations.push('Studio offline; performance metrics estimated or unavailable.');
        }
        return {
            measuredAt,
            instanceCount,
            partCount,
            unanchoredPartCount,
            scriptCount,
            uiObjectCount,
            fps: 'UNAVAILABLE', // Strictly truthful: never fabricated
            memoryIndicators,
            runtimeErrors,
            warningFrequency: runtimeErrors > 5 ? 'HIGH' : runtimeErrors > 0 ? 'MEDIUM' : 'LOW',
            riskLevel,
            observations,
            status
        };
    }
}
export const performanceRealityEngine = new PerformanceRealityEngine();
//# sourceMappingURL=PerformanceRealityEngine.js.map