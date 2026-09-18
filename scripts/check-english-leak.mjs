/**
 * English-leak check: does any English text survive on a foreign-language page?
 *
 * The two coverage scripts (check-translations.mjs, check-product-i18n.mjs) prove that every
 * KNOWN string has a translation. This one proves the opposite direction from the reader's
 * side: it takes the prerendered HTML of every live language (dist/<code>/...) and compares
 * its visible text, segment by segment, with the English page at the same route. A segment
 * that is identical in both is English that leaked, unless it is a proper noun, a code, an
 * address or a standard, which read the same in every language and are allowed below.
 *
 * Needs a prerendered build (npm run build with a Chromium available), because it reads
 * what the visitor's browser would receive. Product pages are not prerendered by default:
 * their dictionary coverage is measured by check-product-i18n.mjs, and `--runtime` renders
 * a sample of them (plus a catalogue listing and the quotation form) in a headless browser
 * against a local copy of dist/ and runs the same comparison on what the browser shows.
 *
 * Usage:
 *   node scripts/check-english-leak.mjs              per-route table for every live language
 *   node scripts/check-english-leak.mjs --lang=de    one language, and list every leaked segment
 *   node scripts/check-english-leak.mjs --runtime    also render the sample pages in a browser
 *   node scripts/check-english-leak.mjs --strict     exit 1 when anything leaked
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, extname, join, relative, sep } from 'node:path';
import { liveLocales } from '../src/i18n/languages.js';
import { strings as uiStrings } from '../src/i18n/locales.js';
import { countriesData } from '../src/data/countriesData.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v = 'true'] = a.replace(/^--/, '').split('=');
    return [k, v];
  })
);

/**
 * Text that legitimately reads the same in every language. Exact strings first, then
 * patterns. Add here only what is genuinely language-neutral; a real English sentence that
 * "happens to be fine" is a translation gap, not an allowance.
 */
const ALLOW_EXACT = new Set([
  'KEAA', 'KEAA International', 'KEAA International Pvt. Ltd.', 'Runi Industries B.V.',
  'TÜV Rheinland', 'MSME Sustainable (ZED), Govt. of India', 'SLV Germany', 'Sigma Karlsruhe',
  'LinkedIn', 'WhatsApp', 'YouTube', 'Facebook', 'Instagram', 'X', 'Uber', 'Ola', 'Rapido',
  'Ringlock', 'Cuplock', 'Haki', 'Plettac', 'Dywidag', 'Kwikstage',
  'Om Parkash Sharma', 'Raveesh Moudgil', 'Sumit Moudgil', 'Bhupesh Moudgil', 'Vikram Singh',
  'Jaskamal Singh', 'Ajay Kumar', 'Harpreet Singh',
  // Sales team and testimonial authors (contact and FAQ pages).
  'Bhupesh Gautam', 'Ajay Rana', 'Sumeet Dogra', 'Amarjot Singh',
  'Rajesh Kumar', 'BuildTech Constructors, India', 'David Williams', 'ProBuild Industries, UK',
  'Carlos Mendez', 'Mendez Construcciones, Mexico',
  // Certification names as issued.
  'ZED Silver', 'Zero Defect Zero Effect, MSME Sustainable (ZED), Govt. of India',
  // The lowercase word mark in the home hero.
  'keaa',
  'Village Bhagwanpura, Dehlon Road', 'Ludhiana – 141120, Punjab, India', 'Ludhiana, India',
  'Village Bhagwanpura, Dehlon Road, Ludhiana – 141120, Punjab, India',
  'Park Forum 1005', '5657 HJ Eindhoven, The Netherlands',
  'Riverside Residences',
]);
const ALLOW_PATTERNS = [
  /^[\w.+-]+@[\w.-]+\.\w+$/, // email
  /^\+?[\d\s()./-]{6,}$/, // phone
  /^(https?:\/\/|www\.)/, // url
  /^(ISO|EN|DIN|IS|BS|ASTM|ETAG)\s?[\d:/-]+/, // a standard number
  /^(ISO|EN|DIN)\b.*\b\d{3,}/, // "ISO 9001:2015 (Quality Management)" style
  /^KI[A-Z][\w\s./()-]*$/, // KEAA item code
  /^KI[A-Z0-9-][\w.&øÜ/()-]*$/, // KEAA item code with ø, Ü or & (KIT-RT-ø25LD, KIRAC(Ü), KIEA-S&D)
  /^[A-Za-z]+(-[A-Za-z0-9ø.]+){2,}$/, // hyphenated part codes (Accessories-Cuplock-CLB)
  /^[A-Z]{2,}_[A-Z0-9]{2,}$/, // underscore part codes (LHB_GH)
  /^KEAA Film \d+$/, // gallery film captions
  /^[A-Z0-9][A-Z0-9 .,:/()+×x-]*$/, // codes, sizes, "M12/M14", "S235JR"
  /^[\d\s.,:/()+×x%°ø-]+(\s?(mm|cm|m|kg|kN|KN|MT|µm|sq\.? ?m|sq\.? ?ft|g\/m2))?$/i, // numbers with units
  /^(Ø|ø)\s?[\d.]+/, // tube diameters
  /^\d{4}$/, // a year
  /^\+?\d+\+?$/, // "42+"
];

