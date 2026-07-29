/**
 * Client proof PDF — every public page of the site, rendered exactly as a visitor sees it,
 * merged into one document for copy review and sign-off.
 *
 * Run `npm run build` first, then `npm run gen:proof`. The script serves dist/ on a throwaway
 * port, drives headless Chromium over the route list, and prints each route as ONE tall PDF
 * page so no section is ever cut in half by a page break. Text stays selectable and searchable,
 * so the client can copy a sentence straight out of the PDF.
 *
 * Route list: every page in scripts/prerender-routes.mjs terms — 14 site pages, the 3 category
 * landings and 28 sub-category catalogues — plus SAMPLE_PRODUCT_IDS. The catalogue has 355
 * product pages off one template; shipping all of them would make the file unusable, so a
 * representative page per sub-category stands in for the rest. Add ids there to widen the sample.
 *
 * Flags:
 *   --products=all      every product page too (slow, very large file)
 *   --products=none     skip the product samples
 *   --width=1440        viewport/page width in CSS px
 *   --maxImage=1600     cap Cloudinary delivery width; 0 embeds originals (much larger file)
 *   --out=path.pdf      output path
 *   --only=/,/about     comma-separated routes, for checking one page without a full run
 */
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import puppeteer from 'puppeteer';
import { PDFDocument, PDFRawStream, PDFDict, PDFArray, PDFRef, PDFName, PDFStream } from 'pdf-lib';

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const DIST = path.join(ROOT, 'dist');

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v = 'true'] = a.replace(/^--/, '').split('=');
    return [k, v];
  })
);

const PAGE_WIDTH = Number(args.width || 1440);
const MAX_IMAGE_PX = Number(args.maxImage ?? 1600); // 0 disables the cap and embeds originals
const PRODUCT_MODE = args.products || 'sample';
const OUT = path.resolve(ROOT, args.out || 'proof/KEAA-website-proof.pdf');

/* Chrome caps a PDF page at 200in; past that the tail of a page would be silently cropped. */
const MAX_PAGE_PX = 18000;

/**
 * One representative product per sub-category, chosen for having real photos and specs so the
 * client can check the detail-page template end to end. All 355 share this layout.
 */
const SAMPLE_PRODUCT_IDS = [281, 413, 279, 280, 290, 132, 306, 298, 320, 332];

const SITE_PAGES = [
  ['/', 'Home'],
  ['/about', 'About Us'],
  ['/manufacturing', 'Manufacturing'],
  ['/certifications', 'Certifications'],
  ['/projects-gallery', 'Projects Gallery'],
  ['/products', 'Products overview'],
  ['/downloads', 'Downloads Centre'],
  ['/careers', 'Careers'],
  ['/faq', 'FAQ'],
  ['/contact', 'Contact'],
  ['/rfq', 'Request a Quotation'],
  ['/privacy-policy', 'Privacy Policy'],
  ['/terms', 'Terms & Conditions'],
  ['/cookie-policy', 'Cookie Policy'],
];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.pdf': 'application/pdf',
};

