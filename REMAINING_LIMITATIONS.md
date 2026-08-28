# Remaining Limitations

## P0

- A reachable bridge and actively polling plugin are required before any
  Studio change can be executed or verified. The bridge currently answers
  health checks, but its listed sessions did not answer a read-only command.
- The bridge token prevents cross-session response spoofing but does not yet
  establish a cryptographic Roblox Studio identity.
- DataModel snapshot evidence is not yet bound to a signed observation envelope.

## P1

- The embedded plugin has no `capture_screen` router action. Screenshot-based
  visual verification remains unavailable; geometric analysis is not a screen
  capture.
- Gameplay state collection requires a confirmed Play-mode observation, but
  it still needs test-specific before/after transition correlation before it
  can report verified gameplay behaviour.
- The recovery engine still needs a transaction-backed retry, read-back, and
  rollback loop.

## P2

- Provider health currently proves transport/tool discovery, not an active
  target Studio instance or a live DataModel.
- The knowledge graph needs source, confidence, last-observed, and verification
  state updates sourced from actual Studio observations.
- Performance, multiplayer, animation, and visual reports need separate
  observed/estimated/simulated/unavailable labels throughout their public API.
