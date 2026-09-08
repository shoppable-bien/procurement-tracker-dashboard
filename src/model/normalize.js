import crypto from 'node:crypto';
import { valueFor } from '../source/field-map.js';
import { sourceRowUrl } from '../source/adapter.js';

const CLOSED_BUCKETS = new Set(['cancelled', 'fulfilled']);

function clean(value) {
  return String(value ?? '').trim();
}

function parseDate(value) {
  const text = clean(value);
  if (!text) return null;
  const match = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (match) {
    const year = Number(match[3].length === 2 ? `20${match[3]}` : match[3]);
    const parsed = new Date(Date.UTC(year, Number(match[1]) - 1, Number(match[2])));
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
  }
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}

function parseNumber(value) {
  const text = clean(value).replace(/[^\d.-]/g, '');
  if (!text || text === '-' || text === '.') return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}

export function deriveOperationalBucket(status) {
  const value = clean(status).toLowerCase();
  if (!value) return 'unknown';
  if (/cancel|not push|lost|declined|reject/.test(value)) return 'cancelled';
  if (/deliver|fulfil|fulfilled|closed/.test(value)) return 'fulfilled';
  if (/won|confirmed|purchase order|po received/.test(value)) return 'won';
  if (/quote|quoted|sent|ready/.test(value)) return 'quoted';
  if (/block|delay|hold|await/.test(value)) return 'blocked';
  if (/sourc|procure|pending|follow/.test(value)) return 'sourcing';
  return 'active';
}

function hash(value) {
  return crypto.createHash('sha1').update(value).digest('hex').slice(0, 12);
}

function stableFingerprint(record) {
  return hash(JSON.stringify(record));
}

export function normalizeRow(sourceRecord, { sourceRow, syncedAt, config, asOf = new Date() }) {
  const quoteNumber = valueFor(sourceRecord, 'quoteNumber');
  const clientName = valueFor(sourceRecord, 'clientName');
  const productInquiry = valueFor(sourceRecord, 'productInquiry');
  const requestedDate = parseDate(valueFor(sourceRecord, 'requestedDate'));
  const operationalStatus = valueFor(sourceRecord, 'operationalStatus');
  const operationalBucket = deriveOperationalBucket(operationalStatus);
  const estimatedRfqValue = parseNumber(valueFor(sourceRecord, 'estimatedRfqValue'));
  const requestedAt = requestedDate ? new Date(`${requestedDate}T00:00:00Z`).getTime() : null;
  const staleAfterMs = config.staleAfterHours * 60 * 60 * 1000;
  const stale = Boolean(requestedAt && asOf.getTime() - requestedAt > staleAfterMs && !CLOSED_BUCKETS.has(operationalBucket));
  const procurementDelayReason = valueFor(sourceRecord, 'procurementDelayReason');
  const assignedSales = valueFor(sourceRecord, 'assignedSales');
  const procurementAssignee = valueFor(sourceRecord, 'procurementAssignee');
  const blocked = operationalBucket === 'blocked' || Boolean(procurementDelayReason);
  const requestId = `sheet:${config.gid}:row:${sourceRow}`;
  const relatedKey = quoteNumber && clientName && productInquiry && requestedDate
    ? `related:${hash([quoteNumber.toLowerCase(), clientName.toLowerCase(), productInquiry.toLowerCase(), requestedDate].join('|'))}`
    : null;
  const missingOwnership = !assignedSales && !procurementAssignee;
  const sourceLink = sourceRowUrl({ spreadsheetId: config.spreadsheetId, gid: config.gid, sourceRow });

  const record = {
    requestId,
    displayId: quoteNumber || `Source row ${sourceRow}`,
    source: {
      spreadsheetId: config.spreadsheetId,
      sheetName: config.sheetName,
      gid: config.gid,
      row: sourceRow,
      range: `A${sourceRow}:BM${sourceRow}`,
      url: sourceLink,
    },
    synchronizedAt: syncedAt,
    identity: { quoteNumber, relatedKey },
    request: {
      requestedDate,
      deadline: parseDate(valueFor(sourceRecord, 'deadline')),
      dateQuoted: parseDate(valueFor(sourceRecord, 'dateQuoted')),
      inquiryOrigin: valueFor(sourceRecord, 'inquiryOrigin'),
      clientName,
      item: productInquiry,
      productCategory: valueFor(sourceRecord, 'productCategory'),
      quantity: valueFor(sourceRecord, 'quantity'),
      priority: valueFor(sourceRecord, 'priority'),
      quoteNumber,
    },
    ownership: {
      assignedSales,
      procurementAssignee,
    },
    status: {
      operational: operationalStatus,
      operationalBucket,
      clientFacing: valueFor(sourceRecord, 'clientFacingStatus'),
      procurementDelayReason,
      nonProceedingReason: valueFor(sourceRecord, 'nonProceedingReason'),
      customerComments: valueFor(sourceRecord, 'customerComments'),
    },
    commercial: {
      costingSheet: valueFor(sourceRecord, 'costingSheet'),
      quotedUnitPrice: valueFor(sourceRecord, 'quotedUnitPrice'),
      totalQuotedAmount: valueFor(sourceRecord, 'totalQuotedAmount'),
      estimatedRfqValue,
      qdwNumber: valueFor(sourceRecord, 'qdwNumber'),
      customerPoNumber: valueFor(sourceRecord, 'customerPoNumber'),
      customerPoLink: valueFor(sourceRecord, 'customerPoLink'),
      poStatus: valueFor(sourceRecord, 'poStatus'),
    },
    supplier: {
      name: valueFor(sourceRecord, 'supplierName'),
      contact: {
        name: valueFor(sourceRecord, 'supplierContactName'),
        phone: valueFor(sourceRecord, 'supplierContactNumber'),
        email: valueFor(sourceRecord, 'supplierEmail'),
      },
    },
    delivery: {
      status: valueFor(sourceRecord, 'itemDeliveryStatus'),
      contact: {
        name: valueFor(sourceRecord, 'deliveryContactName'),
        phone: valueFor(sourceRecord, 'deliveryContactNumber'),
        email: valueFor(sourceRecord, 'deliveryEmail'),
      },
      address: valueFor(sourceRecord, 'deliveryAddress'),
      eta: valueFor(sourceRecord, 'eta'),
      notes: valueFor(sourceRecord, 'deliveryNotes'),
      proofOfDelivery: valueFor(sourceRecord, 'proofOfDelivery'),
      invoiceNumber: valueFor(sourceRecord, 'invoiceNumber'),
      fulfilmentComments: valueFor(sourceRecord, 'fulfilmentComments'),
    },
    flags: {
      active: !CLOSED_BUCKETS.has(operationalBucket),
      stale,
      blocked,
      missingClient: !clientName,
      missingItem: !productInquiry,
      missingRequestDate: !requestedDate,
      missingOwnership,
      highValue: Boolean(config.highValueThreshold > 0 && estimatedRfqValue !== null && estimatedRfqValue >= config.highValueThreshold),
    },
    sourceValues: sourceRecord,
  };

  record.flags.exception = Object.entries(record.flags)
    .filter(([name, value]) => name !== 'active' && Boolean(value))
    .length > 0;
  record.fingerprint = stableFingerprint(record.sourceValues);
  return record;
}