const allowed = (s) => ALLOW_EXACT.has(s) || ALLOW_PATTERNS.some((re) => re.test(s));

/**
 * Every string a language's own dictionaries produce. Text that a translator deliberately
 * mapped to the same word as English ("Downloads", "Home", "Menu" in Dutch) is a
 * translation, not a leak, and only the dictionaries can tell the two apart.
 */
async function ownWords(code) {
  const set = new Set();
  const add = (v) => {
    if (typeof v === 'string') set.add(v.replace(/\s+/g, ' ').trim());
  };
  for (const v of Object.values(uiStrings[code] || {})) add(v);
  const content = join(ROOT, 'src', 'i18n', 'content', `${code}.js`);
  if (existsSync(content)) {
    for (const v of Object.values((await import(pathToFileURL(content).href)).default || {})) add(v);
  }
  const products = join(ROOT, 'src', 'i18n', 'products', `${code}.json`);
  if (existsSync(products)) {
    for (const section of Object.values(JSON.parse(readFileSync(products, 'utf8')))) {
      for (const v of Object.values(section)) add(v);
    }
  }
  // Country names come from the browser (Intl.DisplayNames in CountrySelect), not from a
  // dictionary; a language whose own word is the English one ("India" in Dutch) is correct.
  try {
    const names = new Intl.DisplayNames([code], { type: 'region' });
    for (const c of countriesData) add(names.of(c.iso));
  } catch {
    // An unknown locale tag: no country names to allow.
  }
  return set;
}

const decode = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));

/** The visible text of a page as a set of segments (one per element's text run). */
function segments(html) {
  let h = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');
  // Only what is inside <body>: head tags were already checked by the meta checks.
  const body = h.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (body) h = body[1];
  const out = new Set();
  for (const raw of h.split(/<[^>]+>/)) {
    const s = decode(raw).replace(/\s+/g, ' ').trim();
    if (s.length < 4 || !/[A-Za-z]{3,}/.test(s)) continue;
    out.add(s);
  }
  return out;
}

function routesOf(dir, base = dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) routesOf(full, base, acc);
    else if (name === 'index.html') acc.push(relative(base, dirname(full)).split(sep).filter(Boolean).join('/'));
  }
  return acc;
}

if (!existsSync(DIST)) {
  console.error('check-english-leak: dist/ not found. Run `npm run build` first.');
  process.exit(1);
}

const locales = args.lang ? [args.lang] : liveLocales();
let leakedTotal = 0;
let segmentsTotal = 0;

for (const code of locales) {
  const dir = join(DIST, code);
  if (!existsSync(dir)) {
    console.log(`${code}: no prerendered pages in dist/${code}/ (language not live, or build ran without a browser)`);
    continue;
  }
  const routes = routesOf(dir);
  const words = await ownWords(code);
  let leakedLang = 0;
  let segLang = 0;
  const rows = [];
  for (const route of routes) {
    const en = join(DIST, route, 'index.html');
    const own = join(dir, route, 'index.html');
    if (!existsSync(en)) continue;
    const enSet = segments(readFileSync(en, 'utf8'));
    const ownSet = segments(readFileSync(own, 'utf8'));
    const leaked = [...ownSet].filter((s) => enSet.has(s) && !allowed(s) && !words.has(s));
    segLang += ownSet.size;
    leakedLang += leaked.length;
    rows.push({ route: `/${code}${route ? `/${route}` : ''}`, total: ownSet.size, leaked });
  }
  segmentsTotal += segLang;
  leakedTotal += leakedLang;
  const pct = segLang ? Math.round((leakedLang / segLang) * 100) : 0;
  console.log(`${code}: ${leakedLang} English segment(s) left across ${rows.length} pages (${pct}% of ${segLang})`);
  if (args.lang || args.verbose === 'true') {
    for (const r of rows) {
      if (!r.leaked.length) continue;
      console.log(`  ${r.route}  (${r.leaked.length}/${r.total})`);
      for (const s of r.leaked) console.log(`     · ${s.length > 110 ? `${s.slice(0, 110)}…` : s}`);
    }
  }
}

