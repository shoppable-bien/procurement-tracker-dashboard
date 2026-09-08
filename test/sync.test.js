import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { getRuntimeConfig } from '../src/config.js';
import { createSnapshotStore } from '../src/store/snapshot.js';
import { synchronize } from '../src/sync/synchronize.js';
import { dashboardSummary, filterRecords, groupRecords } from '../src/read-model/query.js';

test('fixture synchronization builds an app-owned snapshot and preserves source-row identity', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'rfq-visibility-'));
  const config = getRuntimeConfig({ SOURCE_MODE: 'fixture', SNAPSHOT_PATH: path.join(temp, 'snapshot.json'), STALE_AFTER_HOURS: '24', HIGH_VALUE_THRESHOLD: '10000' });
  const store = createSnapshotStore(config.snapshotPath);
  const result = await synchronize({ config, store, now: new Date('2026-09-08T08:00:00.000Z') });
  assert.equal(result.error, null);
  assert.equal(result.snapshot.source.sheetName, 'Main File');
  assert.equal(result.snapshot.records.length, 7);
  assert.ok(result.snapshot.records.every((record) => record.requestId.startsWith('sheet:1587599917:row:')));
  assert.ok(result.snapshot.records.every((record) => record.source.url.includes('range=A')));
  assert.ok(result.snapshot.records.some((record) => record.identity.quoteNumber === 'QU-1001'));
  assert.equal(filterRecords(result.snapshot.records, { q: 'Omega' }).length, 1);
  assert.equal(groupRecords(result.snapshot.records.filter((record) => record.identity.quoteNumber === 'QU-1001')).length, 2);
  const dashboard = dashboardSummary(result.snapshot.records, result.snapshot, config);
  assert.equal(dashboard.total, 7);
  assert.ok(dashboard.stale >= 1);
  assert.ok(dashboard.exceptions >= 1);
  assert.ok(dashboard.activeEstimatedValue > 0);
  assert.equal((await store.load()).records.length, 7);
});

test('source failure keeps the last successful application snapshot', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'rfq-visibility-failure-'));
  const config = getRuntimeConfig({ SOURCE_MODE: 'fixture', SOURCE_FIXTURE_PATH: path.join(temp, 'missing.csv'), SNAPSHOT_PATH: path.join(temp, 'snapshot.json') });
  const store = createSnapshotStore(config.snapshotPath);
  const previous = { version: 1, synchronizedAt: '2026-09-08T00:00:00.000Z', records: [{ requestId: 'sheet:g:row:2' }], health: { ok: true, lastSuccessAt: '2026-09-08T00:00:00.000Z' } };
  await store.save(previous);
  const result = await synchronize({ config, store, now: new Date('2026-09-08T08:00:00.000Z') });
  assert.ok(result.error);
  assert.equal(result.snapshot.records.length, 1);
  assert.equal(result.snapshot.health.ok, false);
  assert.match(result.snapshot.health.lastError, /ENOENT|no such file/i);
});
