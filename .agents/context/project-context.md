# Project context: RFQ visibility

## Purpose

Procurement manages RFQs in the `Procurement Tracker-2026` Google Sheet, `Main File` tab. The tracker is useful operationally but difficult for CS, BD, Procurement, and leadership to search and interpret. This application is a read-only visibility and search layer for the interim period.

## Source evidence

- Spreadsheet ID: `1-vvh10uQFz4-vjBCDrW52MZnmBfdxgj_3O36vs7mjAk`
- Sheet: `Main File`
- GID: `1587599917`
- Header row: `1`
- Expected populated range: through `BM` (65 mapped fields observed in the handover).
- Canonical source: [the supplied handover](../../docs/source/PASEO_HANDOVER.md).

The source is manually maintained and may contain blank, duplicated, or non-standard quote numbers, free-text updates, duplicated rows, and incomplete records. Physical source row identity and a direct source link are therefore first-class data.

## Boundaries

- The source tracker must never be modified by this application.
- The application owns a separate normalized read model. The initial implementation uses a local JSON snapshot so it can run without provisioning a database; this is replaceable by SQLite/Postgres or a secondary workbook later.
- Operational status and client-facing status are separate fields.
- Client, supplier, and delivery contacts are separate fields.
- Quote numbers are display/search fields, never the sole identity.
- No authentication, workflow editing, notifications, FAQ management, write-back, or integrations are in scope for the initial visibility slice.

## Authority

The handover and Operations context describe current-state evidence and prototype behavior. Communication ownership, status definitions, official communication source, FAQ content, and any write-back are unresolved until validated by the relevant owners.
