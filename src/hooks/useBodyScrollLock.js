import { useEffect } from 'react';

/**
 * Prevents the page behind a full-screen dialog/drawer from scrolling while it is open.
 *
 * Saves and restores the previous `body.overflow` rather than clearing it, because Layout also
 * owns that property (for the mega-menu and mobile drawer) — clearing it outright would unlock
 * scroll that another owner still wants held. Pass a boolean that is true while the overlay is open.
 * Used by FeedbackWidget, CookieConsent and JobApplicationModal.
 */
export function useBodyScrollLock(active) {
  useEffect(() => {
    if (!active) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [active]);
}
