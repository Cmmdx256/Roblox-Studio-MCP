# Roblox AI Game Development Platform — Architecture Specification

## 1. System Overview

The **Roblox AI Game Development Platform** is an MCP-native, Roblox Studio-integrated, multi-model, verifiable, and autonomous development control plane. It operates on the core principle:

$$\text{Command Executed} \ne \text{Command Verified}$$

Instead of treating AI as a simple chatbot that blindly spits out Luau scripts, this platform provides a bidirectional, closed-loop development runtime between local/remote AI models and active Roblox Studio sessions.

```
USER NATURAL INTENT
    │
    ▼
AI ORCHESTRATOR 2.0 (mcp-server/src/orchestrator/AIOrchestrator.ts)
    │── Intent Classifier & Requirement Extraction
    │── Relevance-Aware Context Retrieval (ProjectContextEngine.ts)
    │── Persistent Project Memory (ProjectMemory.ts)
    │── Model Router & Multi-Model Selection (ModelRouter.ts)
    │── DAG Task Graph Planner (AutonomousPlanner.ts)
    │
    ▼
DOMAIN INTELLIGENCE ENGINES
    │── UI Design & Component Compiler (UIDesignEngine.ts, UIComponentLibrary.ts)
    │── Luau Code & Refactoring Engine (LuauIntelligenceEngine.ts, RefactoringEngine.ts)
    │── Code Architecture & Framework Detection (CodeArchitectureEngine.ts)
    │── Animation Authoring & Posing Engine (AnimationAuthoringEngine.ts)
    │── Mechanic Card Registry & Workflows (MechanicCardRegistry.ts, WorkflowEngine.luau)
    │── Asset Intelligence & Security Inspection (AssetSecurityEngine.ts, AssetIntelligenceEngine.ts)
    │── Visual Feedback & QA Engine (VisualQAEngine.ts, PlaytestEngine.ts)
    │── World Building & Procedural Layout (WorldBuildingEngine.ts, VisualConstructionEngine.ts)
    │
    ▼
CAPABILITY SYSTEM & ROUTING
    │── Capability Contracts & Declarative Specs (CapabilityContract.ts)
    │── Unified Tool Registry & Dynamic Catalog (UnifiedToolRegistry.ts)
    │── Provider Registry (11 Registered Providers) (ProviderRegistry.ts)
    │── Dynamic Health-Aware Router 2.0 (CapabilityRouter.ts, HealthMonitor.ts)
    │
    ▼
VERIFIABLE EXECUTION PIPELINE (ExecutionPipeline.ts)
    │── Security & Risk Policy (SecurityEngine.ts: READ_ONLY to CRITICAL)
    │── Idempotency Guard (IdempotencyGuard.ts: SAFE, REPEATABLE, SKIP)
    │── Multi-Step Transactions & ChangeHistoryService (TransactionEngine.ts)
    │── Precondition Validation ──► Execution ──► Observation ──► 5-State Verification
    │── Autonomous Self-Healing Recovery (RecoveryEngine.ts)
    │
    ▼
PROVIDER LAYER ──► ROBLOX STUDIO RUNTIME
    ├── Embedded Studio Plugin (RobloxUniversalMCP.rbxmx) via HTTP/HTTPS Bridge (:38896/:38897)
    └── Official Roblox Studio MCP (StudioMCP.exe / stdio transport)
```

---

## 2. Layered Responsibilities

### Intelligence Layer (Node.js / TypeScript)
- **Intent Engine**: Parses natural language requests into structured technical specifications.
- **Project Intelligence**: Indexes DataModel instances, scripts, symbols, remotes, attributes, and tags.
- **Model Router**: Routes tasks to specialized models (`fast-utility`, `luau-coder`, `ui-designer`, `deep-architect`, `vision-qa`).
- **Domain Engines**: Synthesizes UI hierarchies, Luau code, animation grips/keyframes, and mechanic cards.
- **Verification Engine**: Evaluates postconditions across 5 discrete evidence-based states (`VERIFIED`, `PARTIALLY_VERIFIED`, `FAILED`, `NOT_VERIFIABLE`, `UNKNOWN`).
- **Recovery Engine**: Classifies runtime errors (`PROPERTY_RESTRICTION`, `NIL_INDEXING`, `SECURITY_RESTRICTION`, `SYNTAX_ERROR`) and synthesizes verified patches.

### Execution Layer (Roblox Studio Plugin / Luau)
- **Embedded Plugin Bridge**: Long-polling and WebSocket-ready HTTP client running inside Studio.
- **Native DataModel Adapters**: Executes instance creation, property mutation, script source replacement, and selection manipulation with undo waypoint integration (`ChangeHistoryService`).
- **Studio Observation**: Emits real-time logs, runtime errors, traceback details, and selection changes back to the MCP bridge.

---

## 3. Provider Architecture (11 Registered Providers)

1. `embedded-plugin`: Native execution inside Roblox Studio via the HTTP/HTTPS bridge.
2. `official-roblox-mcp`: Direct integration with official Roblox Studio MCP binary.
3. `modeling-provider`: 3D mesh, material, and procedural part generation.
4. `animation-provider`: Keyframe sequences, Motor6D joint posing, and Tool grip calibration.
5. `luau-provider`: Static analysis, linting, type-checking, and syntax patching.
6. `workflow-provider`: Multi-step automation templates and mechanic cards.
7. `asset-provider`: Asset search, security scanning, and safe insertion.
8. `testing-provider`: Unit testing, scenario simulation, and output assertion.
9. `diagnostics-provider`: Error diagnosis, traceback correlation, and safe repair.
10. `observation-provider`: Structured DataModel, script, and session state inspection.
11. `design-provider`: Spatial composition, lighting setup, and design tokens.
