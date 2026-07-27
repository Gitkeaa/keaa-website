/**
 * Build-time prerender detection.
 *
 * True only while @prerenderer/renderer-puppeteer is snapshotting the site (the flag is set
 * via `inject` in vite.config.js). Client-only overlays that portal into <body> check this so
 * they are not baked into the static HTML as dead, undismissable markup — see the note in
 * vite.config.js. Used by CookieConsent and FeedbackWidget.
 */
export const isPrerender = () =>
  typeof window !== 'undefined' && Boolean(window.__PRERENDER_INJECTED?.prerender);
