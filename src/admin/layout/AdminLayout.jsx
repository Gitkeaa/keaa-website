import { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, X } from 'lucide-react';
import { useAdminAuth } from '../auth/AdminAuthContext';
import { roleAllowsPath } from '../auth/roles';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';

/**
 * The protected admin shell. Guards the whole /admin/* subtree: an unauthenticated visitor
 * is sent to /admin/login (remembering where they were headed). On desktop the sidebar is
 * fixed; on mobile it is a slide-over drawer.
 *
 * When the real backend lands, the only change here is that the auth check may first wait
 * on a "am I still logged in?" call to /api/auth/me — the redirect logic stays identical.
 */
export default function AdminLayout() {
  const { isAuthed, checking, role } = useAdminAuth();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

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
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  // Role guard: a signed-in user who deep-links to a module their role cannot open is sent to
  // the dashboard (visible to every role) rather than a page whose data the backend will 403.
  // The sidebar already hides these links; this covers a typed URL or a stale bookmark.
  if (role && !roleAllowsPath(role, location.pathname)) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-navy-900">
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

      {/* Content */}
      <div className="lg:pl-64">
        <AdminTopbar onOpenSidebar={() => setDrawerOpen(true)} />
        <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
