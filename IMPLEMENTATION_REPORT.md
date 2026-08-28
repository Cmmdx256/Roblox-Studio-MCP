# Implementation Report — Reality-First P4 Initial Slice

**Date:** 2026-08-28  
**Scope:** P0 evidence provenance and honest build lifecycle.  
**Status:** Partial implementation; not production-complete.

## Implemented

- The bridge creates a random per-handshake token and requires it on poll,
  command-response, and event-ingestion requests.
- Command responses now carry a session ID and are accepted only when it
  matches the session that received the queued command.
- Bridge status output no longer exposes its session tokens.
- Authenticated plugin polling updates only plugin/bridge liveness. It does
  not claim DataModel, playtest, or write capability before a separate
  successful read-back.
- The plugin stores the token received during handshake and attaches it to
  subsequent poll and command-response messages. The distributable plugin
  bundle has been regenerated.
- An autonomous build without a live Studio evidence path stops as `BLOCKED`.
  The former test that expected offline execution now asserts that fail-closed
  result.
- A blocked or unverified build emits `BuildCompleted`, not `BuildCommitted`.
  Recovery recommendations remain `RECOVERED_PENDING_VERIFICATION` until the
  original action is re-run and observed.
- Gameplay snapshots and gameplay conditions now require an alive Studio
  session, readable DataModel, and an observed active Play session. They
  return `BLOCKED` outside that evidence chain rather than reporting a Luau
  response as gameplay verification.
- The screenshot engine no longer dispatches the unsupported embedded-plugin
  `capture_screen` action. Until a real plugin capture implementation is
  registered, visual evidence is explicitly `BLOCKED_BY_PLATFORM`.

## Deliberately not claimed

- The token binds a bridge continuation to its handshake. It does not prove
  that a local process is Roblox Studio; that needs an authenticated Studio
  identity or a supported official capability.
- No live DataModel, screenshot, gameplay, or playtest claim was produced by
  this implementation.

## Live follow-up

- A current plugin session was observed polling the rebuilt bridge.
- After the current daemon restart, a read-only `Workspace.Name` observation returned successfully in 47 ms.
- This proves only the handshake → poll → command → response → DataModel-read
  path. It does not verify mutation, transaction rollback, playtest, gameplay,
  screenshot, visual QA, or a final build.
- Test mode now disables remote Studio proxy discovery. This was added after a
  full test run attempted to use an open creator Studio session; the three
  unintended test GUIs were immediately removed and their absence was verified
  with live DataModel searches. Subsequent full tests completed offline-isolated.
- Capability discovery and system audit tool results no longer mark themselves
  `verified: true`; provider/tool discovery is explicitly `UNVERIFIED` until a
  live operation produces independent evidence.
- A second P0 audit removed every static `verified: true` declaration in the
  server source. Provider acknowledgements, animation/model operations,
  workflow templates, and capability probes are now unverified until an
  independent Studio observation is attached.
- `VerificationEngine.wrapWithVerification` now requires postconditions for a
  `VERIFIED` result. Recovery requires live source read → write → exact source
  re-read; no generic source patch is performed without a safe transformation.
- The generic test provider no longer returns invented test counts, and test
  mode now disables both the HTTP bridge proxy and the Official StudioMCP
  provider to keep local test runs disconnected from an open Studio session.
- `DesignerBrain` has explicit Custom/Hybrid and broader genre classification;
  its service architecture is derived from mechanics instead of fishing-only
  names. Fishing remains a regression scenario, not the platform architecture.

## Next P0 target

Make session expiry authoritative in the HTTP bridge and remove sessions that
stop polling. Then introduce a signed/session-bound observation envelope that
carries the source session, command ID, observation timestamp, and observed
tree hash into the evidence record.
