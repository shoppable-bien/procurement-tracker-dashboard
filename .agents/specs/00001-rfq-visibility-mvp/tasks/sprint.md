# MVP implementation plan

The user request explicitly delegates implementation of the staged MVP, so the plan is accepted for this pass even though policy Gaps remain unresolved. The app will stay within the read-only visibility boundary.

## Task sequence

1. **Foundation and source boundary** — create the Node runtime, exact-header CSV/Google source adapters, normalization model, JSON snapshot store, and fixture. Verify with unit tests and source immutability checks. Acceptance criteria: none.
2. **Vertical slice** — expose sync, health, search, request detail, and source-row links through a small HTTP API and plain browser UI. Verify with API smoke tests and a runnable local server. Acceptance criteria: rendered UI at the local app URL.
3. **Visibility expansion** — add dashboard counts, conservative exceptions, client grouping, grouped request views, and change feed after the slice is verified. Verify with fixture assertions, API smoke tests, and rendered UI states. Acceptance criteria: rendered dashboard, client, exception, and change views.

## Verification

- `npm test`
- `npm start` and HTTP smoke requests to `/`, `/api/health`, `/api/dashboard`, `/api/requests`, and `/api/requests/:id`
- Agent Workspace validator
- Confirm the source handover hash remains unchanged and no source write path exists.

## Current task status

Task 1 and Task 2 are implemented in this pass. Task 3 is included in the same MVP after the vertical slice because the user requested the staged follow-on visibility features.
