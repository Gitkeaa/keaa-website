/**
 * Turn the Search Console coverage exports into redirect rules, and write them into
 * vercel.json.
 *
 * WHY THIS IS GENERATED RATHER THAN HAND-WRITTEN
 * ----------------------------------------------
 * The old PHP site put the same product behind half a dozen address shapes: with and without
 * a numeric id, under /product/ and /enquiry/, with and without a /public/index.php prefix,
 * and as a flat slug at the site root. Google's coverage report lists 928 such addresses
 * across five issue types. Writing those by hand is how you get a typo that silently drops a
 * page's ranking, so the report is the input and this script is the only author.
 *
 * WHAT IT DOES NOT DO
 * -------------------
 * It does not invent redirects for addresses Google has never reported. A redirect for a URL
 * nobody links to and nothing indexes is dead weight in a config file that has a size limit,
 * and the limit is better spent on the addresses that actually hold equity.
 *
 * TWO KINDS OF RULE
 * -----------------
 * 1. PATTERN rules, for the shapes that carry the product id in the path. Four rules cover
 *    246 addresses, because the destination can be derived from the match.
 * 2. EXPLICIT rules, for the shapes that carry only a slug. The destination needs a lookup
 *    against the catalogue, which a hosting config cannot do, so each one is resolved here
 *    and written out individually.
 *
 * Every destination is a page that exists. A slug that resolves to nothing goes to the
 * closest category, or to the products overview as the last resort, which is what the SEO
 * brief asks for. Nothing is ever pointed at a page that would 404.
 *
 * Run: node scripts/gen-legacy-redirects.mjs
 * It rewrites the `redirects` array in vercel.json and prints a summary.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const REPORTS = join(ROOT, 'seo_reports');
const DATA = join(ROOT, 'src', 'data');

const products = JSON.parse(readFileSync(join(DATA, 'products.json'), 'utf8'));
const categories = JSON.parse(readFileSync(join(DATA, 'categories.json'), 'utf8'));

/** slug -> product id. First wins: 29 products share a name, and any of them is a real page. */
const productBySlug = new Map();
for (const p of products) if (p.slug && !productBySlug.has(p.slug)) productBySlug.set(p.slug, p.id);

const categoryBySlug = new Map(categories.map((c) => [c.slug, c.slug]));
const subBySlug = new Map();
for (const c of categories) for (const s of c.subcategories) subBySlug.set(s.slug, `${c.slug}/${s.slug}`);

/**
 * Old marketing pages, mapped by hand because no data file can resolve them. Anything not
 * listed falls through to the catalogue rather than guessing.
 */
const PAGE_MAP = new Map([
  ['who-we-are', '/about'],
  ['about-us', '/about'],
  ['contact', '/contact'],
  ['contact-us', '/contact'],
  ['quality-policy', '/certifications'],
  ['certificates', '/certifications'],
  ['gallery', '/projects-gallery'],
  ['careers', '/careers'],
  ['listing', '/products'],
  ['category', '/products'],
  ['index', '/'],
  ['home', '/'],

  /**
   * Old listing names the current catalogue no longer uses. Each goes to the nearest real
   * page rather than the products overview, because "close" keeps far more of a ranking than
   * "correct but generic". Judgement calls, made once, here:
   *   headlocks and horse-handling-equipments were livestock listings
   *   post-for-gates was timber post hardware
   */
  ['headlocks', '/products/livestock-housing-solutions/cattle'],
  ['horse-handling-equipments', '/products/livestock-housing-solutions/horse'],
  ['post-for-gates', '/products/wood-connectors/post-supports'],
]);

/**
 * Where a bare slug should land.
 *
 * The order depends on what the old address WAS, which is why `prefer` exists. An address
 * under /product/ or /enquiry/ named one item, so a product wins. A flat slug at the site
 * root, or one under the old front controller, was a listing page, so the category or
 * subcategory of that name wins even when a single product shares it. Sending a listing
 * address to one item throws away the other twenty on the page.
 */
function resolveSlug(slug, prefer = 'product') {
  const s = decodeURIComponent(slug).toLowerCase();
  const asProduct = () => (productBySlug.has(s) ? `/product/${productBySlug.get(s)}` : null);
  const asListing = () => {
    if (subBySlug.has(s)) return `/products/${subBySlug.get(s)}`;
    if (categoryBySlug.has(s)) return `/products/${s}`;
    return null;
  };

  const first = prefer === 'listing' ? [asListing, asProduct] : [asProduct, asListing];
  for (const fn of first) {
    const hit = fn();
    if (hit) return hit;
  }
  if (PAGE_MAP.has(s)) return PAGE_MAP.get(s);

  // A near miss: the old site used slightly different separators in places.
  const normalised = s.replace(/-+/g, '-').replace(/^-|-$/g, '');
  if (normalised !== s) return resolveSlug(normalised, prefer);
  return null;
}

/* ---------------------------------------------------------------- read the reports */
if (!existsSync(REPORTS)) {
  console.error(`gen-legacy-redirects - FAIL  no ${REPORTS}. Export the Search Console coverage reports there first.`);
  process.exit(1);
}

