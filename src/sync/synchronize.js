import { loadSource } from '../source/adapter.js';
import { normalizeRow } from '../model/normalize.js';

export async function synchronize({ config, store, now = new Date() }) {
  const previous = await store.load();
  const synchronizedAt = now.toISOString();

  try {
    const source = await loadSource(config);
    const records = source.rows.map((row, index) => normalizeRow(row, {
      sourceRow: config.headerRow + index + 1,
      syncedAt: synchronizedAt,
      config,
      asOf: now,
    }));
    const previousById = new Map((previous?.records || []).map((record) => [record.requestId, record]));
    const currentIds = new Set(records.map((record) => record.requestId));
    const changes = records.map((record) => {
      const before = previousById.get(record.requestId);
      return {
        requestId: record.requestId,
        displayId: record.displayId,
        sourceRow: record.source.row,
        action: !before ? 'new' : before.fingerprint === record.fingerprint ? 'unchanged' : 'changed',
        changedAt: synchronizedAt,
        clientName: record.request.clientName,
        item: record.request.item,
      };
    });
    for (const before of previous?.records || []) {
      if (!currentIds.has(before.requestId)) {
        changes.push({
          requestId: before.requestId,
          displayId: before.displayId,
          sourceRow: before.source.row,
          action: 'removed',
          changedAt: synchronizedAt,
          clientName: before.request.clientName,
          item: before.request.item,
        });
      }
    }

    const snapshot = {
      version: 1,
      synchronizedAt,
      source: {
        mode: config.sourceMode,
        spreadsheetId: config.spreadsheetId,
        sheetName: config.sheetName,
        gid: config.gid,
        headerRow: config.headerRow,
        expectedRange: source.expectedRange,
        observedHeaderCount: source.headers.length,
        recordCount: records.length,
      },
      health: { ok: true, lastError: null, lastAttemptAt: synchronizedAt, lastSuccessAt: synchronizedAt },
      records,
      changes: changes.filter((change) => change.action !== 'unchanged').slice(-100),
    };
    await store.save(snapshot);
    return { snapshot, error: null };
  } catch (error) {
    if (previous) {
      const snapshot = {
        ...previous,
        health: {
          ...(previous.health || {}),
          ok: false,
          lastError: error.message,
          lastAttemptAt: synchronizedAt,
        },
      };
      await store.save(snapshot);
      return { snapshot, error };
    }
    return { snapshot: null, error };
  }
}
