/**
 * Pre-deploy guard: proves no server-side secret ended up in the browser bundle.
 *
 * Vite inlines every `VITE_*` variable into the JS at BUILD time as plain text, and leaves
 * everything else behind in the Node process. That split is the whole security model, and
 * it is silent — nothing warns you the day someone renames `ANTHROPIC_API_KEY` to
 * `VITE_ANTHROPIC_KEY` to "make it work in the component". The key just ships, readable in
 * DevTools → Sources by every visitor.
 *
 * So this reads the real values out of .env and greps the built output for them. It checks
 * the actual artifact rather than the source, which is the only place the answer is
 * definitive: source can look clean while the bundle is not (an inlined var, a prerendered
 * HTML page that captured runtime state, a stray .env copied by a deploy script).
 *
 * Three classes of failure, all exit 1:
 *   1. A non-VITE_ value from .env appears verbatim in dist/          → the leak itself
 *   2. A provider key pattern appears in dist/ (AIza…, AQ.…, sk-…)    → catches keys
 *      hardcoded in source, which .env scanning alone would miss
 *   3. An .env file sits inside dist/                                 → fetchable at /.env
 *
 * Plus warnings (exit 0) about the API wiring, checked against the build INPUT: the site
 * calls its API on its own origin and vercel.json must proxy /api to the backend over https;
 * and VITE_API_DIRECT_ORIGIN, if set, must not point at localhost, or every public form
 * fails for every visitor. After minification neither can be told from the output.
 *
 * Run `npm run check:secrets` after `npm run build`, before uploading dist/.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative, extname } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');

/** Vite loads these in the same order; later files win. Mirrored so we test what it saw. */
const ENV_FILES = ['.env', '.env.local', '.env.production', '.env.production.local'];

/** Only text output can leak a string. Skipping images/fonts keeps this fast on a full dist. */
const TEXT_EXT = new Set(['.js', '.mjs', '.cjs', '.css', '.html', '.json', '.xml', '.txt', '.svg', '.map']);

/**
 * Values too short or too generic to be a credential. Without this, PORT=3001 matches every
 * bundle that happens to contain "3001" and the check cries wolf until someone disables it.
 */
const PLACEHOLDER = /^(your-|changeme|placeholder|example|<.*>$|https:\/\/api\.your-backend-host)/i;
const isSecretish = (value) => value.length >= 12 && !PLACEHOLDER.test(value) && !/^\d+$/.test(value);

/**
 * Provider key shapes, for keys that never went through .env at all. Deliberately narrow —
 * a loose entropy heuristic fires on minified variable names and hashed asset filenames.
 */
const KEY_PATTERNS = [
  { name: 'Google API key', re: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { name: 'Google Cloud AQ key', re: /\bAQ\.[0-9A-Za-z_-]{30,}\b/ },
  { name: 'OpenAI key', re: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
  { name: 'Anthropic key', re: /\bsk-ant-[A-Za-z0-9_-]{20,}\b/ },
  { name: 'AWS access key id', re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'Cloudinary credentials URL', re: /cloudinary:\/\/\d+:[A-Za-z0-9_-]+@/ },
  { name: 'Private key block', re: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
];

/** Every env pair Vite would have seen, later files overriding earlier ones. */
function loadEnv() {
  const pairs = new Map();
  for (const file of ENV_FILES) {
    const path = join(ROOT, file);
    if (!existsSync(path)) continue;
    for (const rawLine of readFileSync(path, 'utf8').split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq < 1) continue;
      const key = line.slice(0, eq).trim();
      // Strip one layer of matching quotes, the way dotenv and Vite both do.
      const value = line.slice(eq + 1).trim().replace(/^(['"])(.*)\1$/, '$2');
      pairs.set(key, { value, file });
    }
  }
  return pairs;
}

/** Every scannable file under dist/, recursively. */
function textFiles(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) textFiles(path, out);
    else if (TEXT_EXT.has(extname(entry).toLowerCase())) out.push(path);
  }
  return out;
}

if (!existsSync(DIST)) {
  console.error('check:secrets — no dist/ to scan. Run `npm run build` first.');
  process.exit(1);
}

const env = loadEnv();
const failures = [];
const warnings = [];

// 1. Server-only values from .env, appearing verbatim in the shipped bundle.
const guarded = [...env.entries()].filter(([k, { value }]) => !k.startsWith('VITE_') && isSecretish(value));
const files = textFiles(DIST);

for (const path of files) {
  const text = readFileSync(path, 'utf8');
  const where = relative(ROOT, path);

  for (const [key, { value, file }] of guarded) {
    if (text.includes(value)) {
      failures.push(`${key} (from ${file}) is present in ${where} — this key is public.`);
    }
  }

  for (const { name, re } of KEY_PATTERNS) {
    const hit = text.match(re);
    if (hit) {
      // Show enough to identify the key, never the whole thing — CI logs get shared.
      failures.push(`${name} found in ${where}: ${hit[0].slice(0, 12)}…`);
    }
  }
}

// 2. An .env dropped into the deploy root is fetchable at https://site/.env. Bots scan for it.
for (const file of readdirSync(DIST)) {
  if (file.startsWith('.env')) failures.push(`dist/${file} would be served publicly. Delete it.`);
}

// 3. Build INPUT check — the API wiring that silently breaks every public form.
//    Production calls the API same-origin (/api/...) and vercel.json proxies that to the
//    backend, so what must be right is the rewrite, not an env var.
const direct = process.env.VITE_API_DIRECT_ORIGIN || env.get('VITE_API_DIRECT_ORIGIN')?.value || '';
if (direct && /localhost|127\.0\.0\.1/.test(direct)) {
  warnings.push(`VITE_API_DIRECT_ORIGIN is "${direct}". Fine for local testing, broken if this build is deployed.`);
}
if (env.has('VITE_ADMIN_API') || process.env.VITE_ADMIN_API) {
  warnings.push('VITE_ADMIN_API is set but retired and ignored. The API is reached same-origin through the vercel.json rewrite; remove the variable.');
}
if (!direct) {
  try {
    const vercel = JSON.parse(readFileSync(join(ROOT, 'vercel.json'), 'utf8'));
    const api = (vercel.rewrites || []).find((r) => r.source === '/api/(.*)');
    if (!api) warnings.push('vercel.json has no rewrite for /api/(.*). Every public form and the admin console will 404 in production.');
    else if (!/^https:\/\//.test(api.destination)) warnings.push(`vercel.json rewrites /api to "${api.destination}", which is not an https backend.`);
  } catch (e) {
    warnings.push(`vercel.json could not be read (${e.message}); the /api proxy cannot be verified.`);
  }
}

for (const w of warnings) console.warn(`check:secrets — WARN  ${w}`);

if (failures.length) {
  for (const f of failures) console.error(`check:secrets — FAIL  ${f}`);
  console.error(`\ncheck:secrets: ${failures.length} leak(s) across ${files.length} files. Do not deploy this build.`);
  process.exit(1);
}

console.log(
  `check:secrets: clean — ${files.length} files scanned, ` +
    `${guarded.length} server-only value(s) confirmed absent, ${KEY_PATTERNS.length} key patterns checked` +
    (warnings.length ? `, ${warnings.length} warning(s)` : ''),
);
