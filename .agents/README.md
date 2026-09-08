# Agent workspace

This directory is the working surface for the RFQ Visibility Application. It is intentionally small and auditable so that future agents can pick up the work without treating exploratory notes as policy.

## Operating rules

- Read `context/project-context.md` before changing product behavior.
- Read the current spec under `specs/` before making architecture or schema decisions.
- Treat `docs/source/PASEO_HANDOVER.md` as source material. Preserve its provenance and do not promote unresolved process questions into product rules.
- Record material unresolved questions in `decisions/open-decisions.md`.
- Keep the Procurement Tracker read-only. The application may only write its own snapshot and local metadata.
- Verify source-row traceability for every displayed request.

## Workspace map

- `context/` — bounded business and data context.
- `specs/` — versioned product specifications and status.
- `decisions/` — decisions to validate before policy or workflow changes.
- `resources/` — durable source artifacts when they are not part of the product UI.

## Provenance

The supplied handover is copied byte-for-byte to `docs/source/PASEO_HANDOVER.md`. Its SHA-256 is `8E8965AAD81954D9B030FEB67DC4D214518395BB56000D3521FF335432F6C674`.
