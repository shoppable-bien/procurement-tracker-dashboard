import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveOperationalBucket, normalizeRow } from '../src/model/normalize.js';

const config = {
  gid: '1587599917',
  spreadsheetId: 'sheet-id',
  sheetName: 'Main File',
  staleAfterHours: 24,
  highValueThreshold: 10000,
};

test('operational and client-facing status remain separate', () => {
  const record = normalizeRow({
    'DATE REQUESTED': '2026-09-08',
    'COMPANY NAME (Please complete company name)': 'Acme',
    'PRODUCT INQUIRY': 'Widgets',
    'QUOTE NO. (QU-000000)': 'QU-1',
    STATUS: 'Sourcing',
    'CLIENT-FACING STATUS': 'Awaiting availability',
    'PROCUREMENT- REASON OF QUOTE DELAYS': 'Supplier response pending',
    'ESTIMATED RFQ VALUE': '12,500',
  }, { sourceRow: 2, syncedAt: '2026-09-08T00:00:00.000Z', config });

  assert.equal(record.status.operational, 'Sourcing');
  assert.equal(record.status.operationalBucket, 'sourcing');
  assert.equal(record.status.clientFacing, 'Awaiting availability');
  assert.equal(record.flags.blocked, true);
  assert.equal(record.flags.highValue, true);
  assert.equal(record.requestId, 'sheet:1587599917:row:2');
  assert.match(record.source.url, /range=A2:BM2/);
});

test('blank and duplicate quote labels do not become the identity', () => {
  const base = {
    'DATE REQUESTED': '2026-09-08',
    'COMPANY NAME (Please complete company name)': 'Acme',
    STATUS: 'Quoted',
    'QUOTE NO. (QU-000000)': 'QU-1',
  };
  const first = normalizeRow({ ...base, 'PRODUCT INQUIRY': 'A' }, { sourceRow: 2, syncedAt: 'now', config });
  const second = normalizeRow({ ...base, 'PRODUCT INQUIRY': 'B' }, { sourceRow: 3, syncedAt: 'now', config });
  const blank = normalizeRow({ ...base, 'QUOTE NO. (QU-000000)': '', 'PRODUCT INQUIRY': 'C' }, { sourceRow: 4, syncedAt: 'now', config });
  assert.notEqual(first.requestId, second.requestId);
  assert.notEqual(first.identity.relatedKey, second.identity.relatedKey);
  assert.equal(blank.displayId, 'Source row 4');
});

test('status bucket is conservative for unknown values', () => {
  assert.equal(deriveOperationalBucket('Mystery manual note'), 'active');
  assert.equal(deriveOperationalBucket('Cancelled'), 'cancelled');
});
