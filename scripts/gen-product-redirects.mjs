/**
 * Generates the id to URL map the edge middleware uses to 301 old product addresses.
 *
 * WHY A GENERATED FILE RATHER THAN A LOOKUP AT REQUEST TIME
 * --------------------------------------------------------
 * The middleware runs on every request to /product/*, so it must not import products.json:
 * that file carries descriptions, spec tables and image arrays for 355 products and would be
 * bundled into the edge function whole. This map is the two fields the redirect actually
 * needs, about 30 KB, built once at build time.
 *
 * WHY NOT vercel.json REDIRECTS
 * -----------------------------
 * Vercel caps vercel.json at 2,048 redirects and the file already holds 269. One rule per
 * product per locale is 355 x 12 = 4,260, which would be refused at deploy. Middleware has no
 * such limit, and it can also handle the locale prefix with one code path instead of twelve
 * rules per product.
 *
 * Run by `npm run gen:product-redirects`, and as part of prebuild.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildProductPaths } from '../src/data/productSlug.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'src', 'data', 'productRedirects.generated.js');

const products = JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'products.json'), 'utf8'));
const { entries, collisions } = buildProductPaths(products);

const paths = new Set(entries.map((e) => e.path));
if (paths.size !== entries.length) {
  console.error(`gen:product-redirects: ${entries.length - paths.size} duplicate product path(s).`);
  process.exit(1);
}

const map = {};
for (const e of entries) map[e.id] = e.path;

const body = `/**
 * GENERATED FILE. Do not edit.
 *
 * Built by scripts/gen-product-redirects.mjs from src/data/products.json.
 * Maps a legacy numeric product id to its slug URL, for the 301 in middleware.js.
 *
 * ${entries.length} products, ${collisions} of which needed their item code to make the slug unique.
 */
export const PRODUCT_REDIRECTS = ${JSON.stringify(map, null, 0)};
`;

writeFileSync(OUT, body, 'utf8');
console.log(
  `gen:product-redirects: ${entries.length} products -> ${Math.round(body.length / 1024)} KB ` +
    `(${collisions} disambiguated by item code).`,
);
