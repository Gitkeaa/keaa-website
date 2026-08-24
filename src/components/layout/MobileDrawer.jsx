import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { mainNav } from '../../data/navigation';
import { getAllCategories } from '../../data/categories';
import { useLocale, useLT } from '../../i18n/LocaleContext';
import { getLanguage, isLiveLocale } from '../../i18n/languages';
import { useRegion } from '../../context/RegionContext';
import { localeId } from '../../data/regions';
import { useAdminAuth } from '../../admin/auth/AdminAuthContext';
import { ROLE_LABELS } from '../../admin/auth/roles';
import { EASE } from '../../lib/motion';

/**
 * Mobile slide-over navigation drawer for small screens: main nav, team sign-in rows, the
 * region and language chooser, and the request-quote CTA.
 *
 * Rendered once by components/Layout.jsx and opened by the Header hamburger; controlled via
 * the open and onClose props. Edit the drawer's contents and behaviour here.
 */
// Closing on route change is owned by Layout, which closes this drawer and the search
// palette together (see Layout.jsx). Do not re-implement it here.
export default function MobileDrawer({ open, onClose }) {
  const { setLanguage, t } = useLocale();
  const lt = useLT('common');
  const { region, entry, setLocaleChoice, regions } = useRegion();
  const [openRegion, setOpenRegion] = useState(null);

  /*
    The drawer carries its own account rows rather than rendering <HeaderAccount />: that
    component is a compact header control with a floating dropdown, and a floating panel
    inside a slide-over is the wrong shape here. The rows below are drawer-native and share
    only the hook.
  */
  const navigate = useNavigate();
  const { user, isAuthed, checking, logout } = useAdminAuth();
  // One login screen for the whole site: close the drawer and go to /portal/login (no in-drawer
  // dialog), so mobile and desktop, signed-out and logged-out, all reach the same page.
  const openSignIn = () => {
    onClose();
    navigate('/portal/login');
  };

  const handleSignOut = async () => {
    onClose();
    await logout();
    navigate('/');
  };

  const activeLocaleId = entry ? localeId(region, entry) : null;

  // One row sets both halves of the setting, exactly as the desktop control does.
  const chooseLocale = (regionKey, item) => {
    const lang = setLocaleChoice(regionKey, item);
    if (lang) setLanguage(lang);
  };

  return (
    /*
      The modal is a SIBLING of the drawer's AnimatePresence, not a child of it. Opening
      sign-in closes the drawer, and the drawer's whole subtree unmounts on close — a modal
      nested inside it would be torn down in the same frame it was asked to open.
    */
    <>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="mobile-drawer-wrapper"
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 z-[70] pointer-events-none"
          >
            {/* Backdrop */}
            <motion.div
              variants={{
                closed: { opacity: 0 },
                open: { opacity: 1 }
              }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="absolute inset-0 bg-navy-950/60 pointer-events-auto"
            />

            {/* Drawer Content */}
            <motion.div
              variants={{
                closed: { x: '100%' },
                open: { x: 0 }
              }}
              transition={{ duration: 0.32, ease: EASE }}
              className="absolute inset-y-0 right-0 z-10 flex w-full max-w-sm flex-col bg-white shadow-2xl pointer-events-auto"
            >
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <Logo />
                <button
                  onClick={onClose}
                  className="flex h-9 items-center justify-center rounded-card border border-border px-3 text-[13px] font-bold uppercase tracking-[0.12em] text-navy-700 transition-colors hover:border-primary/40 hover:bg-navy-50"
                  aria-label={lt('closeMenu', 'Close menu')}
                >
                  {lt('close', 'Close')}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5">
                {/*
                Same information architecture as the desktop panels, flattened. Each nav
                item lists its own children indented beneath it, instead of the old three
                disconnected blocks (nav, then "Product Categories", then "Explore KEAA")
                that gave no clue which section a page belonged to.

                Nothing collapses here: on a phone, tapping to expand a two-item list costs
                more than simply showing it.
              */}
                <nav className="space-y-1">
                  {mainNav.map((item) => {
                    const own = item.children || [];
                    /* The row pointing at the section's own page ("All Products"). On desktop
                       it leads the panel; here it leads the indented list for the same
                       reason — see the note in NavPanel.jsx. */
                    const parentRow = own.find((c) => c.to === item.to);

                    const children = [
                      ...(parentRow ? [{ ...parentRow, label: lt(`nav.row.${parentRow.to}.label`, parentRow.label) }] : []),
                      ...(item.categories
                        ? getAllCategories().map((c) => ({
                            label: lt(`cat.${c.slug}`, c.name),
                            to: `/products/${c.slug}`,
                          }))
                        : []),
                      ...own
                        .filter((c) => c !== parentRow)
                        .map((c) => ({ ...c, label: lt(`nav.row.${c.to}.label`, c.label) })),
                    ];

                    /*
                      A section with sub-pages is a HEADING here, not a link — matching the
                      desktop header, where the nav item only opens its panel. Tapping
                      "Products" no longer loads the catalogue; "All Products" directly
                      beneath it does. Sections with no children stay tappable links, since
                      they have nowhere else to send you.

                      It used to be the reverse: this row linked to the page and the "All
                      Products" child was filtered out as a duplicate. Restoring that child
                      is what makes dropping the link safe.
                    */
                    return (
                      <div key={item.to}>
                        {children.length ? (
                          <p className="px-3 py-3 text-sm font-semibold text-text">
                            {t(item.key)}
                          </p>
                        ) : (
                          <NavLink
                            to={item.to}
                            className={({ isActive }) =>
                              `group flex items-center rounded-card px-3 py-3 text-sm font-semibold ${
                                isActive ? 'bg-navy-50 text-navy-900' : 'text-ink hover:bg-navy-50'
                              }`
                            }
                          >
                            <span className="border-b border-transparent pb-0.5 transition-colors group-hover:border-primary group-hover:text-primary-darker">
                              {t(item.key)}
                            </span>
                          </NavLink>
                        )}

                        {children.map((child) => (
                          <Link
                            key={`${item.to}-${child.to}`}
                            to={child.to}
                            className="group flex items-center rounded-card py-2 pl-6 pr-3 text-sm font-medium text-ink hover:bg-navy-50"
                          >
                            <span className="border-b border-transparent pb-0.5 transition-colors group-hover:border-primary group-hover:text-primary-darker">
                              {child.label}
                            </span>
                          </Link>
                        ))}
                      </div>
                    );
                  })}
                </nav>

                {/* Team sign-in. Nothing renders while the session check is in flight, so the
                  drawer never shows "Sign in" and then swaps it for a name. Text only, like
                  every other row here. */}
                {!checking && (
                  <div className="mt-3 border-t border-border pt-3">
                    {isAuthed ? (
                      <>
                        <div className="px-3 pb-1">
                          <p className="truncate text-sm font-semibold text-navy-900">
                            {user.name}
                          </p>
                          <p className="truncate text-xs text-muted">
                            {ROLE_LABELS[user.role] || user.role}
                          </p>
                        </div>
                        <Link
                          to="/portal"
                          onClick={onClose}
                          className="group flex items-center rounded-card px-3 py-2.5 text-sm font-medium text-ink hover:bg-navy-50"
                        >
                          <span className="border-b border-transparent pb-0.5 transition-colors group-hover:border-primary group-hover:text-primary-darker">
                            {t('auth.dashboard')}
                          </span>
                        </Link>
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="group flex w-full items-center rounded-card px-3 py-2.5 text-left text-sm font-medium text-ink hover:bg-navy-50"
                        >
                          <span className="border-b border-transparent pb-0.5 transition-colors group-hover:border-primary group-hover:text-primary-darker">
                            {t('auth.signOut')}
                          </span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={openSignIn}
                        className="group flex w-full items-center rounded-card px-3 py-3 text-left text-sm font-semibold text-ink hover:bg-navy-50"
                      >
                        <span className="border-b border-transparent pb-0.5 transition-colors group-hover:border-primary group-hover:text-primary-darker">
                          {t('auth.signIn')}
                        </span>
                      </button>
                    )}
                  </div>
                )}

                {/* Region + language — one setting, as on desktop. The drawer expands a
                  region in place rather than drilling into a second screen: a slide-over
                  that pushes another slide-over is hard to back out of on touch. */}
                <div className="mt-3 border-t border-border pt-3">
                  <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                    {t('region.title')}
                  </p>

                  {regions.map((r) => {
                    const expanded = openRegion === r.key;
                    const isCurrent = r.key === region;
                    return (
                      <div key={r.key}>
                        <button
                          type="button"
                          onClick={() => setOpenRegion(expanded ? null : r.key)}
                          aria-expanded={expanded}
                          className={`flex w-full items-center justify-between rounded-card px-3 py-2.5 text-left text-sm transition-colors ${
                            isCurrent ? 'font-semibold text-navy-900' : 'text-ink hover:bg-navy-50'
                          }`}
                        >
                          {lt(`region.${r.key}.label`, r.label)}
                          {/* Typographic, not an icon — the drawer states every affordance
                            in type (see the nav rows above). */}
                          <span
                            aria-hidden
                            className="flex-shrink-0 text-base leading-none text-muted"
                          >
                            {expanded ? '–' : '+'}
                          </span>
                        </button>

                        {expanded && (
                          <ul className="pb-1">
                            {r.locales.map((item) => {
                              const id = localeId(r.key, item);
                              const active = id === activeLocaleId;
                              return (
                                <li key={id}>
                                  <button
                                    type="button"
                                    onClick={() => chooseLocale(r.key, item)}
                                    aria-current={active ? 'true' : undefined}
                                    className={`flex w-full items-center gap-2.5 rounded-card py-2 pl-6 pr-3 text-left text-xs transition-colors ${
                                      active
                                        ? 'bg-primary/[0.06] font-semibold text-navy-900'
                                        : 'text-ink hover:bg-navy-50'
                                    }`}
                                  >
                                    {/* No flag emoji — Chrome on Windows has no flag glyphs
                                      and renders them as bare country letters ("IN"). */}
                                    <span className="min-w-0 flex-1 truncate">
                                      {lt(`country.${item.code}`, item.country)} <span className="text-muted">–</span>{' '}
                                      <span lang={item.lang}>{getLanguage(item.lang).label}</span>
                                    </span>
                                    {/* Same coming-soon badge as the desktop switcher: an
                                      untranslated language says so before it is chosen. */}
                                    {item.lang !== 'en' && !isLiveLocale(item.lang) && !active && (
                                      <span className="flex-shrink-0 rounded-full border border-primary/40 bg-primary/10 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.08em] text-primary-darker">
                                        {t('lang.comingSoon')}
                                      </span>
                                    )}
                                    {/* `aria-current` announces the selection; this is its
                                      visual half, so it stays aria-hidden. */}
                                    {active && (
                                      <span
                                        aria-hidden
                                        className="flex-shrink-0 text-[10px] font-bold uppercase tracking-[0.1em] text-primary-dark"
                                      >
                                        Selected
                                      </span>
                                    )}
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    );
                  })}

                  {/* No office/contact block here either — it was removed from the desktop
                    picker for the same reason: this is a market chooser, not a contact
                    card. Contact details live on the Contact page and in the footer. */}
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
