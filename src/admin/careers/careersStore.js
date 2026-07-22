/**
 * ATS workflow store — the persistence seam for the Applicant Tracking System.
 *
 * The backend (a separate Spring Boot service) does not yet own the careers workflow: the
 * status PATCH 403s and there are no endpoints for notes, interviews, offers, ratings or an
 * activity timeline. So this module keeps that workflow state in the browser (localStorage)
 * OVER the real application list from GET /api/careers, which lets HR run the full pipeline
 * today. Every mutation also fires the intended real API call and ignores its failure, so the
 * day the backend implements the contract below, persistence becomes real with no UI change.
 *
 * Backend contract to flip local -> server (implement in the Spring Boot repo):
 *   PATCH /api/careers/{id}/status   { status, remark }   (currently 403; fix auth/CSRF/impl)
 *   POST  /api/careers/{id}/notes    { note }
 *   POST  /api/careers/{id}/rating   { rating }
 *   GET   /api/careers/{id}          -> { application, timeline, notes }
 * Swap the localStorage read/write here for those calls and drop the overlay.
 *
 * Stored per application id:
 *   { status, rating, events:[{action,from,to,by,at,remark}], hrNotes:[{text,by,at}],
 *     interview, offer, rejection, lastUpdated }
 */
import { useSyncExternalStore } from 'react';
import { api } from '../api/client';
import { normalizeStatus, parseNotes } from './atsConfig';

const KEY = 'keaa.ats.v1';

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') || {};
  } catch {
    return {};
  }
}
function writeAll(obj) {
  try {
    localStorage.setItem(KEY, JSON.stringify(obj));
  } catch {
    /* quota / private mode: the change still holds in memory for this session */
  }
  emit();
}

const listeners = new Set();
let version = 0;
const emit = () => {
  version += 1;
  listeners.forEach((l) => l());
};
const subscribe = (cb) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
const getVersion = () => version;

/** Subscribe a component to store changes: it re-renders whenever any mutation runs. */
export function useAtsVersion() {
  return useSyncExternalStore(subscribe, getVersion, () => 0);
}

const nowIso = () => new Date().toISOString();

function update(id, fn) {
  const all = readAll();
  all[id] = fn({ ...(all[id] || {}) });
  writeAll(all);
}

/** Merge a raw backend row with its local workflow overlay into one view model. */
export function mergeApplication(row) {
  const ov = readAll()[row.id] || {};
  return {
    ...row,
    rawStatus: row.status,
    status: ov.status || normalizeStatus(row.status),
    parsed: parseNotes(row.notes),
    rating: ov.rating || 0,
    hrNotes: ov.hrNotes || [],
    events: ov.events || [],
    interview: ov.interview || null,
    offer: ov.offer || null,
    rejection: ov.rejection || null,
    lastUpdated: ov.lastUpdated || row.createdAt || null,
  };
}

/** Full activity timeline: the synthesised "received" event, then every recorded action. */
export function timelineFor(app) {
  return [
    { action: 'created', to: normalizeStatus(app.rawStatus), at: app.createdAt || null, by: 'System', remark: 'Application received' },
    ...(app.events || []),
  ];
}

export function changeStatus(id, to, { by = 'HR', remark = '', extra = null, from = null } = {}) {
  update(id, (ov) => {
    // Prefer the caller's known current status so the FIRST transition records a real origin
    // (the overlay has no status until the first move).
    const origin = from || ov.status || null;
    const events = [...(ov.events || []), { action: 'status', from: origin, to, by, at: nowIso(), remark }];
    const next = { ...ov, status: to, events, lastUpdated: nowIso() };
    if (to === 'interview-scheduled' && extra) next.interview = extra;
    if (to === 'offer-sent' && extra) next.offer = extra;
    if (to === 'rejected' && extra) next.rejection = extra;
    if (to === 'interview-completed' && extra && extra.rating) next.rating = Number(extra.rating);
    return next;
  });
  api.patch(`/api/careers/${id}/status`, { status: to, remark }).catch(() => {});
}

export function addNote(id, text, by = 'HR') {
  const t = String(text || '').trim();
  if (!t) return;
  update(id, (ov) => ({
    ...ov,
    hrNotes: [...(ov.hrNotes || []), { text: t, by, at: nowIso() }],
    events: [...(ov.events || []), { action: 'note', by, at: nowIso(), remark: t }],
    lastUpdated: nowIso(),
  }));
  api.post(`/api/careers/${id}/notes`, { note: t }).catch(() => {});
}

export function setRating(id, rating, by = 'HR') {
  update(id, (ov) => ({
    ...ov,
    rating: Number(rating),
    events: [...(ov.events || []), { action: 'rating', by, at: nowIso(), remark: `Rated ${rating} of 5` }],
    lastUpdated: nowIso(),
  }));
  api.post(`/api/careers/${id}/rating`, { rating: Number(rating) }).catch(() => {});
}

export function logEmail(id, templateLabel, by = 'HR') {
  update(id, (ov) => ({
    ...ov,
    events: [...(ov.events || []), { action: 'email', by, at: nowIso(), remark: `Sent email: ${templateLabel}` }],
    lastUpdated: nowIso(),
  }));
}

export function bulkStatus(ids, to, { by = 'HR', remark = '', extra = null } = {}) {
  ids.forEach((id) => changeStatus(id, to, { by, remark, extra }));
}
