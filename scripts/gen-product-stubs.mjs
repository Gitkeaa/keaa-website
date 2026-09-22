/**
 * Writes a head-only page for every product URL in a locale that is not fully prerendered.
 *
 * WHAT A STUB IS
 * --------------
 * The complete <head> of the English prerendered page for that product, with three things
 * rewritten for the locale, followed by an empty #root the app fills in the browser. Every
 * script and stylesheet the real page loads is in that head already, so the app boots exactly
 * as it does anywhere else.
 *
 * The head is copied rather than rebuilt from templates on purpose. It means the title, meta
 * description, Open Graph tags, the hreflang alternates and the Product and BreadcrumbList
 * JSON-LD are byte-identical to the page React would have produced, and they
 * cannot drift when useSEO or seoKeywords change. Rebuilding them here would be a second
 * implementation of the same logic, and the two would disagree within a month.
 *
 * WHAT IS REWRITTEN
 * -----------------
 *   <html lang>        the locale code
 *   <link canonical>   the locale-prefixed URL, so the page is its own canonical, never
 *                      English's, which is what stops Google folding twelve URLs into one
 *   <meta og:url>      the same
 *
 * Plus a noindex robots tag, because every stub locale is one we have asked Google not to
 * index. The hreflang block is already identical on every locale version of a page, because
 * useSEO lists the indexed alternates plus x-default from the unprefixed path, so copying it
 * verbatim is correct rather than lazy. Note the stub's own locale is NOT in that set, which
 * is the intended result of dropping it from search.
 *
 * Titles and descriptions stay in English because they are English by design: they are built
 * from the search keyword a buyer types, and a localised page still wants to be found for it.
 * See the note in pages/ProductDetail.jsx.
 *
 * WHY NOT JUST PRERENDER THEM
 * ---------------------------
 * Time. See scripts/prerender-scope.mjs. This runs after the build with no browser at all.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { liveLocales } from '../src/i18n/languages.js';
import { buildProductPaths } from '../src/data/productSlug.js';
import { PRODUCT_STUB_LOCALES, assertScopeCoversLocales } from './prerender-scope.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const SITE_URL = 'https://www.keaainternational.com';

assertScopeCoversLocales(liveLocales());

const products = JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'products.json'), 'utf8'));
const { entries } = buildProductPaths(products);

/**
 * A build with no product pages at all is a PREVIEW, not a fault.
 *
 * vercel.json only sets PRERENDER_PRODUCTS on production, so a preview build has no English
 * product page for this script to copy a head from. That is the intended arrangement, and
 * there is nothing to stub, so it exits quietly.
 *
 * The distinction matters: SOME products missing means the prerender scope and this script
 * disagree, which silently 404s real URLs and is worth failing a build over. NONE missing
 * means products were never in scope. The check below tells the two apart by counting first
 * rather than failing on the first absent file, which is exactly the bug that turned the
 * first preview of this branch red after six minutes.
 */
const prerenderedCount = entries.filter((e) =>
  existsSync(join(DIST, e.path.replace(/^\//, ''), 'index.html')),
).length;

if (prerenderedCount === 0) {
  console.log(
    `gen:product-stubs: skipped - no product pages in this build, so nothing to stub. ` +
      'Expected on previews, where vercel.json leaves PRERENDER_PRODUCTS unset.',
  );
  process.exit(0);
}

/** Swap one attribute value on the first tag that carries it. */
function replaceAttr(html, pattern, value) {
  return html.replace(pattern, (m, a, _old, c) => `${a}${value}${c}`);
}

let written = 0;
let skipped = 0;
const missingSource = [];

for (const entry of entries) {
  const sourcePath = join(DIST, entry.path.replace(/^\//, ''), 'index.html');
  if (!existsSync(sourcePath)) {
    // The English page must exist: it is the source for every stub. If it does not, the
    // prerender scope and this script disagree, which is worth failing loudly over.
    missingSource.push(entry.path);
    continue;
  }
  const source = readFileSync(sourcePath, 'utf8');

  const headEnd = source.indexOf('</head>');
  if (headEnd < 0) throw new Error(`gen:product-stubs: no </head> in ${sourcePath}`);
  const head = source.slice(0, headEnd + '</head>'.length);

  for (const code of PRODUCT_STUB_LOCALES) {
    const target = join(DIST, code, entry.path.replace(/^\//, ''), 'index.html');
    if (existsSync(target)) {
      // A fully prerendered page already won this URL. Never overwrite a real page with a stub.
      skipped += 1;
      continue;
    }

    const localeUrl = `${SITE_URL}/${code}${entry.path}`;
    let html = head;
    html = replaceAttr(html, /(<html[^>]*\blang=")([^"]*)(")/, code);
    html = replaceAttr(html, /(<link rel="canonical" href=")([^"]*)(")/, localeUrl);
    html = replaceAttr(html, /(<meta property="og:url" content=")([^"]*)(")/, localeUrl);

    /**
     * Every stub locale is one we have asked Google not to index (INDEXED_LOCALES in
     * i18n/languages.js), so the tag goes in here as well as being set by useSEO at runtime.
     * A crawler that does not execute JavaScript must still see it.
     */
    if (!/<meta name="robots"/.test(html)) {
      html = html.replace('</head>', '<meta name="robots" content="noindex, follow"></head>');
    }

    html += '<body><div id="root"></div></body></html>';

    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, html, 'utf8');
    written += 1;
  }
}

if (missingSource.length) {
  console.error(
    `gen:product-stubs: ${missingSource.length} product page(s) were not prerendered in English, ` +
      'so there is no head to copy. The prerender scope and this script disagree.',
  );
  for (const p of missingSource.slice(0, 5)) console.error(`  - ${p}`);
  process.exit(1);
}

console.log(
  `gen:product-stubs: ok - ${written} head stub(s) written for ${PRODUCT_STUB_LOCALES.join(', ')}` +
    (skipped ? `, ${skipped} skipped because a real page exists` : ''),
);
