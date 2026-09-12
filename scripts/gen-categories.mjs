/**
 * Regenerates src/data/categories.json from src/data/products.json.
 *
 * Why this file exists: the site chrome (Header, Footer, MobileDrawer) and the homepage's
 * CoreSolutions all render the category list. They used to get it from productHelpers,
 * which statically imports the 355-product catalogue — so products.json landed in the
 * entry chunk and every visitor downloaded the whole catalogue just to see the nav.
 *
 * The nav only needs three categories, their counts and their subcategories: ~3.7 KB.
 * That is precomputed here so the chrome can import it without touching products.json.
 *
 * This runs automatically on `npm run build` (prebuild), so the two can never drift.
 * Run it by hand after editing products.json: `npm run gen:categories`.
 *
 * The derivation below MUST stay identical to getAllCategories() in productHelpers.js.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const DATA = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data');

const slugify = (str) =>
  String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

// Keeps the already-published /products/wood-connectors URL. Mirrors categories.js — both
// copies must carry the same keys, including the pre-rename one.
const CATEGORY_SLUG_OVERRIDES = {
  'wood-connectors-diy-hardware-products': 'wood-connectors',
  'wood-connectors-garden-hardware': 'wood-connectors',
};

const catSlugOf = (nameOrSlug) => {
  const s = slugify(nameOrSlug);
  return CATEGORY_SLUG_OVERRIDES[s] || s;
};

const products = JSON.parse(readFileSync(join(DATA, 'products.json'), 'utf8'));

const map = new Map();
for (const p of products) {
  const catSlug = catSlugOf(p.category);
  const subSlug = slugify(p.subcategory);
  if (!map.has(catSlug)) {
    map.set(catSlug, { name: p.category, slug: catSlug, count: 0, subs: new Map() });
  }
  const c = map.get(catSlug);
  c.count++;
  if (!c.subs.has(subSlug)) {
    c.subs.set(subSlug, { name: p.subcategory, slug: subSlug, count: 0 });
  }
  c.subs.get(subSlug).count++;
}

const categories = [...map.values()].map((c) => ({
  name: c.name,
  slug: c.slug,
  count: c.count,
  subcategories: [...c.subs.values()],
}));

writeFileSync(join(DATA, 'categories.json'), `${JSON.stringify(categories, null, 2)}\n`);

const total = categories.reduce((a, c) => a + c.count, 0);
console.log(
  `categories.json: ${categories.length} categories, ${total} products ` +
    `(${categories.map((c) => `${c.slug}=${c.count}`).join(', ')})`
);
