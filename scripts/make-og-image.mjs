import puppeteer from 'puppeteer';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

/**
 * Builds public/og-default.jpg, the 1200x630 card every non-product page shows when its link
 * is pasted into WhatsApp, LinkedIn or a search result preview.
 *
 * It was an Unsplash stock photograph of somebody else's scaffolding, which is a strange thing
 * to put a company's name against. This one is the real logo and only facts already published
 * on the site: the four ranges, and 2003, which the About page already states.
 *
 * Rendered rather than hand-drawn so it can be regenerated after a logo or tagline change:
 *   node scripts/make-og-image.mjs
 */
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public', 'og-default.jpg');

// The same Cloudinary artwork the header uses, knocked out and trimmed, white for dark ground.
const LOGO =
  'https://res.cloudinary.com/keaa-assets/image/upload/e_make_transparent:30/e_replace_color:white:60:3F4444/e_trim/f_auto,q_auto,w_520/Keaa_Logo_pcf86h';

const html = `<!doctype html>
<html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 44px;
    background: radial-gradient(120% 140% at 12% 8%, #123a63 0%, #0a2342 46%, #071a33 100%);
    font-family: Inter, system-ui, sans-serif; color: #fff; position: relative; overflow: hidden;
  }
  /* The same draughtsman's grid the site uses behind its heroes, at low opacity. */
  body::before {
    content: ''; position: absolute; inset: 0;
    background-image: linear-gradient(rgba(255,255,255,.055) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255,255,255,.055) 1px, transparent 1px);
    background-size: 56px 56px;
    -webkit-mask-image: radial-gradient(90% 110% at 50% 45%, #000 30%, transparent 78%);
  }
  img { width: 300px; height: auto; position: relative; }
  .tag {
    position: relative; max-width: 940px; text-align: center;
    font-size: 40px; line-height: 1.32; font-weight: 600; letter-spacing: -0.01em;
  }
  .rule { position: relative; width: 132px; height: 4px; border-radius: 2px; background: #E7B321; }
  .since { position: relative; font-size: 27px; font-weight: 400; color: rgba(255,255,255,.72); }
</style></head>
<body>
  <img src="${LOGO}" alt="">
  <div class="rule"></div>
  <p class="tag">Scaffolding, Formwork, Livestock Housing and Garden Hardware.</p>
  <p class="since">Made in India since 2003</p>
</body></html>`;

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });
await page.evaluate(() => document.fonts.ready);
await new Promise((r) => setTimeout(r, 400));
await page.screenshot({ path: OUT, type: 'jpeg', quality: 88 });
await browser.close();

const { statSync } = await import('node:fs');
console.log(`wrote ${OUT} (${Math.round(statSync(OUT).size / 1024)} KB, 1200x630)`);
