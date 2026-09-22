import {
  PRODUCT_REDIRECTS,
  PRODUCT_SLUG_REDIRECTS,
  SUBCATEGORY_PATHS,
} from './src/data/productRedirects.generated.js';

/**
 * Vercel routing middleware: the old site's URLs, resolved to the new ones in a single hop.
 *
 * WHY HERE RATHER THAN vercel.json
 * --------------------------------
 * Two reasons. Vercel caps vercel.json at 2,048 redirects and it already holds 263, while one
 * product rule per locale would be 4,260. And most of these rules need a LOOKUP: an old URL
 * carries a numeric id or a product slug, and the destination depends on what that resolves to.
 * A static rule cannot do that, which is why the five pattern rules that used to try ended up
 * pointing at /product/:id and chaining.
 *
 * RULE ORDER MATTERS. R1 strips the PHP prefix first so everything after it sees a clean path;
 * R7 is a catch-all that must run last or it would swallow the specific .php rules above it.
 *
 * NOTHING HERE 404s. Every one of these addresses carries backlinks from the old site, which is
 * the only reason they are worth handling at all. Where a lookup fails the rules fall back:
 * product slug to its subcategory, subcategory to /products, enquiry to the quote form.
 *
 * Source: Search Console export of 2,045 issue URLs, 22 September 2026, in
 * translation-review/gsc-all-issue-urls.csv. Every pattern below appears in it.
 */

const LOCALES = ['nl', 'de', 'fr', 'es', 'it', 'pt', 'pl', 'ru', 'tr', 'ar', 'hi'];
const LOCALE_SET = new Set(LOCALES);

export const config = {
  matcher: [
    '/product/:path*',
    '/enquiry/:path*',
    '/public/:path*',
    '/category/:path*',
    '/rfq',
    '/page-coming-soon',
    '/:path*.php',
    '/index.html',
    '/listing.php',
    // Legacy root-level slugs from the old site. Listed rather than globbed so this does not
    // sit in front of every page on the site for the sake of twenty addresses.
    '/who-we-are',
    '/quality-policy',
    '/contact.php',
    '/access-scaffold-euro-frame',
    '/slab-formwork-system-props',
    '/system-slab-formwork-tripods',
    '/system-scaffolds---hk',
    '/system-scaffolds-accessories-jacks-and-Nuts',
    '/scaffold-tube-fitting-british-and-american',
    '/scaffolding-formworks',
    '/cattle',
    '/headlocks',
    '/sheep-headlocks',
    '/horse',
    '/horse-handling-equipments',
    '/pasture-gates',
    '/post-for-gates',
    '/round-feeder',
    '/indoor-wood-connectors',
    '/miscellaneous-products',
    '/mounting-accessories',
    // and the same set under a locale prefix
    '/:locale(nl|de|fr|es|it|pt|pl|ru|tr|ar|hi)/product/:path*',
    '/:locale(nl|de|fr|es|it|pt|pl|ru|tr|ar|hi)/enquiry/:path*',
    '/:locale(nl|de|fr|es|it|pt|pl|ru|tr|ar|hi)/public/:path*',
    '/:locale(nl|de|fr|es|it|pt|pl|ru|tr|ar|hi)/category/:path*',
    '/:locale(nl|de|fr|es|it|pt|pl|ru|tr|ar|hi)/rfq',
    '/:locale(nl|de|fr|es|it|pt|pl|ru|tr|ar|hi)/page-coming-soon',
  ],
};

/**
 * R6. Legacy root-level slugs to their catalogue page.
 *
 * Resolved against the live catalogue on 2026-09-22, not guessed:
 *   /headlocks      six of the seven headlock products are in Cattle, so Cattle it is
 *   /sheep-headlocks the seventh
 *   /round-feeder   AMBIGUOUS: "Round Feeders" exists in both Cattle and Sheep, so this goes
 *                   to the category rather than picking one and being wrong half the time
 *   /mounting-accessories  wood-connectors IS the garden hardware category, slug overridden
 */
