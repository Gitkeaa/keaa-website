/**
 * Captures a real poster frame for every film in src/data/galleryFilms.js.
 *
 *   node scripts/capture-video-posters.mjs            # all films
 *   node scripts/capture-video-posters.mjs 0 5        # films 0..4 only (resume / retry)
 *
 * Writes public/images/video-thumbs/<shareId>.jpg and prints, for each film, the `poster`
 * value to paste into src/data/galleryFilms.js plus the film's REAL filename as SharePoint
 * publishes it — useful for replacing the "KEAA Film N" placeholder titles.
 *
 * ---------------------------------------------------------------------------------------
 * WHY A BROWSER, AND WHY THIS IS THE ONLY HONEST WAY IN
 * ---------------------------------------------------------------------------------------
 * The films are SharePoint share PAGES, not files. A share page answers HTML, so there is no
 * asset to transform and no frame to lift: the old grid papered over that by dealing each
 * film an unrelated photo from the KEAA gallery, and two films pointed at Cloudinary video
 * ids that had been deleted and returned 404.
 *
 * There IS a way to reach a frame without a browser — the share page embeds a short-lived
 * `driveAccessToken`, and replaying it against SharePoint's internal API returns a thumbnail.
 * That is credential replay against a third party, so it is deliberately NOT what this does.
 *
 * This script instead does exactly what a visitor does: it opens the link in a real browser
 * and lets the page's own player load and decode the video. Nothing is bypassed — it is a
 * screenshot of a page anyone with the link may watch. The video's blob URL is same-origin
 * with the page, so its frames can be read off a canvas without tainting it, which is what
 * makes scoring and a native-resolution export possible.
 *
 * ---------------------------------------------------------------------------------------
 * HOW THE "BEST" FRAME IS CHOSEN
 * ---------------------------------------------------------------------------------------
 * Films open and close on fades, slates and logo cards, so frame 0 is usually black and the
 * last frame usually a fade-out. SAMPLE_POINTS therefore samples across the middle of the
 * clip and each candidate is scored on three things measured off the canvas:
 *
 *   brightness  a bell curve centred on mid-grey — kills black fades and blown-out whites
 *   detail      luminance standard deviation — kills flat walls, skies and title cards
 *   sharpness   mean neighbour-to-neighbour delta — prefers a crisp frame over motion blur
 *
 * The winner is re-seeked and exported, so the saved JPEG is the exact frame that scored.
 *
 * ADAPTIVE STREAMING CAVEAT: the player picks its rendition from the viewport, and a small
 * window gets a 426x240 stream. The viewport is therefore held at CAPTURE_WIDTH and the
 * script waits for videoWidth to stop climbing before it scores anything — without that wait
 * the posters come out at a quarter of the resolution.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import { galleryFilms } from '../src/data/galleryFilms.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'public', 'images', 'video-thumbs');

/** Wide enough that the adaptive player serves its top rendition rather than a 240p one. */
const CAPTURE_WIDTH = 1280;
/**
 * Fractions of the clip to sample. Skips the first and last tenth: fades, slates, logo cards.
 * Override for a retry when a film's winning frame still comes out flat — a clip that opens on
 * a white product sweep needs a denser sweep to find the one shot with something in it:
 *   POSTER_SAMPLES=0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9 node scripts/capture-video-posters.mjs 29 30
 */
const SAMPLE_POINTS = process.env.POSTER_SAMPLES
  ? process.env.POSTER_SAMPLES.split(',').map(Number).filter((n) => n > 0 && n < 1)
  : [0.15, 0.3, 0.45, 0.6, 0.75];
/** JPEG quality for the saved poster. The card renders ~350px wide, so this is already ample. */
const JPEG_QUALITY = 0.82;
const NAV_TIMEOUT = 90_000;

/** Stable per-film filename: the share link's own id, so renaming or reordering cannot break it. */
const shareId = (url) => {
  const m = url.match(/\/([A-Za-z0-9_-]{20,})\?/);
  return m ? m[1].slice(0, 16) : Buffer.from(url).toString('base64url').slice(0, 16);
};

/**
 * Runs INSIDE the page. Seeks to each sample point, draws the frame to a canvas, scores it,
 * then re-seeks to the winner and returns it as a JPEG data URL.
 */
