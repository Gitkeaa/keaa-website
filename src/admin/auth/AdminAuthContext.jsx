import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api, API_LABEL } from '../api/client';
import { isPrerender } from '../../lib/prerender';

/**
 * Map a failed login call to a stable code and the admin console's own wording.
 *
 * A CODE, not just a sentence: /portal/login is an internal console, but the same login is
 * also reachable from the PUBLIC header in twelve languages, where internal detail is not
 * something a visitor should be shown. Callers map the code to their own copy; `error` is
 * the console's wording.
 *
 *   invalid      wrong email/password, or a deactivated account (the server answered 401)
 *   unreachable  no answer at all: backend not running, DNS, CORS, timeout
 *   server       the server answered with a failure (5xx: database down, mid-redeploy)
 *   cookie       signed in, but the browser did not keep the session cookie (set by login())
 */
function describeLoginFailure(e) {
  if (e?.status === 401) {
    return { code: 'invalid', error: e.message && !/^Request failed/.test(e.message) ? e.message : 'Invalid email or password.' };
  }
  // In dev the Vite proxy answers 5xx ITSELF when nothing listens on :8080, so a 5xx there
  // means "backend not running", not "backend crashed".
  if (e?.network || (import.meta.env.DEV && e?.status >= 500 && e?.status <= 504)) {
    const hint = import.meta.env.DEV
      ? `The backend is not running (${API_LABEL}). Start it with "npm run dev:all", or run KeaaAdminApiApplication in IntelliJ, and try again.`
      : e?.timedOut
        ? `${API_LABEL} did not answer in time. It may be restarting, please try again in a minute.`
        : `Could not reach ${API_LABEL}. Check your connection, or the server may be restarting, please try again in a minute.`;
    return { code: 'unreachable', error: hint };
  }
  if (e?.status >= 500) {
    return { code: 'server', error: `The server is having trouble right now (HTTP ${e.status}). Please try again in a moment.` };
  }
  return { code: 'server', error: e?.message || 'Login failed. Please try again.' };
}

const COOKIE_NOT_KEPT =
  'You signed in, but your browser did not keep the session cookie, so the console cannot load. ' +
  'This usually means cookies are blocked for this site (a private window, or a browser setting). ' +
  'Allow cookies for this site and sign in again.';

/**
 * Admin auth, backed by the Spring Boot API.
 *
 * The JWT is stored in an httpOnly cookie the browser can't read from JS, so we don't keep
 * the token here at all. Instead:
 *   - on load we ask GET /api/auth/me who the cookie belongs to (session restore);
 *   - login() POSTs credentials, the server sets the cookie, and ONE more /me confirms the
 *     browser actually kept it before the console opens;
 *   - any later 401 ends the session (the api client raises 'keaa:session-lost');
 *   - logout() POSTs to clear it.
 * `checking` is true while the initial /me call is in flight, so guards can wait instead of
 * bouncing a logged-in user to the login screen on refresh.
 */
const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  // Shown on the login screen after a session ended underneath an open console.
  const [sessionNotice, setSessionNotice] = useState('');

  // The event handler below needs the CURRENT user without re-subscribing on every change.
  const userRef = useRef(null);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    /**
     * Nobody is signed in while the site is being snapshotted at build time, and there is no
     * API on the other end to ask.
     *
     * Without this guard the call was made anyway, the prerender server answered it with the
     * index page rather than a 401, and a truthy non-user came back. Every page then had a
     * SIGNED-IN header baked into its static HTML: a blank account button whose accessible
     * name was literally "undefined, Account menu", shown to every visitor until JavaScript
     * corrected it. Measured on the live site on 2026-09-21, every page except the home page
     * carried it.
     *
     * It is also what stopped the page being hydrated. The prerendered markup said signed in,
     * the browser said signed out, React gave up on the server HTML and rebuilt the whole
     * tree, and the page visibly jumped. See the note in main.jsx.
     *
     * Signed out is the honest answer for a static page, and it is what a visitor sees first
     * either way. A staff member with a live session gets the signed-in header a moment later
     * when the real call resolves, which is a state change after hydration rather than a
     * disagreement with it.
     */
    if (isPrerender()) {
      setChecking(false);
      return undefined;
    }
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

  // A 401 from ANY admin call while someone is signed in means the session is gone: the
  // 7-day cookie expired, "log out everywhere" was used on another device, or the browser
  // stopped sending the cookie. End it here so the layout guard sends the person to the
  // login screen with an explanation, instead of every panel showing "Request failed (401)".
  // Ignored while nobody is signed in: a wrong password and the restore call above both
  // produce a 401 that means nothing.
  useEffect(() => {
    const onSessionLost = () => {
      if (!userRef.current) return;
      setSessionNotice('Your session has ended. Please sign in again.');
      setUser(null);
    };
    window.addEventListener('keaa:session-lost', onSessionLost);
    return () => window.removeEventListener('keaa:session-lost', onSessionLost);
  }, []);

  /**
   * A login answering 200 does not prove the browser KEPT the cookie it was handed; a
   * blocked third-party cookie looks exactly like success until the next request. So every
   * sign-in is confirmed with one GET /me before the console opens. A 401 there means the
   * cookie was dropped, and the person is told so, instead of getting a console that fails
   * on every panel. Anything other than a 401 (a network blip right after login) proceeds
   * with the login response; the session-lost handler catches whatever is real.
   */
  const confirmSession = useCallback(async (fallbackUser) => {
    try {
      return { ok: true, user: await api.get('/api/auth/me') };
    } catch (e) {
      if (e?.status === 401) return { ok: false };
      return { ok: true, user: fallbackUser };
    }
  }, []);

  const login = useCallback(
    async ({ email, password }) => {
      setLoading(true);
      try {
        const res = await api.post('/api/auth/login', { email, password });
        // 2FA on: the password was right but there is no session yet — the caller must collect
        // a code and call loginTwoFactor with this challenge token.
        if (res && res.twoFactorRequired) {
          return { ok: false, twoFactor: true, challengeToken: res.challengeToken };
        }
        const confirmed = await confirmSession(res);
        if (!confirmed.ok) return { ok: false, code: 'cookie', error: COOKIE_NOT_KEPT };
        setSessionNotice('');
        setUser(confirmed.user);
        return { ok: true };
      } catch (e) {
        const { code, error } = describeLoginFailure(e);
        return { ok: false, code, error };
      } finally {
        setLoading(false);
      }
    },
    [confirmSession]
  );

  /** Step two of a 2FA login — trade the challenge token + code for a session. */
  const loginTwoFactor = useCallback(
    async ({ challengeToken, code }) => {
      setLoading(true);
      try {
        const u = await api.post('/api/auth/login/2fa', { challengeToken, code });
        const confirmed = await confirmSession(u);
        if (!confirmed.ok) return { ok: false, code: 'cookie', error: COOKIE_NOT_KEPT };
        setSessionNotice('');
        setUser(confirmed.user);
        return { ok: true };
      } catch (e) {
        return { ok: false, error: e.status === 401 ? 'Your sign-in expired. Please log in again.' : (e.message || 'That code is not valid.') };
      } finally {
        setLoading(false);
      }
    },
    [confirmSession]
  );

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
    setSessionNotice('');
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      role: user?.role ?? null,
      isAuthed: Boolean(user),
      checking,
      loading,
      sessionNotice,
      login,
      loginTwoFactor,
      logout,
      refreshUser,
    }),
    [user, checking, loading, sessionNotice, login, loginTwoFactor, logout, refreshUser]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used inside <AdminAuthProvider>');
  return ctx;
}
