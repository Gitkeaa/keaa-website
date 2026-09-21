/**
 * Fails the build if any catalogue subcategory has no search keyword.
 *
 * src/data/seoKeywords.js is keyed by the exact `subcategory` strings in products.json. A
 * typo, or a subcategory added to the catalogue later, silently falls back to the internal
 * name, which is the thing the keyword map exists to stop appearing in titles. Silent
 * fallbacks are the kind of regression nobody notices for months, so this makes it loud.
 *
 * Run by `npm run check:seo-keywords`, and as part of the build.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const { SUBCATEGORY_KEYWORDS } = await import(
  pathToFileURL(path.join(ROOT, 'src', 'data', 'seoKeywords.js')).href
);

const products = JSON.parse(readFileSync(path.join(ROOT, 'src', 'data', 'products.json'), 'utf8'));
const items = Array.isArray(products) ? products : products.products || [];

const used = [...new Set(items.map((p) => p.subcategory).filter(Boolean))].sort();
const missing = used.filter((s) => !SUBCATEGORY_KEYWORDS[s]);
const unused = Object.keys(SUBCATEGORY_KEYWORDS).filter((k) => !used.includes(k));

if (missing.length) {
  console.error(`check:seo-keywords: ${missing.length} subcategory(ies) have no keyword, so their`);
  console.error('pages and products would be titled with the internal catalogue name:');
  for (const m of missing) console.error(`  - ${JSON.stringify(m)}`);
  console.error('\nAdd them to SUBCATEGORY_KEYWORDS in src/data/seoKeywords.js.');
  process.exit(1);
}

// A stale key is not worth failing a build over, but it usually means a subcategory was
// renamed and one half of the rename was missed.
if (unused.length) {
  console.warn(`check:seo-keywords: ${unused.length} keyword(s) match no subcategory (renamed?):`);
  for (const u of unused) console.warn(`  - ${JSON.stringify(u)}`);
}

console.log(`check:seo-keywords: ok - all ${used.length} subcategories have a keyword.`);
