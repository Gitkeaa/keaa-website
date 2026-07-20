/**
 * Public → admin-backend bridge.
 *
 * The public site's Contact / RFQ / Careers forms POST here so their submissions land in
 * the same MySQL the admin console reads. These endpoints are unauthenticated on the
 * backend (only submitting is public; reading and triaging still require an admin login).
 *
 * Base URL matches the admin API; override with VITE_ADMIN_API when the backend moves.
 *
 * VITE_* variables are inlined at BUILD time, so an unset VITE_ADMIN_API bakes the
 * localhost fallback into the shipped bundle and every public form then fails in the
 * visitor's browser. That failure is silent from the developer's side — the form just
 * shows "Could not send…" — so the check below makes it loud in the console of any
 * production build that was compiled without the variable. See .env.example.
 */
const API_BASE = import.meta.env.VITE_ADMIN_API ?? 'http://localhost:8080';

if (import.meta.env.PROD && /localhost|127\.0\.0\.1/.test(API_BASE)) {
  console.error(
    `[KEAA] VITE_ADMIN_API was not set at build time, so the Contact / RFQ / Careers forms ` +
      `POST to ${API_BASE} and will fail for every visitor. Set VITE_ADMIN_API to the ` +
      `backend URL and rebuild.`
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
 */
const MULTIPART_UNSUPPORTED = new Set([404, 405, 415, 501]);

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
 * Returns `{ uploaded: boolean }` so the caller can tell the applicant the truth about
 * whether their file actually made it.
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
    await onFallback();
    return { uploaded: false };
  }

  if (res.ok) return { uploaded: true };

  if (MULTIPART_UNSUPPORTED.has(res.status)) {
    await onFallback();
    return { uploaded: false };
  }

  throw new Error(`Submission failed (${res.status})`);
}
