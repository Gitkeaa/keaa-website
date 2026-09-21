/**
 * Regenerates public/sitemap.xml from the catalogue.
 *
 * The hand-maintained sitemap listed only the 13 static marketing routes, so every
 * category, subcategory and product page — the overwhelming majority of the site, and the
 * pages that actually carry long-tail search demand — was invisible to crawlers.
 *
 * This reads categories.json (NOT products.json) for the category/subcategory slugs, so
 * the slug derivation lives in exactly one place: gen-categories.mjs. That means order
 * matters — `prebuild` runs gen-categories.mjs first, then this. Run both by hand with
 * `npm run gen:sitemap` after editing products.json.
 *
 * Deliberately no <lastmod>: stamping every URL with the build date claims content
 * freshness that did not happen, and crawlers discount a sitemap whose lastmod is always
 * "today". Add real per-product timestamps here if the catalogue ever carries them.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { liveLocales } from '../src/i18n/languages.js';
import { posts } from '../src/data/blog.js';
import { landingPagePaths } from '../src/data/landingPages.js';
import { buildProductPaths } from '../src/data/productSlug.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'src', 'data');

const SITE_URL = 'https://www.keaainternational.com';

/** Mirrors the public routes in src/App.jsx. Admin routes are intentionally excluded. */
const STATIC_ROUTES = [
  ['/', 1.0],
  ['/about', 0.9],
  ['/products', 0.9],
  ['/contact', 0.9],
  ['/manufacturing', 0.8],
  ['/projects-gallery', 0.8],
  ['/certifications', 0.7],
  ['/faq', 0.7],
  ['/downloads', 0.6],
  ['/export', 0.9],
  ['/request-a-quote', 0.9],
  ['/blog', 0.7],
  ['/careers', 0.6],
  ['/privacy-policy', 0.3],
  ['/terms', 0.3],
  ['/cookie-policy', 0.3],
];

const XML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };
const escapeXml = (value) => String(value).replace(/[&<>"']/g, (c) => XML_ESCAPES[c]);

const categories = JSON.parse(readFileSync(join(DATA, 'categories.json'), 'utf8'));

/** Article slugs, read from the module the site renders so the two cannot drift. */
const blogSlugs = posts.map((p) => p.slug);
const products = JSON.parse(readFileSync(join(DATA, 'products.json'), 'utf8'));

// Readable product URLs, from the same function the app and the middleware use, so the
// sitemap can never list an address the site does not serve.
const productPathById = Object.fromEntries(
  buildProductPaths(products).entries.map((e) => [e.id, e.path]),
);

const urls = [];
const seen = new Set();
const add = (path, priority) => {
  if (seen.has(path)) return;
  seen.add(path);
  urls.push({ path, priority });
};

for (const [path, priority] of STATIC_ROUTES) add(path, priority);

for (const slug of blogSlugs) add(`/blog/${slug}`, 0.6);

// Keyword landing pages. 0.8: below the home page, above a single product, because these are
// the pages the site is actively trying to rank.
for (const p of landingPagePaths) add(p, 0.8);

let subCount = 0;
for (const c of categories) {
  add(`/products/${c.slug}`, 0.8);
  for (const s of c.subcategories) {
    add(`/products/${c.slug}/${s.slug}`, 0.7);
    subCount++;
  }
}

let productCount = 0;
for (const p of products) {
  if (p.id === undefined || p.id === null) continue;
  // The readable address. The numeric one is 301d by middleware.js and is deliberately
  // absent from the sitemap: listing a URL that redirects wastes crawl budget and tells
  // Google the opposite of what the redirect does.
  add(productPathById[p.id] || `/product/${p.id}`, 0.6);
  productCount++;
}

/**
 * Live languages list every URL again under their prefix — /de/about is a real page Google
 * should crawl. Not-yet-live languages get nothing: their URLs 404 by design, and a sitemap
 * that lists 404s erodes crawler trust. While no locale is live this loop adds zero URLs.
 */
const locales = liveLocales();
const base = [...urls];
for (const code of locales) {
  for (const { path, priority } of base) {
    add(path === '/' ? `/${code}` : `/${code}${path}`, priority);
  }
}

const body = urls
  .map(
    ({ path, priority }) =>
      `  <url><loc>${escapeXml(`${SITE_URL}${path}`)}</loc><priority>${priority.toFixed(1)}</priority></url>`,
  )
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

writeFileSync(join(ROOT, 'public', 'sitemap.xml'), xml);

console.log(
  `sitemap.xml: ${urls.length} URLs ` +
    `(${STATIC_ROUTES.length} static, ${categories.length} categories, ` +
    `${subCount} subcategories, ${productCount} products)`,
);
