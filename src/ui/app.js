const state = { records: [], dashboard: null, clients: [], changes: [], view: 'overview' };

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

function display(value, fallback = 'Not recorded') {
  return value === null || value === undefined || String(value).trim() === '' ? fallback : escapeHtml(value);
}

function dateLabel(value) {
  if (!value) return 'Not synchronized';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? display(value) : date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

function statusTag(status, bucket) {
  const className = bucket === 'cancelled' ? 'tag-rose' : ['won', 'fulfilled'].includes(bucket) ? 'tag-green' : ['blocked', 'sourcing'].includes(bucket) ? 'tag-amber' : 'tag-blue';
  return `<span class="tag ${className}">${display(status, 'Unstated')}</span>`;
}

function setNotice(message = '') {
  const element = $('#app-notice');
  element.textContent = message;
  element.hidden = !message;
}

async function api(path, options = {}) {
  const response = await fetch(path, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Request failed with HTTP ${response.status}`);
  return payload;
}

async function loadState() {
  const [dashboard, requests, clients, changes] = await Promise.all([
    api('/api/dashboard'),
    api('/api/requests'),
    api('/api/clients'),
    api('/api/changes'),
  ]);
  state.dashboard = dashboard;
  state.records = requests.records;
  state.clients = clients.clients;
  state.changes = changes.changes;
  renderOverview();
  renderClients();
  renderChanges();
}

function renderOverview() {
  const dashboard = state.dashboard;
  if (!dashboard) return;
  const metrics = [
    ['Requests', dashboard.total, ''],
    ['Active', dashboard.active, 'emphasis'],
    ['Sourcing', dashboard.sourcing, ''],
    ['Quoted', dashboard.quoted, ''],
    ['Stale', dashboard.stale, dashboard.stale ? 'warning' : ''],
    ['Exceptions', dashboard.exceptions, dashboard.exceptions ? 'warning' : ''],
  ];
  $('#metric-grid').innerHTML = metrics.map(([label, value, style]) => `<div class="metric-card ${style}"><span class="metric-label">${label}</span><strong class="metric-value">${value}</strong></div>`).join('');
  $('#last-synced').textContent = dateLabel(dashboard.lastSynchronizedAt);
  $('#source-summary').textContent = `${dashboard.sourceHealth.ok ? 'Source healthy' : 'Last sync failed'} · ${dashboard.total} rows in read model`;
  const exceptions = state.records.filter((record) => record.flags?.exception).slice(0, 5);
  $('#exception-list').innerHTML = exceptions.length ? exceptions.map((record) => {
    const reason = record.status.procurementDelayReason || (record.flags.stale ? 'No recent source update' : record.flags.missingOwnership ? 'No owner recorded' : 'Missing or inconsistent source data');
    return `<div class="exception-item"><button data-request-id="${escapeHtml(record.requestId)}"><div class="exception-title">${display(record.displayId)} · ${display(record.request.clientName, 'Unknown client')}</div><div class="exception-detail">${display(reason)}</div></button><span class="exception-count">!</span></div>`;
  }).join('') : '<div class="empty-state">No exceptions in the current snapshot.</div>';
  const recent = state.records.filter((record) => record.flags?.active).slice(0, 5);
  $('#recent-results').innerHTML = recent.length ? recent.map(resultRow).join('') : '<div class="empty-state">No active requests found.</div>';
}

function resultRow(record) {
  if (record.records) {
    return `<button class="result-row" data-request-id="${escapeHtml(record.requestId)}"><div><div class="result-primary">${display(record.displayId)}</div><div class="result-secondary">${display(record.clientName, 'Unknown client')}</div></div><div><div class="result-primary">${display(record.item, 'Item not recorded')}</div><div class="result-secondary">${record.recordCount} related source rows</div></div><div class="tag-row">${record.statuses.map((status) => statusTag(status)).join('')}</div><span class="result-arrow">›</span></button>`;
  }
  return `<button class="result-row" data-request-id="${escapeHtml(record.requestId)}"><div><div class="result-primary">${display(record.displayId)}</div><div class="result-secondary">${display(record.request.clientName, 'Unknown client')}</div></div><div><div class="result-primary">${display(record.request.item, 'Item not recorded')}</div><div class="result-secondary">Source row ${record.source.row} · ${display(record.supplier?.name, 'Supplier not recorded')}</div></div><div class="tag-row">${statusTag(record.status.operational, record.status.operationalBucket)}${record.status.clientFacing ? `<span class="tag">${display(record.status.clientFacing)}</span>` : ''}</div><span class="result-arrow">›</span></button>`;
}

function renderSearch(records = state.records, grouped = false) {
  $('#result-count').textContent = `${records.length} ${records.length === 1 ? 'request' : 'requests'}${grouped ? ' grouped' : ''}`;
  $('#search-results').innerHTML = records.length ? records.slice(0, 100).map(resultRow).join('') : '<div class="empty-state">No requests match those filters.</div>';
}

function renderClients() {
  $('#client-list').innerHTML = state.clients.length ? state.clients.map((client) => `<div class="client-card"><button data-client="${escapeHtml(client.clientName)}"><div class="client-name">${display(client.clientName)}</div><div class="client-counts"><span><strong>${client.requestCount}</strong> requests</span><span><strong>${client.activeCount}</strong> active</span><span><strong>${client.exceptionCount}</strong> exceptions</span></div></button></div>`).join('') : '<div class="empty-state">No client groups available.</div>';
}

function renderChanges() {
  const changes = state.changes.filter((change) => change.action !== 'unchanged').slice().reverse();
  $('#change-list').innerHTML = changes.length ? changes.map((change) => `<div class="change-row"><span class="change-action ${escapeHtml(change.action)}">${escapeHtml(change.action)}</span><strong>${display(change.displayId)}</strong><span>${display(change.clientName, 'Unknown client')} <span class="muted">· ${display(change.item, 'Item not recorded')}</span></span><span class="muted">${dateLabel(change.changedAt)}</span></div>`).join('') : '<div class="empty-state">No new or changed rows in the latest synchronization.</div>';
}

function renderDetail(record) {
  $('#detail-title').textContent = record.displayId || 'Request';
  const status = `${statusTag(record.status.operational, record.status.operationalBucket)}${record.status.clientFacing ? ` <span class="tag">${display(record.status.clientFacing)}</span>` : ''}`;
  $('#detail-body').innerHTML = `
    <section class="detail-section"><div class="tag-row">${status}${record.flags.stale ? '<span class="tag tag-amber">Stale</span>' : ''}${record.flags.exception ? '<span class="tag tag-rose">Exception</span>' : ''}</div><a class="source-link" href="${escapeHtml(record.source.url)}" target="_blank" rel="noreferrer">Open source row ${record.source.row} ↗</a></section>
    <section class="detail-section"><h3>Request</h3><dl class="detail-grid">${field('Client', record.request.clientName)}${field('Item', record.request.item, true)}${field('Quote number', record.identity.quoteNumber)}${field('Request date', record.request.requestedDate)}${field('Deadline', record.request.deadline)}${field('Origin', record.request.inquiryOrigin)}${field('Category', record.request.productCategory)}${field('Quantity', record.request.quantity)}</dl></section>
    <section class="detail-section"><h3>Ownership</h3><dl class="detail-grid">${field('CS / BD owner', record.ownership.assignedSales)}${field('Procurement owner', record.ownership.procurementAssignee)}</dl></section>
    <section class="detail-section"><h3>Status and reasons</h3><dl class="detail-grid">${field('Operational status', record.status.operational)}${field('Client-facing status', record.status.clientFacing)}${field('Procurement delay / blocker', record.status.procurementDelayReason, true)}${field('Non-proceeding reason', record.status.nonProceedingReason, true)}${field('Customer / CS comments', record.status.customerComments, true)}</dl></section>
    <section class="detail-section"><h3>Commercial and supplier evidence</h3><dl class="detail-grid">${field('Estimated RFQ value', record.commercial.estimatedRfqValue)}${field('Quoted total', record.commercial.totalQuotedAmount)}${field('Costing sheet', record.commercial.costingSheet, true, true)}${field('Customer PO', record.commercial.customerPoNumber)}${field('PO status', record.commercial.poStatus)}${field('Supplier', record.supplier.name)}${field('Supplier contact', contact(record.supplier.contact), true)}</dl></section>
    <section class="detail-section"><h3>Delivery and fulfilment</h3><dl class="detail-grid">${field('Delivery status', record.delivery.status)}${field('ETA', record.delivery.eta)}${field('Delivery contact', contact(record.delivery.contact), true)}${field('Delivery address', record.delivery.address, true)}${field('Proof of delivery', record.delivery.proofOfDelivery, true)}${field('Invoice number', record.delivery.invoiceNumber)}${field('Fulfilment comments', record.delivery.fulfilmentComments, true)}</dl></section>
    <section class="detail-section"><h3>Traceability</h3><dl class="detail-grid">${field('Source workbook', record.source.spreadsheetId)}${field('Source sheet', `${record.source.sheetName} · row ${record.source.row}`)}${field('Last synchronized', dateLabel(record.synchronizedAt))}</dl></section>`;
  $('#detail-drawer').classList.add('open');
  $('#detail-drawer').setAttribute('aria-hidden', 'false');
}

function field(label, value, full = false, link = false) {
  let content = display(value);
  if (link && value) content = `<a href="${escapeHtml(value)}" target="_blank" rel="noreferrer">Open evidence ↗</a>`;
  return `<div class="detail-field ${full ? 'full' : ''}"><dt>${label}</dt><dd>${content}</dd></div>`;
}

function contact(value) {
  if (!value) return '';
  return [value.name, value.phone, value.email].filter(Boolean).map(escapeHtml).join('<br>');
}

async function openRequest(requestId) {
  try { renderDetail(await api(`/api/requests/${encodeURIComponent(requestId)}`)); } catch (error) { setNotice(error.message); }
}

function setView(view) {
  state.view = view;
  $$('.nav-link').forEach((button) => button.classList.toggle('active', button.dataset.view === view));
  $$('.view').forEach((section) => section.classList.toggle('active', section.dataset.section === view));
}

async function runSearch(event) {
  event?.preventDefault();
  const form = $('#search-form');
  const data = new FormData(form);
  const params = new URLSearchParams();
  for (const [key, value] of data.entries()) if (value) params.set(key, value === 'on' ? 'true' : value);
  if ($('#grouped-toggle').checked) params.set('grouped', 'true');
  try { const payload = await api(`/api/requests?${params}`); renderSearch(payload.records, payload.grouped); } catch (error) { setNotice(error.message); }
}

async function syncNow() {
  const button = $('#sync-button');
  button.disabled = true;
  button.textContent = 'Syncing…';
  try { const result = await api('/api/sync', { method: 'POST' }); setNotice(result.ok ? `Synchronized ${result.recordCount} source rows.` : `Sync failed; the last known snapshot was kept. ${result.error || ''}`); await loadState(); if (state.view === 'search') await runSearch(); } catch (error) { setNotice(error.message); } finally { button.disabled = false; button.textContent = 'Sync now'; }
}

document.addEventListener('click', (event) => {
  const viewButton = event.target.closest('[data-view]');
  if (viewButton) { setView(viewButton.dataset.view); if (viewButton.dataset.view === 'search') renderSearch(); }
  const requestButton = event.target.closest('[data-request-id]');
  if (requestButton) openRequest(requestButton.dataset.requestId);
  const clientButton = event.target.closest('[data-client]');
  if (clientButton) { setView('search'); $('#search-form [name="client"]').value = clientButton.dataset.client; runSearch(); }
});

$('#quick-search').addEventListener('submit', (event) => { event.preventDefault(); setView('search'); $('#search-form [name="q"]').value = new FormData(event.target).get('q'); runSearch(); });
$('#search-form').addEventListener('submit', runSearch);
$('#grouped-toggle').addEventListener('change', runSearch);
$('#clear-filters').addEventListener('click', () => { $('#search-form').reset(); renderSearch(state.records); });
$('#sync-button').addEventListener('click', syncNow);
$('#open-exceptions').addEventListener('click', () => { setView('search'); $('#search-form').reset(); $('#search-form [name="exception"]').checked = true; runSearch(); });
$('#close-drawer').addEventListener('click', () => { $('#detail-drawer').classList.remove('open'); $('#detail-drawer').setAttribute('aria-hidden', 'true'); });
$('#drawer-backdrop').addEventListener('click', () => $('#close-drawer').click());

loadState().catch((error) => setNotice(`The application could not load its snapshot: ${error.message}`));
