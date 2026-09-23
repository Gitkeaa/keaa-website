/**
 * ===========================================================================
 *  PASTE YOUR THREE CLOUDINARY CERTIFICATE PDF LINKS IN THIS FILE
 * ===========================================================================
 *
 * This is the ONLY file you need to edit to put the three PDF certificates on
 * the Certifications page. Nothing else has to change.
 *
 * FOR EACH OF THE THREE SLOTS BELOW:
 *   1. Paste the Cloudinary link into `pdf: ''` (between the quote marks).
 *   2. Edit `name`, `scope`, `body` and `note` to describe that certificate.
 *
 * A slot with an EMPTY `pdf` is skipped, so the page never shows a dead card.
 * Fill in one, two or three of them and the row lays itself out to suit.
 *
 * OPTIONAL: add `pages: 5,` to a slot if you know the page count. The viewer
 * works it out on its own, which costs a moment the first time a multi-page
 * certificate is opened; stating it skips that entirely.
 *
 * WHAT COUNTS AS A VALID LINK. Any of these work:
 *
 *   https://res.cloudinary.com/keaa-assets/image/upload/v1730000000/certs/iso-9001.pdf
 *   https://res.cloudinary.com/keaa-assets/image/upload/certs/iso-9001.pdf
 *   certs/iso-9001                     <- just the public ID, like certificationLogos.js
 *
 * ---------------------------------------------------------------------------
 *  TWO THINGS TO CHECK IN CLOUDINARY, OR THE THUMBNAIL WILL NOT APPEAR
 * ---------------------------------------------------------------------------
 *
 *  1. UPLOAD THE PDF AS AN IMAGE, NOT AS "RAW". The first-page thumbnail is
 *     produced by Cloudinary itself (the `pg_1` transformation), and that only
 *     works on files stored as the `image` resource type. A PDF uploaded as
 *     `raw` is delivered from a `/raw/upload/` URL and cannot be turned into a
 *     picture at all. Dragging a PDF into the Media Library gives you `image`,
 *     which is what you want.
 *
 *  2. TURN ON PDF DELIVERY. Cloudinary blocks PDF delivery by default on new
 *     accounts. In the console: Settings -> Security -> "PDF and ZIP files
 *     delivery" -> allow. Until that is ticked, the thumbnail request comes
 *     back 401 and the card falls back to a plain document placeholder. The
 *     View PDF button still works either way, so the page never looks broken.
 *
 * The cloud name below must match the one the rest of the site uses
 * (see src/data/images.js).
 */

const CLOUD = 'keaa-assets';

/**
 * The three slots. Paste into `pdf`, then fill in the wording around it.
 *
 * `scope`, `body` and `note` are the same three fields the existing cards in
 * src/data/company.js use, so these read identically on the page.
 */
export const certificateDocuments = [
  {
  // ---------------- CERTIFICATE 1 ----------------------------------------
  pdf: 'B30_Prop_Sigma_Certificate_uwivrj',
  name: 'B30 Prop Sigma Certificate',
  scope: 'Adjustable telescopic steel prop — Class B30',
  body: 'Sigma Test & Research Centre',
  note: 'Independent test certificate for the B30 adjustable telescopic steel prop.',
},
{
  // ---------------- CERTIFICATE 2 ----------------------------------------
  pdf: 'Prop_BD_Class_Certificate_EN_1065_xy9uzr',
  name: 'Prop BD Class Certificate EN 1065',
  scope: 'Adjustable telescopic steel props — EN 1065',
  note: 'Certificate relating to EN 1065 product specifications, design and assessment requirements for adjustable steel props.',
},
{
  // ---------------- CERTIFICATE 3 ----------------------------------------
  pdf: 'T.P.I._ATTESTATION_OF_INSPECTION_ISO_1462_KEAA_INTERNATIONAL_1_qch4w5',
  name: 'T.P.I. Attestation of Inspection — ISO 1462',
  scope: 'Metallic coating inspection — ISO 1462',
  body: 'Third-party inspection (T.P.I.)',
  note: 'Third-party inspection attestation for the coating assessment stated in the certificate.',
},
  {
  // ---------------- CERTIFICATE 4 ----------------------------------------
  pdf: '9137-9_Certificate-of-Conformity_RA_SW-coupler_2026-07-31_zykes2',
  name: '9137-9 Certificate of Conformity — RA & SW Couplers',
  scope: 'Right-angle (RA) and swivel (SW) scaffolding couplers',
  // body: 'Issuing body stated in the certificate',
  note: 'Certificate of conformity for right-angle and swivel couplers used with scaffolding tubes and temporary works equipment.',
},
];

