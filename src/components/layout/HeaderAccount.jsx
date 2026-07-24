import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { headerControl, headerControlCls } from './headerControl';
import { useAdminAuth } from '../../admin/auth/AdminAuthContext';
import { resolveUpload } from '../../admin/api/client';
import { useT } from '../../i18n/LocaleContext';

/**
 * The account control in the header's utility cluster — a text "Sign in" when nobody is
 * signed in, the user's first name plus a small menu when somebody is.
 *
 * Icon plus word, matching the search and region controls beside it. The glyph alone would
 * over-promise — a bare silhouette reads as "your account", and there is no public account
 * system behind it (see SignInModal for what this actually signs into) — so the label carries
 * the meaning and the icon only marks the control in the row.
 *
 * The signed-out control is what renders while `checking` is still true, and that is
 * deliberate. AdminAuthContext asks GET /api/auth/me on mount; rendering nothing until it
 * answers costs EVERY visitor a header that reflows when the control pops in, and it also
 * left the control out of the prerendered HTML entirely (the backend is not running at build
 * time, so `checking` never resolves during the snapshot). Signed out is the correct default
 * for the overwhelming majority, so it is drawn immediately and only upgrades to a name for
 * the few who turn out to have a session. Nobody sees a gap; a signed-in admin sees one label
 * settle. That trade runs the right way round.
 */
export default function HeaderAccount() {
  const t = useT();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthed, logout } = useAdminAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef(null);

  // Navigating out of the menu must dismiss it — the route changes underneath but the
  // pointer never leaves the header, so no outside click would ever fire.
  useEffect(() => setMenuOpen(false), [location.pathname]);

  // Escape and outside pointer-down close it, matching HeaderSearch and the nav panels.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const handleSignOut = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/');
  };

  // `hidden sm:flex` overrides the shared idiom's `flex` at the narrow end: the mobile drawer
  // carries its own account row, and a narrow header has room for the quote CTA or this, not both.
  const triggerCls = `${headerControlCls(menuOpen)} hidden sm:flex`;

  // `checking` counts as signed out here — see the note above on why this renders eagerly.
  // One login screen for the whole site: this goes straight to /portal/login rather than opening
  // an in-header dialog, so a signed-out visitor and a logged-out staffer see the same page.
  if (!isAuthed) {
    return (
      <>
        {/* Mobile: an icon-only sign-in beside the search icon, so login is one tap from any
            page instead of buried at the foot of the drawer. Same styling as the search
            button; hidden at sm+, where the worded link below takes over. */}
        <Link
          to="/portal/login"
          aria-label={t('auth.signIn')}
          className={`${headerControl} justify-center sm:hidden`}
        >
          <User aria-hidden className="h-[18px] w-[18px]" strokeWidth={2} />
        </Link>
        <Link to="/portal/login" className={triggerCls}>
          <User aria-hidden className="h-[18px] w-[18px] flex-shrink-0" strokeWidth={2} />
          {t('auth.signIn')}
        </Link>
      </>
    );
  }

  // Just the first name on the header line: full names run long enough to push the quote
  // CTA off a laptop-width row, and the menu shows the full name anyway.
  const firstName = user.name?.split(' ')[0] || user.name;

  return (
    <>
      {/* Mobile: icon-only shortcut into the portal, in the same slot as the signed-out
          sign-in icon. It opens the dashboard; the drawer still carries sign-out. */}
      <Link
        to="/portal"
        aria-label={t('auth.dashboard')}
        className={`${headerControl} justify-center sm:hidden`}
      >
        {user.avatarUrl ? (
          <img src={resolveUpload(user.avatarUrl)} alt="" className="h-5 w-5 rounded-full object-cover" />
        ) : (
          <User aria-hidden className="h-[18px] w-[18px]" strokeWidth={2} />
        )}
      </Link>
      <div ref={wrapRef} className="relative hidden sm:block">
        {/* No chevron. An item with a panel looks identical to one without in this header —
            see the note above the nav in Header.jsx. `aria-expanded` carries the state to
            anyone who needs it announced. */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          // The name FIRST, then the purpose. `aria-label` replaces the element's contents in
          // the accessible name, so a bare "Account menu" would throw away the one word the
          // control visibly shows — speech input ("click Kishlay") would find nothing to match,
          // and a screen reader would never say which account is signed in. Same superset shape
          // as RegionLanguageSwitcher's srLabel, em dash included.
          aria-label={`${firstName}, ${t('auth.accountAria')}`}
          className={triggerCls}
        >
          {user.avatarUrl ? (
            <img src={resolveUpload(user.avatarUrl)} alt="" className="h-5 w-5 flex-shrink-0 rounded-full object-cover" />
          ) : (
            <User aria-hidden className="h-[18px] w-[18px] flex-shrink-0" strokeWidth={2} />
          )}
          {firstName}
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full z-50 mt-2 min-w-[13rem] rounded-card border border-border bg-white p-1.5 shadow-card">
            <div className="border-b border-border px-3 pb-2.5 pt-2">
              <p className="truncate text-sm font-semibold text-navy-900">{user.name}</p>
            </div>

            <Link
              to="/portal"
              onClick={() => setMenuOpen(false)}
              className="block rounded-card px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-navy-50 hover:text-navy-900"
            >
              {t('auth.dashboard')}
            </Link>

            <button
              type="button"
              onClick={handleSignOut}
              className="block w-full rounded-card px-3 py-2 text-left text-sm font-medium text-ink transition-colors hover:bg-navy-50 hover:text-navy-900"
            >
              {t('auth.signOut')}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
