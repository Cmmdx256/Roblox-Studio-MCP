export class LuauIntelligenceEngine {
    /**
     * Deep static analysis of Luau source code.
     */
    analyzeSource(source) {
        const lines = source.split('\n');
        const functions = [];
        const modules = [];
        const remotes = [];
        const securityRisks = [];
        const performanceWarnings = [];
        const isStrict = lines.some(l => l.trim() === '--!strict');
        for (const line of lines) {
            const trimmed = line.trim();
            // Function detection
            const fnMatch = trimmed.match(/function\s+([A-Za-z0-9_.:]+)\s*\(/);
            if (fnMatch)
                functions.push(fnMatch[1]);
            // Require detection
            const reqMatch = trimmed.match(/require\(([^)]+)\)/);
            if (reqMatch)
                modules.push(reqMatch[1]);
            // Remote detection
            if (trimmed.includes('FireServer') || trimmed.includes('FireClient') || trimmed.includes('InvokeServer')) {
                remotes.push(trimmed);
            }
            // Deprecated patterns
            if (trimmed.includes('wait(') && !trimmed.includes('task.wait')) {
                performanceWarnings.push('Use task.wait() instead of legacy global wait()');
            }
            if (trimmed.includes('spawn(') && !trimmed.includes('task.spawn')) {
                performanceWarnings.push('Use task.spawn() instead of legacy global spawn()');
            }
            // Security checks (Client authoritative vulnerabilities)
            if (trimmed.includes('.OnServerEvent:Connect') && trimmed.includes('amount') && !trimmed.includes('type(')) {
                securityRisks.push('RemoteEvent handler accepts unvalidated client amount parameter');
            }
        }
        return {
            totalLines: lines.length,
            functionsFound: [...new Set(functions)],
            requiredModules: [...new Set(modules)],
            remotesReferenced: [...new Set(remotes)],
            securityRisks,
            performanceWarnings,
            isStrictTypechecking: isStrict
        };
    }
    /**
     * Synthesizes a minimal unified diff patch for a source string.
     */
    generateMinimalPatch(originalSource, targetLineOrPattern, replacement) {
        if (originalSource.includes(targetLineOrPattern)) {
            return originalSource.replace(targetLineOrPattern, replacement);
        }
        return originalSource + '\n' + replacement;
    }
}
export const luauIntelligenceEngine = new LuauIntelligenceEngine();
//# sourceMappingURL=LuauIntelligenceEngine.js.map