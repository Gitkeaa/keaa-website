import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useT } from '../i18n/LocaleContext';

/**
 * Two accessibility primitives that a single-page app has to provide for itself.
 *
 * Both are rendered by components/Layout.jsx INSIDE <LocaleProvider>, so they translate.
 */

/**
 * WCAG 2.4.1 "Bypass Blocks" (Level A).
 *
 * Without this, a keyboard or screen-reader user tabs through the entire header — logo,
 * six nav items, the products dropdown, search, region, language, the quote button — on
 * every single page before reaching any content.
 *
 * It is visually hidden until focused (`sr-only` + `focus:not-sr-only`), which is the
 * standard pattern: sighted mouse users never see it, keyboard users get it on the first
 * Tab. `z-[120]` puts it above the scroll-progress bar (z-100) and the cookie bar (z-90).
 */
export function SkipToContent() {
  const t = useT();
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[120] focus:rounded-card focus:bg-primary-dark focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
    >
      {t('a11y.skipToContent')}
    </a>
  );
}

/**
 * Announces the new page to screen readers after a client-side navigation.
 *
 * A normal page load makes the browser announce the new document. A React Router
 * navigation does not: the URL and the DOM change silently, so a screen-reader user gets
 * no confirmation that anything happened. This polite live region re-announces the title.
 *
 * The 300ms delay is deliberate — useSEO writes `document.title` in an effect, so reading
 * it synchronously here would announce the PREVIOUS page's title.
 */
export function RouteAnnouncer() {
  const location = useLocation();
  const [message, setMessage] = useState('');

  useEffect(() => {
    const id = setTimeout(() => setMessage(document.title), 300);
    return () => clearTimeout(id);
  }, [location.pathname]);

  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
}
