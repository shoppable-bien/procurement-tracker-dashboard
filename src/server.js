import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getRuntimeConfig, projectRoot } from './config.js';
import { createSnapshotStore } from './store/snapshot.js';
import { synchronize } from './sync/synchronize.js';
import { clientGroups, dashboardSummary, filterRecords, groupRecords, summarizeRecord } from './read-model/query.js';

const uiRoot = path.resolve(projectRoot, 'src/ui');

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });
  response.end(JSON.stringify(payload));
}

function getHealth(snapshot) {
  return snapshot?.health || { ok: false, lastError: 'No successful synchronization yet' };
}

async function serveStatic(request, response) {
  const pathname = request.url === '/' ? '/index.html' : new URL(request.url, 'http://localhost').pathname;
  const candidate = path.resolve(uiRoot, `.${pathname}`);
  if (!candidate.startsWith(uiRoot)) {
    sendJson(response, 400, { error: 'Invalid path' });
    return;
  }
  try {
    const body = await fs.readFile(candidate);
    const contentTypes = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };
    response.writeHead(200, { 'content-type': contentTypes[path.extname(candidate)] || 'application/octet-stream' });
    response.end(body);
  } catch (error) {
    if (error.code === 'ENOENT') sendJson(response, 404, { error: 'Not found' });
    else sendJson(response, 500, { error: 'Unable to read interface' });
  }
}

export async function createApplication({ config = getRuntimeConfig(), store = createSnapshotStore(config.snapshotPath), syncOnStart = true } = {}) {
  let snapshot = await store.load();
  let syncPromise = null;

  const sync = async () => {
    if (syncPromise) return syncPromise;
    syncPromise = synchronize({ config, store }).then((result) => {
      snapshot = result.snapshot || snapshot;
      syncPromise = null;
      return result;
    }).catch((error) => {
      syncPromise = null;
      throw error;
    });
    return syncPromise;
  };

  if (syncOnStart) await sync();

  async function handle(request, response) {
    const url = new URL(request.url, 'http://localhost');
    if (!url.pathname.startsWith('/api/')) {
      return serveStatic(request, response);
    }

    if (url.pathname === '/api/health' && request.method === 'GET') {
      const health = getHealth(snapshot);
      return sendJson(response, health.ok ? 200 : 503, {
        ...health,
        lastSynchronizedAt: snapshot?.synchronizedAt || null,
        source: snapshot?.source || { mode: config.sourceMode, sheetName: config.sheetName, gid: config.gid },
      });
    }

    if (url.pathname === '/api/sync' && request.method === 'POST') {
      const result = await sync();
      return sendJson(response, result.error ? 502 : 200, {
        ok: !result.error,
        error: result.error?.message || null,
        synchronizedAt: result.snapshot?.synchronizedAt || null,
        recordCount: result.snapshot?.records?.length || 0,
        changes: result.snapshot?.changes || [],
        health: getHealth(result.snapshot),
      });
    }

    if (!snapshot?.records) return sendJson(response, 503, { error: 'No application snapshot is available', health: getHealth(snapshot) });

    if (url.pathname === '/api/dashboard' && request.method === 'GET') {
      return sendJson(response, 200, dashboardSummary(snapshot.records, snapshot, config));
    }

    if (url.pathname === '/api/requests' && request.method === 'GET') {
      const filtered = filterRecords(snapshot.records, Object.fromEntries(url.searchParams.entries()));
      const grouped = url.searchParams.get('grouped') === 'true';
      const records = grouped ? groupRecords(filtered) : filtered.map(summarizeRecord);
      return sendJson(response, 200, {
        records,
        total: filtered.length,
        grouped,
        lastSynchronizedAt: snapshot.synchronizedAt,
      });
    }

    if (url.pathname.startsWith('/api/requests/') && request.method === 'GET') {
      const requestId = decodeURIComponent(url.pathname.slice('/api/requests/'.length));
      const record = snapshot.records.find((candidate) => candidate.requestId === requestId);
      return record ? sendJson(response, 200, record) : sendJson(response, 404, { error: 'Request not found' });
    }

    if (url.pathname === '/api/clients' && request.method === 'GET') {
      return sendJson(response, 200, { clients: clientGroups(snapshot.records) });
    }

    if (url.pathname === '/api/changes' && request.method === 'GET') {
      return sendJson(response, 200, { changes: snapshot.changes || [], lastSynchronizedAt: snapshot.synchronizedAt });
    }

    return sendJson(response, 404, { error: 'API route not found' });
  }

  return { config, store, handle, getSnapshot: () => snapshot, sync };
}

export async function startServer(config = getRuntimeConfig()) {
  const app = await createApplication({ config });
  const server = http.createServer((request, response) => {
    app.handle(request, response).catch((error) => sendJson(response, 500, { error: error.message }));
  });
  await new Promise((resolve) => server.listen(config.port, resolve));
  console.log(`RFQ Visibility Application running at http://localhost:${config.port}`);
  return server;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  startServer().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
