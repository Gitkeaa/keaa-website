import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, LogOut, ChevronDown, ExternalLink, Sun, Moon, X } from 'lucide-react';
import { useAdminAuth } from '../auth/AdminAuthContext';
import { ROLE_LABELS } from '../auth/roles';
import { resolveUpload } from '../api/client';
import HelpButton from '../help/HelpButton';

/**
 * Sticky top bar for the admin console: sidebar toggle, Help button, profile nudge, theme switch, and avatar menu.
 *
 * Rendered once by admin/layout/AdminLayout.jsx inside HelpProvider; edit the topbar
 * controls and the avatar menu here, while layout, routing, and auth live in the parent.
 */
export default function AdminTopbar({ onOpenSidebar, theme, onToggleTheme }) {
  const { user, role, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const onLogout = () => {
    logout();
    navigate('/portal/login', { replace: true });
  };

  // A one-line "finish your profile" nudge next to View site — shows only while the account is
  // incomplete (no photo or phone), and a red cross dismisses it for the session.
  const [nudgeHidden, setNudgeHidden] = useState(() => (user ? sessionStorage.getItem(`keaa-pb-${user.id}`) === '1' : true));
  const profileIncomplete = user && (!user.avatarUrl || !user.phone);
  const dismissNudge = () => { if (user) sessionStorage.setItem(`keaa-pb-${user.id}`, '1'); setNudgeHidden(true); };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
      <button
        type="button"
        onClick={onOpenSidebar}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="ml-auto flex items-center gap-2">
        <HelpButton />
        {profileIncomplete && !nudgeHidden && (
          <div className="hidden items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 md:flex">
            <Link to="/portal/profile" className="hover:underline">Complete your profile</Link>
            <button type="button" onClick={dismissNudge} aria-label="Dismiss" className="text-red-500 transition-colors hover:text-red-700">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          title="Toggle theme"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        >
          {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </button>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 sm:flex"
        >
          View site <ExternalLink className="h-3.5 w-3.5" />
        </a>

        <div className="relative" ref={ref}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            {user?.avatarUrl ? (
              <img src={resolveUpload(user.avatarUrl)} alt="" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-800 text-sm font-bold uppercase text-white">
                {(user?.name || '?').charAt(0)}
              </span>
            )}
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-sm font-medium capitalize text-navy-900">{user?.name}</span>
              <span className="block text-[11px] text-slate-400">{ROLE_LABELS[role]}</span>
            </span>
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
            >
              <div className="border-b border-slate-100 px-4 py-2.5">
                <p className="truncate text-sm font-medium capitalize text-navy-900">{user?.name}</p>
                <p className="truncate text-xs text-slate-400">{user?.email}</p>
              </div>
              {/* The standalone "View site" link beside the avatar is hidden below sm, so the
                  same exit lives here in the menu — the only path to the website on mobile. */}
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="flex w-full items-center gap-2.5 border-b border-slate-100 px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50"
              >
                <ExternalLink className="h-4 w-4" /> View site
              </a>
              <button
                type="button"
                onClick={onLogout}
                role="menuitem"
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
