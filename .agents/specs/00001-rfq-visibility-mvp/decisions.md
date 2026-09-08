# Spec decision ledger

| ID | Question | Stance for this MVP | Status / owner |
|---|---|---|---|
| GAP-001 | What are the approved operational and client-facing status definitions? | Preserve original values and use conservative derived buckets only for navigation and counts. | Unresolved; Procurement, CS, BD |
| GAP-002 | Who owns requests from each inquiry origin? | Preserve Assigned Sales and Procurement Assignee independently; missing ownership is an exception. | Unresolved; BD, CS, Procurement |
| GAP-003 | What is the official communication source of truth? | Show source comments/reasons as evidence only; no communication workflow. | Unresolved; Operations, CS, BD |
| GAP-004 | Should the interim app write back to the tracker? | No; the source is read-only and the app writes only its own snapshot/metadata. | Deferred for validation; EXECOM, Procurement, IT |
| GAP-005 | What stale and high-value thresholds are approved? | Configurable environment values with clearly labelled demo defaults; no SLA is implied. | Unresolved; leadership, Procurement |
| GAP-006 | Which fields are mandatory for a valid request? | Do not reject rows for missing fields; retain source row and flag missing identity/ownership evidence. | MVP assumption; validate with Procurement |

## Technical decisions accepted for this implementation

- Use Node.js built-ins and a plain browser UI to keep the interim tool runnable without provisioning or dependency installation.
- Use a Google Sheets CSV export adapter plus a checked-in fixture adapter behind one source interface.
- Use a JSON snapshot as the app-owned read model; move to SQLite/Postgres only when deployment or concurrency needs it.
- Use `sheet:<gid>:row:<number>` as the stable physical row identity. Quote numbers are searchable display values and never a sole key.
