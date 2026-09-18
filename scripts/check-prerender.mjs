/**
 * Build gate: refuse to ship a build whose pages all carry the homepage's head tags.
 *
 * THE FAILURE THIS CATCHES
 * ------------------------
 * Prerendering is conditional on finding a browser (see findChromium in
 * prerender-routes.mjs). When none is found the build still succeeds and produces a
 * perfectly working site, so nothing looks wrong locally. What actually ships is the plain
 * SPA: one index.html served for every URL, which means every page tells Google
 * "canonical: the homepage" and every shared link previews with the homepage title.
 *
 * That is exactly what happened on Vercel for months. The build image has no Chrome, the
 * warning scrolled past in the build log, and the live site served the same 4.8 KB shell on
 * all 4,800 URLs while the code that sets per-page titles and canonicals worked fine in the
 * browser, where no crawler was looking.
 *
 * A silent downgrade that costs the entire search presence must not be a warning. It is an
 * error, and this makes the build fail instead.
 *
 * WHAT IT CHECKS
 *   1. A sample of routes produced their own dist/<route>/index.html
 *   2. Each one's canonical points at ITSELF, not at the homepage
 *   3. Each one's <title> differs from the homepage's
 *
 * Run after `vite build`, as part of `npm run build`.
 */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const SITE = 'https://www.keaainternational.com';

/** Read a built page, or null when the route produced no HTML of its own. */
function readPage(route) {
  const file = route === '/' ? join(DIST, 'index.html') : join(DIST, route, 'index.html');
  return existsSync(file) ? readFileSync(file, 'utf8') : null;
}

const canonicalOf = (html) => (html.match(/<link rel="canonical"[^>]*href="([^"]+)"/i) || [])[1] || null;
const titleOf = (html) => (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1]?.trim() || null;

const home = readPage('/');
if (!home) {
  console.error('check:prerender - FAIL  dist/index.html is missing. Did the build run?');
  process.exit(1);
}
const homeTitle = titleOf(home);

/**
 * Routes that must always exist and must always be distinct from the homepage. Deliberately
 * a small fixed list rather than the full route set: this is a smoke test for "did
 * prerendering run at all", and it has to keep working when the catalogue changes.
 */
const SAMPLE = ['/about', '/products', '/contact', '/careers'];

const failures = [];
let checked = 0;

for (const route of SAMPLE) {
  const html = readPage(route);
  if (!html) {
    failures.push(`${route} produced no dist${route}/index.html, so it will serve the homepage shell.`);
    continue;
  }
  checked += 1;

  const canonical = canonicalOf(html);
  const expected = `${SITE}${route}`;
  if (!canonical) failures.push(`${route} has no canonical tag.`);
  else if (canonical.replace(/\/$/, '') !== expected) {
    failures.push(`${route} canonical is "${canonical}", expected "${expected}".`);
  }

  const title = titleOf(html);
  if (!title) failures.push(`${route} has no <title>.`);
  else if (title === homeTitle) failures.push(`${route} has the homepage title, so its head tags were not rendered.`);
}

if (failures.length) {
  console.error('\ncheck:prerender - FAIL');
  for (const f of failures) console.error(`  ${f}`);
  console.error(
    '\nPrerendering did not run, or did not produce per-page head tags. Almost always this means\n' +
      'no browser was found: the build needs Chrome. On Vercel the build command installs it\n' +
      '("npx puppeteer browsers install chrome", see vercel.json); locally, install Chrome or set\n' +
      'PRERENDER_BROWSER to a Chrome, Edge or Chromium binary.\n' +
      'Shipping without it serves the homepage title and canonical on every URL.\n'
  );
  process.exit(1);
}

console.log(`check:prerender: ok - ${checked} sampled routes have their own canonical and title.`);
