/**
 * Merges a batch of translated strings into a language's content dictionary.
 *
 * The dictionaries in src/i18n/content/<code>.js are generated files: one flat, sorted map
 * of `"namespace.key": "text"` under a header comment. Editing them by hand for a hundred
 * new keys is error-prone, so a translation run is delivered as a JSON patch
 * (`{ "home.hero.tagline": "…", … }`) and merged here: existing keys are overwritten only
 * when --overwrite is given, new keys are added, the map is re-sorted and the header comment
 * is kept exactly as it was.
 *
 * Usage:
 *   node scripts/merge-translations.mjs --lang=de --patch=path/to/de.patch.json
 *   node scripts/merge-translations.mjs --lang=de --patch=… --overwrite   replace existing values too
 *   node scripts/merge-translations.mjs --lang=de --patch=… --dry         report only, write nothing
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_DIR = join(ROOT, 'src', 'i18n', 'content');

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v = 'true'] = a.replace(/^--/, '').split('=');
    return [k, v];
  })
);

if (!args.lang || !args.patch) {
  console.error('usage: node scripts/merge-translations.mjs --lang=<code> --patch=<file.json> [--overwrite] [--dry]');
  process.exit(1);
}

const file = join(CONTENT_DIR, `${args.lang}.js`);
if (!existsSync(file)) {
  console.error(`no dictionary for "${args.lang}" at ${file}`);
  process.exit(1);
}

const patch = JSON.parse(readFileSync(resolve(ROOT, args.patch), 'utf8'));
const current = (await import(pathToFileURL(file).href)).default || {};
const source = readFileSync(file, 'utf8');
const headerEnd = source.indexOf('export default {');
const header = headerEnd >= 0 ? source.slice(0, headerEnd) : '';

let added = 0;
let replaced = 0;
let kept = 0;
const merged = { ...current };
for (const [key, value] of Object.entries(patch)) {
  if (typeof value !== 'string') continue;
  if (!(key in merged)) {
    merged[key] = value;
    added++;
  } else if (args.overwrite === 'true' && merged[key] !== value) {
    merged[key] = value;
    replaced++;
  } else {
    kept++;
  }
}

const body = Object.keys(merged)
  .sort((a, b) => a.localeCompare(b, 'en'))
  .map((k) => ` ${JSON.stringify(k)}: ${JSON.stringify(merged[k])},`)
  .join('\n');
const out = `${header}export default {\n${body}\n};\n`;

console.log(`${args.lang}: ${added} added, ${replaced} replaced, ${kept} unchanged, ${Object.keys(merged).length} keys total`);
if (args.dry !== 'true') {
  writeFileSync(file, out);
  console.log(`wrote ${file}`);
}
