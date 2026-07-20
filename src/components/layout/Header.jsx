import { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import Logo from './Logo';
import Button from '../ui/Button';
import RegionLanguageSwitcher from './RegionLanguageSwitcher';
import HeaderSearch from './HeaderSearch';
import HeaderAccount from './HeaderAccount';
import NavPanel from './NavPanel';
import { headerControl } from './headerControl';
import { mainNav } from '../../data/navigation';
import { useT } from '../../i18n/LocaleContext';
// Derived from the catalogue itself, so the menu can never drift from the pages that
// actually exist. The legacy `productCategories` list still names lines (Safety Products,
// Formwork Accessories) that have no catalogue page, and linked to `/products#anchor`
// hashes that the router's scroll-to-top swallowed.
import { getAllCategories } from '../../data/categories';

/**
 * The site header — one row: identity, navigation, then the utility cluster
 * (search · region · language · quote).
 *
 * The standalone "Explore KEAA" mega-menu is gone. It was a second discovery system sitting
 * beside the six-item nav, holding five pages that had no other home. Those pages are now
 * filed under the nav item each one actually belongs to — Careers under About, Downloads
 * under Products, Certifications under Manufacturing, Success Stories under Projects — and
 * open in a half-height panel per item (layout/NavPanel.jsx). See `mainNav` in
 * data/navigation.js for why each page sits where it does.
 *
 * `layout/MegaMenu.jsx` still exists on disk but is no longer rendered anywhere.
 */

export default function Header({ onOpenDrawer }) {
  const [scrolled, setScrolled] = useState(false);
  // Which nav item's panel is open, by `key`. Null = none.
  const [openKey, setOpenKey] = useState(null);
  // Owned here, not in HeaderSearch, because it is the NAV that has to react to it.
  const [searchOpen, setSearchOpen] = useState(false);
  const t = useT();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Navigating from inside a panel must dismiss it — the route changes underneath but the
  // pointer never leaves the header, so no mouseleave would ever fire.
  useEffect(() => setOpenKey(null), [location.pathname]);

  // Escape closes it, as it does for every other overlay on the site.
  useEffect(() => {
    if (!openKey) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpenKey(null);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [openKey]);

  const openItem = mainNav.find((i) => i.key === openKey && i.children);

  return (
    /*
      `onMouseLeave` sits on the header, not on each nav item: the panel is a child of the
      header, so moving the pointer down from a nav item INTO the panel never leaves this
      element — which is what lets the panel stay open long enough to click.
    */
    <header
      onMouseLeave={() => setOpenKey(null)}
      className={`sticky top-0 z-40 w-full border-b bg-white transition-[box-shadow,border-color] ${
        scrolled ? 'border-border shadow-[0_1px_3px_rgba(10,35,66,0.06)]' : 'border-transparent'
      }`}
    >
      {/* The navy utility strip (export tagline, phone, email, LinkedIn) is removed.
          The component still lives in layout/TopBar.jsx — re-add <TopBar /> here to
          bring it back. Its contact details are still reachable in the footer, and the
          region control below now surfaces the desk for the visitor's own market. */}
      {/*
        `container-full`, not `container-page`: the header runs edge to edge on the shared
        responsive gutter instead of being centred inside the 1760px content column. On a
        wide monitor that column left ~140px of dead margin on each side and squeezed the
        six nav items, the search, the market picker and the CTA into the middle, which is
        what made the row look cramped.
      */}
      <div className="container-full flex items-center justify-between gap-4 py-3.5">
        <Link to="/" aria-label="KEAA International home" className="flex-shrink-0">
          <Logo />
        </Link>

        {/* Faded out while search is open: the expanded field reaches back across this row,
            and a half-covered "Contact Us" reads as a broken layout. `pointer-events-none`
            so a hidden link can never be clicked through the field. */}
        {/*
          No chevrons. An item with a panel looks identical to one without — the nav item
          itself is the affordance, and a glyph here would be the only icon left in a header
          that states everything else in words.

          `onFocus` alongside `onMouseEnter` so the panel is reachable by keyboard, not just
          by pointer.
        */}
        <nav
          className={`hidden items-center gap-7 transition-opacity duration-200 xl:flex ${
            searchOpen ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
        >
          {/*
            A nav item WITH a panel is a button, not a link — it opens the menu and never
            navigates. Clicking "Products" used to load /products immediately, which meant a
            visitor aiming for one category landed on the full catalogue first; the page is
            now reached only by choosing "All Products" inside the panel. Items with no panel
            (Home, Contact Us) stay ordinary links, because there is nothing to open.

            This is safe precisely because every panel's first row IS its own parent page —
            see the note in data/navigation.js. Remove that row and the page becomes
            unreachable from the header.
          */}
          {mainNav.map((item) => {
            /* A section counts as current for its whole subtree, so /products/wood-connectors
               still underlines "Products". `startsWith` needs the trailing slash or /products
               would also match a hypothetical /products-archive. */
            const onSection =
              item.to === '/'
                ? location.pathname === '/'
                : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);

            const cls = `relative text-sm font-semibold transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:bg-primary-dark after:transition-all ${
              onSection || openKey === item.key
                ? 'text-navy-900 after:w-full'
                : 'text-ink after:w-0 hover:text-navy-900 hover:after:w-full'
            }`;

            return item.children ? (
              <button
                key={item.key}
                type="button"
                aria-expanded={openKey === item.key}
                onMouseEnter={() => setOpenKey(item.key)}
                onFocus={() => setOpenKey(item.key)}
                /* Click TOGGLES rather than only opening: on a touch screen there is no
                   hover, so the first tap opens the panel and a second one must close it. */
                onClick={() => setOpenKey(openKey === item.key ? null : item.key)}
                className={cls}
              >
                {t(item.key)}
              </button>
            ) : (
              <NavLink
                key={item.key}
                to={item.to}
                onMouseEnter={() => setOpenKey(null)}
                onFocus={() => setOpenKey(null)}
                className={cls}
              >
                {t(item.key)}
              </NavLink>
            );
          })}
        </nav>

        <div className="flex flex-shrink-0 items-center gap-1.5">
          {/* Search opens in place — see HeaderSearch. It owns its own ⌘K binding. */}
          <HeaderSearch onOpenChange={setSearchOpen} />

          {/* One control for market AND language — see RegionLanguageSwitcher for why the
              two were merged rather than sat side by side. */}
          <div className="hidden items-center gap-0.5 xl:flex">
            <span aria-hidden className="mx-1 h-5 w-px bg-border" />
            <RegionLanguageSwitcher />
            <span aria-hidden className="mx-1 h-5 w-px bg-border" />
          </div>

          {/* Icon + word, like the search and region controls beside it. It renders nothing
              while the session check is in flight, so the row does not flicker. The region
              block above already closes with a divider, so none is added here. */}
          <HeaderAccount />

          <Button to="/rfq" variant="primary" size="sm" className="hidden sm:inline-flex">
            {t('cta.requestQuote')}
          </Button>

          {/* "Menu" as a word, not a hamburger — the label survives; only the bordered box
              is gone, so it reacts like every other control in the row. */}
          <button
            type="button"
            onClick={onOpenDrawer}
            className={`${headerControl} text-[13px] font-bold uppercase tracking-[0.12em] xl:hidden`}
            aria-label={t('header.menuAria')}
          >
            {t('header.menu')}
          </button>
        </div>
      </div>

      {/* The half-height panel. Rendered here, as a sibling of the header row rather than
          inside a nav item, so it can span the full viewport width. Hidden while search is
          open — two overlapping panels in one header is nobody's idea of clean. */}
      {openItem && !searchOpen && (
        <NavPanel
          item={{ ...openItem, label: t(openItem.key) }}
          categories={openItem.categories ? getAllCategories() : []}
          onNavigate={() => setOpenKey(null)}
        />
      )}
    </header>
  );
}
