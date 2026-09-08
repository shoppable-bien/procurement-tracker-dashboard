import fs from 'node:fs/promises';
import { parseCsv, rowsToObjects } from './csv.js';
import { SOURCE_HEADERS } from './field-map.js';

export function sourceRowUrl({ spreadsheetId, gid, sourceRow }) {
  return `https://docs.google.com/spreadsheets/d/${encodeURIComponent(spreadsheetId)}/edit?gid=${encodeURIComponent(gid)}#gid=${encodeURIComponent(gid)}&range=A${sourceRow}:BM${sourceRow}`;
}

async function readFixture(config) {
  return fs.readFile(config.fixturePath, 'utf8');
}

async function readGoogleCsv(config) {
  const response = await fetch(config.sourceCsvUrl);
  if (!response.ok) throw new Error(`Source CSV request failed with HTTP ${response.status}`);
  return response.text();
}

export async function loadSource(config) {
  const text = config.sourceMode === 'fixture' ? await readFixture(config) : await readGoogleCsv(config);
  const parsed = rowsToObjects(parseCsv(text));
  if (!parsed.headers.length) throw new Error('Source CSV did not contain a header row');
  if (parsed.rows.length === 0) throw new Error('Source CSV did not contain any data rows');

  return {
    headers: parsed.headers,
    rows: parsed.rows,
    expectedRange: 'A:BM',
    expectedHeaderCount: SOURCE_HEADERS.length,
    sourceUrl: sourceRowUrl({ spreadsheetId: config.spreadsheetId, gid: config.gid, sourceRow: config.headerRow }),
  };
}
