/**
 * Fails the build if product URLs would collide, or if the category slug rules have drifted
 * apart.
 *
 * TWO THINGS THIS CATCHES
 * -----------------------
 * 1. A duplicate product URL. Slugs are derived, and 53 of the 355 products already need their
 *    item code to be unique. A catalogue re-export that changes a name or an item code could
 *    produce two products at one address, where the second silently becomes unreachable.
 *
 * 2. Category slug drift. data/productSlug.js cannot import data/categories.js, because
 *    categories.js imports JSON and the Node generators cannot follow that, so the category
 *    slug overrides are written out in both files. If somebody adds an override to one and not
 *    the other, product URLs stop matching their own category pages. This compares the two.
 *
 * Run by `npm run check:product-paths`, and as part of prebuild.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildProductPaths, categorySlugOf } from '../src/data/productSlug.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const products = JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'products.json'), 'utf8'));
const { entries, collisions } = buildProductPaths(products);

let failed = false;

/* 1. duplicate URLs */
const seen = new Map();
for (const e of entries) {
  if (seen.has(e.path)) {
    console.error(`check:product-paths: duplicate URL ${e.path} (products ${seen.get(e.path)} and ${e.id})`);
    failed = true;
  }
  seen.set(e.path, e.id);
}

/* 2. the override tables agree */
const categoriesSource = readFileSync(join(ROOT, 'src', 'data', 'categories.js'), 'utf8');
const block = categoriesSource.slice(
  categoriesSource.indexOf('const CATEGORY_SLUG_OVERRIDES'),
  categoriesSource.indexOf('};', categoriesSource.indexOf('const CATEGORY_SLUG_OVERRIDES')),
);
for (const [, from, to] of block.matchAll(/'([^']+)':\s*'([^']+)'/g)) {
  // categorySlugOf takes a display name or a slug and is idempotent, so feeding it the
  // override key must produce the override value on both sides.
  if (categorySlugOf(from) !== to) {
    console.error(
      `check:product-paths: category override drift. categories.js maps ${JSON.stringify(from)} ` +
        `to ${JSON.stringify(to)}, productSlug.js gives ${JSON.stringify(categorySlugOf(from))}.`,
    );
    console.error('Add the same entry to CATEGORY_SLUG_OVERRIDES in src/data/productSlug.js.');
    failed = true;
  }
}

if (failed) process.exit(1);

console.log(
  `check:product-paths: ok - ${entries.length} unique product URLs ` +
    `(${collisions} disambiguated by item code), category overrides in step.`,
);
