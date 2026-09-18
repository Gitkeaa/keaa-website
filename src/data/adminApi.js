/**
 * Public → admin-backend bridge.
 *
 * The public site's Contact / RFQ / Careers forms POST here so their submissions land in
 * the same MySQL the admin console reads. These endpoints are unauthenticated on the
 * backend (only submitting is public; reading and triaging still require an admin login).
 *
 * WHERE THE API IS. Same rule as src/admin/api/client.js: calls go to the page's own origin
 * as `/api/...`, and a proxy hands them to Spring Boot (vercel.json in production,
 * vite.config.js in dev and preview). Nothing has to be configured at build time for the
 * forms to work; what has to be right is the /api rewrite in vercel.json, and
 * scripts/check-secrets.mjs checks that.
 *
 * VITE_API_DIRECT_ORIGIN bypasses the proxy and calls that origin directly. A production
 * build with it pointing at localhost would fail for every visitor, so that is shouted
 * about below, at runtime, where it cannot be missed.
 */
const API_BASE = import.meta.env.VITE_API_DIRECT_ORIGIN ?? '';

if (import.meta.env.PROD && /localhost|127\.0\.0\.1/.test(API_BASE)) {
  console.error(
    `[KEAA] VITE_API_DIRECT_ORIGIN was ${API_BASE} at build time, so the Contact / RFQ / Careers ` +
      `forms POST to a visitor's own machine and fail. Unset it (same-origin through the ` +
      `vercel.json proxy) and rebuild.`
  );
}

export async function submitPublicForm(path, data) {
  const res = await fetch(API_BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Submission failed (${res.status})`);
  return res.json().catch(() => ({}));
}

/**
 * Statuses that mean "this endpoint does not do multipart", as opposed to "your request was
 * bad". 404 no such route, 405 method/consumes mismatch, 415 unsupported media type, 501
 * not implemented. Anything else — 400, 413, 500 — is a real failure and must surface.
 *
 * 403 is here too, and it is the one that actually matters today: the live backend has no
 * multipart handler, and its Spring Security chain answers the multipart POST with 403
 * Forbidden (the plain JSON POST to the same public route returns 200). Without 403 in this
 * set, every application that attaches a CV threw "Could not submit" instead of falling back
 * to the JSON path — so the whole application was lost over a file the server was never going
 * to store anyway. With it, the application still lands (file flagged as not received) and
 * uploads begin working the moment the backend adds the multipart endpoint.
 */
const MULTIPART_UNSUPPORTED = new Set([403, 404, 405, 415, 501]);

/**
 * Submit a form WITH a file attached, as `multipart/form-data`.
 *
 * Why this is separate from `submitPublicForm`, and why it falls back:
 *
 * The backend today takes JSON and its Careers entity stores a `resumeUrl` STRING — there is
 * no file handling on the server yet. Shipping an unconditional multipart POST would
 * therefore break every application that attaches a CV, which is worse than the current
 * behaviour (the file is ignored but the application arrives). So this tries the richer
 * request first and, only when the server says it cannot accept multipart at all, replays
 * the plain JSON submission via `onFallback` so the application still lands.
 *
 * The moment the backend adds the endpoint below, uploads start working with no frontend
 * change:
 *
 *   POST /api/careers            Content-Type: multipart/form-data
 *     part "payload"  application/json  — exactly the body submitPublicForm sends today
 *     part "resume"   the file          — store it, put its location in `resumeUrl`
 *   Reject anything that is not application/pdf | msword | vnd.openxmlformats-…document,
 *   and cap the size server-side; the client checks both but a client check is not a
 *   control.
 *
 * Returns `{ uploaded: boolean, data }` — `uploaded` tells the applicant the truth about whether
 * their file actually made it, and `data` is the created application row (for its id / App ID).
 */
export async function submitPublicFormWithFile(path, data, file, onFallback) {
  const body = new FormData();
  // A JSON part keeps ONE payload shape across both transports — the server parses the same
  // object either way, instead of a flattened set of form fields that would drift.
  body.append('payload', new Blob([JSON.stringify(data)], { type: 'application/json' }));
  body.append('resume', file, file.name);

  let res;
  try {
    // No Content-Type header: the browser must set it, because it has to append the
    // multipart boundary. Setting it by hand produces a body the server cannot parse.
    res = await fetch(API_BASE + path, { method: 'POST', body });
  } catch {
    // Network-level failure. Try the plain path before giving up — the applicant losing
    // their whole application to a flaky upload would be the worst outcome here.
    const data = await onFallback();
    return { uploaded: false, data };
  }

  if (res.ok) {
    // Also hand back the created row, so the caller can show the real Application ID.
    const data = await res.json().catch(() => ({}));
    return { uploaded: true, data };
  }

  if (MULTIPART_UNSUPPORTED.has(res.status)) {
    const data = await onFallback();
    return { uploaded: false, data };
  }

  throw new Error(`Submission failed (${res.status})`);
}