let runtimeLeaked = 0;
if (args.runtime === 'true') runtimeLeaked = await runtimeCheck(locales);

console.log(
  `\nTotal: ${leakedTotal} English segment(s) in prerendered pages` +
    (args.runtime === 'true' ? ` and ${runtimeLeaked} in browser-rendered sample pages` : '') +
    ` across ${locales.length} language(s), ${segmentsTotal} prerendered segments checked.`
);
if (args.strict === 'true' && leakedTotal + runtimeLeaked > 0) process.exit(1);

async function runtimeCheck(codes) {
  /**
   * The browser-rendered sample: product pages of every category, one subcategory listing
   * (its filters and cards), and the quotation form with its product picker labels.
   */
  const RUNTIME_ROUTES = [
    '/product/136',
    '/product/281',
    '/product/94',
    '/product/119',
    '/product/13',
    '/products/scaffolding-formworks/slab-formwork-system-props',
    '/products/livestock-housing-solutions/cattle',
    '/contact?tab=rfq',
  ];
  const { default: puppeteer } = await import('puppeteer');
  const { findChromium } = await import('./prerender-routes.mjs');
  const { createServer } = await import('node:http');
  const { readFile } = await import('node:fs/promises');

  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || findChromium();
  if (!executablePath) {
    console.log('\nBrowser-rendered sample skipped: no Chrome or Chromium found (set PUPPETEER_EXECUTABLE_PATH).');
    return 0;
  }

  const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.woff2': 'font/woff2',
    '.xml': 'application/xml',
  };
  // Static dist/ with the SPA fallback the real host applies: a route with no prerendered
  // file gets index.html, and the app reads the language from the URL as it would live.
  const server = createServer(async (req, res) => {
    const url = decodeURIComponent((req.url || '/').split('?')[0]);
    const candidates = [join(DIST, url), join(DIST, url, 'index.html'), join(DIST, 'index.html')];
    for (const file of candidates) {
      if (!file.startsWith(DIST) || !existsSync(file) || statSync(file).isDirectory()) continue;
      res.writeHead(200, { 'content-type': MIME[extname(file).toLowerCase()] || 'application/octet-stream' });
      res.end(await readFile(file));
      return;
    }
    res.writeHead(404).end('not found');
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const origin = `http://127.0.0.1:${server.address().port}`;

  const browser = await puppeteer.launch({
    headless: true,
    executablePath,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000 });
  await page.setRequestInterception(true);
  page.on('request', (req) =>
    ['image', 'media', 'font'].includes(req.resourceType()) ? req.abort() : req.continue()
  );

  const render = async (route) => {
    await page.goto(origin + route, { waitUntil: 'networkidle0', timeout: 60_000 });
    await new Promise((r) => setTimeout(r, 800));
    const text = await page.evaluate(() => document.body.innerText);
    return new Set(
      text
        .split('\n')
        .map((s) => s.replace(/\s+/g, ' ').trim())
        .filter((s) => s.length >= 4 && /[A-Za-z]{3,}/.test(s))
    );
  };

  const english = new Map();
  for (const r of RUNTIME_ROUTES) english.set(r, await render(r));

  let leaked = 0;
  console.log('\nBrowser-rendered sample (product pages are not prerendered):');
  for (const code of codes) {
    const words = await ownWords(code);
    let n = 0;
    const rows = [];
    for (const r of RUNTIME_ROUTES) {
      const own = await render(`/${code}${r}`);
      const bad = [...own].filter((s) => english.get(r).has(s) && !allowed(s) && !words.has(s));
      n += bad.length;
      rows.push([r, bad]);
    }
    leaked += n;
    console.log(`${code}: ${n} English segment(s) across ${RUNTIME_ROUTES.length} sample pages`);
    if (args.lang || args.verbose === 'true') {
      for (const [r, bad] of rows) {
        if (!bad.length) continue;
        console.log(`  /${code}${r}`);
        for (const s of bad) console.log(`     · ${s.length > 110 ? `${s.slice(0, 110)}…` : s}`);
      }
    }
  }

  await browser.close();
  server.close();
  return leaked;
}
