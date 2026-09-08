# Paseo Handover — RFQ Visibility Application

This document transfers the RFQ visibility problem, current-state context, source spreadsheet, Google Sheets prototype, Apps Script implementation, known defects, and recreation requirements to Paseo.

The intended next step is to recreate this prototype as a maintainable application while preserving the source procurement tracker as read-only during the interim phase.

## 1. Handover objective

The business process project is trying to give CS, BD, Procurement, and leadership a reliable way to see what is happening to each request for quotation (RFQ) without manually searching and interpreting a large procurement spreadsheet.

Paseo should use this handover to:

- understand the business problem and operating context;
- connect to the existing procurement source structure;
- reproduce the current Google Sheets mini application;
- improve the application-style search, client view, status visibility, and exceptions experience;
- preserve source-row traceability;
- keep the source tracker read-only until a future write-back design is explicitly approved;
- identify the requirements and decisions that still need owner validation before production use.

This is an interim visibility prototype, not an approved future-state process, policy, SOP, or production system.

## 2. Short problem statement

EXECOM direction discussed in the source thread is that CS and BD should communicate with clients, while Procurement should not direct communications to clients. The practical concern raised by Mark, Head of Business/BD, is visibility: if CS/BD owns client communication, they need to see what is happening to each request, what is available, what is still being sourced, what the blocker is, and what answer can be given to the client.

Mark’s position in the thread was hesitant rather than a final rejection. The concerns included:

- multiple intake routes and procurement scenarios;
- the risk of changing communication ownership before information is visible;
- the need for FAQs and standardized answers;
- the possible need for a dedicated Procurement person or admin to support CS/BD;
- uncertainty over how direct-account ownership should work.

The meeting was part of process mapping and improvement. Its notes were exploratory and should not be treated as a finalized operating rule without owner validation.

## 3. Operating context

### 3.1 Accepted reusable truth from the Operations KB

The local Operations KB records the following reusable baseline:

- Procurement Tracker is the required operational entry point before Procurement begins costing or quote work.
- The minimum information for an actionable RFQ is Item, Quantity, Contact Person, and Address.
- Requests can originate from multiple channels, including Email, Facebook, Viber, WhatsApp, Intercom, Freshdesk, Quotable/RFQ Marketplace, phone, SMS, and other routes.
- Attio, Intercom, channel inboxes, phone records, and Google Sheets may contain parallel or supporting information; these systems are not consistently connected to the Procurement Tracker.
- Procurement owns completeness review, costing, and quote preparation.
- CS/BD source owners are expected to remain accountable for customer follow-up for requests originating in their channels, but the ownership rule is not consistently enforced.
- Quotable is the customer-facing quote record; costing sheets remain working calculation records.
- Supplier availability, quote revisions, customer approval evidence, PO-match checks, and handoff evidence are not consistently linked to the Procurement Tracker.

These statements are accepted bounded current-state context, not a target-state design.

### 3.2 Bounded current-state evidence from this thread

The thread and live sheet inspection establish the following prototype context:

- Teams are heavily dependent on spreadsheets for procurement tracking.
- Intake and communication sources are fragmented.
- The existing tracker contains useful operational data but behaves as a spreadsheet rather than an application.
- Technology is expected to digitize the procurement process, but the intended larger applications are expected to take approximately one month before they are usable.
- An interim Apps Script dashboard was proposed to provide visibility while the larger solution is being developed.

These are bounded observations for this handover. They do not replace process-owner playback.

### 3.3 Unresolved process and governance questions

Paseo must not silently decide these questions:

- Is the EXECOM communication direction an approved rule, a decision in progress, or only a meeting recommendation?
- Should CS/BD always communicate externally, including supplier-availability explanations and quote revisions?
- When is Procurement allowed to communicate directly for direct Procurement-originated requests?
- Who owns a client account when the request originates from Procurement, BD, or a personal client relationship?
- What is the official source of truth for communications?
- What are the approved statuses and definitions for sourcing, quote readiness, client feedback, won, cancelled, and delivery?
- What FAQ content and payment/term guidance may be shown to CS/BD?
- Should the interim dashboard remain read-only, or is limited write-back eventually required?

## 4. Procurement source file

### 4.1 Live source workbook

The runtime source supplied for the prototype is the Google Sheet:

- Workbook: `Procurement Tracker-2026`
- Source tab: `Main File`
- URL: [Procurement Tracker-2026 — Main File](https://docs.google.com/spreadsheets/d/1-vvh10uQFz4-vjBCDrW52MZnmBfdxgj_3O36vs7mjAk/edit?gid=1587599917#gid=1587599917)
- Spreadsheet ID: `1-vvh10uQFz4-vjBCDrW52MZnmBfdxgj_3O36vs7mjAk`
- Main File sheet ID: `1587599917`
- Header row: `1`

Metadata observed during the prototype read:

- Configured size: 4,948 rows x 120 columns.
- One frozen header row and five frozen columns.
- 65 populated headers were observed through column `BM`.
- 4,493 populated data rows were observed through source row `4,494`.
- Workbook timezone is `Asia/Hong_Kong`; the dashboard Apps Script is configured for `Asia/Manila`. Both are UTC+8, but the mismatch should be made explicit in a future system.

### 4.2 Local procurement process-register file

The repository also contains a local procurement process-register workbook used as discovery evidence and process census material. It is not the runtime data source for the Apps Script dashboard:

- [Procurement process-register workbook](../../.agents/resources/process-registers/procurement-process-register.xlsx)

The live Google Sheet above is the source that the prototype reads.

### 4.3 Source safety rule

The `Main File` tab must remain read-only for the interim application. The dashboard may read the source and create a normalized snapshot in a separate workbook, but it must not clear, reformat, append to, or update the procurement source.

## 5. Source field map

The exact source map is documented in [source-field-map.md](source-field-map.md). The main fields are:

| Application concept | Source column | Exact source header |
|---|---:|---|
| Request date | C | `DATE REQUESTED` |
| Inquiry origin | D | `INQUIRY ORIGIN` |
| Company/client name | E | `COMPANY NAME (Please complete company name)` |
| Deadline | F | `DEADLINE MM/DD/YYYY` |
| Date quoted | G | `DATE QUOTED MM/DD/YYYY` |
| Quote number | L | `QUOTE NO. (QU-000000)` |
| Procurement delay reason / blocker | M | `PROCUREMENT- REASON OF QUOTE DELAYS` |
| Customer/CS comments | N | `CUSTOMER FEEDBACK/ CS COMMENTS` |
| Assigned Sales / CS-BD owner | O | `ASSIGNED SALES` |
| Client contact person | P | `CONTACT PERSON` |
| Client contact number | Q | `CONTACT NUMBER` |
| Client email | R | `EMAIL ADDRESS` |
| Procurement assignee | S | `PROCUREMENT ASSIGNEE` |
| Product inquiry | T | `PRODUCT INQUIRY` |
| Costing sheet | U | `COSTING SHEET` |
| Product category | V | `PRODUCT CATEGORY` |
| Quantity | W | `QUANTITY` |
| Quoted unit price | Z | `QUOTED PRICE TO CLIENT` |
| Total quoted amount | AA | `TOTAL PRICE OF ITEMS WITH QUANTITY` |
| Operational/process status | AB | `STATUS` |
| QDW number | AC | `QDW NO. (PLEASE ADD ONCE QUOTE IS WON)` |
| Non-proceeding reason | AD | `REASONS- QUOTE NOT PUSHING THROUGH` |
| Customer PO number | AF | `CUSTOMER PO NUMBER` |
| Customer PO link/evidence | AG | `CUSTOMER PO LINK` |
| Supplier | AH | `SUPPLIER` |
| PO status | AO | `PO Status ( Procurement & Acctng)` |
| Item delivery status | BG | `Item Status ( Delivered)` |
| Client-facing status | BK | `CLIENT-FACING STATUS` |
| Priority | BL | `PRIORITY` |
| Estimated RFQ value | BM | `ESTIMATED RFQ VALUE` |

Additional fields cover supplier contacts, warehouse and delivery details, ETA, payment, logistics, proof of delivery, invoice number, and fulfilment comments.

Important distinctions:

- Client contact is `P/Q`; supplier contact is `AJ/AK`; delivery contact is `AS/AT`.
- Operational status is `AB`; client-facing status is `BK`.
- Procurement delay narrative is `M`; closed/non-proceeding reason is `AD`.
- Historical quote total is `AA`; newer estimated RFQ value is `BM`.

### 5.1 Source data quality constraints

The application must not assume that the spreadsheet is a clean relational table:

- Some rows have no quote number.
- Some quote-number cells contain manual quote labels, order numbers, `Cancelled`, or other non-standard values.
- Duplicate quote values exist.
- A quote number is therefore not always a unique request key.
- The application must preserve the physical source row and provide a source-row link.
- `CLIENT-FACING STATUS`, `PRIORITY`, and `ESTIMATED RFQ VALUE` are populated only in a newer structured segment observed around rows `3,662–4,471`; blank older values do not mean that the request has no status or value.
- Free-text fields contain spelling variations, multi-line update logs, and multiple names separated by `/`.

The current prototype uses a quote number where available and falls back to `SOURCE-ROW-n` when it is blank. Paseo should improve this with a stable composite key or a source-row-backed request identity while retaining the quote number as a display field.

## 6. Google Sheets prototype

### 6.1 Dashboard workbook

The separate dashboard workbook is named `RFQ Visibility Application`. It is the presentation and snapshot layer. It must not replace the source tracker during the interim period.

The V2 Apps Script creates or maintains these tabs in the dashboard workbook:

| Tab | Purpose |
|---|---|
| `_Config` | Source workbook ID/URL, source tab, header row, email recipients, stale threshold, high-value threshold, valuation mode |
| `Field Mapping` | Canonical-field to exact-source-header overrides |
| `Dashboard` | Summary metrics, status counts, exceptions, active valuation, refresh information |
| `RFQ Snapshot` | Normalized read-only copy of source records used by the application |
| `Exceptions` | Stale, incomplete, blocked, or high-value RFQs |
| `Change Feed` | New RFQs and changes detected between refreshes |
| `Header Audit` | Matched canonical fields, source headers, source columns, and purposes |

If an earlier failed installer created a tab named `Config`, V2 does not use it. The correct V2 tab is `_Config`. It can be left alone while troubleshooting; do not delete or modify the source workbook.

### 6.2 Search sidebar / mini application

The sidebar supports:

- free-text search across request/RFQ, quote, client, supplier, and item;
- filters for client, status, CS/BD owner, and Procurement owner;
- active-only and stale-only filtering;
- grouped results with one result per RFQ/request;
- RFQ detail view;
- line-item view;
- client workspace view;
- source-row links back to the procurement tracker;
- manual refresh from the sidebar.

The current UI is intentionally application-like, but it still depends on the spreadsheet as its storage and snapshot surface.

## 7. Apps Script implementation

### 7.1 Package files

The current package is in this folder:

- [V2 README](README.md)
- [Code.gs](Code.gs)
- [SearchSidebar.html](SearchSidebar.html)
- [appsscript.json](appsscript.json)
- [MainFileSourceMapping.gs](MainFileSourceMapping.gs)
- [MainFileSourceMappingSafe.gs](MainFileSourceMappingSafe.gs)
- [MainFileSourceConstants.gs](MainFileSourceConstants.gs)
- [Exact source field map](source-field-map.md)
- [Mapping setup instructions](MAIN_FILE_MAPPING_SETUP.md)
- [Mapping troubleshooting](MAIN_FILE_MAPPING_TROUBLESHOOTING.md)

The V1 package remains as an earlier baseline in [the parent outputs folder](../rfq-visibility-appscript), but V2 is the application-style implementation to recreate.

### 7.2 Main functions

| Function | Behavior |
|---|---|
| `setupDashboard()` | Stores the dashboard ID, creates dashboard tabs, and prompts for the source spreadsheet URL/ID |
| `showRfqSearch()` | Opens the HTML search sidebar |
| `refreshNow()` | Manually refreshes the snapshot and dashboard |
| `refreshFromSidebar()` | Refreshes and returns updated sidebar options |
| `sendDigestNow()` | Refreshes and sends an email digest immediately |
| `sendDailyDigest()` | Trigger handler for the daily digest |
| `installTriggers()` | Installs a 15-minute refresh trigger and a daily digest trigger around 8:00 |
| `removeTriggers()` | Removes the managed triggers |
| `installMainFileExactMappingSafe()` | Safely configures the exact `Main File` source mapping |
| `diagnoseMainFileMappingSafe()` | Reports active workbook, tab presence, and mapping context without writing |

### 7.3 Refresh data flow

```text
Dashboard action or time trigger
  → read _Config
  → open source workbook by ID
  → read Main File row 1 headers and populated range
  → resolve exact/canonical field mapping
  → create normalized records with source row links
  → group records by request identity
  → calculate exceptions and change events
  → write RFQ Snapshot, Exceptions, Change Feed, Header Audit, and Dashboard
  → serve sidebar search/detail results
```

### 7.4 Configuration

V2 reads these keys from `_Config`:

| Key | Required value for this source |
|---|---|
| `SOURCE_SPREADSHEET_URL_OR_ID` | `1-vvh10uQFz4-vjBCDrW52MZnmBfdxgj_3O36vs7mjAk` |
| `SOURCE_SHEET_NAME` | `Main File` |
| `SOURCE_HEADER_ROW` | `1` |
| `EMAIL_RECIPIENTS` | Comma-separated recipients; optional until email is tested |
| `STALE_AFTER_HOURS` | Default `24`; adjust only after agreement on stale definition |
| `HIGH_VALUE_THRESHOLD` | Default `0`; zero disables the flag |
| `VALUATION_MODE` | `RFQ_TOTAL` by default; `LINE_VALUE` only when mapped values are line-level |

### 7.5 Refresh and email behavior

- Manual refresh is available through the `RFQ Control Tower` menu and the sidebar.
- Scheduled refresh is every 15 minutes after triggers are installed.
- Daily digest is scheduled around 8:00 AM in the Apps Script timezone. Google time triggers run within a time window rather than at an exact minute.
- The digest summarizes active RFQs, sourcing, quote-ready work, stale RFQs, exceptions, active estimated value, the first ten exceptions, and a dashboard link.
- The user who installs triggers must retain access to the source workbook because time-driven triggers run under that user’s authorization.

## 8. Mapping installer status and known implementation issue

The first safe-installer attempt failed with:

```text
Main File mapping failed during Config sheet: MAIN_FILE_SOURCE_SPREADSHEET_ID is not defined
```

The active workbook was confirmed as `RFQ Visibility Application`, so the failure was not caused by running from the source workbook. The issue was a dependency on constants from another optional `.gs` file.

The local package was corrected as follows:

- `MainFileSourceMappingSafe.gs` now contains its own source ID and source tab constants.
- Both installers target V2’s `_Config` sheet, not `Config`.
- Both installers write `SOURCE_SPREADSHEET_URL_OR_ID`, which is the key read by `Code.gs`.
- `MainFileSourceConstants.gs` remains available for compatibility with the original installer.
- The mapping files pass JavaScript syntax checks when piped through Node’s parser.

For the current dashboard project, add the updated [MainFileSourceMappingSafe.gs](MainFileSourceMappingSafe.gs), save, and run:

```javascript
installMainFileExactMappingSafe();
```

Then run the normal dashboard refresh. Do not clear the source file. If the dashboard’s `_Config` or `Field Mapping` tab is protected or structurally corrupted, create a fresh dashboard shell rather than resetting the procurement source.

## 9. Current prototype limitations

The V2 app is useful as an interim visibility layer, but Paseo should treat these as known limitations:

- The source remains a spreadsheet and has no controlled request identity.
- The current core `CANONICAL_FIELDS` list exposes only the main search/detail fields; the full source map includes additional client, PO, delivery, and fulfilment fields that should be surfaced in the recreated app.
- The current sidebar does not expose every mapped field, including the newer client-facing status, priority, and estimated RFQ value fields.
- The source has multiple status layers and free-text reasons that need a normalized status model.
- Quote numbers are not reliably unique or consistently formatted.
- Blank quote numbers fall back to physical source rows, but duplicate/non-standard identifiers need a better identity strategy.
- The source contains multiple communication channels but no central communication source of truth.
- No write-back or controlled status-edit workflow has been approved.
- Email recipients, stale thresholds, high-value thresholds, and status definitions remain configuration decisions.
- The existing prototype does not implement FAQ content or a formal CS/BD-to-Procurement escalation workflow.
- The current source-read model assumes the installer user continues to have access to the source workbook.

## 10. Paseo recreation brief

Paseo should recreate the application in stages.

### Stage 1 — Read-only parity MVP

- Create a source connector for the Google Sheet ID and exact tab `Main File`.
- Read header row 1 and map the 65 populated source fields through `BM`.
- Preserve exact source row references and source links.
- Store a normalized RFQ/request model separate from the source spreadsheet.
- Implement a stable request identity that does not merge unrelated rows solely because their quote labels match.
- Recreate search by quote/request, client, assigned sales, Procurement assignee, supplier, item, and source channel.
- Recreate client filtering and client workspace views.
- Recreate operational status, client-facing status, procurement delay reason, closed reason, priority, valuation, and supplier/PO visibility.
- Preserve line-item detail and grouped RFQ views.
- Provide a visible “last synchronized” timestamp and source-access error state.

### Stage 2 — Visibility and communication support

- Add status normalization with the original source status retained for traceability.
- Add missing-field and stale-request exceptions.
- Add change history between synchronizations.
- Add configurable email or orchestrator notifications.
- Add FAQ references and approved response guidance only after Procurement/BD/CS owner validation.
- Allow CS/BD to see enough information to communicate without requiring Procurement to direct to the client.

### Stage 3 — Controlled workflow and system transition

- Confirm ownership and communication rules with EXECOM, BD, CS, and Procurement.
- Define approved write-back permissions and audit history, if write-back is required.
- Replace spreadsheet-dependent intake with the approved ticketing/source system.
- Link costing, Quotable, PO, Accounting, and Logistics records using controlled identifiers.
- Migrate from the interim dashboard to the approved procurement application.

## 11. Acceptance criteria for the recreated MVP

Paseo’s first recreated version should be considered successful when:

- it reads `Procurement Tracker-2026` / `Main File` without modifying it;
- it maps the requested fields correctly: Company Name, Quote No., Assigned Sales, Contact Person, Number, Procurement Assignee, Status, Reasons, and procurement details;
- it distinguishes client, supplier, and delivery contacts;
- it distinguishes operational status from client-facing status;
- it distinguishes procurement delay narrative from closed/non-proceeding reason;
- it supports search and filtering by client, quote number, request identity, assigned sales, Procurement assignee, status, supplier, and item;
- it preserves the source row link for every displayed request and line;
- it handles blank, duplicated, and non-standard quote numbers without silently merging unrelated requests;
- it displays the last synchronization time and source access failures;
- it provides dashboard counts for active, stale, sourcing, quote-sent, won, cancelled, and exception records;
- it does not require the procurement team to manually remap source headers each time the app is initialized;
- it does not write to the source tracker.

## 12. Provenance and authority

### Internal KB used

- [Operations KB index](../../.agents/context/index.md)
- [Operations project scope](../../.agents/context/project-scope.md)
- [RFQ Intake current state](../../.agents/context/rfq-intake-current-state.md)
- [Procurement detailed current state](../../.agents/context/procurement-detailed-current-state.md)
- [RFQ Costing → Quote → PO current state](../../.agents/context/rfq-costing-quote-po-current-state.md)
- [Operations current-state checkpoint](../../.agents/context/operations-current-state-checkpoint.md)
- [Active discovery spec status](../../.agents/specs/00001-operations-process-discovery/status.md)

### Authority classification

- The Operations KB records accepted reusable baseline and bounded current-state context.
- The user-provided meeting notes and this thread are source material and working evidence, not approved policy.
- The Apps Script package is a technical prototype/proof of concept, not a frozen implementation contract.
- The source Google Sheet is the current operational tracker used by the prototype; it is not assumed to be a clean database.
- No public web research was used for the internal-process findings.

### External context

Paseo (`https://paseo.sh/`) is the requested destination/orchestrator for continuing the work. Its product capabilities were not used as a source of truth in this handover; Paseo should validate its own integration, deployment, authentication, and data-connector requirements.

## 13. Suggested Paseo starting prompt

```text
Recreate the RFQ Visibility Application described in PASEO_HANDOVER.md.

Start with a read-only parity MVP using the Google Sheet:
  Spreadsheet ID: 1-vvh10uQFz4-vjBCDrW52MZnmBfdxgj_3O36vs7mjAk
  Tab: Main File
  Header row: 1

Do not modify the source sheet. Implement an exact source adapter for columns A:BM, preserve source-row links, and do not use Quote No. as the only unique request key. Recreate search, filters, grouped RFQ results, client view, line-item detail, statuses, reasons, supplier/PO visibility, stale/exception views, synchronization timestamp, and change history. Preserve operational status and client-facing status as separate fields.

Load the local Operations context linked in the handover. Treat EXECOM’s communication direction, Mark’s visibility concerns, FAQ needs, and ownership questions as unresolved or decision-in-progress context unless an owner validates them. Treat the Apps Script as a prototype to reproduce and improve, not as an approved target-state process.
```
