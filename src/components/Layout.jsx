import { useState, useEffect, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import Header from './layout/Header';
import Footer from './layout/Footer';
import MobileDrawer from './layout/MobileDrawer';
import MobileActionBar from './layout/MobileActionBar';
import ScrollToTop from './ScrollToTop';
import BackToTop from './BackToTop';
import CookieConsent from './CookieConsent';
import LanguageNotice from './LanguageNotice';
import { SkipToContent, RouteAnnouncer } from './A11y';
import { LocaleProvider } from '../i18n/LocaleContext';
import { RegionProvider } from '../context/RegionContext';
import { entryInitial } from '../lib/firstPaint';

/**
 * The public shell. It owns the three pieces of chrome state that more than one child cares
 * about — the drawer, the search palette and its keyboard shortcut — plus the locale and
 * region providers, which are mounted HERE rather than in App so the admin console never
 * pays for them.
 *
 * Search is NOT here any more. It used to be a full-screen palette rendered as a sibling of
 * `Header`, with its ⌘K binding owned by this component; it is now an inline field that
 * opens inside the header itself and owns its own shortcut (see layout/HeaderSearch.jsx).
 *
 * The desktop mega-menu is no longer rendered — Header dropped its trigger in favour of
 * search (see the note there). `layout/MegaMenu.jsx` still exists if it is wanted back.
 */
/**
 * Routes that render WITHOUT the site footer.
 *
 * The legal pages are read, not browsed: the footer under them is a second full sitemap
 * offering every link the visitor just left, directly beneath a policy they were sent here to
 * read. It also repeats links to these same three pages, so the footer on /terms links to
 * /terms. They carry their own "Go back" control instead (see pages/Legal.jsx).
 *
 * These are BASENAME-RELATIVE paths. App.jsx mounts the router with the locale prefix as its
 * basename, so /de/terms arrives here as "/terms" and one entry covers every language.
 */
const FOOTERLESS = new Set(['/privacy-policy', '/terms', '/cookie-policy']);

export default function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  const location = useLocation();

  // The palette locks scroll itself; this covers the drawer only, so the two cannot fight
  // over `body.overflow` on close.
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
  }, [drawerOpen]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname, location.search, location.hash]);


  return (
    <LocaleProvider>
      <RegionProvider>
        <div className="flex min-h-screen flex-col">
          {/* First focusable element on the page — see components/A11y.jsx. */}
          <SkipToContent />
          <motion.div
            style={{ scaleX }}
            className="fixed left-0 right-0 top-0 z-[100] h-[3px] origin-left bg-primary-dark"
          />
          <ScrollToTop />
          <Header onOpenDrawer={() => setDrawerOpen(true)} />
          {/* Coming-soon strip for a chosen language that is not fully translated yet.
              In-flow under the header on purpose; renders nothing for English and for
              live languages. */}
          <LanguageNotice />
          {/* tabIndex -1 so the skip link can move focus here, not just scroll to it. */}
          <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={entryInitial({ opacity: 0 })}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                <Suspense fallback={<div className="min-h-[60vh]" />}>
                  <Outlet />
                </Suspense>
              </motion.div>
            </AnimatePresence>
          </main>
          {/* Trailing slash trimmed first: /terms and /terms/ are the same page, and only the
              bare form is in FOOTERLESS. */}
          {!FOOTERLESS.has(location.pathname.replace(/\/+$/, '') || '/') && <Footer />}
          <MobileDrawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
          />
          {/* Quote / WhatsApp / Call, pinned to the bottom on phones only. It publishes its
              height as `--actionbar-h`, which the three fixed corner widgets below add to
              their own offsets so none of them ends up underneath it. */}
          <MobileActionBar />
          {/* Desktop only (hidden below sm): on mobile the chat launcher moves to the
              bottom-left corner this button occupies, so it steps aside there. */}
          <BackToTop />
          {/* Site-wide on every public page. Portals itself to <body>. */}
          <CookieConsent />
          {/* Announces client-side navigations, which browsers do not do for an SPA. */}
          <RouteAnnouncer />
        </div>
      </RegionProvider>
    </LocaleProvider>
  );
}
