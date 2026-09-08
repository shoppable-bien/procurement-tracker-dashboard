# Task 00003 — visibility expansion

## Summary

Add dashboard counts, conservative exceptions, client grouping, grouped request support, and synchronization change visibility after the vertical slice.

## Implementation notes

- Derived status buckets are navigation heuristics only; original operational and client-facing values remain visible.
- Exception flags identify stale, blocked, missing ownership, and configurable high-value conditions without implying policy.

## Verification

Dashboard, client, change, duplicate-quote, and exception API checks passed against the fixture. The browser includes Overview, Search requests, Clients, and Changes views.

## Acceptance criteria

Rendered dashboard, client, exception, and change views are the review artifact. Human visual acceptance remains open.
