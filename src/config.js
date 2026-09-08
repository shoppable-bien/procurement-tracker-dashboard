import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function numberFrom(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function getRuntimeConfig(env = process.env) {
  const mode = env.SOURCE_MODE || (env.SOURCE_CSV_URL || env.SOURCE_SPREADSHEET_ID ? 'google' : 'fixture');
  const spreadsheetId = env.SOURCE_SPREADSHEET_ID || '1-vvh10uQFz4-vjBCDrW52MZnmBfdxgj_3O36vs7mjAk';
  const gid = env.SOURCE_SHEET_GID || '1587599917';
  const sourceCsvUrl = env.SOURCE_CSV_URL || '';
  const csvUrl = sourceCsvUrl || `https://docs.google.com/spreadsheets/d/${encodeURIComponent(spreadsheetId)}/export?format=csv&gid=${encodeURIComponent(gid)}`;

  return {
    port: numberFrom(env.PORT, 3000),
    sourceMode: mode,
    sourceCsvUrl: csvUrl,
    spreadsheetId,
    sheetName: env.SOURCE_SHEET_NAME || 'Main File',
    gid,
    headerRow: numberFrom(env.SOURCE_HEADER_ROW, 1),
    staleAfterHours: numberFrom(env.STALE_AFTER_HOURS, 24),
    highValueThreshold: numberFrom(env.HIGH_VALUE_THRESHOLD, 0),
    fixturePath: path.resolve(projectRoot, env.SOURCE_FIXTURE_PATH || 'data/fixtures/main-file.csv'),
    snapshotPath: path.resolve(projectRoot, env.SNAPSHOT_PATH || 'data/snapshot.json'),
  };
}