async function pickBestFrame(points, quality) {
  const v = document.querySelector('video');
  const seek = (t) =>
    new Promise((res) => {
      const done = () => {
        v.removeEventListener('seeked', done);
        // A seeked event fires before the new frame is necessarily painted; give the
        // decoder a moment or the canvas still holds the previous frame.
        setTimeout(res, 420);
      };
      v.addEventListener('seeked', done);
      v.currentTime = t;
    });

  const c = document.createElement('canvas');
  const ctx = c.getContext('2d', { willReadFrequently: true });

  const score = () => {
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    ctx.drawImage(v, 0, 0, c.width, c.height);
    // Score on a downsampled copy: 160px wide is plenty for these statistics and keeps
    // getImageData cheap across 5 samples x 39 films.
    const sw = 160;
    const sh = Math.max(1, Math.round((sw * c.height) / c.width));
    const s = document.createElement('canvas');
    s.width = sw;
    s.height = sh;
    const sx = s.getContext('2d', { willReadFrequently: true });
    sx.drawImage(c, 0, 0, sw, sh);
    const d = sx.getImageData(0, 0, sw, sh).data;

    const lum = new Float64Array(sw * sh);
    for (let i = 0, p = 0; i < d.length; i += 4, p++) {
      lum[p] = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
    }
    let sum = 0;
    for (const l of lum) sum += l;
    const mean = sum / lum.length;
    let varc = 0;
    for (const l of lum) varc += (l - mean) ** 2;
    const stddev = Math.sqrt(varc / lum.length);

    // Mean absolute neighbour delta, horizontal and vertical: high on crisp edges, low on
    // motion blur and on flat fields.
    let edge = 0;
    let n = 0;
    for (let y = 1; y < sh; y++) {
      for (let x = 1; x < sw; x++) {
        const p = y * sw + x;
        edge += Math.abs(lum[p] - lum[p - 1]) + Math.abs(lum[p] - lum[p - sw]);
        n += 2;
      }
    }
    edge = n ? edge / n : 0;

    // Brightness as a bell centred on 128: a black fade or a blown white both score ~0.
    const brightness = Math.exp(-((mean - 128) ** 2) / (2 * 55 ** 2));
    const detail = Math.min(stddev / 60, 1);
    const sharp = Math.min(edge / 18, 1);
    return { total: brightness * 1.0 + detail * 1.1 + sharp * 1.3, mean, stddev, edge };
  };

  const dur = v.duration;
  let best = null;
  for (const f of points) {
    const t = Math.max(0.05, Math.min(dur - 0.05, dur * f));
    await seek(t);
    const sc = score();
    if (!best || sc.total > best.total) best = { ...sc, t, frac: f };
  }

  await seek(best.t);
  c.width = v.videoWidth;
  c.height = v.videoHeight;
  ctx.drawImage(v, 0, 0, c.width, c.height);
  return { ...best, w: c.width, h: c.height, dataUrl: c.toDataURL('image/jpeg', quality) };
}

async function captureOne(browser, film, index) {
  const page = await browser.newPage();
  const id = shareId(film.url);
  try {
    await page.setViewport({ width: CAPTURE_WIDTH, height: 760 });
    await page.goto(film.url, { waitUntil: 'networkidle2', timeout: NAV_TIMEOUT });

    // The player mounts the <video> well after load, and only then fetches media.
    await page.waitForFunction(
      () => {
        const v = document.querySelector('video');
        return v && v.readyState >= 3 && v.videoWidth > 0;
      },
      { timeout: 60_000 },
    );

    // Wait for the adaptive stream to settle on its best rendition: poll until videoWidth
    // stops climbing, else the poster is captured from a 240p stream.
    await page.evaluate(async () => {
      const v = document.querySelector('video');
      let last = 0;
      for (let i = 0; i < 12; i++) {
        if (v.videoWidth === last && i > 2) break;
        last = v.videoWidth;
        await new Promise((r) => setTimeout(r, 500));
      }
      v.pause();
    });

    // The film's real name, as the page itself publishes it — for fixing placeholder titles.
    const realName = await page.evaluate(() => {
      const m = document.documentElement.innerHTML.match(/"name"\s*:\s*"([^"]+\.(?:mp4|mov|m4v|MP4|MOV))"/);
      return m ? m[1] : '';
    });

    const best = await page.evaluate(pickBestFrame, SAMPLE_POINTS, JPEG_QUALITY);
    const buf = Buffer.from(best.dataUrl.split(',')[1], 'base64');
    fs.writeFileSync(path.join(OUT_DIR, `${id}.jpg`), buf);

    console.log(
      `[${String(index + 1).padStart(2)}/${galleryFilms.length}] ok  ${id}.jpg  ` +
        `${best.w}x${best.h}  t=${best.t.toFixed(1)}s  score=${best.total.toFixed(2)}  ` +
        `${(buf.length / 1024).toFixed(0)}KB  | ${film.title} | real: ${realName || '?'}`,
    );
    return { index, id, ok: true, realName, w: best.w, h: best.h, bytes: buf.length };
  } catch (err) {
    console.log(`[${String(index + 1).padStart(2)}/${galleryFilms.length}] FAIL ${id}  ${film.title}  -> ${err.message.slice(0, 90)}`);
    return { index, id, ok: false, error: err.message.slice(0, 160) };
  } finally {
    await page.close().catch(() => {});
  }
}

const from = Number(process.argv[2] ?? 0);
const to = Number(process.argv[3] ?? galleryFilms.length);
fs.mkdirSync(OUT_DIR, { recursive: true });

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required', '--mute-audio'],
});

const results = [];
// Sequential on purpose: these are someone else's servers, and parallel tabs also make the
// adaptive player fight itself for bandwidth and settle on a lower rendition.
for (let i = from; i < to && i < galleryFilms.length; i++) {
  results.push(await captureOne(browser, galleryFilms[i], i));
}
await browser.close();

const ok = results.filter((r) => r.ok);
// Report lands beside this script, NOT in OUT_DIR: everything under public/ is copied
// verbatim into the build, and a stray JSON index of the run has no business being served.
fs.writeFileSync(path.join(ROOT, 'scripts', 'video-posters.report.json'), JSON.stringify(results, null, 2));
console.log(`\n${ok.length}/${results.length} captured -> public/images/video-thumbs/`);
console.log('\nPaste these into src/data/galleryFilms.js:\n');
for (const r of results) {
  if (r.ok) console.log(`  film ${r.index}: poster: '/images/video-thumbs/${r.id}.jpg',   // real name: ${r.realName || '?'}`);
  else console.log(`  film ${r.index}: FAILED -> ${r.error}`);
}
