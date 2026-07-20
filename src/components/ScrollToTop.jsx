import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Resets scroll on navigation, and lands hash links on their section.
 *
 * The hash path is not a one-shot lookup. Every route on this site is lazy (see App.jsx),
 * so following `/manufacturing#process` from another page runs this effect BEFORE the
 * Manufacturing chunk has mounted — the element does not exist yet, the old single 80ms
 * timeout found nothing, and the visitor silently landed at the top of the page instead of
 * the section they asked for. It now polls a few animation frames for the element and gives
 * up quietly if it never appears (a stale link should not yank the page around).
 *
 * The sticky header is handled in CSS, not here: `scroll-margin-top` on the target (see the
 * `[id]` rule in src/index.css) keeps `block: 'start'` from parking the section underneath.
 */
const HASH_LOOKUP_MS = 1200;

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1));
      let raf = 0;
      const deadline = performance.now() + HASH_LOOKUP_MS;

      const tryScroll = () => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
        if (performance.now() < deadline) raf = requestAnimationFrame(tryScroll);
        // Deadline passed: no such id on this route. Leave the page where it is rather than
        // jumping to the top, which would read as the link half-working.
      };

      raf = requestAnimationFrame(tryScroll);
      return () => cancelAnimationFrame(raf);
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    return undefined;
  }, [pathname, hash]);

  return null;
}
