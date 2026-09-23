import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, Phone } from 'lucide-react';
import { WhatsApp } from '../ui/BrandGlyphs';
import { company } from '../../data/company';
import { useT } from '../../i18n/LocaleContext';
import { track, EVENTS } from '../../lib/analytics';

/**
 * The three things a buyer on a phone actually wants, pinned to the bottom of every page:
 * ask for a price, message us, ring us.
 *
 * Phones only (`md:hidden`). From `md` up the utility bar carries WhatsApp, the header
 * carries the quote button, and a band across the bottom of a laptop would be taking screen
 * from the page to repeat controls already on it.
 *
 * ROUTES WHERE IT DOES NOT APPEAR. A page whose whole job is a form does not need a bar
 * offering to start one, and on a phone it covers the submit button at the foot of that very
 * form. These are basename-relative, so one entry covers every language (see Layout.jsx).
 */
const FORM_ROUTES = new Set(['/contact', '/request-a-quote']);

/**
 * Whether focus is sitting in something a soft keyboard would open for.
 *
 * This is the other half of "hidden when a form is open", and it is the half that matters
 * most. A `position: fixed` bar does not stay at the bottom of the page when the on-screen
 * keyboard comes up: iOS Safari lifts it with the keyboard, so it lands directly over the
 * field being typed into. Hiding on focus is cheaper and far more reliable than trying to
 * measure the keyboard through `visualViewport`.
 *
 * Modals need no handling here. They sit at z-60 and above (CatalogueRequestModal,
 * JobApplicationModal, the consent preferences dialog) and this bar is z-40, so an open
 * dialog already covers it.
 */
const isTypingTarget = (el) =>
  !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);

export default function MobileActionBar() {
  const t = useT();
  const location = useLocation();
  const barRef = useRef(null);
  const [typing, setTyping] = useState(false);

  // `focusin`/`focusout` rather than focus/blur: those two do not bubble, so one listener on
  // the document would never see a field deeper in the page receive focus.
  useEffect(() => {
    const onIn = (e) => setTyping(isTypingTarget(e.target));
    const onOut = () => setTyping(false);
    document.addEventListener('focusin', onIn);
    document.addEventListener('focusout', onOut);
    return () => {
      document.removeEventListener('focusin', onIn);
      document.removeEventListener('focusout', onOut);
    };
  }, []);

  const onFormRoute = FORM_ROUTES.has(location.pathname.replace(/\/+$/, '') || '/');
  const hidden = onFormRoute || typing;

  /**
   * Publish the bar's height as `--actionbar-h`, the same contract CookieConsent uses for
   * `--consent-bar-h`: the fixed corner widgets add both to their own `bottom` so nothing
   * ends up stacked underneath this. It matters more here than it looks, because the chat
   * launcher's home corner on a phone is bottom-LEFT, which is exactly where this bar's
   * first cell goes.
   *
   * Removed, not zeroed, while the bar is hidden, so the widgets drop back down over a form
   * page instead of floating above a gap.
   */
  useEffect(() => {
    const root = document.documentElement;
    const el = barRef.current;
    if (hidden || !el) {
      root.style.removeProperty('--actionbar-h');
      return undefined;
    }
    const sync = () => root.style.setProperty('--actionbar-h', `${el.offsetHeight}px`);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.removeProperty('--actionbar-h');
    };
  }, [hidden]);

  if (hidden) return null;

  const cell =
    'flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-bold uppercase tracking-[0.06em] text-white transition-colors active:bg-primary-darker';

  return (
    <div
      ref={barRef}
      /* Below the consent bar's z-[90] on purpose: on a first visit the consent choice comes
         first, and this reappears above the fold the moment it is answered. */
      className="fixed inset-x-0 bottom-0 z-40 border-t border-primary-darker bg-primary-dark md:hidden"
      /* The iPhone home indicator sits in the bottom ~34px of the viewport and would take a
         bite out of the labels. Nothing else on the site needed this, because nothing else
         was flush to the bottom edge. */
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <nav aria-label={t('header.quickActions')} className="flex items-stretch divide-x divide-white/20">
        <Link to="/contact?tab=rfq" onClick={() => track(EVENTS.quoteRequest, { location: 'actionbar' })} className={cell}>
          <FileText aria-hidden className="h-5 w-5" strokeWidth={2} />
          {t('header.requestQuote')}
        </Link>

        <a
          href={company.social.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track(EVENTS.whatsappClick, { location: 'actionbar' })}
          className={cell}
        >
          <WhatsApp className="h-5 w-5" />
          WhatsApp
        </a>

        <a
          href={`tel:${company.phones[0].replace(/\s+/g, '')}`}
          onClick={() => track(EVENTS.phoneClick, { location: 'actionbar' })}
          className={cell}
        >
          <Phone aria-hidden className="h-5 w-5" strokeWidth={2} />
          {t('header.call')}
        </a>
      </nav>
    </div>
  );
}
