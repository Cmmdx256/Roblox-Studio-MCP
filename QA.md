# Verification & Quality Assurance (QA) Engine

## 1. The 5-State Verification System

Every mutation in the platform is passed through the server-side `VerificationEngine.ts`. The engine outputs one of 5 discrete states backed by field-level evidence:

| State | Definition | Confidence Threshold |
|---|---|---|
| `VERIFIED` | All preconditions and postconditions match Studio state within epsilon tolerance ($\epsilon = 0.001$). | $1.00$ |
| `PARTIALLY_VERIFIED` | Core existence and class match, but non-fatal secondary properties drifted or replicated asynchronously. | $\ge 0.50$ |
| `FAILED` | Precondition or postcondition violated (e.g. Instance missing, ClassName mismatch, script error thrown). | $0.00$ |
| `NOT_VERIFIABLE` | Target is an ephemeral engine side-effect (e.g. Sound playback, temporary particle burst). | N/A |
| `UNKNOWN` | Studio session timed out or disconnected during verification check. | $0.00$ |

---

## 2. Multi-Dimensional QA Coverage

```
┌────────────────────────────────────────────────────────────────────────┐
│                         VERIFICATION MATRIX                            │
├───────────────────┬───────────────────┬────────────────────────────────┤
│ 1. STRUCTURAL QA  │ 2. FUNCTIONAL QA  │ 3. SECURITY QA                 │
│ Hierarchy, names, │ Script execution, │ Remote validation, client/     │
│ ClassNames, and   │ return values,    │ server boundary checks,        │
│ parent paths.     │ events fired.     │ backdoor/obfuscation scanning. │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ 4. MULTIPLAYER QA │ 5. VISUAL QA      │ 6. PERFORMANCE QA              │
│ Replication,      │ UI overlap,       │ Deprecated wait() throttling,  │
│ server authority, │ clipping, and     │ memory leak detection, part    │
│ anti-spoofing.    │ contrast ratios.  │ density checks.                │
└───────────────────┴───────────────────┴────────────────────────────────┘
```

---

## 3. Automated Edge Case Generation

The platform automatically generates and tests edge cases for standard game mechanics:

### Economy / Shop Edge Cases
- Insufficient player balance.
- Invalid or deleted item ID.
- Rapid duplicate purchase requests (remote spam).
- Player disconnecting midway through transaction.
- Negative or non-integer currency amounts sent from client.

### Fishing Edge Cases
- Full inventory at time of catch.
- Rod unequipped or destroyed during cast timeline.
- Player character death or teleportation during reeling.
- Concurrent selling of the same fish instance.
