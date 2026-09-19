/**
 * The one place the measurement ID is decided.
 *
 * WHY ITS OWN MODULE
 * ------------------
 * Two things need to know whether analytics exists: src/lib/analytics.js, which loads and
 * fires it, and components/CookieConsent.jsx, which offers the toggle that gates it. But
 * analytics.js already imports the consent check from CookieConsent, so having CookieConsent
 * import back from analytics.js would be a cycle. A tiny leaf module that neither of them
 * owns breaks it, and guarantees the toggle and the tool can never disagree about whether
 * analytics is configured.
 *
 * WHY THE ID IS IN THE REPOSITORY
 * -------------------------------
 * A GA4 measurement ID is not a secret. It is sent to Google in the URL of a script tag on
 * every page that loads analytics, so it is visible to anyone who views source, and it grants
 * nothing: it identifies a property to send hits to, it does not read anything back. Keeping
 * it here means the build works the same on a laptop, on a preview deploy and in production,
 * rather than depending on an environment variable that someone has to remember to set.
 *
 * VITE_GA4_ID still overrides it, which is what a staging property would use. Setting it to
 * an empty string switches analytics off entirely: the script never loads, the consent
 * dialog stops offering the category, and CONSENT_VERSION drops back so nobody is asked
 * about processing that no longer happens.
 */
const CONFIGURED_ID = 'G-M16R1DTSPT';

/** Empty means analytics is switched off, everywhere, completely. */
export const GA4_ID = import.meta.env.VITE_GA4_ID ?? CONFIGURED_ID;

/** Whether a measurement tool actually exists in this build. */
export const ANALYTICS_CONFIGURED = Boolean(GA4_ID);

/** The consent category analytics lives under. */
export const ANALYTICS_CATEGORY = 'analytics';
