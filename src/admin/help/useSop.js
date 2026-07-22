/**
 * The ONE place the help content is fetched. Everything else — the dashboard card, the Help
 * button, the drawer — goes through these three functions and never touches the content store
 * directly.
 *
 * PHASE 2 (backend-driven): replace the three bodies below with a call to `GET /api/sops`
 * (cached), keyed the same way. Because the return shapes already match the planned `sop`
 * table, no caller changes — the dashboard card and drawer keep working as-is, and a Super
 * Admin editing a guide in the Guide Management module updates every surface at once. That is
 * the whole reason the callers depend on this file and not on `sopContent.js`.
 */
import { ROLE_SOPS, PAGE_GUIDES, DEFAULT_GUIDE } from './sopContent';
import { moduleKeyForPath } from '../auth/roles';

/** The SOP for a role — shown on the dashboard card and as the role's "complete SOP". */
export const roleSop = (role) => ROLE_SOPS[role] || null;

/** The guide for a module key (e.g. 'rfq'), falling back to a generic help guide. */
export const pageGuide = (key) => PAGE_GUIDES[key] || DEFAULT_GUIDE;

/** The guide for a route — resolves the path to its module key, then to a guide. */
export const guideForPath = (pathname) => pageGuide(moduleKeyForPath(pathname));
