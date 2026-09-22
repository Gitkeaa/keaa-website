/**
 * Which locales get a fully prerendered product page, and which get a head stub.
 *
 * WHY THERE IS A SPLIT AT ALL
 * ---------------------------
 * Prerendering 355 products across twelve locales is 4,260 pages, and every one costs a
 * headless Chrome page load. Together with the 744 marketing, category and subcategory pages
 * that is 5,004 routes, which took 9m 40s on a developer machine and DIED AT 45m 40s on
 * Vercel, one minute past the build ceiling. The catalogue is what makes the site rank, so
 * the answer is not to stop prerendering it; it is to prerender it where it pays and serve a
 * correct head everywhere else.
 *
 * English plus five locales are fully prerendered: 2,874 pages, about 23 to 27 minutes on
 * Vercel by measured scaling, which leaves real headroom under the ceiling.
 *
 * THE OTHER SIX GET A HEAD STUB, NOT A 404
 * ----------------------------------------
 * vercel.json has no catch-all rewrite, deliberately, because that is what fixed the soft 404
 * problem. So a URL with no file returns a hard 404. Simply not prerendering six locales would
 * therefore 404 2,130 real product URLs and point six of every page's twelve hreflang
 * alternates at them, which is worse than having no alternates at all.
 *
 * scripts/gen-product-stubs.mjs writes a real file for each of those URLs instead: the
 * complete head of the English prerendered page, with the canonical, og:url and lang attribute
 * rewritten for the locale, and an empty #root the app fills in the browser. It needs no
 * browser, so 2,130 files cost seconds rather than minutes.
 *
 * The trade, stated plainly: those pages have no body until JavaScript runs. Google executes
 * JavaScript and the head carries the canonical and the structured data, so indexing is
 * served, but a human on a slow connection sees a blank frame first. That is why this list is
 * a deliberate choice rather than a default, and why the five come first by traffic.
 *
 * TO PROMOTE A LOCALE: move its code from STUB to PRERENDER and rebuild. Every product page in
 * it becomes fully rendered, and the build grows by roughly 355 pages, which measured scaling
 * puts at about three minutes on Vercel. Check the total stays under the ceiling.
 */

/** Locales whose product pages are fully prerendered. English is implicit and always is. */
export const PRODUCT_PRERENDER_LOCALES = ['de', 'nl', 'pl', 'fr', 'es'];

/** Locales whose product pages get a head stub. Must not overlap the list above. */
export const PRODUCT_STUB_LOCALES = ['it', 'pt', 'ru', 'tr', 'ar', 'hi'];

/**
 * Guards the two lists against drifting apart from the live locale set, which is the failure
 * that would silently 404 a whole language. Callers pass liveLocales() in.
 */
export function assertScopeCoversLocales(liveCodes) {
  const covered = new Set([...PRODUCT_PRERENDER_LOCALES, ...PRODUCT_STUB_LOCALES]);
  const missing = liveCodes.filter((c) => !covered.has(c));
  const unknown = [...covered].filter((c) => !liveCodes.includes(c));
  const overlap = PRODUCT_PRERENDER_LOCALES.filter((c) => PRODUCT_STUB_LOCALES.includes(c));

  if (overlap.length) {
    throw new Error(`prerender-scope: ${overlap.join(', ')} is in both lists. Pick one.`);
  }
  if (missing.length) {
    throw new Error(
      `prerender-scope: live locale(s) ${missing.join(', ')} are in neither list, so their ` +
        'product URLs would 404. Add them to PRODUCT_PRERENDER_LOCALES or PRODUCT_STUB_LOCALES.',
    );
  }
  if (unknown.length) {
    console.warn(`prerender-scope: ${unknown.join(', ')} listed but not live. Harmless, probably stale.`);
  }
}
