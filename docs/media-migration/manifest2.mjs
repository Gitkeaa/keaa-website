import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { mediaKey, withSuffix } from 'file:///C:/Users/Web-Pc/keaa-media-r2/src/data/mediaKey.js';

const sha1Last6 = (s) => createHash('sha1').update(s, 'utf8').digest('hex').slice(-6);
const all = JSON.parse(readFileSync('inventory.json', 'utf8'));
const ROOT = '1.keaa-assets';

// Owner's layout decision, 2026-09-24. Every stored asset gets a destination prefix here, or it
// lands in the loose-root manifest with a proposal instead of a key.
const PROPOSED = {
  gallery:       { prefix: ROOT + '/keaa-gallery',       why: 'used by data/gallery.js and data/heroSlides.js' },
  certificates:  { prefix: ROOT + '/keaa-certificates',  why: 'certification badge, used by data/certificationLogos.js' },
  team:          { prefix: ROOT + '/keaa-team',          why: 'leadership portrait, used by data/company.js' },
  manufacturing: { prefix: ROOT + '/keaa-manufacturing', why: 'plant photo, used by Manufacturing.jsx and ManufacturingBand.jsx' },
  brand:         { prefix: ROOT + '/keaa-brand',         why: 'KEAA logo' },
  site:          { prefix: ROOT + '/keaa-site',          why: 'general site imagery' },
  ask:           { prefix: null,                         why: 'NEEDS YOUR DECISION, unreferenced by the site' },
};

const LOOSE = {
  gallery: ['IMG_0430_bnfi0v','Locking_2_jrzuql','IMG_2508_kmskzh','hot_dip_u4t1vc','IMG_9524_qcbtn4','DJI_0131_ljo3tq','DJI_0126_busis7','DJI_0117_jnjfzw','DJI_0083_1_w7zuxk','Screenshot_2023-04-17_103327_cq7mkj','IMG_9612_xlbdb5','IMG_9641_pi3mja','IMG_9518_tzihvj','IMG_9483_xgkajt','IMG_9471_rxoaxo','IMG_9406_hz6kms','IMG_9405_tqyhyi','IMG_9389_pndzst','IMG_1977_qclqp3','DJI_0164_efaxki','DJI_0146_bzclb7','DJI_0082_p2qmld','IMG_0444_pzkfun','IMG_0378_x5iqib','IMG_0363_eik0rk','DSC_6380_afmt2n','DSC_6129_n49y89','IMG_1113_wb6dmo','IMG_9619_dy341a','IMG_2473_p9prtl','IMG_2512_wggw9o','IMG_2516_ss6pmj','IMG_1108_lkay4c','IMG_0453_xiscrp','IMG_9473_iqy5gk','IMG_9440_ueh71y'],
  certificates: ['ChatGPT_Image_23_Sept_2026_10_59_42_p9trct','ChatGPT_Image_23_Sept_2026_10_48_56_ec1d2o','ChatGPT_Image_23_Sept_2026_10_48_14_x1gpjq','ISO_9001_14001_45001_wrszlx','BSCI_Compliant_epigki','Ct-PAT_z5gdra','CE_Certified_heisan','DIN_EN_1090-1_fwxhqh','EN_1090_Part_2_and_Part_3_dp5fl6','CTO_CTE_xtttnf'],
  team: ['ChatGPT_Image_22_Sept_2026_15_38_28_nta0bu','ChatGPT_Image_19_Sept_2026_16_13_24_r2nb0b','sumit_Dogra_keaa_enpham','Bhupesh_Gautam_sh5j0f','Jaskamal_Keaa_nr05tj','Amarjot_keaa_m3uucm','Ajay_RAna_Keaa_tn10ww'],
  manufacturing: ['Automatic_Powder_Coating_Plant_guv3pr','Hot_Dip_Galvanizing_Plant_ze1vep','Robotic_Welding_Stations_vnvqos','Sheet_laser_Cutting_oa7ib6','CNC_Press_Brake_tcsl3k','Tube_Laser_Cutting_mx4lc9'],
  brand: ['Keaa_Logo_pcf86h','logo_yrd3ye','logo_white_lczf5d','logo_for_linked_in_oni1vy'],
  site: ['All_categories_r2ttvy','About_us_2_cd9rr8'],
  ask: ['ChatGPT_Image_24_Sept_2026_14_23_40_bv5tdn','ChatGPT_Image_24_Sept_2026_14_20_33_rqqwzu','main-sample'],
};
const looseGroup = new Map();
for (const [g, ids] of Object.entries(LOOSE)) for (const id of ids) looseGroup.set(id, g);

