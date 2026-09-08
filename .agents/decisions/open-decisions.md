# Open decisions to validate

These questions are deliberately recorded instead of encoded as silent policy:

| ID | Question | Current implementation stance | Owner(s) to validate |
|---|---|---|---|
| DEC-001 | Is the EXECOM communication direction an approved rule? | Display ownership fields and source evidence; do not automate or enforce communication routing. | EXECOM, CS, BD, Procurement |
| DEC-002 | Who owns a request originating from Procurement, BD, or a direct client relationship? | Preserve source `Assigned Sales` and `Procurement Assignee` independently; label missing ownership as an exception. | BD, CS, Procurement |
| DEC-003 | What are the approved operational and client-facing status definitions? | Preserve original values and show a conservative derived bucket only for navigation/counts. | Procurement, CS, BD |
| DEC-004 | Which system is the official communication source of truth? | Show comments/reasons as source evidence only; no communication workflow. | Operations, CS, BD |
| DEC-005 | What FAQ, payment, and term guidance is approved for CS/BD? | No FAQ or guidance content shipped in the MVP. | Procurement, Finance, CS/BD |
| DEC-006 | Is limited write-back required in the interim? | No write-back; source and application APIs are read-only except for app-owned sync metadata. | EXECOM, Procurement, IT |
| DEC-007 | What stale threshold and value threshold should leadership use? | Configurable environment values; defaults are clearly labelled and not policy. | Leadership, Procurement |
