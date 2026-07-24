/**
 * Cloudinary image delivery — so heavy images live on the CDN, not in the repo.
 *
 * This account allows image transformations (verified: `f_auto,q_auto,w_*` deliver
 * optimised, resized files), even though it blocks *video* transcodes. So images get the
 * full CDN treatment — `f_auto` serves WebP/AVIF to browsers that support them, `q_auto`
 * picks the smallest quality that still looks right, and `w_` resizes on the fly, which is
 * what makes responsive `srcSet` cheap.
 *
 * To put an image on the CDN: upload it in the Cloudinary dashboard (or via an unsigned
 * upload preset), note its `public_id`, then reference it with `cldImage(publicId)` /
 * `cldSrcSet(publicId)`. Nothing is added to the repo.
 */

const CLOUD_NAME = 'keaa-assets';
const BASE = `https://res.cloudinary.com/${CLOUD_NAME}`;

// public_ids may contain folder slashes ("products/ringlock-tower"); keep the slashes,
// encode everything else.
const encodeId = (id) => id.split('/').map(encodeURIComponent).join('/');

/**
 * An optimised image URL. Pass `w`/`h` for a target size (Cloudinary resizes on delivery);
 * omit both to keep the original dimensions. `crop` only applies when a size is given.
 * `extra` appends any further transformation string, e.g. 'g_auto' or 'e_sharpen'.
 */
export function cldImage(publicId, { w, h, crop = 'fill', extra } = {}) {
  const t = ['f_auto', 'q_auto'];
  if (w) t.push(`w_${w}`);
  if (h) t.push(`h_${h}`);
  if (w || h) t.push(`c_${crop}`);
  if (extra) t.push(extra);
  return `${BASE}/image/upload/${t.join(',')}/${encodeId(publicId)}`;
}

/** A `srcSet` string across common widths, for a responsive `<img srcset sizes>`. */
export function cldSrcSet(publicId, widths = [480, 768, 1200, 1600, 2000]) {
  return widths.map((w) => `${cldImage(publicId, { w })} ${w}w`).join(', ');
}

/**
 * A poster still lifted from a video asset. Image output from a video works here even
 * though `.mp4` transforms don't, so hero posters need not be stored in the repo either.
 * `so` is the second to grab (past any logo intro); `w` the width.
 */
export function cldVideoPoster(publicId, { so = 0, w = 960 } = {}) {
  return `${BASE}/video/upload/so_${so},w_${w},q_auto,f_auto/${encodeId(publicId)}.jpg`;
}

/**
 * Optimised, progressive video delivery.
 *
 * `q_auto,f_auto` re-encodes the upload to the smallest quality that still looks right and
 * hands the browser the best codec/container it accepts. Cloudinary serves that result
 * web-optimised — the moov atom is at the front (faststart) and it honours HTTP range
 * requests — so the <video> STREAMS: it starts on the first chunk instead of waiting for the
 * whole file, and a phone only pulls the bytes it actually plays. That is the "45s that plays
 * on mobile" trick; the duration never mattered, the delivery did.
 *
 * `w` caps the width with `c_limit` (never upscales): pass 720 for phones, 1920 for desktop,
 * so a metered phone gets a genuinely smaller rendition of the same clip.
 *
 * REQUIRES "Strict transformations" OFF in the Cloudinary account — otherwise every video
 * transform URL 404s. While it is still ON, pass `raw: true` to deliver the untouched upload
 * (no resize, and faststart only if the source file already had it).
 */
export function cldVideo(publicId, { w, raw = false } = {}) {
  if (raw) return `${BASE}/video/upload/${encodeId(publicId)}.mp4`;
  const t = ['q_auto', 'f_auto'];
  if (w) t.push(`w_${w}`, 'c_limit');
  return `${BASE}/video/upload/${t.join(',')}/${encodeId(publicId)}.mp4`;
}
