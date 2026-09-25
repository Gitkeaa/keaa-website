import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Logo from './Logo';
import TopBar from './TopBar';
import HeaderSearch from './HeaderSearch';
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
 * The site header — a utility bar that scrolls away (layout/TopBar.jsx: region · language ·
 * WhatsApp · account) over one pinned row: identity, navigation, then search and quote.
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
  const navigate = useNavigate();
  const headerRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Navigating from inside a panel dismisses it — the route changes underneath.
  useEffect(() => setOpenKey(null), [location.pathname]);

  /*
    The panel is CLICK-CONTROLLED, not hover-controlled: it opens on a click and stays open
    until the visitor acts. Hover does nothing. So the only ways to close it are a click on a
    link inside it (which navigates, closing via the route effect above), a click on another
    nav item (which switches the panel), Escape, or a click ANYWHERE outside the header.

    That last one is this effect. `pointerdown`, not `click`, so it settles before the nav
    button's own click fires; and it is scoped to "outside the header", so clicks inside the
    panel — which is a child of the header — never trip it.
  */
  useEffect(() => {
    if (!openKey) return undefined;
    const onPointerDown = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) setOpenKey(null);
    };
    const onKey = (e) => e.key === 'Escape' && setOpenKey(null);
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [openKey]);

  const openItem = mainNav.find((i) => i.key === openKey && i.children);

  return (
    /*
      No `onMouseLeave` — the panel must NOT close when the pointer leaves. It is pinned open
      by a click and dismissed only by the deliberate actions handled in the effect above.
      `ref` is what that outside-click check measures against.
    */
    <header
      ref={headerRef}
      className={`sticky z-40 w-full border-b bg-white transition-[box-shadow,border-color] ${
        scrolled ? 'border-border shadow-[0_1px_3px_rgba(10,35,66,0.06)]' : 'border-transparent'
      }`}
      /*
        NOT `top-0`. The header is offset upwards by exactly the utility bar's height, so the
        bar scrolls off the top of the screen and the nav row alone pins there. The whole
        header has to be the sticky element for this: a sticky child inside a static parent is
        released the moment the parent's box scrolls past, so making only the row sticky would
        send the row away with the bar.

        `--topbar-h` is measured and published by TopBar. It is 0 below `md`, where the bar is
        `display: none`, and 0 before hydration, which is also correct: a visitor at the top of
        the page has not scrolled yet, so there is nothing to offset.
      */
      style={{ top: 'calc(-1 * var(--topbar-h, 0px))' }}
    >
      <TopBar />
      {/*
        `container-full`, not `container-page`: the header runs edge to edge on the shared
        responsive gutter instead of being centred inside the 1760px content column. On a
        wide monitor that column left ~140px of dead margin on each side and squeezed the
        six nav items, the search, the market picker and the CTA into the middle, which is
        what made the row look cramped.
      */}
      <div className="container-full flex items-center justify-between gap-4 py-3.5">
        {/* The logo steps aside while search is open, but only below `md`.
            The expanded field is anchored to the right of the row and is
            `min(32rem, 72vw)` wide, so on a narrow row it reaches all the way back across it
            and printed itself on top of the mark. Measured: the field still covers 62px of the
            logo at 768px and first clears it at 1024px, so the hand-off is at `lg`, not `md`. Fading rather than
            unmounting keeps the row's height and the field's anchor from shifting, and
            `pointer-events-none` stops an invisible logo swallowing a tap meant for the
            field. The nav beside it fades on the same state, just at a different breakpoint. */}
        <Link
          to="/"
          aria-label="KEAA International home"
          className={`flex-shrink-0 transition-opacity duration-200 ${
            searchOpen ? 'pointer-events-none opacity-0 lg:pointer-events-auto lg:opacity-100' : 'opacity-100'
          }`}
        >
          <Logo />
        </Link>

        {/* Faded out while search is open: the expanded field reaches back across this row,
            and a half-covered "Contact Us" reads as a broken layout. `pointer-events-none`
            so a hidden link can never be clicked through the field. */}
        {/*
          No chevrons. An item with a panel looks identical to one without — the nav item
          itself is the affordance, and a glyph here would be the only icon left in a header
          that states everything else in words.

          CLICK, not hover: a panel item opens on click and stays open. Hover does nothing,
          so a visitor reading one panel never has it yanked away by the pointer drifting off.

          DOUBLE-CLICK goes to the section's own page — the same landing a panelless item like
          Home or Contact reaches on a single click. So a single click browses the panel; a
          double click says "just take me to Products". The two single clicks a double click
          also fires only toggle the panel open then shut before the navigation lands, so there
          is nothing left open behind the new route.
        */}
        {/* `deck` (1152px), not `lg` and no longer `xl`. Six items, the search and the quote
            button stopped fitting on one line below `lg` once the items were measured in
            German and French rather than English, and the row wrapped instead of scrolling.
            `xl` (1280px) was then too cautious: a 14-inch 1920x1080 laptop at 150% scaling
            reports about 1265px and was handed the hamburger even though the bar fits.
            `deck` is defined in tailwind.config.js. Below it the drawer carries the same six,
            so nothing is lost. Keep this in step with the Menu button's `deck:hidden` at the
            foot of this row: between the two breakpoints a visitor would get both or
            neither. */}
        <nav
          className={`hidden items-center gap-4 transition-opacity duration-200 deck:flex deck:gap-5 xl:gap-7 ${
            searchOpen ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
        >
          {/*
            A nav item WITH a panel is a button, not a link — it opens the menu and never
            navigates. Clicking "Products" used to load /products immediately, which meant a
            visitor aiming for one category landed on the full catalogue first; the page is
            now reached only by choosing "All Products" inside the panel. Items with no panel
            (Home) stay ordinary links, because there is nothing to open.

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
                aria-haspopup="menu"
                aria-expanded={openKey === item.key}
                /* Toggle: clicking the open item again closes it; clicking a different item
                   switches the panel to that one. No hover handlers — this is click-only. */
                onClick={() => setOpenKey(openKey === item.key ? null : item.key)}
                /* Double click skips the panel and opens the parent page itself. */
                onDoubleClick={() => {
                  setOpenKey(null);
                  navigate(item.to);
                }}
                className={cls}
              >
                {t(item.key)}
              </button>
            ) : (
              <NavLink
                key={item.key}
                to={item.to}
                /* A panelless item (Home) closes any open panel as it navigates.
                   The route effect already covers a real navigation; this also handles the
                   case where the target is the current route, so no route change fires. */
                onClick={() => setOpenKey(null)}
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

          {/* The market and language control and the staff sign-in are NOT here: they sit in the
              utility bar above (layout/TopBar.jsx), which shows from `md` up. This row carries
              the one commercial action instead.

              The one commercial action the site exists for, reachable from every page. Quote
              calls to action already sit on the products, category and product pages, but a
              visitor who lands on About or Manufacturing had to go looking for one. Styled as
              the only filled control in the row so it reads as the primary action. Narrow
              screens keep it: it stays beside the menu button rather than being hidden behind
              it, because the drawer is one more tap between a buyer and an enquiry.

              Sentence case, not uppercase. The label used to be forced to REQUEST A QUOTE by
              `uppercase tracking-[0.08em]`, which shouted the one control it did not need to.
              Sentence case also stops the longer translations (Offerte aanvragen, Demander un
              devis) from running the button into the nav.

              It steps out of the flow while search is open below `lg`, like the logo: the
              expanded field is anchored to the right of this row and needs the width. */}
          <Link
            to="/contact?tab=rfq"
            className={`ml-1 items-center whitespace-nowrap rounded-full bg-primary-dark px-3.5 py-1.5 text-[13px] font-bold text-white transition-colors hover:bg-primary-darker sm:px-4 ${
              searchOpen ? 'hidden lg:inline-flex' : 'inline-flex'
            }`}
          >
            {t('header.requestQuote')}
          </Link>

          {/* A hamburger, not the word "Menu". The word was chosen when this row stated
              everything in type; the row now ends in a pill-shaped button, and a second
              worded control beside it read as a pair of labels rather than an action. The
              accessible name is unchanged, so nothing about it is icon-only to a screen
              reader. Keep `deck:hidden` in step with the nav's `deck:flex` above. */}
          <button
            type="button"
            onClick={onOpenDrawer}
            className={`${headerControl} justify-center deck:hidden ${searchOpen ? 'hidden lg:flex' : ''}`}
            aria-label={t('header.menuAria')}
          >
            <Menu aria-hidden className="h-[22px] w-[22px]" strokeWidth={2} />
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
