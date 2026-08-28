# Project Intelligence & Memory Architecture

## 1. Multi-Tiered Memory System

The platform distinguishes between five distinct categories of project memory:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PROJECT INTELLIGENCE                            │
├───────────────────┬───────────────────┬────────────────────────────────┤
│ 1. CONVERSATION   │ 2. PROJECT STATE  │ 3. ARCHITECTURE MEMORY         │
│ Memory of recent  │ Live DataModel    │ Detected framework (Knit/      │
│ user exchanges.   │ cache & active    │ Vanilla), naming conventions,  │
│ Summarized to     │ simulation mode.  │ important shared paths.        │
│ prevent bloat.    │                   │                                │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ 4. ERROR MEMORY   │ 5. CAPABILITY     │ 6. DECISION MEMORY             │
│ Previous runtime  │ Systems installed │ Architecture decisions and     │
│ errors & verified │ (FishingSystem,   │ technical rationale across     │
│ repair recipes.   │ ShopSystem, etc.) │ task sessions.                 │
└───────────────────┴───────────────────┴────────────────────────────────┘
```

---

## 2. Token & Cost Optimization (Relevance-Aware Context Retrieval)

Instead of dumping the entire DataModel or sending full 1,000-line scripts to AI models, the platform uses targeted retrieval:

1. **Relevance Ranking**: Scores instances and scripts against user intent tokens.
2. **Cost Budgets**:
   - `CHEAP` (1-level depth, basic properties, $\le$ 500 tokens).
   - `NORMAL` (2-level depth, core hierarchy, $\le$ 2,000 tokens).
   - `DEEP` (3-level depth, full property inspection, $\le$ 5,000 tokens).
   - `FULL` (unbounded full subtree for complete exports).
3. **Focused Context Compression (`ContextCompressor.ts`)**:
   - Extracts a targeted **35-line window** around the relevant function or symbol.
   - Summarizes top-level requires, type annotations, and exported interfaces.
   - Reduces token footprint by **80–90%** while retaining critical context for accurate patch generation.

---

## 3. Persistent Project Memory (`ProjectMemory.ts`)

Survives between disconnected Studio sessions and task runs:
- **System Registry**: Tracks every registered system (`name`, `rootPath`, `serverScripts`, `clientScripts`, `sharedModules`, `remotes`, `dependencies`).
- **Error Memory**: Catalogs past runtime errors and verified fix strategies (`PROPERTY_RESTRICTION`, `NIL_INDEXING`, etc.).
- **Decision History**: Records architectural choices with rationale and timestamp.
