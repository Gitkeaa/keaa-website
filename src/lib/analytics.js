/**
 * Conversion measurement: the six events from section 6.7 of the SEO programme.
 *
 * NOTHING RUNS WITHOUT CONSENT
 * ----------------------------
 * A measurement ID is configured, so the analytics category appears in the consent dialog.
 * Until a visitor turns it on, `track()` returns immediately: no script is fetched, no
 * cookie is written and nothing is sent. gtag.js is loaded lazily on the first event that
 * passes the consent check, not on page load, so a visitor who never consents never pays for
 * it either.
 *
 * With VITE_GA4_ID set to an empty string the module goes fully inert again and the consent
 * dialog stops offering the category, because a toggle that governs nothing teaches people
 * to ignore the dialog.
 *
 * WHY CONSENT IS CHECKED ON EVERY CALL
 * ------------------------------------
 * Consent can be withdrawn at any time through the footer link. Reading the current decision
 * at call time, rather than caching it at load, means a withdrawal takes effect on the next
 * event rather than at the next page load.
 *
 * WHERE THE ID LIVES
 * ------------------
 * src/lib/analyticsConfig.js, with VITE_GA4_ID as an override. Setting that variable to an
 * empty string switches analytics off completely: no script, no toggle in the consent
 * dialog, and CONSENT_VERSION drops back so nobody is asked about processing that no longer
 * happens.
 */
import { isAllowed } from '../components/CookieConsent';
import { GA4_ID, ANALYTICS_CONFIGURED, ANALYTICS_CATEGORY } from './analyticsConfig';

export { GA4_ID, ANALYTICS_CONFIGURED, ANALYTICS_CATEGORY };

/**
 * The event names the brief asks for. Kept as a frozen map rather than loose strings so a
 * typo at a call site is a missing property rather than an event that silently never
 * appears in a report, which is the usual way analytics quietly stops working.
 */
export const EVENTS = Object.freeze({
  quoteRequest: 'quote_request',
  exportEnquiry: 'export_enquiry',
  catalogueDownload: 'catalogue_download',
  jobApplication: 'job_application',
  whatsappClick: 'whatsapp_click',
  phoneClick: 'phone_click',
  /**
   * Not in the brief's list of six, but a general contact message is an enquiry too, and
   * leaving it uncounted would make the contact page look like it produces nothing.
   */
  contactMessage: 'contact_message',
});

let loading = null;

/** Load gtag.js once, and only once consent is in hand. */
function ensureLoaded() {
  if (!ANALYTICS_CONFIGURED || typeof window === 'undefined') return null;
  if (loading) return loading;

  loading = new Promise((resolve) => {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    /**
     * anonymize_ip and no ad personalisation: this is a manufacturer measuring enquiries,
     * not an advertiser building audiences, so the least intrusive configuration that still
     * answers "did this page produce a lead" is the right one.
     */
    window.gtag('config', GA4_ID, {
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });

    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA4_ID)}`;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.head.appendChild(s);
  });

  return loading;
}

/**
 * Record a conversion. Safe to call from anywhere, including during prerendering: with no
 * measurement ID, no consent, or no window, it does nothing at all.
 *
 * @param {string} name   one of EVENTS
 * @param {object} params optional extra parameters, e.g. { category: 'Scaffolding' }
 */
export function track(name, params = {}) {
  if (!ANALYTICS_CONFIGURED || typeof window === 'undefined') return;
  if (!isAllowed(ANALYTICS_CATEGORY)) return;
  ensureLoaded();
  try {
    window.gtag?.('event', name, params);
  } catch {
    // Measurement must never break the thing being measured.
  }
}

/**
 * Record a page view. Only needed because the site is a single page app: gtag's automatic
 * page_view fires once on load and never again as the router changes route.
 */
export function trackPageView(path) {
  if (!ANALYTICS_CONFIGURED || typeof window === 'undefined') return;
  if (!isAllowed(ANALYTICS_CATEGORY)) return;
  ensureLoaded();
  try {
    window.gtag?.('event', 'page_view', { page_path: path });
  } catch {
    /* ignore */
  }
}
