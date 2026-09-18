import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, API_BASE } from '../api/client';

/** Map a failed login call to a stable code and the admin console's own wording. */
function describeLoginFailure(e) {
  if (e?.status === 401) {
    return { code: 'invalid', error: e.message && !/^Request failed/.test(e.message) ? e.message : 'Invalid email or password.' };
  }
  if (e?.status >= 500) {
    return {
      code: 'server',
      error: `The server is having trouble right now (HTTP ${e.status}). Please try again in a moment.`,
    };
  }
  if (e?.network) {
    const local = /localhost|127.0.0.1/.test(API_BASE);
    const hint = import.meta.env.DEV && local
      ? `The backend is not running on ${API_BASE}. Start it with "npm run dev:all" (or run KeaaAdminApiApplication in IntelliJ) and try again.`
      : e.timedOut
        ? `${API_BASE} did not answer in time. It may be restarting — please try again in a minute.`
        : `Could not reach ${API_BASE}. Check your connection, or the server may be restarting — please try again in a minute.`;
    return { code: 'unreachable', error: hint };
  }
  return { code: 'server', error: e?.message || 'Login failed. Please try again.' };
}

/**
 * Admin auth, backed by the Spring Boot API.
 *
 * The JWT is stored in an httpOnly cookie the browser can't read from JS, so we don't keep
 * the token here at all. Instead:
 *   - on load we ask GET /api/auth/me who the cookie belongs to (session restore);
 *   - login() POSTs credentials and the server sets the cookie;
 *   - logout() POSTs to clear it.
 * `checking` is true while the initial /me call is in flight, so guards can wait instead of
 * bouncing a logged-in user to the login screen on refresh.
 */
const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    api
      .get('/api/auth/me')
      .then((u) => alive && setUser(u))
      .catch(() => alive && setUser(null))
      .finally(() => alive && setChecking(false));
    return () => {
      alive = false;
    };
  }, []);

  const login = useCallback(async ({ email, password }) => {
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      // 2FA on: the password was right but there is no session yet — the caller must collect a
      // code and call loginTwoFactor with this challenge token.
      if (res && res.twoFactorRequired) {
        return { ok: false, twoFactor: true, challengeToken: res.challengeToken };
      }
      setUser(res);
      return { ok: true };
    } catch (e) {
      // A CODE, not just a sentence. This used to return English prose, which was fine while
      // /portal/login was the only caller — an internal console, English-only, staffed by people
      // who know what port 8080 is. It is now also reachable from the PUBLIC header in twelve
      // languages, where an internal detail is not something a visitor should ever be shown.
      // Callers map the code to their own copy; `error` stays for the admin console.
      //
      // Three codes, because they need three different actions from the person reading them:
      //   invalid      wrong email/password (or a deactivated account) — the server answered 401
      //   server       the server answered, but with a failure (5xx: database down, mid-redeploy)
      //   unreachable  no answer at all — backend not running, wrong VITE_ADMIN_API, CORS, timeout
      // Before this split every non-401 (including a 500 from a database hiccup on the live
      // API) was reported as "Is the backend running on port 8080?", which sent people looking
      // for a local process that was not the problem.
      const { code, error } = describeLoginFailure(e);
      return { ok: false, code, error };
    } finally {
      setLoading(false);
    }
  }, []);

  /** Step two of a 2FA login — trade the challenge token + code for a session. */
  const loginTwoFactor = useCallback(async ({ challengeToken, code }) => {
    setLoading(true);
    try {
      const u = await api.post('/api/auth/login/2fa', { challengeToken, code });
      setUser(u);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.status === 401 ? 'Your sign-in expired. Please log in again.' : (e.message || 'That code is not valid.') };
    } finally {
      setLoading(false);
    }
  }, []);

  /** Re-pull the current user (e.g. after a profile photo change) so the shell updates. */
  const refreshUser = useCallback(async () => {
    try { setUser(await api.get('/api/auth/me')); } catch { /* ignore */ }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {
      /* clear locally even if the call fails */
    }
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, role: user?.role ?? null, isAuthed: Boolean(user), checking, loading, login, loginTwoFactor, logout, refreshUser }),
    [user, checking, loading, login, loginTwoFactor, logout, refreshUser]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used inside <AdminAuthProvider>');
  return ctx;
}
