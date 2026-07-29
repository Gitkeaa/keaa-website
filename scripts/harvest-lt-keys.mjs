/**
 * Runtime lt() key harvest — the dynamic half of the translation manifest.
 *
 * check-translations.mjs reads keys statically, but data-driven copy uses template-literal
 * keys (lt(`items.${i}.q`, item.q)) that only exist at runtime. This drives the BUILT site
 * (dist/) through every public route with window.__LT_HARVEST set — see useLT in
 * src/i18n/LocaleContext.jsx — and unions every (key, english) pair the pages call.
 *
 * The full manifest for translators is therefore:  static scan  ∪  this harvest.
 *   node scripts/check-translations.mjs --json > static.json
 *   node scripts/harvest-lt-keys.mjs --out=harvest.json
 *
 * Interactive-only strings (an unopened modal's labels) appear only in the static half,
 * dynamic rendered strings only here; the union covers both.
 */
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const DIST = path.join(ROOT, 'dist');

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v = 'true'] = a.replace(/^--/, '').split('=');
    return [k, v];
  })
);
const OUT = path.resolve(ROOT, args.out || 'lt-harvest.json');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

function serveDist() {
  const server = createServer(async (req, res) => {
    const url = decodeURIComponent((req.url || '/').split('?')[0]);
    const candidates = [path.join(DIST, url), path.join(DIST, url, 'index.html'), path.join(DIST, 'index.html')];
    for (const file of candidates) {
      if (!file.startsWith(DIST) || !existsSync(file)) continue;
      try {
        const body = await readFile(file);
        res.writeHead(200, { 'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
        res.end(body);
        return;
      } catch { /* directory without index.html */ }
    }
    res.writeHead(404).end('not found');
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

async function buildRoutes() {
  const routes = [
    '/', '/about', '/manufacturing', '/certifications', '/projects-gallery', '/products',
    '/downloads', '/careers', '/faq', '/contact', '/rfq',
    '/privacy-policy', '/terms', '/cookie-policy',
  ];
  const categories = JSON.parse(await readFile(path.join(ROOT, 'src/data/categories.json'), 'utf8'));
  for (const cat of categories) {
    routes.push(`/products/${cat.slug}`);
    for (const sub of cat.subcategories || []) routes.push(`/products/${cat.slug}/${sub.slug}`);
  }
  for (const id of [281, 413, 279, 280, 290, 132, 306, 298, 320, 332]) routes.push(`/product/${id}`);
  return routes;
}

async function main() {
  if (!existsSync(DIST)) {
    console.error('harvest-lt-keys — dist/ not found. Run `npm run build` first.');
    process.exit(1);
  }
  const routes = await buildRoutes();
  const { server, port } = await serveDist();
  const origin = `http://127.0.0.1:${port}`;
  const browser = await puppeteer.launch({
    headless: true,
    protocolTimeout: 240_000,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000 });
  await page.evaluateOnNewDocument(() => {
    window.__LT_HARVEST = 1;
  });
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const type = req.resourceType();
    if (type === 'image' || type === 'media' || type === 'font') return req.abort();
    return req.continue();
  });

  const harvest = {};
  for (const [i, route] of routes.entries()) {
    try {
      await page.goto(origin + route, { waitUntil: 'networkidle0', timeout: 60_000 });
      await new Promise((r) => setTimeout(r, 600));
      const found = await page.evaluate(() => window.__LT_KEYS || {});
      Object.assign(harvest, found);
      console.log('  %d/%d %s (+%d, total %d)', i + 1, routes.length, route, Object.keys(found).length, Object.keys(harvest).length);
    } catch (err) {
      console.warn('  !! %s failed: %s', route, err.message);
    }
  }

  await browser.close();
  server.close();
  const sorted = Object.fromEntries(Object.entries(harvest).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(OUT, JSON.stringify(sorted, null, 1));
  console.log('\nharvest-lt-keys — %s (%d keys)', path.relative(ROOT, OUT), Object.keys(sorted).length);
}

main().catch((err) => { console.error(err); process.exit(1); });
