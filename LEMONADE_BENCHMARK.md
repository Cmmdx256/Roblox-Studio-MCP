# Lemonade Benchmark — Product Research and Adaptation Plan

**Research date:** 2026-08-28  
**Scope:** Publicly observable product behavior only. Lemonade's internal
implementation, models, prompts, provider contracts, and synchronization
protocol are not public; this document does not infer or reproduce them.

## What Lemonade publicly demonstrates

Lemonade presents a prompt-first Roblox game-creation product: a creator
describes a game, iterates with follow-up instructions, and works against a
Roblox Studio project. Its public site shows genre examples spanning cooking,
shooters, tycoons, racing, survival, PvP, fishing, and more. The Discord
listing explicitly describes two-way Studio synchronisation, eliminating manual
copy/paste. The sign-in flow uses Roblox identity and indicates access only to
basic profile information. Its privacy policy says project files and code stay
on Roblox rather than being hosted by Lemonade.

This establishes an experience target, not evidence of any particular backend:

```
Roblox identity → creator project → conversational prompt/revision → Studio sync
               → inspect/test → next revision
```

## Verified design lessons for this platform

| Product behavior | Adaptation here | Reality boundary |
| --- | --- | --- |
| Prompt-first creation | Preserve each user request as an intent, design spec, change plan, and approval diff. | A plan is not an executed change. |
| Iterative revision | Treat every follow-up as a new, idempotent revision against observed project state. | Do not infer state from prior prompts or memory. |
| Studio synchronisation | Use the authenticated plugin/bridge as the mutation channel and bind evidence to the responding session. | A handshake, health response, or tool discovery is not DataModel proof. |
| Broad genre examples | Keep genre as a design input only; route through generic systems, mechanics, UI, assets, and acceptance criteria. | Example templates cannot become hard-coded execution paths. |
| Creator ownership | Store build history, plans, diffs, and evidence locally with the project; expose export/recovery paths. | Do not claim cloud storage, publishing, or collaboration support unless implemented. |

## Product architecture to build (Lemonade-inspired, not a clone)

1. **Creator workspace** — project list, Studio-session badge, revision chat,
   plan preview, build timeline, evidence drawer, and a clear “observed vs
   inferred” label on every result.
2. **Revision service** — converts an initial prompt or follow-up into a typed
   `GameDesignSpec`, semantic diff (`CREATE`, `MODIFY`, `DELETE`, `MOVE`,
   `RENAME`), risk level, acceptance criteria, and rollback plan.
3. **Approval boundary** — low-risk operations may be queued according to the
   user's selected mode; medium/high/critical plans remain pending approval.
4. **Studio synchronisation** — only an alive, authenticated, polling session
   may receive commands. Every response carries session, command, operation,
   and transaction correlation identifiers.
5. **Evidence-first revision loop** — snapshot before, mutate, snapshot after,
   evaluate criteria, run only supported tests, and report `BLOCKED` or
   `UNVERIFIED` whenever the evidence chain is incomplete.

## Current implementation delta

Implemented in this repository:

- intent → design spec → acceptance suite → staged change plan;
- an authenticated bridge token and session-bound responses;
- build history, quality gates, transaction/idempotency foundations, and a
  live-dashboard backend;
- a fail-closed gameplay observer and explicit visual-capture limitation.

Still required for the creator-workspace product:

- a user-facing workspace and revision timeline UI;
- durable project/build storage (current in-memory services do not survive
  process restarts);
- explicit plan approval and cancellation controls;
- protocol-level before/after snapshot correlation;
- real screenshot capture, visual inspection, and confirmed Play-mode
  transitions;
- a live integration suite using a real Studio project, separate from offline
  tests.

## Sources

- [Lemonade product site](https://lemonade.gg/)
- [Lemonade Discord listing](https://discord.com/servers/lemonade-1324506639289548840)
- [Lemonade privacy policy](https://lemonade.gg/privacy-policy)
- [Lemonade sign-in permissions](https://lemonade.gg/sign-in)
- [Roblox Studio AI workflows](https://create.roblox.com/docs/ai/accelerated-workflows)
- [Roblox Build documentation](https://create.roblox.com/docs/ai/build)
