/**
 * Builds `dist/search-index.json` — the site's full-text search index.
 *
 * WHY IT READS THE PRERENDERED HTML
 * ---------------------------------
 * Page copy lives inside JSX and `src/data/*`, spread across dozens of components, so there
 * is no single place to read it from. But the build ALREADY renders every route to real
 * HTML (see prerender-routes.mjs), and that HTML is, by definition, exactly what a visitor
 * sees. Parsing it gives a true whole-site index — headings and body copy included — with
 * no per-page registration to keep in sync and nothing that can silently drift.
 *
 * Runs AFTER `vite build`, so the prerendered files exist. PRODUCT PAGES ARE EXCLUDED, by
 * the pattern below rather than by accident: the search box already matches products against
 * the catalogue at runtime, with their codes and specifications, which is better than
 * matching scraped page text. Including them as well is pure duplication, and because
 * production prerenders all 355 products in 12 languages it took this file from 1.5 MB to
 * 8.5 MB, downloaded by every visitor who types in the search box.
 *
 * The index is fetched lazily, only once the visitor actually types.
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative, sep } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');

/** Chrome, nav and boilerplate that appears on every page would match everything. */
const STRIP_SELECTOR_TAGS = ['script', 'style', 'noscript', 'svg', 'header', 'footer', 'nav'];

/**
 * Nothing is skipped. The legal pages used to be excluded here as "boilerplate", which meant
 * a visitor searching "privacy", "cookies" or "terms" got no result for the very pages that
 * answer them. If a page is on the site and a visitor can read it, it is findable.
 */
const SKIP_ROUTES = new Set();

/**
 * Routes excluded by shape rather than by name.
 *   /product/<id>  the catalogue already answers these at runtime, with better data
 *   /404           not a page anyone should be sent to from a search box
 * Locale prefixes are stripped before this runs, so one pattern covers all languages.
 */
const SKIP_PATTERNS = [
  /**
   * Product pages, at BOTH URL shapes.
   *
   * The four-segment form is the current one, /products/<category>/<subcategory>/<slug>.
   * Category and subcategory pages are two and three segments and are NOT skipped: they are
   * real destinations a search should return.
   *
   * The old /product/<id> form is kept because middleware only 301s it at the edge, so a file
   * could still exist from an older build.
   *
   * This nearly went wrong. When product URLs changed shape the old pattern stopped matching,
   * and the index went from 732 entries at 3.8 MB to 4,992 at 11.1 MB, a download every
   * visitor pays for. Re-check this whenever a URL shape or the prerender scope changes.
   */
  /^\/products\/[^/]+\/[^/]+\/[^/]+$/,
  /^\/product\//,
  /^\/404$/,
];

const decodeEntities = (s) =>
  s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&[a-z]+;/gi, ' ');

/** Remove a tag and everything inside it. */
function stripTag(html, tag) {
  const re = new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?</${tag}>`, 'gi');
  let out = html;
  let prev;
  // Repeat: nested instances of the same tag need more than one pass.
  do {
    prev = out;
    out = out.replace(re, ' ');
  } while (out !== prev);
  return out;
}

function extract(html) {
  const title = (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || '';
  const description =
    (html.match(/<meta\s+name="description"\s+content="([^"]*)"/i) || [])[1] || '';

  // Body only, minus chrome.
  let body = (html.match(/<body[^>]*>([\s\S]*)<\/body>/i) || [])[1] || '';
  for (const tag of STRIP_SELECTOR_TAGS) body = stripTag(body, tag);

  // Headings are worth more than body prose, so keep them separately for ranking.
  const headings = [...body.matchAll(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/gi)]
    .map((m) => decodeEntities(m[1].replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim())
    .filter((h) => h.length > 1 && h.length < 120);

  const text = decodeEntities(body.replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();

  return {
    title: decodeEntities(title).replace(/\s*\|\s*KEAA International\s*$/, '').trim(),
    description: decodeEntities(description).trim(),
    headings: [...new Set(headings)].slice(0, 25),
    text,
  };
}

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, files);
    else if (name === 'index.html') files.push(full);
  }
  return files;
}

if (!existsSync(DIST)) {
  console.warn('[search-index] no dist/ — run after `vite build`. Skipping.');
  process.exit(0);
}

/** Per-page body-text cap. See the note on `x` below. */
const TEXT_CAP = 16000;

const entries = [];
const truncated = [];
for (const file of walk(DIST)) {
  const rel = relative(DIST, dirname(file)).split(sep).filter(Boolean).join('/');
  const route = rel ? `/${rel}` : '/';
  if (SKIP_ROUTES.has(route)) continue;
  if (SKIP_PATTERNS.some((re) => re.test(route.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/'))) continue;

  const { title, description, headings, text } = extract(readFileSync(file, 'utf8'));
  if (!title && !text) continue;

  entries.push({
    r: route,
    t: title,
    d: description,
    h: headings,
    /**
     * Capped so the index the visitor downloads stays small. It was 4 000, which quietly
     * truncated the one page that most needs full coverage: the FAQ runs well past that, so
     * its later answers (and now the testimonials under them) were simply not searchable.
     * At 16 000 every page on this site is indexed whole; revisit only if the index grows
     * uncomfortable, and log it rather than truncating in silence.
     */
    x: text.slice(0, TEXT_CAP),
  });
  if (text.length > TEXT_CAP) {
    truncated.push(`${route} (${text.length} chars)`);
  }
}

writeFileSync(join(DIST, 'search-index.json'), JSON.stringify(entries));

const kb = (statSync(join(DIST, 'search-index.json')).size / 1024).toFixed(1);
console.log(`search-index.json: ${entries.length} pages, ${kb} KB`);
// Never truncate silently: a clipped page looks fully indexed but is not searchable to the end.
if (truncated.length) {
  console.warn(`[search-index] body text clipped at ${TEXT_CAP} chars on: ${truncated.join(', ')}`);
}
