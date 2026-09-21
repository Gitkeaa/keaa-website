import { PRODUCT_REDIRECTS } from './src/data/productRedirects.generated.js';

/**
 * Vercel routing middleware. Two jobs, both of which vercel.json cannot do.
 *
 * 1. PRODUCT URL MIGRATION
 *    Products used to live at /product/136. They now live at
 *    /products/scaffolding-formworks/slab-formwork-system-props/push-pull-props, because a
 *    numeric id tells a buyer and a search engine nothing.
 *
 *    Four old shapes reach the same product, all of them still in Google's index from the
 *    previous PHP site, and all of them end with the numeric id:
 *      /product/136
 *      /product/push-pull-props/136
 *      /enquiry/push-pull-props/136
 *      /public/index.php/product/push-pull-props/136
 *    Every one 301s straight to the readable address in a SINGLE hop, in all twelve locales.
 *
 *    This is here rather than in vercel.json for two reasons. Vercel caps that file at 2,048
 *    redirects and one rule per product per locale is 355 x 12 = 4,260, which would be refused
 *    at deploy. And the pattern rules that used to cover these shapes could only send them to
 *    /product/:id, which after this migration would redirect a second time: a chain, which
 *    costs crawl budget and dilutes the signal. A lookup cannot be expressed in vercel.json,
 *    so those five rules moved here and 178 explicit ones had their destination rewritten to
 *    point at the readable URL directly.
 *
 * 2. GONE, NOT MOVED
 *    /page-coming-soon was a placeholder on the old site with no successor, so 410 Gone is the
 *    honest answer and the one that drops it from the index fastest. vercel.json redirects can
 *    only return 3xx, which is the other reason this file exists. Its old 308 to /products was
 *    removed from vercel.json, because redirects there run BEFORE middleware and would have
 *    won.
 *
 * MATCHER SCOPE
 * -------------
 * Deliberately narrow. Every other page is prerendered static HTML served from the edge cache,
 * and putting middleware in front of that would add a function invocation to every page view
 * for nothing.
 *
 * An unknown id falls through untouched and the app renders its own not-found state. Inventing
 * a destination for an id that never existed would be worse than a 404.
 */
export const config = {
  matcher: [
    '/product/:path*',
    '/enquiry/:path*',
    '/public/index.php/:path*',
    '/page-coming-soon',
    '/:locale(nl|de|fr|es|it|pt|pl|ru|tr|ar|hi)/product/:path*',
    '/:locale(nl|de|fr|es|it|pt|pl|ru|tr|ar|hi)/enquiry/:path*',
    '/:locale(nl|de|fr|es|it|pt|pl|ru|tr|ar|hi)/public/index.php/:path*',
    '/:locale(nl|de|fr|es|it|pt|pl|ru|tr|ar|hi)/page-coming-soon',
  ],
};

const LOCALES = new Set(['nl', 'de', 'fr', 'es', 'it', 'pt', 'pl', 'ru', 'tr', 'ar', 'hi']);

export default function middleware(request) {
  const url = new URL(request.url);
  let segments = url.pathname.split('/').filter(Boolean);

  // Peel a locale prefix off the front and remember it, so a Dutch visitor lands on the Dutch
  // page rather than being dropped onto the English one.
  let locale = '';
  if (segments.length && LOCALES.has(segments[0])) {
    locale = `/${segments[0]}`;
    segments = segments.slice(1);
  }

  // The old site served everything under /public/index.php as well as at the bare path.
  if (segments[0] === 'public' && segments[1] === 'index.php') {
    segments = segments.slice(2);
  }

  if (segments[0] === 'page-coming-soon') {
    return new Response('Gone', {
      status: 410,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }

  /**
   * Both /product/... and /enquiry/... identified a product, and in every shape the numeric id
   * is the last segment that is entirely digits. Reading it that way covers all four shapes
   * with one rule instead of four, and tolerates the slug in the middle being anything at all,
   * which matters because the old slugs are not ours and some contain characters we would not
   * produce today.
   */
  if (segments[0] === 'product' || segments[0] === 'enquiry') {
    const id = [...segments].reverse().find((s) => /^\d+$/.test(s));
    const target = id && PRODUCT_REDIRECTS[id];
    if (target) {
      // 301 rather than 308: both are permanent, 301 is what every SEO tool reports on, and a
      // page request is a GET either way.
      return Response.redirect(new URL(`${locale}${target}${url.search}`, url.origin), 301);
    }
  }

  // Not ours: let the request continue to the static file or the app shell.
  return undefined;
}