// Magic-byte detection result for the one asset Cloudinary records no format for.
// Probed 2026-09-24 over HTTP: its first bytes are %PDF-1.3.
const SNIFFED = { '1.Keaa Assets/Keaa Resumes/file_klapaj': 'pdf' };

const decided = [], loose = [], excluded = [], sniffLog = [];

for (const a of all) {
  const id = a.public_id;
  if (a.type === 'fetch') {
    excluded.push({ public_id: id, resource_type: a.resource_type, reason: 'external URL, replace with KEAA asset' });
    continue;
  }
  if (id === 'samples' || id.startsWith('samples/')) {
    excluded.push({ public_id: id, resource_type: a.resource_type, reason: 'Cloudinary demo content, not KEAA' });
    continue;
  }
  let format = a.format || '';
  if (!format && SNIFFED[id]) {
    format = SNIFFED[id];
    sniffLog.push({ public_id: id, detected: format, how: 'magic bytes' });
  }

  let target = null, group = null;
  if (id.startsWith('keaa-products/')) {
    target = ROOT + '/keaa-products/' + id.slice('keaa-products/'.length); group = 'products';
  } else if (id.startsWith('1.Keaa Assets/Keaa Resumes/')) {
    target = ROOT + '/keaa-resumes/' + id.slice('1.Keaa Assets/Keaa Resumes/'.length); group = 'resumes';
  } else if (!id.includes('/') && a.resource_type === 'video') {
    target = ROOT + '/1.keaa-hero-page-videos/' + id; group = 'hero-videos';
  } else if (!id.includes('/') && format === 'pdf') {
    target = ROOT + '/keaa-certificates/' + id; group = 'certificate-pdfs';
  }

  if (target) { decided.push({ a, id, format, target, group }); continue; }

  const g = looseGroup.get(id);
  if (!g) { excluded.push({ public_id: id, resource_type: a.resource_type, reason: 'UNCLASSIFIED, script needs updating' }); continue; }
  const p = PROPOSED[g];
  loose.push({ a, id, format, group: g, why: p.why, target: p.prefix ? p.prefix + '/' + id : null });
}

// Keys for everything, decided and proposed alike, because they all share one bucket namespace.
const taken = new Map(); const collisions = []; const rows = [];
const addRow = (e, status) => {
  const base = mediaKey(e.target, e.format);
  let key = base, collided = false;
  if (taken.has(base)) {
    collided = true;
    key = withSuffix(base, sha1Last6(e.id));
    collisions.push({ key: base, winner: taken.get(base), loser: e.id, loserKey: key });
  }
  taken.set(key, e.id);
  rows.push({ public_id: e.id, status, group: e.group, resource_type: e.a.resource_type, format: e.format,
    r2_key: key, key_bytes: Buffer.byteLength(key, 'utf8'), bytes: e.a.bytes, collided, note: e.why || '' });
};
decided.sort((x, y) => x.id.localeCompare(y.id)).forEach((e) => addRow(e, 'approved'));
loose.filter((e) => e.target).sort((x, y) => x.id.localeCompare(y.id)).forEach((e) => addRow(e, 'proposed'));
for (const e of loose.filter((e) => !e.target).sort((x, y) => x.id.localeCompare(y.id))) {
  rows.push({ public_id: e.id, status: 'needs-decision', group: e.group, resource_type: e.a.resource_type,
    format: e.format, r2_key: '', key_bytes: 0, bytes: e.a.bytes, collided: false, note: e.why });
}

