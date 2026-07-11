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

const CLOUD_NAME = 'tt2nmm62';
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
