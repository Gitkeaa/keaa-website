/**
 * Tiny fetch wrapper for the admin API (the Spring Boot backend).
 *
 * WHERE THE API IS. Every call goes to the SAME ORIGIN the page came from, as `/api/...`,
 * and a proxy hands it to Spring Boot:
 *   - production:            vercel.json rewrites /api/* and /uploads/* to the Railway backend
 *   - npm run dev / preview: vite.config.js proxies the same two prefixes to :8080
 *
 * That is what makes the session hold. The backend answers a login with an httpOnly cookie.
 * Served through the page's own origin, that cookie is FIRST-PARTY and every browser keeps
 * it. When this file called the Railway hostname directly, the same cookie was THIRD-PARTY
 * (site: keaainternational.com, cookie: up.railway.app), and every browser that blocks
 * third-party cookies (Safari, Brave, Chrome and Edge in private windows or with the
 * setting on) accepted the login, then silently dropped the cookie, so the console opened
 * and every panel answered 403.
 *
 * VITE_API_DIRECT_ORIGIN bypasses the proxy and calls that origin directly, for a preview
 * build pointed at a staging API. Expect the cookie problem above whenever that origin is a
 * different site from the page.
 *
 * `credentials: 'include'` is right for both: same-origin it changes nothing, direct it is
 * what sends the cookie cross-site (the backend's CORS allows this exact origin).
 *
 * Every error thrown here carries enough to tell the failure classes apart:
 *   err.network === true   no HTTP answer at all (backend down, DNS, CORS refusal, timeout)
 *   err.status === 401     no session; the auth provider ends it (see 'keaa:session-lost')
 *   err.status === 403     signed in, but this role may not do that
 *   err.status >= 500      the server was reached but failed (DB down, crash, redeploy)
 */
export const API_BASE = import.meta.env.VITE_API_DIRECT_ORIGIN ?? '';

/** Where requests go, in words, for error messages. */
export const API_LABEL =
  API_BASE || (import.meta.env.DEV ? 'the backend on http://localhost:8080 (through the Vite proxy)' : 'the API');

/** Give up on a request after this long. Without it, a backend that accepts the TCP
 *  connection but never answers (cold start, hung DB) leaves the login spinner forever. */
const REQUEST_TIMEOUT_MS = 20_000;

/**
 * True for a URL that belongs to our own backend: a same-origin path, or an absolute URL on
 * API_BASE / this page's origin. Callers use it to decide whether the admin cookie may be
 * sent to a URL and whether a file at that URL may be framed inside the console. A stored
 * resumeUrl or imageUrl can be an outside host (Cloudinary), which is public and must never
 * receive the cookie.
 */
export function isOwnApiUrl(url) {
  if (!url) return false;
  if (url.startsWith('/')) return true;
  const own = API_BASE || (typeof window !== 'undefined' ? window.location.origin : '');
  return Boolean(own) && url.startsWith(`${own}/`);
}

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
    const err = new Error(timedOut ? `No reply from ${API_LABEL} within ${REQUEST_TIMEOUT_MS / 1000}s` : `Cannot reach ${API_LABEL}`);
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
    if (res.status === 401 && typeof window !== 'undefined') {
      // Tell the auth provider. It ignores this while nobody is signed in (a wrong password,
      // the session-restore call on load) and otherwise ends the session, which sends the
      // person to the login screen with a notice instead of leaving a console where every
      // panel says "Request failed".
      window.dispatchEvent(new CustomEvent('keaa:session-lost', { detail: { path } }));
    }
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
