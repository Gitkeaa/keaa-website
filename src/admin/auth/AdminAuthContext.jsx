import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ROLES } from './roles';

/**
 * Admin auth — MOCK for now, real later.
 *
 * Phase 1 has no backend yet, so login accepts any non-empty credentials and signs the
 * user in as SUPER_ADMIN. The session is held in sessionStorage so a refresh keeps you in.
 *
 * When Spring Boot lands, only the two marked functions change:
 *   login()  → POST /api/auth/login  (server sets an httpOnly JWT cookie; the response
 *              body carries the safe user profile { name, email, role } we store here —
 *              the token itself never touches JS, that is the point of the httpOnly cookie)
 *   logout() → POST /api/auth/logout (server clears the cookie)
 * Everything downstream (role, guards, nav) stays exactly as it is.
 */
const SESSION_KEY = 'keaa-admin-user';

const AdminAuthContext = createContext(null);

function readSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(readSession);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else window.sessionStorage.removeItem(SESSION_KEY);
  }, [user]);

  // MOCK — replace body with a fetch to /api/auth/login. Signature stays the same.
  const login = useCallback(async ({ email, password }) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500)); // fake network latency
    setLoading(false);
    if (!email || !password) {
      return { ok: false, error: 'Email and password are required.' };
    }
    const profile = {
      name: email.split('@')[0].replace(/[._]/g, ' ') || 'Administrator',
      email,
      role: ROLES.SUPER_ADMIN, // Phase 1: everyone who logs in is the super admin
    };
    setUser(profile);
    return { ok: true };
  }, []);

  // MOCK — replace with POST /api/auth/logout, then clear.
  const logout = useCallback(() => setUser(null), []);

  const value = useMemo(
    () => ({ user, role: user?.role ?? null, isAuthed: Boolean(user), loading, login, logout }),
    [user, loading, login, logout]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used inside <AdminAuthProvider>');
  return ctx;
}