const csv = (name, header, data) => writeFileSync(name, header.join(',') + '\n' +
  data.map((r) => header.map((h) => '"' + String(r[h] ?? '').replace(/"/g, '""') + '"').join(',')).join('\n'));
const H = ['public_id','status','group','resource_type','format','r2_key','key_bytes','bytes','collided','note'];
csv('manifest.csv', H, rows.filter((r) => r.status === 'approved'));
csv('manifest-loose-root.csv', H, rows.filter((r) => r.status !== 'approved'));
csv('manifest-excluded.csv', ['public_id','resource_type','reason'], excluded);
writeFileSync('manifest-all.json', JSON.stringify({ rows, excluded, collisions, sniffLog }, null, 2));

const keyed = rows.filter((r) => r.r2_key);
console.log('=== UPDATED MANIFEST (new 1.keaa-assets layout)');
console.log('cloudinary assets total        ', all.length);
console.log('excluded                       ', excluded.length);
const byReason = excluded.reduce((m, e) => (m[e.reason] = (m[e.reason] || 0) + 1, m), {});
for (const [reason, n] of Object.entries(byReason)) console.log('    ' + n, reason);
console.log('APPROVED layout, keys assigned ', rows.filter((r) => r.status === 'approved').length);
console.log('PROPOSED layout, keys assigned ', rows.filter((r) => r.status === 'proposed').length);
console.log('NEEDS YOUR DECISION, no key    ', rows.filter((r) => r.status === 'needs-decision').length);
console.log('total KEAA assets accounted    ', rows.length);
console.log('distinct keys                  ', new Set(keyed.map((r) => r.r2_key)).size, 'of', keyed.length);
console.log('COLLISIONS                     ', collisions.length);
console.log('KEYS OVER 1024 BYTES           ', keyed.filter((r) => r.key_bytes > 1024).length,
  '(longest ' + Math.max(...keyed.map((r) => r.key_bytes)) + ')');
console.log('magic-byte detections logged   ', sniffLog.length);
for (const s of sniffLog) console.log('     ', s.public_id, '->', s.detected, 'via', s.how);
if (collisions.length) { console.log('\n=== COLLISION LOG'); collisions.forEach((c) => console.log(JSON.stringify(c))); }

console.log('\n=== BY DESTINATION PREFIX');
const p = {};
for (const r of keyed) {
  const k = r.r2_key.slice(0, r.r2_key.lastIndexOf('/'));
  (p[k] ??= { n: 0, status: r.status }).n++;
}
for (const [k, v] of Object.entries(p).sort((a, b) => b[1].n - a[1].n)) {
  console.log(String(v.n).padStart(4), k, ' [' + v.status + ']');
}
console.log('\n=== NEEDS YOUR DECISION');
rows.filter((r) => r.status === 'needs-decision').forEach((r) => console.log('     ', r.public_id, '(' + r.format + ')'));
console.log('\n=== SAMPLE REMAPPED KEYS');
for (const g of ['products','resumes','hero-videos','certificate-pdfs','gallery','team','certificates','manufacturing','brand','site']) {
  const r = rows.find((x) => x.group === g && x.r2_key);
  if (r) console.log('   ', JSON.stringify(r.public_id), '->', r.r2_key);
}

// Safety assertions over every assigned key.
const assert = (name, bad) => console.log((bad.length ? 'FAIL ' : 'ok   ') + name, bad.length, bad.slice(0, 3).map((r) => r.r2_key).join(' '));
console.log('\n=== ASSERTIONS');
assert('uppercase or space',            keyed.filter((r) => /[A-Z ]/.test(r.r2_key)));
assert('outside [a-z0-9/._-]',          keyed.filter((r) => /[^a-z0-9/._-]/.test(r.r2_key)));
assert('double hyphen',                 keyed.filter((r) => /--/.test(r.r2_key)));
assert('leading/doubled/trailing slash', keyed.filter((r) => /(^\/|\/\/|\/$)/.test(r.r2_key)));
assert('segment edge hyphen',           keyed.filter((r) => r.r2_key.split('/').some((s) => /^-|-$/.test(s))));
assert('over 1024 bytes',               keyed.filter((r) => r.key_bytes > 1024));
assert('missing extension',             keyed.filter((r) => !/\.[a-z0-9]+$/.test(r.r2_key)));
assert('not under 1.keaa-assets/',      keyed.filter((r) => !r.r2_key.startsWith('1.keaa-assets/')));
const dupes = keyed.filter((r, i, arr) => arr.findIndex((o) => o.r2_key === r.r2_key) !== i);
assert('duplicate key', dupes);
