// Read-only inventory of the Cloudinary account. Lists assets, changes nothing.
// Credentials are read from the backend's application.properties and never printed.
import { readFileSync, writeFileSync } from 'node:fs';

const PROPS = 'C:/Users/Web-Pc/IdeaProjects/keaa-admin-api/src/main/resources/application.properties';
const props = Object.fromEntries(
  readFileSync(PROPS, 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const cloud = props['cloudinary.cloud-name'];
const auth = 'Basic ' + Buffer.from(`${props['cloudinary.api-key']}:${props['cloudinary.api-secret']}`).toString('base64');
if (!cloud || !props['cloudinary.api-key']) { console.error('NO_CREDENTIALS'); process.exit(2); }
console.error('cloud name in use:', cloud);

async function listAll(type) {
  const out = [];
  let cursor = null, pages = 0;
  do {
    const u = new URL(`https://api.cloudinary.com/v1_1/${cloud}/resources/${type}`);
    u.searchParams.set('max_results', '500');
    if (cursor) u.searchParams.set('next_cursor', cursor);
    const r = await fetch(u, { headers: { Authorization: auth } });
    if (!r.ok) { console.error(`${type}: HTTP ${r.status} ${(await r.text()).slice(0, 300)}`); return out; }
    const j = await r.json();
    for (const x of j.resources || []) {
      out.push({ public_id: x.public_id, format: x.format || '', resource_type: x.resource_type, type: x.type, bytes: x.bytes, created_at: x.created_at });
    }
    cursor = j.next_cursor; pages++;
  } while (cursor && pages < 60);
  console.error(`${type}: ${out.length} assets over ${pages} page(s)`);
  return out;
}

const all = [];
for (const t of ['image', 'video', 'raw']) all.push(...(await listAll(t)));
writeFileSync('inventory.json', JSON.stringify(all, null, 2));
console.error('TOTAL', all.length, '-> inventory.json');