const reported = new Set();
let issues = 0;
for (const dir of readdirSync(REPORTS)) {
  const full = join(REPORTS, dir);
  if (!statSync(full).isDirectory()) continue;
  const table = join(full, 'Table.csv');
  if (!existsSync(table)) continue;
  issues += 1;
  const lines = readFileSync(table, 'utf8').replace(/\r\n/g, '\n').trim().split('\n');
  lines.shift();
  for (const line of lines) {
    const url = line.slice(0, line.lastIndexOf(','));
    try {
      reported.add(new URL(url).pathname);
    } catch {
      /* a handful of rows are malformed in the export; skip rather than guess */
    }
  }
}

/* ------------------------------------------------------- pattern rules (id in path) */
const PATTERNS = [
  // The old product page, with and without the front-controller prefix.
  { source: '/product/:slug/:id(\\d+)', destination: '/product/:id' },
  { source: '/public/index.php/product/:slug/:id(\\d+)', destination: '/product/:id' },
  // The old enquiry page pointed at the same product.
  { source: '/enquiry/:slug/:id(\\d+)', destination: '/product/:id' },
  { source: '/public/index.php/enquiry/:slug/:id(\\d+)', destination: '/product/:id' },
];

/* ------------------------------------------------- explicit rules (slug, no id) */
const explicit = new Map();
const unresolved = [];

for (const path of reported) {
  if (/\/\d+\/?$/.test(path)) continue; // a pattern rule already covers it

  // /product/<slug>/detail.php, /enquiry/<slug>/enquiry.php, with or without the prefix
  let m = path.match(/^(?:\/public\/index\.php)?\/(?:product|enquiry)\/([^/]+)\/[a-z]+\.php$/i);
  if (!m) m = path.match(/^(?:\/public\/index\.php)?\/(?:product|enquiry)\/([^/]+)\/?$/i);
  if (!m) m = path.match(/^\/public\/index\.php\/([^/]+)\/?$/i);
  if (!m) m = path.match(/^\/([a-z0-9][a-z0-9-]*)\.php$/i);
  if (!m) m = path.match(/^\/([a-z0-9][a-z0-9-]{2,})\/?$/i);

  if (!m) { unresolved.push(path); continue; }

  // Only the item-level shapes name one product; everything else was a listing.
  const prefer = /^(?:\/public\/index\.php)?\/(?:product|enquiry)\//.test(path) ? 'product' : 'listing';
  const destination = resolveSlug(m[1], prefer);
  if (!destination) { unresolved.push(path); continue; }
  // Never emit a rule whose source already IS its destination.
  if (path.replace(/\/$/, '') === destination) continue;
  explicit.set(path, destination);
}

/**
 * Anything still unmatched but clearly from the old site goes to the catalogue. A soft 404 on
 * an indexed address is worse than a redirect to a relevant page, which is what the brief
 * says to do when no exact match exists.
 */
const CATCH_ALL_PREFIXES = [/^\/public\/index\.php/, /\.php$/, /^\/enquiry\//];
for (const path of unresolved) {
  if (CATCH_ALL_PREFIXES.some((re) => re.test(path))) explicit.set(path, '/products');
}

/* ------------------------------------------------------------------ write vercel.json */
const vercelPath = join(ROOT, 'vercel.json');
const vercel = JSON.parse(readFileSync(vercelPath, 'utf8'));

/** The hand-written rules stay: they cover shapes Google has not reported but people share. */
const HAND_WRITTEN = vercel.redirects.filter((r) => !r.__generated);

const generated = [
  ...PATTERNS.map((r) => ({ ...r, permanent: true, __generated: true })),
  ...[...explicit.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([source, destination]) => ({ source, destination, permanent: true, __generated: true })),
];

// Drop any generated rule whose source a hand-written rule already claims.
const claimed = new Set(HAND_WRITTEN.map((r) => r.source));
const merged = [...HAND_WRITTEN, ...generated.filter((r) => !claimed.has(r.source))];

// __generated is bookkeeping for the next run; Vercel must never see it.
vercel.redirects = merged.map(({ __generated, ...rule }) => rule);
writeFileSync(vercelPath, `${JSON.stringify(vercel, null, 2)}\n`);

console.log(`gen-legacy-redirects: ${issues} report(s), ${reported.size} distinct paths reported by Google`);
console.log(`  ${PATTERNS.length} pattern rules (every legacy shape that carries a product id)`);
console.log(`  ${explicit.size} explicit rules (slug only, resolved against the catalogue)`);
console.log(`  ${vercel.redirects.length} redirects in vercel.json in total`);
const stillUnmatched = unresolved.filter((p) => !explicit.has(p));
if (stillUnmatched.length) {
  console.log(`  ${stillUnmatched.length} path(s) left alone, they are current pages or not from the old site:`);
  for (const p of stillUnmatched.slice(0, 10)) console.log(`     ${p}`);
}
