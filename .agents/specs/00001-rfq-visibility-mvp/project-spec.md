# RFQ Visibility Application — MVP project spec

## Product brief

Give CS, BD, Procurement, and leadership a dependable way to find an RFQ and understand its current evidence without scanning the Procurement Tracker. The MVP is a read-only application-owned view over a synchronized snapshot of `Procurement Tracker-2026 / Main File`; the tracker remains the operational workspace.

## User journeys

1. A CS/BD teammate searches by client, quote label, item, supplier, request row, or owner, sees a compact result, opens the detail, and follows the source-row link when evidence needs verification.
2. A Procurement user refreshes the snapshot, sees the last synchronization time and any source-access error, then reviews incomplete, stale, blocked, or high-value records.
3. A leader opens the dashboard, sees conservative counts for active, sourcing, quoted, won, cancelled, stale, and exception records, then drills into exceptions.
4. A teammate filters a client workspace to see that client’s requests and the distinct operational and client-facing status fields.
5. A teammate opens change visibility to see newly observed or changed source rows since the prior successful synchronization.

## Initial requirements

### Functional

- Read a configured Google Sheet CSV export for the exact `Main File` tab without modifying it.
- Normalize mapped fields while retaining the original source values, source row number, source URL, and sync timestamp.
- Support search/filter by client, quote number/label, request identity, item, supplier, Assigned Sales, Procurement Assignee, source channel, operational status, client-facing status, active, stale, and exception.
- Show request detail with client/item, owners, source status, client-facing status, reasons, quote/costing/PO/supplier/delivery evidence, distinct contact roles, and source link.
- Preserve blank, duplicate, and non-standard quote labels. Use a source-sheet-and-row-backed request ID; use a conservative composite only to identify related rows, never to merge solely by quote.
- Provide dashboard counts, client grouping, exceptions, and a compact change feed after a refresh.
- Make source access failures visible and preserve the last known app-owned snapshot when one exists.

### Non-functional

- Run locally with one documented command and no external service required for demo mode.
- Keep source adapter, normalization/read model, HTTP API, and UI in separate modules.
- Avoid dependencies in the first slice; a 4.5k-row snapshot is small enough for a local JSON read model.
- Make future replacement by Backoffice possible by keeping source and UI contracts internal and explicit.

## Assumptions

- The Google Sheet can be read through its CSV export by an authorized/public runtime, or the deployment will provide an equivalent read-only connector.
- In demo mode, a checked-in fixture stands in for the source so the UI is runnable without credentials.
- A physical source row is the safest unique request identity during the interim. Related-row grouping is conservative and requires matching quote plus context; it never merges rows based on quote alone.
- “Stale” is a navigation heuristic based on request date and a configurable threshold, not a committed SLA.
- Derived status buckets are for counts/navigation; original operational and client-facing values remain visible.
- The local JSON snapshot is a replaceable application-owned read model, not a second source of truth for Procurement.

## Recommended interim stack

- Node.js 22+ with the built-in `http`, `fetch`, filesystem, and test runner APIs.
- Plain browser HTML/CSS/JavaScript for the first UI; no framework or build step is needed for this read-only surface.
- Google Sheets CSV export as the initial source connector, configured by spreadsheet ID and GID.
- Versioned JSON snapshot for local/demo use; move to SQLite or Postgres only when deployment/concurrency requires it.
- Hosting can be any small Node service; the app does not depend on Google Apps Script and can later sit behind Backoffice APIs.

This is intentionally pragmatic for an interim internal tool: the architecture boundaries are explicit, while operational infrastructure is not prematurely fixed.

## Open decisions

See [open-decisions.md](../../decisions/open-decisions.md). In particular, do not encode communication ownership, FAQ guidance, approved status definitions, or write-back permissions.

## Acceptance criteria

- A clean checkout starts with `npm start` and exposes the UI and JSON API.
- Demo mode synchronizes a fixture and shows a visible synchronization timestamp.
- Configured source mode reads `Main File` by spreadsheet ID/GID and never writes to the source.
- Every result/detail contains a stable source-row-backed ID and a direct source-row link.
- Blank, duplicate, and non-standard quote labels remain distinct unless a conservative related-row key matches more context; no quote-only merge occurs.
- Operational status, client-facing status, procurement delay reason, and non-proceeding reason remain distinct in the API and UI.
- Client, supplier, and delivery contacts remain distinct in the API and UI.
- Search and filters work for client, quote, item, supplier, both owners, statuses, active, stale, and exceptions.
- Dashboard, client grouping, exceptions, and change feed are visible after synchronization.
- A source access failure is returned by health/API and does not erase the previous successful snapshot.