const LEGACY_SLUGS = {
  '/access-scaffold-euro-frame': '/products/scaffolding-formworks/access-scaffold-euro-frame',
  '/slab-formwork-system-props': '/products/scaffolding-formworks/slab-formwork-system-props',
  '/system-slab-formwork-tripods': '/products/scaffolding-formworks/system-slab-formwork-tripods',
  '/system-scaffolds---hk': '/products/scaffolding-formworks/system-scaffolds-hk',
  '/system-scaffolds-accessories-jacks-and-nuts': '/products/scaffolding-formworks/accessories-jacks-nuts',
  '/scaffold-tube-fitting-british-and-american': '/products/scaffolding-formworks/scaffold-tube-fitting-british-american',
  '/scaffolding-formworks': '/products/scaffolding-formworks',
  '/cattle': '/products/livestock-housing-solutions/cattle',
  '/headlocks': '/products/livestock-housing-solutions/cattle',
  '/sheep-headlocks': '/products/livestock-housing-solutions/sheep',
  '/horse': '/products/livestock-housing-solutions/horse',
  '/horse-handling-equipments': '/products/livestock-housing-solutions/horse',
  '/pasture-gates': '/products/livestock-housing-solutions/field-gates',
  '/post-for-gates': '/products/livestock-housing-solutions/field-gates',
  '/round-feeder': '/products/livestock-housing-solutions',
  '/indoor-wood-connectors': '/products/wood-connectors/indoor-wood-connectors',
  '/miscellaneous-products': '/products/wood-connectors/miscellaneous-products',
  '/mounting-accessories': '/products/wood-connectors',
  '/quality-policy': '/certifications',
  '/who-we-are': '/about',
  '/who-we-are.php': '/about',
  '/contact.php': '/contact',
  '/index.html': '/',
  '/index.php': '/',
  '/listing.php': '/',
  '/category/index.php': '/products',
};

/**
 * R5. Category ids.
 *
 * Only /category/1 is evidenced, from search snippets on the old site. 2 and 3 were never
 * confirmed and /category/2 does not appear in the Search Console export at all, so the rest
 * fall through to the catalogue overview rather than being guessed at. Sending a visitor to
 * the wrong category is worse than sending them to the index.
 */
const CATEGORY_IDS = { 1: '/products/scaffolding-formworks' };

const redirect = (url, locale, target, status = 301) =>
  Response.redirect(new URL(`${locale}${target}${url.search}`, url.origin), status);

export default function middleware(request) {
  const url = new URL(request.url);
  let segments = url.pathname.split('/').filter(Boolean);

  // Keep the visitor in their language. Peeled first so every rule below sees a clean path.
  let locale = '';
  if (segments.length && LOCALE_SET.has(segments[0])) {
    locale = `/${segments[0]}`;
    segments = segments.slice(1);
  }

  /* R1. Strip the legacy PHP prefix, then carry on with the remaining rules. */
  if (segments[0] === 'public') {
    segments = segments.slice(1);
    if (segments[0] === 'index.php') segments = segments.slice(1);
  }

  const path = `/${segments.join('/')}`;
  const lower = path.toLowerCase();

  /* Gone, not moved. No successor, so 410 gets it dropped from the index fastest. */
  if (segments[0] === 'page-coming-soon') {
    return new Response('Gone', { status: 410, headers: { 'content-type': 'text/plain; charset=utf-8' } });
  }

  /* R6 and the assorted legacy pages, including anything R1 just unwrapped. */
  if (LEGACY_SLUGS[lower]) return redirect(url, locale, LEGACY_SLUGS[lower]);

  /* /rfq is an alias of the quote form, which lives on /contact. */
  if (segments[0] === 'rfq' && segments.length === 1) {
    return redirect(url, locale, '/contact?tab=rfq');
  }

  /* R5. Category ids. */
  if (segments[0] === 'category') {
    const target = CATEGORY_IDS[segments[1]] || '/products';
    return redirect(url, locale, target);
  }

  /**
   * R2, R3 and R4. Products and enquiries.
   *
   * Every old shape ends in either a numeric id or a product slug, so both are tried in that
   * order: an id is unambiguous, a slug is a best effort.
   */
  if (segments[0] === 'product' || segments[0] === 'enquiry') {
    const isEnquiry = segments[0] === 'enquiry';
    const rest = segments.slice(1);

    // R2 / R4-by-id: the last all-digits segment.
    const id = [...rest].reverse().find((s) => /^\d+$/.test(s));
    if (id && PRODUCT_REDIRECTS[id]) return redirect(url, locale, PRODUCT_REDIRECTS[id]);

    // R3 / R4-by-slug: the last segment that is not a .php file and not numeric.
    const slug = [...rest].reverse().find((s) => s && !/\.php$/i.test(s) && !/^\d+$/.test(s));
    if (slug) {
      const key = slug.toLowerCase();
      if (PRODUCT_SLUG_REDIRECTS[key]) return redirect(url, locale, PRODUCT_SLUG_REDIRECTS[key]);
      if (SUBCATEGORY_PATHS[key]) return redirect(url, locale, SUBCATEGORY_PATHS[key]);
    }

    // Nothing matched. An enquiry was someone trying to ask about a product, so send them
    // somewhere they still can; a product goes to the catalogue.
    return redirect(url, locale, isEnquiry ? '/contact?tab=rfq' : '/products');
  }

  /* R7. Catch-all for anything else the old site served with a .php extension. */
  if (/\.php$/i.test(path)) return redirect(url, locale, '/');

  // Not ours: on to the static file or the app shell.
  return undefined;
}
