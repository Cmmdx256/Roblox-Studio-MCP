# Multi-Model Router & Orchestration

## 1. Model Profiles & Capability Matrix

The platform avoids hardcoding a single AI model for all operations. Tasks are routed to specialized models based on capability scores ($0.0 - 1.0$), context window, cost, and latency:

| Profile ID | Target Specialization | Reasoning | Coding | Luau | UI | Vision | Latency Class | Est. Cost / 1M Tokens |
|---|---|---|---|---|---|---|---|---|
| `fast-utility` | Property reads/writes, instance inspection | 0.70 | 0.75 | 0.70 | 0.60 | 0.00 | `ULTRA_FAST` | $0.80 |
| `luau-coder` | Luau scripts, algorithms, remotes, refactoring | 0.88 | 0.96 | 0.95 | 0.80 | 0.00 | `FAST` | $3.00 |
| `ui-designer` | Roblox GUI layouts, design tokens, styling | 0.85 | 0.90 | 0.88 | 0.98 | 0.85 | `BALANCED` | $3.00 |
| `deep-architect`| 0-to-1 game planning, system architecture, deep debug | 0.98 | 0.95 | 0.92 | 0.85 | 0.80 | `THOROUGH` | $15.00 |
| `vision-qa` | Viewport screenshot analysis, aesthetic critique | 0.88 | 0.82 | 0.80 | 0.92 | 0.98 | `BALANCED` | $2.50 |

---

## 2. Intent-Based Routing Rules

1. **Vision & Aesthetic Critique**: Screenshot inspection, UI alignment, visual balance $\longrightarrow$ `vision-qa`.
2. **Deep Architecture & Complete Games**: Zero-to-One game specifications, multi-system refactoring $\longrightarrow$ `deep-architect`.
3. **UI Generation & Themes**: Menus, HUD overlays, inventory panels, theme tokens $\longrightarrow$ `ui-designer`.
4. **Luau Scripting & Logic**: Service scripts, client controllers, DataStores, math algorithms $\longrightarrow$ `luau-coder`.
5. **Lightweight Mutations**: Property gets/sets, renames, parent changes $\longrightarrow$ `fast-utility`.

---

## 3. Automatic Escalation Chain

If a lower-cost model produces code that fails postcondition verification or throws a runtime error during playtesting, the task automatically escalates:

$$\text{fast-utility} \xrightarrow{\text{Failed Verification}} \text{luau-coder} \xrightarrow{\text{Failed Verification}} \text{deep-architect}$$
