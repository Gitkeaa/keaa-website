import { useEffect, useRef } from 'react';
import RegionLanguageSwitcher from './RegionLanguageSwitcher';
import HeaderAccount from './HeaderAccount';
import { WhatsApp } from '../ui/BrandGlyphs';
import { utilityControl } from './headerControl';
import { company } from '../../data/company';
import { useT } from '../../i18n/LocaleContext';
import { track, EVENTS } from '../../lib/analytics';

/**
 * The utility bar above the nav: market and language, WhatsApp, account.
 *
 * WHY THESE THREE AND NOTHING ELSE. They are the controls a visitor uses ABOUT the site
 * rather than controls for moving around it. Sitting them in the main row cost that row
 * roughly 200px it needed for six nav items, the search and the quote button, and put a
 * staff login at the same weight as the one commercial action on the page. Up here they are
 * available without competing.
 *
 * It replaced a navy strip carrying an export tagline, a phone number, an email address and
 * a LinkedIn mark. The tagline repeated the hero headline, and the contact details are in
 * the footer and on the contact page, so none of it earned a band across every page.
 *
 * IT SCROLLS AWAY. The bar is inside the sticky header, and the header is offset upwards by
 * exactly this bar's height (see `--topbar-h` below and the `top` in Header.jsx), so the
 * first scroll takes the bar off the top of the screen and pins the nav row on its own.
 * That keeps the stuck header at the ~68px the rest of the site is built around: the
 * `[id] { scroll-margin-top: 6rem }` rule in index.css reserves 96px for it, and a
 * permanently taller header would park every `#journey` / `#process` / `#team` heading
 * underneath itself.
 *
 * Hidden below `md`. A phone gets these same three things elsewhere: language and login in
 * the drawer, WhatsApp in the bottom action bar.
 */
export default function TopBar() {
  const t = useT();
  const barRef = useRef(null);

  /**
   * Publish the bar's height as `--topbar-h` for the sticky offset in Header.jsx.
   *
   * Measured rather than hard-coded, for the same reason CookieConsent measures its own bar:
   * a hard-coded offset that disagrees with the rendered height by even two pixels leaves a
   * sliver of this bar pinned under the top of the screen, and the height moves with the
   * longest translated label in the row. Below `md` the bar is `display: none`, so
   * `offsetHeight` is 0 and the header sticks flush to the top with no special case.
   */
  useEffect(() => {
    const root = document.documentElement;
    const el = barRef.current;
    if (!el) return undefined;
    const sync = () => root.style.setProperty('--topbar-h', `${el.offsetHeight}px`);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.removeProperty('--topbar-h');
    };
  }, []);

  return (
    <div ref={barRef} className="hidden border-b border-border bg-navy-50 md:block">
      <div className="container-full flex h-9 items-center justify-end">
        <RegionLanguageSwitcher compact />

        <span aria-hidden className="mx-1.5 h-4 w-px bg-border" />

        {/* The number is spelled out rather than hidden behind a glyph: a buyer comparing
            suppliers copies it into their own phone as often as they tap it, and on desktop
            a tap does nothing useful unless WhatsApp Web is already signed in. */}
        <a
          href={company.social.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track(EVENTS.whatsappClick, { location: 'topbar' })}
          aria-label={`${t('header.whatsappAria')}: ${company.whatsappNumber}`}
          className={utilityControl}
        >
          <WhatsApp className="h-4 w-4 flex-shrink-0" />
          <span className="whitespace-nowrap">WhatsApp: {company.whatsappNumber}</span>
        </a>

        <span aria-hidden className="mx-1.5 h-4 w-px bg-border" />

        {/* Staff sign-in, last in the strip. It shows "Log in" to a visitor and the signed-in
            person's first name with a small menu to anyone with a session, which is why it sits
            up here rather than in the nav row: it is a utility, not one of the six places a
            buyer goes. A phone reaches the same thing from the first block of the drawer. */}
        <HeaderAccount />
      </div>
    </div>
  );
}
