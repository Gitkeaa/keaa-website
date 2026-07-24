/**
 * The ONE place help content is fetched. The dashboard card, the Help button, the drawer and
 * the SOP & Help manager all go through the readers below and never touch the content store
 * directly.
 *
 * Backend-driven with a safe fallback: `loadSops()` (called once from AdminLayout) fetches
 * `GET /api/sops` and caches it. The readers return that live content when present, and fall
 * back to the static `sopContent.js` otherwise, so if the backend is not running, not yet
 * updated, or unreachable, every surface still shows real guides instead of nothing.
 *
 * A Super Admin editing a guide in the SOP & Help manager PUTs it and then calls `loadSops()`
 * again; the tiny store below notifies subscribers (`useSopVersion`) so the dashboard card and
 * any open surface re-render with the new text at once. That is the "edit in one place, update
 * everywhere" the whole system is for.
 *
 * A guide object carries any of these fields; each surface renders whichever are present:
 *   title, department, purpose, workflow[], responsibilities[], checklist[], bestPractices[],
 *   important[], quickTips[], related[]   plus DB metadata: updatedAt, updatedBy, version.
 */
import { useSyncExternalStore } from 'react';
import { ROLE_SOPS, PAGE_GUIDES, DEFAULT_GUIDE } from './sopContent';
import { moduleKeyForPath } from '../auth/roles';
import { api } from '../api/client';

// Live content, keyed by role / by page key. Null until a successful load.
let liveRole = null;
let livePage = null;

// A minimal external store so components re-render when live content arrives or changes.
let version = 0;
const listeners = new Set();
const emit = () => {
  version += 1;
  listeners.forEach((l) => l());
};
const subscribe = (cb) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
const getVersion = () => version;

/** Shape a raw DB row into the guide object the surfaces render. Unknown/missing fields stay
 *  undefined so the drawer simply hides those sections. */
const toGuide = (r) => ({
  title: r.title,
  department: r.department,
  purpose: r.purpose,
  workflow: r.workflow,
  responsibilities: r.responsibilities,
  checklist: r.checklist,
  bestPractices: r.bestPractices,
  important: r.important,
  quickTips: r.quickTips,
  related: r.related,
  // metadata for the drawer's version badge / "last updated" line
  updatedAt: r.updatedAt,
  updatedBy: r.updatedBy,
  version: r.version,
});

/**
 * Fetch the guides. Called once on admin load, and again after an edit to refresh every surface.
 * Silent on failure: the static fallback covers a backend that is down or not yet updated.
 */
export async function loadSops() {
  try {
    const rows = await api.get('/api/sops');
    const role = {};
    const page = {};
    for (const r of rows || []) {
      const guide = toGuide(r);
      if (r.scope === 'role') role[r.refKey] = guide;
      else if (r.scope === 'page') page[r.refKey] = guide;
    }
    liveRole = role;
    livePage = page;
    emit();
  } catch {
    // Backend unreachable / endpoint not present yet — keep the static fallback.
  }
}

/** Subscribe a component to live-content updates so it re-renders when loadSops resolves. */
export function useSopVersion() {
  return useSyncExternalStore(subscribe, getVersion, getVersion);
}

/** The SOP for a role — dashboard card + the role's "complete SOP". Live first, then static. */
export const roleSop = (role) => (liveRole && liveRole[role]) || ROLE_SOPS[role] || null;

/** The guide for a module key (e.g. 'rfq'), falling back to a generic help guide. */
export const pageGuide = (key) => (livePage && livePage[key]) || PAGE_GUIDES[key] || DEFAULT_GUIDE;

/** The guide for a route — resolves the path to its module key, then to a guide. */
export const guideForPath = (pathname) => pageGuide(moduleKeyForPath(pathname));
