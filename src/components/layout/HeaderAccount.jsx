import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { utilityControl, utilityControlCls } from './headerControl';
import { useAdminAuth } from '../../admin/auth/AdminAuthContext';
import { resolveUpload } from '../../admin/api/client';
import { useT } from '../../i18n/LocaleContext';

/**
 * The account control, in the utility bar above the nav — a text "Log in" when nobody is
 * signed in, the user's first name plus a small menu when somebody is.
 *
 * Icon plus word, matching the region control beside it. The glyph alone would over-promise:
 * a bare silhouette reads as "your account", and there is no public account system behind it,
 * so the label carries the meaning and the icon only marks the control in the row.
 *
 * NO BREAKPOINTS OF ITS OWN any more. It used to carry `sm:hidden` / `hidden sm:flex` pairs
 * to swap a worded link for an icon-only one on a narrow header. It now lives inside TopBar,
 * which is hidden below `md` outright, so those variants could never render and the drawer's
 * own account row is what a phone gets instead. One control, one shape.
 *
 * The signed-out control is what renders while `checking` is still true, and that is
 * deliberate. AdminAuthContext asks GET /api/auth/me on mount; rendering nothing until it
 * answers costs EVERY visitor a bar that reflows when the control pops in, and it also
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

  // `checking` counts as signed out here — see the note above on why this renders eagerly.
  // One login screen for the whole site: this goes straight to /portal/login rather than
  // opening an in-header dialog, so a signed-out visitor and a logged-out staffer see the
  // same page.
  if (!isAuthed) {
    return (
      <Link to="/portal/login" className={utilityControl}>
        <User aria-hidden className="h-4 w-4 flex-shrink-0" strokeWidth={2} />
        {t('auth.signIn')}
      </Link>
    );
  }

  // Just the first name on the bar: full names run long enough to crowd the region control
  // beside them, and the menu shows the full name anyway.
  const firstName = user.name?.split(' ')[0] || user.name;

  return (
    <div ref={wrapRef} className="relative">
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
        // as RegionLanguageSwitcher's srLabel.
        aria-label={`${firstName}, ${t('auth.accountAria')}`}
        className={utilityControlCls(menuOpen)}
      >
        {user.avatarUrl ? (
          <img src={resolveUpload(user.avatarUrl)} alt="" className="h-4 w-4 flex-shrink-0 rounded-full object-cover" />
        ) : (
          <User aria-hidden className="h-4 w-4 flex-shrink-0" strokeWidth={2} />
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
  );
}
