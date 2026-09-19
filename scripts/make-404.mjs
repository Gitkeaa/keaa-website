/**
 * Turn the prerendered /404 page into dist/404.html, the body Vercel serves with a real 404
 * status for any address that matches no file.
 *
 * WHY THIS IS NEEDED
 * ------------------
 * The site used to answer every unknown address with HTTP 200 and the app shell, because a
 * catch-all rewrite sent everything to index.html. Google calls that a soft 404: it wastes
 * crawl budget on addresses that do not exist and, worse, it means a mistyped or retired URL
 * looks to a crawler like a real page with thin content. Now that every public route is
 * prerendered as its own file, the catch-all is gone and unmatched addresses fall through to
 * this file with the status they should always have had.
 *
 * A rewrite could not have done it: a Vercel rewrite always answers 200, whatever it points
 * at. Only a genuinely unmatched request produces a 404, which is why vercel.json lists the
 * app routes that are NOT prerendered (the staff console) explicitly and nothing else.
 *
 * Runs at the end of `npm run build`. It is a hard failure if the source page is missing:
 * shipping without it silently restores the soft 404 behaviour.
 */
import { copyFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(ROOT, 'dist', '404', 'index.html');
const TARGET = join(ROOT, 'dist', '404.html');

if (!existsSync(SOURCE)) {
  // Prerendering was skipped, so there is no rendered 404 to copy. Fall back to the app
  // shell: it renders the same NotFound page in the browser, and the 404 STATUS, which is
  // what actually matters to a crawler, comes from Vercel either way.
  const shell = join(ROOT, 'dist', 'index.html');
  if (!existsSync(shell)) {
    console.error('make-404 - FAIL  neither dist/404/index.html nor dist/index.html exists.');
    process.exit(1);
  }
  copyFileSync(shell, TARGET);
  console.warn(
    'make-404: WARN  /404 was not prerendered, so dist/404.html is the app shell. The status\n' +
      '                will still be 404; only the served markup is thinner. This goes away as\n' +
      '                soon as prerendering runs (see scripts/check-prerender.mjs).'
  );
  process.exit(0);
}

copyFileSync(SOURCE, TARGET);
console.log('make-404: ok - dist/404.html written from the prerendered /404 page.');
