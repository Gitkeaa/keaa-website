import { cldRaw } from '../../data/cloudinary';

/**
 * The KEAA mark — used in the header, the footer, the mega-menu and the mobile drawer.
 *
 * Delivered from Cloudinary as `Keaa_Logo_pcf86h`, the stacked artwork: the cube above the
 * "keaa" wordmark. Nothing about the mark is stored in the repo.
 *
 * ---------------------------------------------------------------------------------------
 * WHY THE DELIVERY CHAIN IS NOT JUST f_auto,q_auto
 * ---------------------------------------------------------------------------------------
 * The upload is a 1254x1254 RGB PNG with NO alpha channel — the artwork sits on a baked-in
 * off-white ground, with roughly a fifth of the canvas as empty margin. Served as-is it is a
 * pale square tile: a visible box against the dark footer, and a faint one even against the
 * white header. `f_auto` on its own makes that worse, not better — with no transparency to
 * preserve it happily encodes the file as JPEG.
 *
 * So each variant is a CHAIN, applied in order (see cldRaw for why one component will not do):
 *
 *   e_make_transparent:30  knocks the off-white ground out, giving the file an alpha channel.
 *                          This is also what makes f_auto safe: with transparency present it
 *                          negotiates WebP or PNG and can no longer fall back to JPEG.
 *   e_replace_color:...    DARK VARIANT ONLY. The wordmark is near-black (~#3F4444) and all
 *                          but vanishes on the navy footer, so it is swapped for white. The
 *                          tolerance is wide enough to catch the antialiased edges and far
 *                          enough from the cube's blues to leave them untouched.
 *   e_trim                 crops the margin the knockout just turned transparent. It has to
 *                          come after, or there is nothing transparent for it to trim.
 *   f_auto,q_auto,w_       the ordinary optimise-and-resize step, last.
 *
 * The result is ~6 KB and lands at a 1.11:1 ratio — the artwork is close to square, which is
 * why HEIGHT below is larger than the 40px the old horizontal lockup used: at 40px tall this
 * mark is only ~44px wide and the wordmark under it becomes unreadable.
 *
 * NOTE ON THE LOCKUP. This artwork carries the cube and "keaa" only — it has no
 * "INTERNATIONAL" line, which the previous mark did. That word is no longer shown anywhere in
 * the header or footer. The full horizontal lockup, if it is wanted back, is in the repo at
 * /public/downloads/keaa-logo-primary.png (and -white.png for dark backgrounds).
 */

/** The knockout + trim that every variant starts from. Order is load-bearing. */
const BASE_CHAIN = 'e_make_transparent:30/e_trim';

/** Dark-background variant: same, with the near-black wordmark swapped to white first. */
const LIGHT_CHAIN = 'e_make_transparent:30/e_replace_color:white:60:3F4444/e_trim';

/**
 * Rendered height, and the one real cost of a near-square mark in a horizontal header slot.
 *
 * The wordmark occupies only the lower third of the artwork, so the mark has to be tall for
 * "keaa" to hold its own next to the nav labels. Measured in the real header: 48px leaves the
 * wordmark visibly smaller than the nav, 64px matches it but pushes the header to 93px from
 * the 68px it was. 56px is the balance — legible wordmark, header at 85px.
 */
const HEIGHT = 56;
const RATIO = 1066 / 962; // measured off the trimmed output, so the box never reflows on load

const src = (chain, w) => cldRaw('Keaa_Logo_pcf86h', `${chain}/f_auto,q_auto,w_${w}`);

export default function Logo({ light = false, className = '' }) {
  const chain = light ? LIGHT_CHAIN : BASE_CHAIN;
  const w = Math.round(HEIGHT * RATIO);

  return (
    <img
      src={src(chain, w)}
      srcSet={`${src(chain, w)} 1x, ${src(chain, w * 2)} 2x`}
      // Every wrapper that needs one already carries its own aria-label (the header's home
      // link, the mega-menu's home button), and a link's aria-label wins over its contents —
      // so this alt names the mark for the footer, where there is no wrapper label, without
      // doubling up anywhere else.
      alt="KEAA International"
      width={w}
      height={HEIGHT}
      // Eager and high priority: it is above the fold on every page, and the header row
      // collapses around a late-loading logo. Lowercase on purpose — React 18.3 does not
      // recognise the camelCase `fetchPriority` and warns, passing it through unrendered.
      fetchpriority="high"
      decoding="async"
      className={`w-auto ${className}`}
      style={{ height: HEIGHT }}
    />
  );
}
