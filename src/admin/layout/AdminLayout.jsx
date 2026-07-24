import { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, X } from 'lucide-react';
import { useAdminAuth } from '../auth/AdminAuthContext';
import { roleAllowsPath } from '../auth/roles';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';
import { HelpProvider } from '../help/HelpContext';
import WelcomeTour from '../help/WelcomeTour';
import { loadSops } from '../help/useSop';

/**
 * The protected admin shell. Guards the whole /portal/* subtree: an unauthenticated visitor
 * is sent to /portal/login (remembering where they were headed). On desktop the sidebar is
 * fixed; on mobile it is a slide-over drawer.
 *
 * When the real backend lands, the only change here is that the auth check may first wait
 * on a "am I still logged in?" call to /api/auth/me — the redirect logic stays identical.
 */
export default function AdminLayout() {
  const { isAuthed, checking, role } = useAdminAuth();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Load the DB-backed help/SOP content once the session is confirmed. Fails silently to the
  // static fallback, so nothing here blocks or breaks when the backend is down.
  useEffect(() => {
    if (isAuthed) loadSops();
  }, [isAuthed]);
  const [theme, setTheme] = useState(() => localStorage.getItem('keaa-admin-theme') || 'light');
  const toggleTheme = () =>
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark';
      localStorage.setItem('keaa-admin-theme', next);
      return next;
    });

  // Wait for the session-restore call before deciding — otherwise a refresh flashes the
  // login screen for an already-signed-in user.
  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-6 w-6 animate-spin text-primary-dark" />
      </div>
    );
  }

  if (!isAuthed) {
    return <Navigate to="/portal/login" replace state={{ from: location.pathname }} />;
  }

  // Role guard: a signed-in user who deep-links to a module their role cannot open is sent to
  // the dashboard (visible to every role) rather than a page whose data the backend will 403.
  // The sidebar already hides these links; this covers a typed URL or a stale bookmark.
  if (role && !roleAllowsPath(role, location.pathname)) {
    return <Navigate to="/portal" replace />;
  }

  return (
    <div className={`min-h-screen bg-slate-50 text-navy-900 ${theme === 'dark' ? 'admin-dark' : ''}`}>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <AdminSidebar />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-navy-950/50"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-50 w-64"
            >
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="absolute -right-11 top-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white"
              >
                <X className="h-5 w-5" />
              </button>
              <AdminSidebar onNavigate={() => setDrawerOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Faint KEAA cube mark behind every page — shows only through the empty areas, since the
          module cards are opaque. Fixed + very low opacity so it never distracts. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 hidden items-center justify-center opacity-[0.09] lg:flex lg:pl-64"
      >
        <svg viewBox="0 0 100 100" className="h-[32rem] w-[32rem]">
          <defs>
            <mask id="admin-bg-cube">
              <rect x="0" y="0" width="100" height="100" fill="white" />
              <line x1="50" y1="50" x2="5" y2="50" stroke="black" strokeWidth="5.5" />
              <line x1="50" y1="50" x2="73" y2="10" stroke="black" strokeWidth="5.5" />
              <line x1="50" y1="50" x2="73" y2="90" stroke="black" strokeWidth="5.5" />
            </mask>
          </defs>
          <g mask="url(#admin-bg-cube)">
            <polygon points="10,50 30,15.36 70,15.36 50,50" fill="#79c7f9" />
            <polygon points="10,50 50,50 70,84.64 30,84.64" fill="#2b84da" />
            <polygon points="50,50 70,15.36 90,50 70,84.64" fill="#2065be" />
          </g>
        </svg>
      </div>

      {/* Content. Wrapped in HelpProvider so the topbar Help button and every page share the
          one contextual-help drawer. */}
      <div className="relative z-10 lg:pl-64">
        <HelpProvider>
          <AdminTopbar onOpenSidebar={() => setDrawerOpen(true)} theme={theme} onToggleTheme={toggleTheme} />
          <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
          {/* First-visit walkthrough — shows once, then never again. */}
          <WelcomeTour />
        </HelpProvider>
      </div>
    </div>
  );
}
