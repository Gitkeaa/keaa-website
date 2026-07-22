/**
 * Tiny fetch wrapper for the admin API (the Spring Boot backend).
 *
 * `credentials: 'include'` is the important bit: the JWT lives in an httpOnly cookie the
 * browser sets on login, and this tells fetch to send that cookie on every call. The
 * backend's CORS config allows this exact origin with credentials.
 *
 * Base URL defaults to the local Spring Boot port; override with VITE_ADMIN_API when the
 * backend is deployed elsewhere.
 */
export const API_BASE = import.meta.env.VITE_ADMIN_API ?? 'http://localhost:8080';

/** Resolve an uploaded-file path (e.g. an avatar's "/uploads/…") to a full URL; passes
 *  through absolute URLs and returns null for empty input. */
export const resolveUpload = (path) => (!path ? null : path.startsWith('http') ? path : `${API_BASE}${path}`);

async function request(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  if (res.status === 204) return null;

  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  const body = isJson ? await res.json() : await res.text();

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
