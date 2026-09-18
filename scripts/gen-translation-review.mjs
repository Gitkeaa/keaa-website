/**
 * Review sheets for human translators: one CSV per language with every string that a
 * native speaker should check before the language is considered final.
 *
 * What goes in, and why:
 *   - legal pages (privacy, terms, cookies): wording with legal effect
 *   - certifications and manufacturing quality copy: claims about standards and audits
 *   - any interface string that names a standard, a load, a dimension or a class
 *   - every product description, specification label, specification value and derived term
 *   - every product name, flagged "terminology": the trade vocabulary of each market
 *
 * Columns: section, key, english, translation, reason. Open in Excel or Google Sheets;
 * a reviewer edits the translation column and sends the file back, and the corrections are
 * applied with merge-translations.mjs (interface) or by editing src/i18n/products/<code>.json.
 *
 * Usage:
 *   node scripts/gen-translation-review.mjs --lang=de            writes translation-review/de.csv
 *   node scripts/gen-translation-review.mjs --lang=de,nl,fr      several languages
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'translation-review');

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v = 'true'] = a.replace(/^--/, '').split('=');
    return [k, v];
  })
);
if (!args.lang) {
  console.error('usage: node scripts/gen-translation-review.mjs --lang=de[,nl,...]');
  process.exit(1);
}

/** Interface keys with their English source, from the static scan. */
const staticKeys = JSON.parse(
  execFileSync(process.execPath, [join(ROOT, 'scripts', 'check-translations.mjs'), '--json'], { encoding: 'utf8' })
);
/**
 * The runtime harvest (scripts/harvest-lt-keys.mjs --out=…), when given: it carries the
 * dynamic keys the static scan cannot see, such as the legal sections and the FAQ items.
 */
const harvestPath = args.harvest ? resolve(ROOT, args.harvest) : null;
const harvest = harvestPath && existsSync(harvestPath) ? JSON.parse(readFileSync(harvestPath, 'utf8')) : {};
const interfaceKeys = { ...harvest, ...Object.fromEntries(Object.entries(staticKeys).filter(([, v]) => v != null)) };

const LEGAL_NS = /^(legal|privacy|terms|cookies|cookie)\./;
const CLAIMS_NS = /^(certifications|manufacturing\.quality|manufacturing\.infra|home\.certs)/;
const TECHNICAL = /\b(EN|DIN|ISO|IS|BS|ETAG|CE)\s?\d|\b\d+(\.\d+)?\s?(kN|KN|mm|cm|µm|MT|kg)\b|\bclass\b|\bcertif|\bgalvani|\bwelder|\bEN ISO\b/i;

const csvCell = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;

const manifest = JSON.parse(
  execFileSync(process.execPath, [join(ROOT, 'scripts', 'check-product-i18n.mjs'), '--json'], { encoding: 'utf8' })
);

for (const code of args.lang.split(',').map((s) => s.trim()).filter(Boolean)) {
  const contentPath = join(ROOT, 'src', 'i18n', 'content', `${code}.js`);
  const productPath = join(ROOT, 'src', 'i18n', 'products', `${code}.json`);
  const content = existsSync(contentPath) ? (await import(pathToFileURL(contentPath).href)).default || {} : {};
  const products = existsSync(productPath) ? JSON.parse(readFileSync(productPath, 'utf8')) : {};

  const rows = [['section', 'key', 'english', 'translation', 'reason']];

  for (const [key, english] of Object.entries(interfaceKeys).sort(([a], [b]) => a.localeCompare(b))) {
    let reason = null;
    if (LEGAL_NS.test(key)) reason = 'legal wording';
    else if (CLAIMS_NS.test(key)) reason = 'certification or quality claim';
    else if (TECHNICAL.test(english)) reason = 'names a standard, class, load or dimension';
    if (!reason) continue;
    rows.push(['interface', key, english, content[key] ?? '', reason]);
  }

  const productReasons = {
    descriptions: 'product description, technical',
    specLabels: 'specification label',
    specValues: 'specification value',
    terms: 'catalogue vocabulary, filters and finishes',
    names: 'terminology: product name',
  };
  for (const section of ['descriptions', 'specLabels', 'specValues', 'terms', 'names']) {
    for (const english of manifest[section] || []) {
      rows.push([`product ${section}`, '', english, (products[section] || {})[english] ?? '', productReasons[section]]);
    }
  }

  mkdirSync(OUT_DIR, { recursive: true });
  const file = join(OUT_DIR, `${code}.csv`);
  // A UTF-8 byte-order mark so Excel opens the accents correctly.
  writeFileSync(file, `﻿${rows.map((r) => r.map(csvCell).join(',')).join('\r\n')}\r\n`);
  const untranslated = rows.slice(1).filter((r) => !r[3]).length;
  console.log(`${code}: ${rows.length - 1} strings to review, ${untranslated} without a translation, ${file}`);
}
