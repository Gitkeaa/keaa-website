/**
 * Lists every image's public_id in a Cloudinary asset folder, so a page can reference
 * them with cldImage()/cldSrcSet() without anything being added to the repo.
 *
 * The account is on "Dynamic folders", where the folder is metadata and NOT part of the
 * public_id — so the folder name alone is not enough to build a URL. This asks the Admin
 * API for the real public_ids.
 *
 * Run it with your Cloudinary API key + secret in the environment (never hard-code them):
 *
 *   PowerShell (Windows):
 *     $env:CLOUDINARY_API_KEY="your_key"
 *     $env:CLOUDINARY_API_SECRET="your_secret"
 *     node scripts/list-gallery.mjs
 *
 *   Git Bash:
 *     CLOUDINARY_API_KEY=your_key CLOUDINARY_API_SECRET=your_secret node scripts/list-gallery.mjs
 *
 * Pass a different folder as the first argument (defaults to "gallery"):
 *   node scripts/list-gallery.mjs my-folder
 *
 * It prints a JSON array of public_ids. Paste that back and the gallery data file gets
 * built from it. Your secret stays in your shell — it is never written to a file.
 */

const CLOUD = 'keaa-assets';
const FOLDER = process.argv[2] || 'gallery';
const KEY = process.env.CLOUDINARY_API_KEY;
const SECRET = process.env.CLOUDINARY_API_SECRET;

if (!KEY || !SECRET) {
  console.error(
    'Missing credentials. Set CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in your\n' +
      'environment first (see the comment at the top of this file). Find both on the\n' +
      'Cloudinary dashboard under "Go to API Keys".'
  );
  process.exit(1);
}

const auth = 'Basic ' + Buffer.from(`${KEY}:${SECRET}`).toString('base64');
const api = `https://api.cloudinary.com/v1_1/${CLOUD}`;

async function get(url) {
  const res = await fetch(url, { headers: { Authorization: auth } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} — ${JSON.stringify(body.error || body)}`);
  }
  return body;
}

const encodePath = (p) => p.split('/').map(encodeURIComponent).join('/');

/** Every folder path in the account, recursed, so the exact asset_folder is visible. */
async function listFolders(path = '') {
  const url = path ? `${api}/folders/${encodePath(path)}` : `${api}/folders`;
  let body;
  try {
    body = await get(url);
  } catch {
    return [];
  }
  let all = [];
  for (const f of body.folders || []) {
    all.push(f.path);
    all = all.concat(await listFolders(f.path));
  }
  return all;
}

/** Walk every page (Cloudinary caps a page at 500) and collect image resources. */
async function listAll(makeUrl) {
  const out = [];
  let cursor;
  do {
    const url = makeUrl(cursor);
    const page = await get(url);
    for (const r of page.resources || []) {
      if (!r.resource_type || r.resource_type === 'image') {
        out.push({ public_id: r.public_id, format: r.format, width: r.width, height: r.height });
      }
    }
    cursor = page.next_cursor;
  } while (cursor);
  return out;
}

async function main() {
  // `node scripts/list-gallery.mjs --folders` just prints the folder tree.
  if (process.argv.includes('--folders')) {
    const folders = await listFolders();
    console.error(`\n${folders.length} folder(s) in the account. Pass the exact path you want:\n`);
    console.log(JSON.stringify(folders, null, 2));
    return;
  }

  let images = [];

  // Dynamic folders: ask by asset folder.
  try {
    images = await listAll(
      (cursor) =>
        `${api}/resources/by_asset_folder?asset_folder=${encodeURIComponent(FOLDER)}` +
        `&max_results=500${cursor ? `&next_cursor=${cursor}` : ''}`
    );
  } catch (e) {
    console.error(`by_asset_folder failed (${e.message}); trying a prefix search instead…`);
  }

  // Fixed folders (or older accounts): the folder IS part of the public_id, so match by prefix.
  if (images.length === 0) {
    images = await listAll(
      (cursor) =>
        `${api}/resources/image/upload?prefix=${encodeURIComponent(FOLDER + '/')}` +
        `&max_results=500${cursor ? `&next_cursor=${cursor}` : ''}`
    ).catch(() => []);
  }

  if (images.length === 0) {
    // Show the real folder paths so the right one can be passed next.
    const folders = await listFolders();
    console.error(`No images found in folder "${FOLDER}". The account's actual folders are:\n`);
    console.error(JSON.stringify(folders, null, 2));
    console.error(
      `\nRe-run with the exact path, e.g.:\n  node scripts/list-gallery.mjs "${folders[0] || 'the/right/path'}"`
    );
    process.exit(2);
  }

  // Sort by public_id so the order is stable between runs.
  images.sort((a, b) => a.public_id.localeCompare(b.public_id));

  console.error(`\nFound ${images.length} image(s) in "${FOLDER}". public_ids:\n`);
  console.log(JSON.stringify(images.map((i) => i.public_id), null, 2));
}

main().catch((e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
