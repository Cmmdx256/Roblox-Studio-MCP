# Autonomous AI Workflows & Zero-to-One Game Creation

## Workflow Lifecycle

Every high-level workflow in the system follows a deterministic 5-stage pipeline:

```
    PLAN
      │
      ▼
   VALIDATE
      │
      ▼
   EXECUTE
      │
      ▼
   VERIFY
      │
      ▼
  COMPLETE
```

---

## 1. Zero-to-One Game Creation (`game_create_from_spec`)
The AI agent can take a natural language description:
> *"Create a fishing game where players fish at a lake, sell fish in a village, upgrade rods and unlock new zones."*

And automatically executes:
1. **`GameSpecificationParser`**: Derives GameDesignDocument, ArchitectureDocument, FeatureGraph, and Asset/Animation plans.
2. **`Dependency-Aware Topological Execution`**:
   - Data schemas & item definitions first
   - Communication remotes (`ReplicatedStorage`)
   - Server gameplay logic (`ServerScriptService`)
   - Client UI & controller scripts (`StarterPlayerScripts` & `StarterGui`)
3. **`WorldBuildingEngine`**: Constructs world zones, spawn points, terrain, and interaction anchors.
4. **`ModelingProvider` & `AnimationProvider`**: Integrates 3D models and animation tracks.
5. **`VerificationEngine`**: Asserts pre/post conditions on all instances.
6. **`PlaytestEngine`**: Runs automated scenario simulation and verifies output logs.
7. **`CompletenessEngine`**: Verifies 100% of requested features are implemented before completion.

---

## 2. High-Level Semantic Tool Surface
* **`project_analyze`**: Comprehensive architecture analysis.
* **`project_health`**: Audits memory leaks, loose unanchored parts, syntax issues.
* **`project_repair`**: Automated batch repair of unanchored parts and broken hierarchies.
* **`system_create`**: Creates full-stack modular systems (Server + Module + Client + Remotes).
* **`scene_optimize`**: Optimizes scene hierarchy and physics.
* **`diagnostics_safe_repair`**: Diagnoses runtime errors, correlates stack traces, and synthesizes dry-run verified script patches.
