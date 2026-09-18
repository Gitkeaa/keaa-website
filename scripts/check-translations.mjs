/**
 * Translation completeness report — the gate in front of the `live` flag.
 *
 * Scans src/ for lt() calls (see useLT in src/i18n/LocaleContext.jsx), collects every
 * namespaced key with its inline English source, and compares each content dictionary in
 * src/i18n/content/ against that set. A language may only flip `live: true` in
 * src/i18n/languages.js when this reports it complete AND its legal/spec strings have had
 * a human review — the no-half-translated-pages rule, made checkable.
 *
 * Usage:
 *   node scripts/check-translations.mjs             # completeness table
 *   node scripts/check-translations.mjs --missing=de  # list a language's missing keys
 *   node scripts/check-translations.mjs --json      # key -> English manifest on stdout
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');
const CONTENT_DIR = join(SRC, 'i18n', 'content');

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v = 'true'] = a.replace(/^--/, '').split('=');
    return [k, v];
  })
);

/** Every .js/.jsx file under src/, admin excluded — the admin console does not translate. */
function* sourceFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'admin' || entry.name === 'content') continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* sourceFiles(full);
    else if (/\.(js|jsx)$/.test(entry.name)) yield full;
  }
}

/**
 * A file declares its namespace with useLT('ns'); its lt('key', 'English…') calls then
 * produce 'ns.key'. String-literal fallbacks only — a computed fallback cannot be checked
 * here and shows up as a key with English `null`, which the table flags.
 */
/**
 * A translator is bound as `const NAME = useLT('ns')`. NAME is usually `lt`, but a file that
 * needs two namespaces binds a second one (`const ltRfq = useLT('rfq')` on the contact
 * page), so calls are matched per bound name rather than on `lt(` alone. Matching `lt(`
 * only credited every call after that second binding to the wrong namespace, which reported
 * translated strings as missing and hid the ones that really were.
 */
const DECL_RE = /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*useLT\(\s*['"]([\w.-]+)['"]\s*\)/g;
const callRegexFor = (name) =>
  new RegExp(
    `\\b${name}\\(\\s*(?:'((?:[^'\\\\]|\\\\.)*)'|"((?:[^"\\\\]|\\\\.)*)")\\s*(?:,\\s*(?:'((?:[^'\\\\]|\\\\.)*)'|"((?:[^"\\\\]|\\\\.)*)"))?`,
    'gs'
  );

const keys = new Map(); // 'ns.key' -> english | null
let filesWithCalls = 0;

for (const file of sourceFiles(SRC)) {
  const text = readFileSync(file, 'utf8');
  const decls = [...text.matchAll(DECL_RE)].map((m) => ({ name: m[1], ns: m[2], index: m.index }));
  if (!decls.length) continue;
  filesWithCalls++;
  /**
   * Source-order scoping: a file may hold several components, each binding its own `lt`,
   * so a call is attributed to the CLOSEST PRECEDING binding of that same name. Calls
   * before the first binding cannot exist (the name would be undefined there).
   */
  for (const name of new Set(decls.map((d) => d.name))) {
    const mine = decls.filter((d) => d.name === name);
    for (const c of text.matchAll(callRegexFor(name))) {
      const decl = mine.filter((d) => d.index < c.index).pop();
      if (!decl) continue;
      const key = (c[1] ?? c[2] ?? '').replace(/\\(.)/g, '$1');
      const english = c[3] != null || c[4] != null ? (c[3] ?? c[4]).replace(/\\(.)/g, '$1') : null;
      if (!key) continue;
      const id = `${decl.ns}.${key}`;
      if (!keys.has(id) || keys.get(id) === null) keys.set(id, english);
    }
  }
}

if (args.json) {
  console.log(JSON.stringify(Object.fromEntries([...keys.entries()].sort()), null, 1));
  process.exit(0);
}

console.log(`lt() keys found: ${keys.size} across ${filesWithCalls} files\n`);
const noEnglish = [...keys.entries()].filter(([, v]) => v === null).map(([k]) => k);
if (noEnglish.length) {
  console.log(`keys with a computed (uncheckable) English fallback: ${noEnglish.length}`);
  for (const k of noEnglish) console.log(`  ~ ${k}`);
  console.log('');
}

const contentFiles = existsSync(CONTENT_DIR)
  ? readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.js'))
  : [];

if (!contentFiles.length) {
  console.log('No content dictionaries in src/i18n/content/ yet — every language is at 0%.');
  process.exit(0);
}

for (const file of contentFiles.sort()) {
  const code = file.replace(/\.js$/, '');
  const mod = await import(pathToFileURL(join(CONTENT_DIR, file)).href);
  const dict = mod.default || {};
  const have = Object.keys(dict);
  const missing = [...keys.keys()].filter((k) => !(k in dict));
  const extra = have.filter((k) => !keys.has(k));
  const pct = keys.size ? Math.round(((keys.size - missing.length) / keys.size) * 100) : 100;
  console.log(
    `${code}: ${keys.size - missing.length}/${keys.size} (${pct}%)` +
      (extra.length ? `, ${extra.length} stale key(s) no lt() call uses` : '')
  );
  if (args.missing === code) {
    for (const k of missing) console.log(`  - ${k}`);
    for (const k of extra) console.log(`  + stale: ${k}`);
  }
}
console.log('\nA language is eligible for `live: true` only at 100% with legal/spec strings human-reviewed.');
