# RFQ Visibility Application — product brief

## Goal

Give CS, BD, Procurement, and leadership a dependable way to search and understand RFQs without manually scanning the Procurement Tracker.

## Scope

- Read the configured `Procurement Tracker-2026 / Main File` source without writing to it.
- Keep a separate application-owned normalized snapshot with sync health and source-row provenance.
- Provide request search, detail evidence, source links, dashboard counts, client grouping, exceptions, and change visibility.
- Keep operational status, client-facing status, and contact roles distinct.

## Non-goals

Authentication, workflow editing, notifications, FAQ management, write-back, source replacement, and integrations are deferred until the visibility experience is validated.

## Actors

CS/BD teammates, Procurement users, leadership, and the source synchronization process. The source spreadsheet is a dependency, not a human actor.

## Evidence and authority

The supplied handover at `docs/source/PASEO_HANDOVER.md` is preserved byte-for-byte and describes prototype behavior and current-state evidence. It is not an approval of communication ownership, status definitions, thresholds, or write-back policy.
