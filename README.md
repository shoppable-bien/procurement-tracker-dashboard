# RFQ Visibility Application

An interim, read-only visibility layer over the Procurement Tracker. Procurement continues working in the source tracker; this application synchronizes a separate application-owned read model for search, detail, dashboard, exceptions, client grouping, and change visibility.

## Run the demo

Requires Node.js 22 or newer. The demo uses the checked-in fixture, so it needs no credentials or external services.

```text
npm test
npm start
```

Open `http://localhost:3000`.

## Use the Google Sheet source

The source adapter reads a Google Sheets CSV export and never writes to the source workbook. Configure the runtime with environment variables before starting:

```text
$env:SOURCE_MODE = "google"
$env:SOURCE_SPREADSHEET_ID = "1-vvh10uQFz4-vjBCDrW52MZnmBfdxgj_3O36vs7mjAk"
$env:SOURCE_SHEET_GID = "1587599917"
$env:SOURCE_SHEET_NAME = "Main File"
npm start
```

If access requires authentication, provide an authorized equivalent CSV connector through `SOURCE_CSV_URL`; deployment/authentication is intentionally not overbuilt in this MVP.

## Boundaries

- `src/source/` reads CSV/Google source material.
- `src/model/` normalizes source rows while preserving raw values and physical row identity.
- `src/store/` writes only `data/snapshot.json`, the application-owned read model.
- `src/read-model/` provides query and dashboard projections.
- `src/ui/` is the plain browser interface.
- `.agents/` is the ChrisAI Agent Workspace; start with `.agents/context/index.md` and the active spec.

Boundaries that must remain explicit: quote numbers are display/search fields, not unique identity; every request is keyed by source sheet/GID and physical row; operational and client-facing status remain separate; and client, supplier, and delivery contacts remain separate.
