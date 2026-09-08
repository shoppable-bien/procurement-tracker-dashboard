# Task 00002 — vertical slice

## Summary

Expose synchronization, health, search, request detail, and source-row traceability through a no-dependency Node HTTP service and plain browser interface.

## Implementation notes

- `/api/requests` returns compact summaries; `/api/requests/:id` returns full-fidelity detail.
- The UI shows a direct source-row link and separate status/contact sections.

## Verification

Local HTTP smoke checks passed for `/`, `/api/health`, `/api/requests`, `/api/requests/:id`, and `POST /api/sync`.

## Acceptance criteria

Rendered browser surface at `http://localhost:3000` is the review artifact. Human visual acceptance remains open; the interface uses document-relative static assets and no external dependency.
