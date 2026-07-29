/**
 * Text snapshot of the built site — the zero-change verifier for refactors.
 *
 * Serves dist/ on a throwaway port, walks every public route in headless Chromium and
 * records what a visitor would read: <title>, meta description, canonical, and the page's
 * rendered text. Two snapshots can then be diffed to prove a refactor changed nothing a
 * visitor sees — run one before, one after, and compare.
 *
 * Usage:
 *   node scripts/snapshot-text.mjs --out=snap.json          # snapshot dist/
 *   node scripts/snapshot-text.mjs --diff=a.json,b.json     # compare two snapshots
 *
 * Images and video are blocked at the network layer: text does not depend on them and it
 * makes the run several times faster.
 */
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
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

/* ---------------------------------------------------------------- diff mode */
if (args.diff) {
  const [aPath, bPath] = args.diff.split(',');
  const a = JSON.parse(readFileSync(aPath, 'utf8'));
  const b = JSON.parse(readFileSync(bPath, 'utf8'));
  const routes = [...new Set([...Object.keys(a), ...Object.keys(b)])];
  let bad = 0;
  for (const r of routes) {
    if (!a[r]) { console.log(`ONLY IN B: ${r}`); bad++; continue; }
    if (!b[r]) { console.log(`ONLY IN A: ${r}`); bad++; continue; }
    for (const field of ['title', 'description', 'canonical', 'text']) {
      if (a[r][field] === b[r][field]) continue;
      bad++;
      console.log(`DIFF ${r} [${field}]`);
      if (field === 'text') {
        const la = (a[r].text || '').split('\n');
        const lb = (b[r].text || '').split('\n');
        for (let i = 0; i < Math.max(la.length, lb.length); i++) {
          if (la[i] !== lb[i]) {
            console.log(`  line ${i + 1}:`);
            console.log(`    A: ${la[i] ?? '(missing)'}`);
            console.log(`    B: ${lb[i] ?? '(missing)'}`);
          }
        }
      } else {
        console.log(`  A: ${a[r][field]}`);
        console.log(`  B: ${b[r][field]}`);
      }
    }
  }
  console.log(bad ? `\n${bad} difference(s) found` : '\nSNAPSHOTS IDENTICAL');
  process.exit(bad ? 1 : 0);
}

/* ------------------------------------------------------------ snapshot mode */
const OUT = path.resolve(ROOT, args.out || 'snapshot.json');

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
  /* The 355 product pages share one template; these ten stand in for it (same ids as the
     client-proof sample in gen-proof-pdf.mjs). */
  for (const id of [281, 413, 279, 280, 290, 132, 306, 298, 320, 332]) routes.push(`/product/${id}`);
  return routes;
}

async function main() {
  if (!existsSync(DIST)) {
    console.error('snapshot-text — dist/ not found. Run `npm run build` first.');
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

  /* Same consent stamp as gen-proof-pdf.mjs, so consent-gated markup renders. */
  await page.evaluateOnNewDocument((version) => {
    try {
      window.localStorage.setItem(
        'keaa:cookie-consent',
        JSON.stringify({ version, necessary: true, embeds: true, savedAt: new Date().toISOString() })
      );
    } catch { /* storage disabled */ }
  }, 2);

  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const type = req.resourceType();
    if (type === 'image' || type === 'media' || type === 'font') return req.abort();
    return req.continue();
  });

  const snap = {};
  for (const [i, route] of routes.entries()) {
    try {
      await page.goto(origin + route, { waitUntil: 'networkidle0', timeout: 60_000 });
      /* Let lazy page chunks mount and settle. */
      await new Promise((r) => setTimeout(r, 600));
      snap[route] = await page.evaluate(() => ({
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content || '',
        canonical: document.querySelector('link[rel="canonical"]')?.href || '',
        /* normalised: collapse runs of blank lines so animation timing noise cannot flake the diff */
        text: document.body.innerText.replace(/\n{2,}/g, '\n').trim(),
      }));
      console.log('  %d/%d %s', i + 1, routes.length, route);
    } catch (err) {
      snap[route] = { error: err.message };
      console.warn('  !! %s failed: %s', route, err.message);
    }
  }

  await browser.close();
  server.close();
  await writeFile(OUT, JSON.stringify(snap, null, 1));
  console.log('\nsnapshot-text — %s (%d routes)', path.relative(ROOT, OUT), routes.length);
}

main().catch((err) => { console.error(err); process.exit(1); });
