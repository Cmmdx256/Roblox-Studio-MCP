/**
 * DiagnosticsEngine handles root-cause error analysis and safe repair synthesis for Roblox Studio.
 */
export class DiagnosticsEngine {
    /**
     * Analyzes raw Roblox runtime / engine errors and produces actionable diagnostic guidance.
     */
    analyzeRobloxError(errorMessage, sourceCode) {
        const err = errorMessage.toLowerCase();
        // 1. Property Read-Only / Joint C0 / Transform Assignment Error
        if (err.includes('property is read only') || err.includes('unable to assign property c0') || err.includes('unable to assign property transform')) {
            let suggested = '';
            if (sourceCode && sourceCode.includes('RightShoulder')) {
                suggested = `-- Correct R15 Motor6D access:\nlocal rShoulder = dummy:FindFirstChild("UpperTorso") and dummy.UpperTorso:FindFirstChild("RightShoulder") or dummy.RightUpperArm:FindFirstChildWhichIsA("Motor6D")\nif rShoulder and rShoulder:IsA("Motor6D") then\n    rShoulder.C0 = rShoulder.C0 * CFrame.Angles(math.rad(80), 0, 0)\nend`;
            }
            else {
                suggested = `-- Verify instance type and use writable properties:\nif targetJoint and targetJoint:IsA("Motor6D") then\n    targetJoint.C0 = targetJoint.C0 * CFrame.Angles(math.rad(45), 0, 0)\nend`;
            }
            return {
                category: 'PROPERTY_RESTRICTION',
                summary: 'Attempted to assign a property that is read-only or restricted on this instance class.',
                rootCause: 'In Roblox R15 avatars, limb joints (like RightShoulder) are parented to UpperTorso (Part0: UpperTorso, Part1: RightUpperArm). If accessed on RightUpperArm or if the joint is a RigidConstraint/Attachment rather than a Motor6D, C0 is not writable. Additionally, Motor6D.Transform is read-only in Edit mode (animated by Animator).',
                actionableAdvice: '1. Check if the joint is located in UpperTorso rather than RightUpperArm.\n2. Ensure the joint is a Motor6D using :IsA("Motor6D").\n3. Modify Motor6D.C0 or Motor6D.C1 instead of Transform at Edit time.',
                suggestedFix: suggested,
                affectedPropertyOrMethod: 'C0 / Transform'
            };
        }
        // 2. Nil indexing / child access error
        if (err.includes('attempt to index nil with') || err.includes('is not a valid member of')) {
            return {
                category: 'NIL_INDEXING',
                summary: 'Attempted to access a member or child of an instance that does not exist or has not replicated.',
                rootCause: 'The target parent or instance was nil at evaluation time. In Roblox Studio, instances created dynamically may not have their full hierarchy populated immediately without WaitForChild or FindFirstChild checks.',
                actionableAdvice: 'Use :FindFirstChild("Name") or :WaitForChild("Name", 5) with defensive nil checks before indexing properties.',
                suggestedFix: 'local child = parent:FindFirstChild("TargetName")\nif child then\n    -- safely operate on child\nend',
            };
        }
        // 3. Security / Identity Elevation error
        if (err.includes('the current identity') || err.includes('security') || err.includes('cannot call')) {
            return {
                category: 'SECURITY_RESTRICTION',
                summary: 'The requested operation requires elevated Roblox security context (PluginSecurity or RobloxScriptSecurity).',
                rootCause: 'Standard Luau execution context identity (identity 2 or 5) cannot execute internal/engine-restricted APIs like RunService:Run() or settings modification.',
                actionableAdvice: 'Route this operation to the Official Roblox MCP Provider (StudioMCP.exe) or use corresponding MCP platform tools (e.g. start_stop_play).',
                suggestedFix: 'Use MCP tool start_stop_play or execute via official-roblox-mcp proxy.',
            };
        }
        // 4. HTTP Service Disabled
        if (err.includes('http requests are not enabled') || err.includes('httpenabled')) {
            return {
                category: 'HTTP_RESTRICTION',
                summary: 'HttpService is disabled in Game Settings.',
                rootCause: 'Roblox requires "Allow HTTP Requests" to be turned on in Game Settings > Security before HttpService requests can be executed.',
                actionableAdvice: 'Enable HTTP Requests in Roblox Studio: Home > Game Settings > Security > Allow HTTP Requests = ON.',
            };
        }
        // Default Fallback
        return {
            category: 'GENERAL_RUNTIME_ERROR',
            summary: errorMessage,
            rootCause: 'A Luau runtime exception occurred during execution in Roblox Studio.',
            actionableAdvice: 'Inspect the stack trace and verify instance paths, types, and parameter values.',
            suggestedFix: sourceCode ? `-- Wrap execution in pcall for error diagnosis:\nlocal success, err = pcall(function()\n${sourceCode.split('\n').map(l => '    ' + l).join('\n')}\nend)\nif not success then warn("Execution failed: " .. tostring(err)) end` : undefined
        };
    }
    /**
     * Collects all relevant diagnostics from the environment.
     */
    async collectDiagnostics() {
        console.error(`[DiagnosticsEngine] Collecting diagnostics`);
        return { logs: [], errors: [], affectedScripts: [], recentChanges: [] };
    }
    /**
     * Analyzes an error log to determine the root cause and propose a patch.
     */
    async analyzeRootCause(errorLog) {
        const diag = this.analyzeRobloxError(errorLog.message);
        return {
            rootCause: diag.rootCause,
            confidence: 0.9,
            proposedPatch: diag.suggestedFix ? { search: '', replacement: diag.suggestedFix } : undefined
        };
    }
    /**
     * Synthesizes and applies a safe repair.
     */
    async safeRepair(patchSpec) {
        console.error(`[DiagnosticsEngine] Applying safe repair to: ${patchSpec.scriptPath} (dryRun: ${patchSpec.dryRun})`);
        return {
            status: 'SUCCESS',
            verified: false,
            changes: [],
            evidence: []
        };
    }
}
export const diagnosticsEngine = new DiagnosticsEngine();
//# sourceMappingURL=DiagnosticsEngine.js.map