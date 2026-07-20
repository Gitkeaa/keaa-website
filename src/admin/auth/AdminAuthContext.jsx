import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';

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
      const u = await api.post('/api/auth/login', { email, password });
      setUser(u);
      return { ok: true };
    } catch (e) {
      // A CODE, not just a sentence. This used to return English prose, which was fine while
      // /admin/login was the only caller — an internal console, English-only, staffed by people
      // who know what port 8080 is. It is now also reachable from the PUBLIC header in twelve
      // languages, where "Is the backend running on port 8080?" is both untranslated and an
      // internal detail no visitor should ever be shown. Callers map the code to their own copy;
      // `error` stays for the admin console, which wants exactly this wording.
      const code = e.status === 401 ? 'invalid' : 'unreachable';
      const error =
        code === 'invalid'
          ? 'Invalid email or password.'
          : 'Could not reach the server. Is the backend running on port 8080?';
      return { ok: false, code, error };
    } finally {
      setLoading(false);
    }
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
    () => ({ user, role: user?.role ?? null, isAuthed: Boolean(user), checking, loading, login, logout }),
    [user, checking, loading, login, logout]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used inside <AdminAuthProvider>');
  return ctx;
}