/** Static file server for dist/ with SPA fallback — /product/:id has no prerendered file. */
function serveDist() {
  const server = createServer(async (req, res) => {
    const url = decodeURIComponent((req.url || '/').split('?')[0]);
    const candidates = [
      path.join(DIST, url),
      path.join(DIST, url, 'index.html'),
      path.join(DIST, 'index.html'),
    ];
    for (const file of candidates) {
      if (!file.startsWith(DIST) || !existsSync(file)) continue;
      try {
        const body = await readFile(file);
        res.writeHead(200, { 'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
        res.end(body);
        return;
      } catch {
        /* a directory without index.html — fall through to the next candidate */
      }
    }
    res.writeHead(404).end('not found');
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

/** Route list: site pages, then the catalogue tree read from the generated categories file. */
async function buildRoutes() {
  const routes = SITE_PAGES.map(([url, title]) => ({ url, title, group: 'Site' }));

  const categories = JSON.parse(await readFile(path.join(ROOT, 'src/data/categories.json'), 'utf8'));
  for (const cat of categories) {
    routes.push({ url: `/products/${cat.slug}`, title: cat.name, group: 'Catalogue' });
    for (const sub of cat.subcategories || []) {
      /* no em dash anywhere the client reads: they flag it as machine-written */
      routes.push({
        url: `/products/${cat.slug}/${sub.slug}`,
        title: `${cat.name}: ${sub.name}`,
        group: 'Catalogue',
      });
    }
  }

  if (PRODUCT_MODE !== 'none') {
    const products = JSON.parse(await readFile(path.join(ROOT, 'src/data/products.json'), 'utf8'));
    const wanted =
      PRODUCT_MODE === 'all'
        ? products
        : SAMPLE_PRODUCT_IDS.map((id) => products.find((p) => String(p.id) === String(id))).filter(Boolean);
    for (const p of wanted) {
      routes.push({ url: `/product/${p.id}`, title: `${p.name}${p.itemCode ? ` (${p.itemCode})` : ''}`, group: 'Product pages' });
    }
  }

  return routes;
}

/**
 * Overlays are correct on a live site and noise in a proof: the chat launcher, feedback tab,
 * back-to-top button and scroll-progress bar would repeat on every sheet and sit on top of the
 * copy being reviewed. Chrome also freezes `position: fixed` at one scroll offset, so in a
 * full-height capture they land in the middle of nowhere.
 *
 * Matching on computed position rather than a hand-written selector list means a widget added
 * later is caught too. The header is exempt: it is the one pinned element that belongs in the
 * proof, and it prints in flow at the top once the page is scrolled back to zero.
 *
 * The cookie banner is dismissed through localStorage instead, so anything gated on consent
 * renders the way it does for a visitor who accepted.
 */
async function hideOverlays(page) {
  return page.evaluate(() => {
    const hidden = [];
    for (const el of document.querySelectorAll('body *')) {
      if (getComputedStyle(el).position !== 'fixed') continue;
      if (el.closest('header')) continue;
      if (el.closest('[data-proof-hidden]')) continue;
      el.setAttribute('data-proof-hidden', '');
      el.style.setProperty('display', 'none', 'important');
      hidden.push(
        `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}` +
          `${el.getAttribute('aria-label') ? `[${el.getAttribute('aria-label')}]` : ''}` +
          ` "${(el.textContent || '').trim().slice(0, 28)}"`
      );
    }
    return hidden;
  });
}

async function preparePage(page) {
  await page.emulateMediaType('screen');

  /* CONSENT_VERSION in components/CookieConsent.jsx. `savedAt` must be stamped at run time:
     getCookieConsent() expires a record older than CONSENT_MAX_AGE_MS, and a hard-coded date
     silently ages out, which puts the banner back on every page of the proof. */
  await page.evaluateOnNewDocument((version) => {
    try {
      window.localStorage.setItem(
        'keaa:cookie-consent',
        JSON.stringify({ version, necessary: true, embeds: true, savedAt: new Date().toISOString() })
      );
    } catch {
      /* storage disabled — the banner stays and gets caught by hideOverlays() instead */
    }
  }, 2);

  /**
   * Two levers keep the proof small without touching how the site looks:
   *
   * 1. Format. Every site URL carries `f_auto`, which negotiates on the Accept header —
   *    Chrome advertises WebP/AVIF and gets them, and Chromium's PDF writer re-encodes
   *    those LOSSLESSLY, ballooning the file past 150 MB. Stripping webp/avif from Accept
   *    makes Cloudinary fall back to JPEG (or PNG when the source has alpha, so logos keep
   *    their transparency), and a received JPEG stream is embedded in the PDF as-is.
   *
   * 2. Pixels. `c_limit,w_N,q_auto:good` chained AFTER the site's own component caps the
   *    delivered result. Chained first it would be useless: the site's `w_…,c_…` runs later
   *    and re-scales the image right back. Applies to `upload` and `fetch` deliveries both.
   *
   * Hero videos are dropped: a PDF cannot play them, the <video> falls back to its poster
   * still, and the download is pure weight.
   */
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const url = req.url();
    if (!url.includes('res.cloudinary.com')) return req.continue();
    if (url.includes('/video/upload/') && !url.endsWith('.jpg')) return req.abort();

    const marker = ['/image/upload/', '/image/fetch/'].find((m) => url.includes(m));
    if (!marker) return req.continue();
    const headers = { ...req.headers(), accept: 'image/jpeg,image/png,image/gif,image/*;q=0.8' };
    if (!MAX_IMAGE_PX) return req.continue({ headers });

    const at = url.indexOf(marker) + marker.length;
    const [first, ...rest] = url.slice(at).split('/');
    const cap = `c_limit,w_${MAX_IMAGE_PX},q_auto:good`;
    const capped = /^[a-z]{1,2}_[^/]*$/.test(first)
      ? `${url.slice(0, at)}${first}/${cap}/${rest.join('/')}`
      : `${url.slice(0, at)}${cap}/${url.slice(at)}`;
    return req.continue({ url: capped, headers });
  });
}

/**
 * Reveal/StaggerGroup animate on `whileInView` with `once: true`, and images below the fold are
 * lazy. Both only resolve for content that has actually been scrolled past, so walk the page top
 * to bottom before capturing or the PDF is a stack of blank sections.
 */
async function settlePage(page) {
  await page.evaluate(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const step = Math.round(window.innerHeight * 0.75);
    let last = -1;
    for (let y = 0; y < document.body.scrollHeight + step; y += step) {
      window.scrollTo(0, y);
      await wait(140);
      if (document.body.scrollHeight === last && y > document.body.scrollHeight) break;
      last = document.body.scrollHeight;
    }
    window.scrollTo(0, document.body.scrollHeight);
    await wait(400);
    window.scrollTo(0, 0);
    await wait(500);

    /* Bounded: a lazy image in a hidden carousel slide never fires load/error, and an unbounded
       wait on it blows puppeteer's protocol timeout and loses the whole page. */
    await Promise.race([
      Promise.all(
        [...document.images].map((img) =>
          img.complete ? null : new Promise((r) => { img.addEventListener('load', r, { once: true }); img.addEventListener('error', r, { once: true }); })
        )
      ),
      wait(12_000),
    ]);
    await document.fonts?.ready;
    await wait(300);
  });
}

/**
 * page.pdf resolves viewport units against the PAPER size, not the browser viewport: a 100vh
 * hero measured at 1000px on screen re-renders at the full sheet height, pushing everything
 * below it onto a duplicate page. Rewriting every vh/vw declaration that currently applies to
 * the pixel value it has on screen freezes the screen layout before measuring and printing.
 */
async function freezeViewportUnits(page) {
  await page.evaluate(() => {
    const px = { h: innerHeight / 100, w: innerWidth / 100 };
    px.min = Math.min(px.h, px.w);
    px.max = Math.max(px.h, px.w);
    const VH = () => /(-?\d*\.?\d+)(?:s|d|l)?v(h|w|min|max)\b/g;
    const hasVh = (s) => VH().test(s || '');
    const conv = (s) => s.replace(VH(), (_, n, axis) => `${(parseFloat(n) * px[axis]).toFixed(2)}px`);

    /* a vh rule inside a non-matching @media must stay dead, not get flattened into scope */
    const mediaOk = (rule) => {
      for (let r = rule.parentRule; r; r = r.parentRule) {
        if (r.conditionText !== undefined) {
          if (r.cssRules && r.constructor.name === 'CSSSupportsRule' && !CSS.supports(r.conditionText)) return false;
          if (r.media && !matchMedia(r.conditionText).matches) return false;
        }
      }
      return true;
    };

    const out = [];
    const walk = (rules) => {
      for (const rule of rules) {
        if (rule.cssRules?.length) walk(rule.cssRules);
        if (!rule.style || !rule.selectorText || !hasVh(rule.cssText) || !mediaOk(rule)) continue;
        const decls = [];
        for (const prop of rule.style) {
          const val = rule.style.getPropertyValue(prop);
          if (hasVh(val)) decls.push(`${prop}:${conv(val)} !important`);
        }
        if (decls.length) out.push(`${rule.selectorText}{${decls.join(';')}}`);
      }
    };
    for (const sheet of document.styleSheets) {
      try {
        walk(sheet.cssRules);
      } catch {
        /* cross-origin sheet — everything is served locally, so none in practice */
      }
    }
    const style = document.createElement('style');
    style.textContent = out.join('\n');
    document.head.appendChild(style);

    for (const el of document.querySelectorAll('[style]')) {
      const s = el.getAttribute('style');
      if (hasVh(s)) el.setAttribute('style', conv(s));
    }
  });
}

const footer = (title, url) => `
  <div style="width:100%;font-family:Arial,Helvetica,sans-serif;font-size:9px;color:#8a8f98;
              padding:0 16px;display:flex;justify-content:space-between;">
    <span>KEAA International website proof</span>
    <span>${title}</span>
    <span>${url}</span>
    <span class="pageNumber"></span>
  </div>`;

/** Cover + contents page, printed through the same pipeline so it matches the body typography. */
function coverHtml(routes, stampedOn) {
  const rows = routes
    .map((r, i) => {
      const head = i === 0 || routes[i - 1].group !== r.group;
      return `${head ? `<tr><td colspan="3" class="grp">${r.group}</td></tr>` : ''}
        <tr><td class="n">${i + 2}</td><td>${r.title}</td><td class="u">${r.url}</td></tr>`;
    })
    .join('');
  return `<!doctype html><meta charset="utf-8">
  <style>
    body{font-family:Arial,Helvetica,sans-serif;color:#12263f;margin:0;padding:64px 72px;}
    h1{font-size:38px;margin:0 0 6px;letter-spacing:-.5px;}
    .sub{font-size:15px;color:#5b6672;margin:0 0 34px;}
    .meta{font-size:12px;color:#5b6672;border-top:2px solid #d9a441;padding-top:14px;margin-bottom:40px;line-height:1.9;}
    .meta b{color:#12263f;}
    h2{font-size:15px;text-transform:uppercase;letter-spacing:.16em;color:#5b6672;margin:0 0 14px;}
    table{width:100%;border-collapse:collapse;font-size:12.5px;}
    td{padding:5px 8px;border-bottom:1px solid #edf0f3;vertical-align:top;}
    .grp{font-size:11px;text-transform:uppercase;letter-spacing:.14em;color:#d9a441;
         padding-top:20px;border-bottom:none;font-weight:bold;}
    .n{width:42px;color:#8a8f98;}
    .u{width:44%;color:#5b6672;font-family:Consolas,monospace;font-size:11.5px;}
  </style>
  <h1>KEAA International</h1>
  <p class="sub">Website proof for review: full user interface and copy, page by page.</p>
  <div class="meta">
    <b>Generated:</b> ${stampedOn}<br>
    <b>Pages in this document:</b> ${routes.length + 1}<br>
    <b>Rendered at:</b> ${PAGE_WIDTH}px desktop width, screen styling, live fonts and images<br>
    <b>Note:</b> each sheet below is one complete web page top to bottom, so nothing is split
    across a page break. Text is selectable, so any sentence can be copied out for mark-up.
  </div>
  <h2>Contents</h2>
  <table>${rows}</table>`;
}

/**
 * Chrome embeds every image once per page.pdf() call, so a product card, logo or hero that
 * repeats across pages lands in the merged file once per appearance — measured at ~3/4 of the
 * total weight. Content-hash every image stream (dict resolved deep, so ICC profiles and soft
 * masks compare by value, not by object number), point every reference at the first copy, then
 * drop whatever became unreachable. Returns the number of streams removed.
 */
function dedupeImages(doc) {
  const ctx = doc.context;
  const md5 = (b) => createHash('md5').update(b).digest('hex');

  const canon = (obj, depth = 0) => {
    if (depth > 6 || obj === undefined) return '?';
    if (obj instanceof PDFRef) return canon(ctx.lookup(obj), depth + 1);
    if (obj instanceof PDFRawStream) return `S${md5(obj.contents)}${canon(obj.dict, depth + 1)}`;
    if (obj instanceof PDFDict) {
      const parts = [];
      for (const [k, v] of obj.entries()) {
        if (k === PDFName.of('Length')) continue;
        parts.push(`${k.toString()}:${canon(v, depth + 1)}`);
      }
      return `D{${parts.sort().join('|')}}`;
    }
    if (obj instanceof PDFArray) return `A[${obj.asArray().map((v) => canon(v, depth + 1)).join(',')}]`;
    return obj.toString();
  };

  const canonical = new Map();
  const remap = new Map();
  for (const [ref, obj] of ctx.enumerateIndirectObjects()) {
    if (!(obj instanceof PDFRawStream)) continue;
    if (obj.dict.get(PDFName.of('Subtype')) !== PDFName.of('Image')) continue;
    const key = canon(obj);
    const seen = canonical.get(key);
    if (seen) remap.set(ref.toString(), seen);
    else canonical.set(key, ref);
  }
  if (!remap.size) return 0;

  const rewire = (obj) => {
    if (obj instanceof PDFDict) {
      for (const [k, v] of obj.entries()) {
        if (v instanceof PDFRef) {
          const to = remap.get(v.toString());
          if (to) obj.set(k, to);
        } else rewire(v);
      }
    } else if (obj instanceof PDFArray) {
      obj.asArray().forEach((v, i) => {
        if (v instanceof PDFRef) {
          const to = remap.get(v.toString());
          if (to) obj.set(i, to);
        } else rewire(v);
      });
    } else if (obj instanceof PDFStream) rewire(obj.dict);
  };
  for (const [, obj] of ctx.enumerateIndirectObjects()) rewire(obj);

  const reachable = new Set();
  const visit = (obj) => {
    if (obj instanceof PDFRef) {
      if (reachable.has(obj.toString())) return;
      reachable.add(obj.toString());
      return visit(ctx.lookup(obj));
    }
    if (obj instanceof PDFStream) return visit(obj.dict);
    if (obj instanceof PDFDict) {
      for (const [, v] of obj.entries()) visit(v);
      return;
    }
    if (obj instanceof PDFArray) for (const v of obj.asArray()) visit(v);
  };
  visit(ctx.trailerInfo.Root);
  visit(ctx.trailerInfo.Info);
  for (const [ref] of ctx.enumerateIndirectObjects()) {
    if (!reachable.has(ref.toString())) ctx.delete(ref);
  }
  return remap.size;
}

async function main() {
  if (!existsSync(DIST)) {
    console.error('gen:proof — dist/ not found. Run `npm run build` first.');
    process.exit(1);
  }

  let routes = await buildRoutes();
  if (args.only) {
    const wanted = new Set(args.only.split(','));
    routes = routes.filter((r) => wanted.has(r.url));
  }
  const { server, port } = await serveDist();
  const origin = `http://127.0.0.1:${port}`;
  const browser = await puppeteer.launch({
    headless: true,
    protocolTimeout: 240_000,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none'],
  });

  const merged = await PDFDocument.create();
  const oversize = [];
  const failed = [];

  const append = async (buffer) => {
    const doc = await PDFDocument.load(buffer);
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach((p) => merged.addPage(p));
  };

  const page = await browser.newPage();
  await page.setViewport({ width: PAGE_WIDTH, height: 1000, deviceScaleFactor: 1 });
  await preparePage(page);

  const stampedOn = new Date().toISOString().slice(0, 10);
  await page.setContent(coverHtml(routes, stampedOn), { waitUntil: 'load' });
  await append(await page.pdf({ width: `${PAGE_WIDTH}px`, height: '2000px', printBackground: true }));
  console.log('  1/%d  cover + contents', routes.length + 1);

  for (const [i, route] of routes.entries()) {
    const label = `${route.title} — ${route.url}`;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        await page.goto(origin + route.url, { waitUntil: 'networkidle0', timeout: 90_000 });
        await settlePage(page);
        /* after settle, not before: AiChat and FeedbackWidget are lazy chunks that mount late */
        const hidden = await hideOverlays(page);
        if (i === 0) console.log('     overlays hidden: %s', hidden.join(' | ') || 'none');
        await freezeViewportUnits(page);

        let height = await page.evaluate(() =>
          Math.ceil(Math.max(document.body.scrollHeight, document.documentElement.scrollHeight))
        );
        if (height > MAX_PAGE_PX) {
          oversize.push(`${route.url} (${height}px)`);
          height = MAX_PAGE_PX;
        }

        await append(
          await page.pdf({
            /* sheet = content + the 30px footer margin, or the last 28px of every page
               overflows onto a duplicate near-blank sheet */
            width: `${PAGE_WIDTH}px`,
            height: `${height + 32}px`,
            printBackground: true,
            displayHeaderFooter: true,
            headerTemplate: '<div></div>',
            footerTemplate: footer(route.title, route.url),
            margin: { top: '0px', bottom: '30px', left: '0px', right: '0px' },
          })
        );
        console.log('  %d/%d  %s', i + 2, routes.length + 1, label);
        break;
      } catch (err) {
        if (attempt === 1) {
          console.warn('  .. %s attempt 1 failed (%s), retrying', route.url, err.message);
          continue;
        }
        failed.push(`${route.url} — ${err.message}`);
        console.warn('  !! %s failed: %s', route.url, err.message);
      }
    }
  }

  await browser.close();
  server.close();

  merged.setTitle('KEAA International website proof');
  merged.setSubject('Full public site, page by page, for copy review');
  merged.setProducer('scripts/gen-proof-pdf.mjs');

  const deduped = dedupeImages(merged);
  if (deduped) console.log('  deduped %d repeated image streams', deduped);

  await mkdir(path.dirname(OUT), { recursive: true });
  const bytes = await merged.save();
  await writeFile(OUT, bytes);

  console.log(
    '\ngen:proof — %s\n  %d pages, %s MB',
    path.relative(ROOT, OUT),
    merged.getPageCount(),
    (bytes.length / 1024 / 1024).toFixed(1)
  );
  if (oversize.length) console.log('  cropped at %dpx (page taller than Chrome allows): %s', MAX_PAGE_PX, oversize.join(', '));
  if (failed.length) console.log('  FAILED: %s', failed.join('; '));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
