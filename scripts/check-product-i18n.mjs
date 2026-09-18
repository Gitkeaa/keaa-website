/**
 * Product-data translation coverage, the companion of check-translations.mjs.
 *
 * check-translations.mjs measures the INTERFACE strings that go through lt(). Product text
 * (names, descriptions, specification rows) never goes through lt(): it comes straight from
 * products.json and is translated by the string-keyed dictionaries in src/i18n/products/
 * (see src/i18n/localizeProduct.js). This script builds the manifest of every distinct
 * English product string a page can render and reports, per language, how many have a
 * translation.
 *
 * What is in the manifest, and what is deliberately not:
 *   - every distinct product name and description
 *   - every specification label that contains a word (item codes used as labels are not
 *     text and are skipped)
 *   - every specification value that contains a word once units, standards and
 *     abbreviations are removed ("Left", "Hot Dip Galvanized as per ISO 1461"); pure
 *     numbers, dimensions and codes pass through untranslated by design
 *   - the derived finish and product-type labels from src/data/productTerms.js
 *
 * Usage:
 *   node scripts/check-product-i18n.mjs                 coverage table
 *   node scripts/check-product-i18n.mjs --missing=de    list one language's untranslated strings
 *   node scripts/check-product-i18n.mjs --json          the manifest, for translators
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { ALL_TERMS } from '../src/data/productTerms.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PRODUCTS = join(ROOT, 'src', 'data', 'products.json');
const DICT_DIR = join(ROOT, 'src', 'i18n', 'products');

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v = 'true'] = a.replace(/^--/, '').split('=');
    return [k, v];
  })
);

/** Same normalisation as localizeProduct.js, so a manifest key always matches a lookup. */
const norm = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();

/** KEAA item codes (KIRS 100, KIHKTH/HR 120) and bare part codes are not text. */
const isCode = (s) => /^KI[-A-Z]/.test(s) || (/^[A-Z0-9][A-Z0-9\-/.&()Ü ]{0,14}$/.test(s) && !/[a-z]/.test(s) && !/[A-Z]{4,}/.test(s));

/**
 * A string needs a translation only if a real word survives once units, standards and
 * abbreviations are stripped. "0.7 / 10m / CE / ETAG 015" does not; "30 / 30 / 2.0 / Left"
 * does.
 */
const NOISE = /\b(CE|ETAG|DIN|EN|ISO|EZP|OD|SS|YS|UTS|MPa|Mpa|mm|cm|kg|KN|kN|MT|HD|LD|MD|BD|JR|JRH|GD|Z|Fe|Zn|SW|R|L|W|H|WxH|td)\b/g;
const hasWord = (s) => /[A-Za-z]{3,}/.test(String(s).replace(NOISE, ' '));

export function buildManifest() {
  const products = JSON.parse(readFileSync(PRODUCTS, 'utf8'));
  const names = new Set();
  const descriptions = new Set();
  const specLabels = new Set();
  const specValues = new Set();
  for (const p of products) {
    if (p.name) names.add(norm(p.name));
    if (p.description && norm(p.description)) descriptions.add(norm(p.description));
    for (const s of p.specs || []) {
      if (!s || !s.value) continue;
      const label = norm(s.label);
      const value = norm(s.value);
      if (label && hasWord(label) && !isCode(label)) specLabels.add(label);
      if (value && hasWord(value) && !isCode(value)) specValues.add(value);
    }
  }
  const sorted = (set) => [...set].sort((a, b) => a.localeCompare(b, 'en'));
  return {
    names: sorted(names),
    descriptions: sorted(descriptions),
    specLabels: sorted(specLabels),
    specValues: sorted(specValues),
    terms: [...ALL_TERMS],
  };
}

const manifest = buildManifest();
const SECTIONS = ['names', 'descriptions', 'specLabels', 'specValues', 'terms'];
const total = SECTIONS.reduce((n, k) => n + manifest[k].length, 0);

if (args.json) {
  console.log(JSON.stringify(manifest, null, 1));
  process.exit(0);
}

console.log(
  `product strings: ${total} ` +
    `(${SECTIONS.map((k) => `${manifest[k].length} ${k}`).join(', ')})\n`
);

const dictFiles = existsSync(DICT_DIR) ? readdirSync(DICT_DIR).filter((f) => f.endsWith('.json')).sort() : [];
if (!dictFiles.length) {
  console.log('No product dictionaries in src/i18n/products/ yet: every language is at 0%.');
  process.exit(0);
}

let worst = 100;
for (const file of dictFiles) {
  const code = file.replace(/\.json$/, '');
  const dict = JSON.parse(readFileSync(join(DICT_DIR, file), 'utf8'));
  const missing = {};
  let done = 0;
  for (const k of SECTIONS) {
    const map = dict[k] || {};
    missing[k] = manifest[k].filter((s) => map[s] == null || map[s] === '');
    done += manifest[k].length - missing[k].length;
  }
  const pct = total ? Math.round((done / total) * 100) : 100;
  worst = Math.min(worst, pct);
  console.log(
    `${code}: ${done}/${total} (${pct}%)  ` +
      SECTIONS.map((k) => `${k} ${manifest[k].length - missing[k].length}/${manifest[k].length}`).join(', ')
  );
  if (args.missing === code) {
    for (const k of SECTIONS) for (const s of missing[k]) console.log(`  - [${k}] ${s}`);
  }
}
console.log('\nA language is complete for product data only at 100%.');
if (args.strict === 'true' && worst < 100) process.exit(1);
