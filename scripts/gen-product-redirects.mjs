/**
 * Generates the lookup tables the edge middleware uses to 301 old addresses.
 *
 * WHY A GENERATED FILE RATHER THAN A LOOKUP AT REQUEST TIME
 * --------------------------------------------------------
 * The middleware runs on every request it matches, so it must not import products.json: that
 * file carries descriptions, spec tables and image arrays for 355 products and would be bundled
 * into the edge function whole. These tables are the few fields the redirects actually need.
 *
 * WHY NOT vercel.json REDIRECTS
 * -----------------------------
 * Vercel caps vercel.json at 2,048 redirects and the file already holds 263. One rule per
 * product per locale is 355 x 12 = 4,260, which would be refused at deploy. Middleware has no
 * such limit, and it can resolve a slug or an id by lookup, which a static rule cannot.
 *
 * THREE TABLES
 * ------------
 *   PRODUCT_REDIRECTS       numeric id     -> new product URL   (R2, R4 by id)
 *   PRODUCT_SLUG_REDIRECTS  old page slug  -> new product URL   (R3, R4 by slug)
 *   SUBCATEGORY_PATHS       subcategory slug -> its catalogue URL (R3/R6 fallbacks)
 *
 * On the slug table: the old PHP site had one page per slug, and our slugs derive from the same
 * product names, so most map straight across. 22 base slugs are shared by 49 products, and the
 * old site cannot tell us which one it meant. Those resolve to the LOWEST id, deterministically,
 * so the same old URL always lands on the same product rather than moving between builds.
 *
 * Run by `npm run gen:product-redirects`, and as part of prebuild.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildProductPaths, slugifyPart } from '../src/data/productSlug.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'src', 'data', 'productRedirects.generated.js');

const products = JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'products.json'), 'utf8'));
const { entries, collisions } = buildProductPaths(products);

const paths = new Set(entries.map((e) => e.path));
if (paths.size !== entries.length) {
  console.error(`gen:product-redirects: ${entries.length - paths.size} duplicate product path(s).`);
  process.exit(1);
}

/* id -> path */
const byId = {};
for (const e of entries) byId[e.id] = e.path;

/**
 * old slug -> path.
 *
 * Keyed on the BASE slug the old site would have used, which is the product name slugified,
 * not our disambiguated one. Lowest id wins a tie so the mapping is stable across builds.
 */
const bySlug = {};
const byIdNum = new Map(products.map((p) => [p.id, p]));
for (const e of [...entries].sort((a, b) => Number(a.id) - Number(b.id))) {
  const p = byIdNum.get(e.id);
  const base = slugifyPart(p?.slug || p?.name || String(e.id));
  if (!(base in bySlug)) bySlug[base] = e.path;
  // Our disambiguated slug is also a valid key, for anything already linking to the new shape.
  if (!(e.slug in bySlug)) bySlug[e.slug] = e.path;
}

/* subcategory slug -> catalogue URL, for the "no product matched" fallbacks */
const subPaths = {};
for (const e of entries) {
  if (!(e.subSlug in subPaths)) subPaths[e.subSlug] = `/products/${e.categorySlug}/${e.subSlug}`;
}

const body = `/**
 * GENERATED FILE. Do not edit.
 *
 * Built by scripts/gen-product-redirects.mjs from src/data/products.json.
 * Feeds the 301s in middleware.js. See that file for the rule order.
 *
 * ${entries.length} products, ${collisions} of which needed their item code to make the slug unique.
 * ${Object.keys(bySlug).length} slug keys, ${Object.keys(subPaths).length} subcategories.
 */
export const PRODUCT_REDIRECTS = ${JSON.stringify(byId, null, 0)};

export const PRODUCT_SLUG_REDIRECTS = ${JSON.stringify(bySlug, null, 0)};

export const SUBCATEGORY_PATHS = ${JSON.stringify(subPaths, null, 0)};
`;

writeFileSync(OUT, body, 'utf8');
console.log(
  `gen:product-redirects: ${entries.length} ids, ${Object.keys(bySlug).length} slugs, ` +
    `${Object.keys(subPaths).length} subcategories -> ${Math.round(body.length / 1024)} KB.`,
);
