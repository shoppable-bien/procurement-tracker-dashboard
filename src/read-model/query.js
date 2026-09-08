function lower(value) {
  return String(value ?? '').toLowerCase();
}

function matchesText(record, query) {
  if (!query) return true;
  const haystack = [
    record.requestId,
    record.displayId,
    record.identity.quoteNumber,
    record.request.clientName,
    record.request.item,
    record.request.productCategory,
    record.request.inquiryOrigin,
    record.ownership.assignedSales,
    record.ownership.procurementAssignee,
    record.supplier.name,
    record.status.operational,
    record.status.clientFacing,
    record.source.row,
  ].map(lower).join(' ');
  return haystack.includes(lower(query));
}

function includesFilter(value, filter) {
  return !filter || lower(value).includes(lower(filter));
}

function exactFilter(value, filter) {
  return !filter || lower(value) === lower(filter);
}

export function filterRecords(records, params = {}) {
  const query = String(params.q || '').trim();
  const active = params.active === 'true';
  const stale = params.stale === 'true';
  const exception = params.exception === 'true';
  return records.filter((record) => {
    if (!matchesText(record, query)) return false;
    if (!includesFilter(record.request.clientName, params.client)) return false;
    if (!includesFilter(record.supplier.name, params.supplier)) return false;
    if (!includesFilter(record.ownership.assignedSales, params.owner)) return false;
    if (!includesFilter(record.ownership.procurementAssignee, params.procurementOwner)) return false;
    if (!includesFilter(record.request.inquiryOrigin, params.sourceChannel)) return false;
    if (!exactFilter(record.status.operationalBucket, params.operationalStatus)) return false;
    if (!includesFilter(record.status.clientFacing, params.clientFacingStatus)) return false;
    if (active && !record.flags.active) return false;
    if (stale && !record.flags.stale) return false;
    if (exception && !record.flags.exception) return false;
    return true;
  });
}

export function groupRecords(records) {
  const groups = new Map();
  records.forEach((record) => {
    const key = record.identity.relatedKey || record.requestId;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(record);
  });
  return Array.from(groups.entries()).map(([groupId, grouped]) => ({
    groupId,
    requestId: grouped[0].requestId,
    recordCount: grouped.length,
    displayId: grouped[0].displayId,
    quoteNumber: grouped[0].identity.quoteNumber,
    clientName: grouped[0].request.clientName,
    item: grouped[0].request.item,
    sourceRows: grouped.map((record) => record.source.row),
    statuses: Array.from(new Set(grouped.map((record) => record.status.operational).filter(Boolean))),
    records: grouped.map(summarizeRecord),
  }));
}

export function clientGroups(records) {
  const groups = new Map();
  records.forEach((record) => {
    const key = record.request.clientName || 'Unassigned client';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(record);
  });
  return Array.from(groups.entries())
    .map(([clientName, grouped]) => ({
      clientName,
      requestCount: grouped.length,
      activeCount: grouped.filter((record) => record.flags.active).length,
      exceptionCount: grouped.filter((record) => record.flags.exception).length,
      records: grouped.map(summarizeRecord),
    }))
    .sort((a, b) => b.requestCount - a.requestCount || a.clientName.localeCompare(b.clientName));
}

export function dashboardSummary(records, snapshot, config) {
  const count = (predicate) => records.filter(predicate).length;
  const bucket = (name) => count((record) => record.status.operationalBucket === name);
  return {
    total: records.length,
    active: count((record) => record.flags.active),
    sourcing: bucket('sourcing'),
    blocked: bucket('blocked'),
    quoted: bucket('quoted'),
    won: bucket('won'),
    cancelled: bucket('cancelled'),
    stale: count((record) => record.flags.stale),
    exceptions: count((record) => record.flags.exception),
    missingOwnership: count((record) => record.flags.missingOwnership),
    highValue: count((record) => record.flags.highValue),
    activeEstimatedValue: records
      .filter((record) => record.flags.active)
      .reduce((total, record) => total + (record.commercial.estimatedRfqValue || 0), 0),
    thresholds: {
      staleAfterHours: config.staleAfterHours,
      highValueThreshold: config.highValueThreshold,
    },
    lastSynchronizedAt: snapshot?.synchronizedAt || null,
    sourceHealth: snapshot?.health || { ok: false, lastError: 'No snapshot available' },
  };
}

export function summarizeRecord(record) {
  return {
    requestId: record.requestId,
    displayId: record.displayId,
    source: record.source,
    synchronizedAt: record.synchronizedAt,
    identity: record.identity,
    request: record.request,
    ownership: record.ownership,
    status: record.status,
    supplier: { name: record.supplier.name },
    delivery: { status: record.delivery.status, eta: record.delivery.eta },
    flags: record.flags,
  };
}

export function apiRecord(record) {
  return record;
}
