/**
 * Tiny fetch wrapper for the admin API (the Spring Boot backend).
 *
 * `credentials: 'include'` is the important bit: the JWT lives in an httpOnly cookie the
 * browser sets on login, and this tells fetch to send that cookie on every call. The
 * backend's CORS config allows this exact origin with credentials.
 *
 * Base URL defaults to the local Spring Boot port; override with VITE_ADMIN_API when the
 * backend is deployed elsewhere.
 *
 * Every error thrown here carries enough to tell the three failure classes apart, because
 * the login screen shows a different message for each:
 *   err.network === true   the request never got an HTTP answer (backend down, DNS, CORS
 *                          refusal, or the timeout below) — `status` is undefined
 *   err.status === 401     wrong credentials / no session
 *   err.status >= 500      the server was reached but failed (DB down, crash, redeploy)
 */
export const API_BASE = import.meta.env.VITE_ADMIN_API ?? 'http://localhost:8080';

/** Give up on a request after this long. Without it, a backend that accepts the TCP
 *  connection but never answers (cold start, hung DB) leaves the login spinner forever. */
const REQUEST_TIMEOUT_MS = 20_000;

/** Resolve an uploaded-file path (e.g. an avatar's "/uploads/…") to a full URL; passes
 *  through absolute URLs and returns null for empty input. */
export const resolveUpload = (path) => (!path ? null : path.startsWith('http') ? path : `${API_BASE}${path}`);

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(API_BASE + path, {
      credentials: 'include',
      // Older browsers (pre-2022) have no AbortSignal.timeout; they simply get no timeout
      // rather than a login that always fails.
      signal: options.signal ?? (typeof AbortSignal?.timeout === 'function' ? AbortSignal.timeout(REQUEST_TIMEOUT_MS) : undefined),
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });
  } catch (cause) {
    // fetch() only rejects when no HTTP response arrived at all.
    const timedOut = cause?.name === 'TimeoutError' || cause?.name === 'AbortError';
    const err = new Error(timedOut ? `No reply from ${API_BASE} within ${REQUEST_TIMEOUT_MS / 1000}s` : `Cannot reach ${API_BASE}`);
    err.network = true;
    err.timedOut = timedOut;
    err.cause = cause;
    throw err;
  }

  if (res.status === 204) return null;

  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  const body = isJson ? await res.json().catch(() => null) : await res.text().catch(() => '');

  if (!res.ok) {
    const message =
      (body && body.error) || (typeof body === 'string' && body) || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  return body;
}

export const api = {
  get: (path) => request(path),
  post: (path, data) => request(path, { method: 'POST', body: data ? JSON.stringify(data) : undefined }),
  put: (path, data) => request(path, { method: 'PUT', body: JSON.stringify(data) }),
  patch: (path, data) => request(path, { method: 'PATCH', body: JSON.stringify(data) }),
  del: (path) => request(path, { method: 'DELETE' }),
};
