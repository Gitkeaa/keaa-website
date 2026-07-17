/**
 * Public → admin-backend bridge.
 *
 * The public site's Contact / RFQ / Careers forms POST here so their submissions land in
 * the same MySQL the admin console reads. These endpoints are unauthenticated on the
 * backend (only submitting is public; reading and triaging still require an admin login).
 *
 * Base URL matches the admin API; override with VITE_ADMIN_API when the backend moves.
 */
const API_BASE = import.meta.env.VITE_ADMIN_API ?? 'http://localhost:8080';

export async function submitPublicForm(path, data) {
  const res = await fetch(API_BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Submission failed (${res.status})`);
  return res.json().catch(() => ({}));
}