const TRANSFORM_PARAM = /^[a-z]{1,3}_[^,/]+$/;
const isTransform = (seg) => seg.split(',').every((p) => TRANSFORM_PARAM.test(p));
const isVersion = (seg) => /^v\d+$/.test(seg);

function parseRef(ref) {
  const value = (ref || '').trim();
  if (!value) return null;

  const stripExt = (s) => s.replace(/\.(pdf|jpe?g|png|webp)$/i, '');

  if (!/^https?:\/\//i.test(value)) {
    // A bare public ID, the same shape certificationLogos.js uses.
    return { cloud: CLOUD, type: 'image', id: stripExt(value) };
  }

  let url;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  // /{cloud}/{resource_type}/{delivery_type}/{transforms?}/{version?}/{public_id}
  const parts = url.pathname.split('/').filter(Boolean);
  if (parts.length < 4) return null;

  const [cloud, type] = parts;
  let rest = parts.slice(3); // drop cloud, resource type and delivery type
  while (rest.length > 1 && (isTransform(rest[0]) || isVersion(rest[0]))) rest = rest.slice(1);

  return { cloud, type, id: stripExt(rest.join('/')) };
}

/**
 * One page of the certificate, as a picture.
 *
 * `pg_N` is Cloudinary's page selector and `f_auto` then hands the browser a WebP or AVIF
 * rather than the JPEG the extension asks for. Returns null for a `raw` upload or an
 * unparseable value, which the card and the viewer both read as "there is nothing to show".
 */
export function certificatePageUrl(ref, page = 1, w = 800) {
  const parsed = parseRef(ref);
  if (!parsed || parsed.type === 'raw') return null;
  return `https://res.cloudinary.com/${parsed.cloud}/image/upload/f_auto,q_auto,pg_${page},w_${w},c_limit/${parsed.id}.jpg`;
}

/** Page one, at card size. The thumbnail is just the first page at a smaller width. */
export const certificateThumbUrl = (ref, w = 800) => certificatePageUrl(ref, 1, w);

/**
 * How many pages the certificate has.
 *
 * NOTE THERE IS NO `certificatePdfUrl` ANY MORE, and that is the point. The cards used to
 * link straight at the .pdf, which handed every visitor the browser's built-in PDF viewer
 * with its Download and Print buttons. The certificates are now shown as page images in an
 * in-page viewer instead, so the document itself is never offered as a file. Put the .pdf
 * link back and the download comes back with it.
 *
 * The count is discovered by asking for a 50px-wide copy of each page in turn until one
 * comes back an error, because a delivery URL carries no page count and Cloudinary's
 * Admin API needs a key that has no business being in a public bundle. Pages are tiny at
 * that width (~1 KB), it only runs when somebody opens a certificate, and page one is on
 * screen throughout. `pages` in the config short-circuits it if you would rather state it.
 */
const MAX_PAGES = 32;

/**
 * Pages are asked for in batches rather than one at a time. Cloudinary rasterises a page the
 * first time it is requested, which costs the better part of a second, so walking a five-page
 * certificate one page at a time took about four seconds and the pager only appeared after
 * the reader had already started looking. In parallel the whole batch costs about as long as
 * its slowest page. Eight is chosen so that every certificate here resolves in one round trip
 * while a one-page document still only wastes seven ~1 KB requests.
 */
const PROBE_BATCH = 8;

export function certificatePageCount(doc, signal) {
  if (Number.isInteger(doc.pages) && doc.pages > 0) return Promise.resolve(doc.pages);

  const probe = (n) =>
    new Promise((resolve) => {
      const url = certificatePageUrl(doc.pdf, n, 50);
      if (!url) return resolve(false);
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
      return undefined;
    });

  return (async () => {
    let known = 1;
    while (known < MAX_PAGES) {
      if (signal?.aborted) return known;

      const from = known + 1;
      const batch = [];
      for (let n = from; n < from + PROBE_BATCH && n <= MAX_PAGES; n += 1) batch.push(n);
      if (!batch.length) break;

      const found = await Promise.all(batch.map(probe));
      const firstMissing = found.indexOf(false);

      // Every page in the batch exists, so the document runs past it: go round again.
      if (firstMissing === -1) {
        known = batch[batch.length - 1];
        continue;
      }
      // `firstMissing` is an offset into the batch, and the page before it is the last real
      // one. An offset of 0 means the batch started past the end, so `known` is unchanged.
      known = from + firstMissing - 1;
      break;
    }
    return known;
  })();
}

/** The slots that have actually been filled in, in the order written above. */
export const publishedCertificateDocuments = certificateDocuments.filter((d) => (d.pdf || '').trim());
