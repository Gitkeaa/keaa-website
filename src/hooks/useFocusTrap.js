import { useEffect } from 'react';

const DEFAULT_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Traps keyboard focus inside a modal panel while it is open, making an `aria-modal="true"`
 * declaration actually true: focus the panel on open, cycle Tab/Shift+Tab within it, and route
 * Escape to `onEscape`. Without this, Tab walks out into the page behind the backdrop.
 *
 * `selector` is which descendants count as focusable and varies slightly by dialog, so it is a
 * parameter (CookieConsent counts disabled inputs, FeedbackWidget does not). Used by both.
 */
export function useFocusTrap(ref, { active, onEscape, selector = DEFAULT_SELECTOR }) {
  useEffect(() => {
    if (!active) return undefined;
    ref.current?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') {
        onEscape?.();
        return;
      }
      if (e.key !== 'Tab' || !ref.current) return;

      const focusable = [...ref.current.querySelectorAll(selector)].filter(
        (el) => el.offsetParent !== null
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const target = document.activeElement;

      if (e.shiftKey && (target === first || target === ref.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && target === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, onEscape, selector, ref]);
}
