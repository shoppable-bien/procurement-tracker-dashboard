# Task 00001 — foundation and source boundary

## Summary

Create the runtime config, fixture/Google CSV adapter, exact source field map, normalized record model, and application-owned JSON snapshot.

## Implementation notes

- Physical source identity is `sheet:<gid>:row:<number>`.
- Raw source values remain on the normalized record; quote labels are display/search fields.
- Source failure updates app-owned health metadata and preserves the last successful snapshot.

## Verification

`npm test` passes CSV parsing, field normalization, identity, dashboard projection, fixture sync, and source-failure preservation tests.

## Acceptance criteria

Acceptance criteria: none; this is a technical foundation task.
