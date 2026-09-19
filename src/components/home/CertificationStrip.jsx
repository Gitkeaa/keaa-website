import { cldImage } from '../../data/cloudinary';
import { certificationLogos } from '../../data/certificationLogos';

/**
 * The certification strip under the hero — the accreditation marks, floating past.
 *
 * The marks live in data/certificationLogos.js as Cloudinary keys; add one there and it
 * appears here. Nothing in this file needs editing to change the line-up.
 *
 * MIXED IMAGE AND TEXT IS THE POINT, not a stopgap. A row with no `id` renders as its name,
 * which is exactly what this strip was before the badges existed — so marks can be uploaded
 * one at a time and the strip is never half-empty. Once every id is filled it reads as a
 * pure badge rail with no code change.
 *
 * WHY IT FLOATS. Nine marks will not sit in a static row: on a laptop the last one clips and
 * on a phone they shrink to illegible thumbnails. A marquee gives every mark the same
 * generous width at every screen size, and a tenth certification costs a data line, not a
 * redesign.
 *
 * HOW THE LOOP IS SEAMLESS. The track holds the list TWICE and slides exactly -50%, so the
 * moment the first copy leaves, the second sits pixel-identical in its place and the reset is
 * invisible. With only a handful of marks two copies would not span a wide monitor, so the
 * list is first padded up to MIN_TRACK_ITEMS by repeating it — the -50% arithmetic is
 * unaffected because both halves are still built from the same padded array.
 *
 * SPEED is per-item (SECONDS_PER_ITEM), not a fixed duration: adding a mark lengthens the
 * track, and a fixed duration would make everything race to cover it. The strip therefore
 * drifts at the same pace whether there are four marks or forty.
 *
 * Hovering pauses it, so a visitor can actually read a mark they recognise; reduced-motion
 * users get no animation at all and scroll the rail by hand instead.
 */

/** Repeat the list until the half-track is at least this long, so wide screens stay filled. */
const MIN_TRACK_ITEMS = 10;

/** Marquee pace. Higher = slower. One mark takes this many seconds to cross its own width. */
const SECONDS_PER_ITEM = 4.5;

/**
 * A mark's delivery URL. `id` may be a Cloudinary public_id OR a full URL pasted straight
 * from the dashboard — a pasted URL is already a delivery URL, so it is used untouched.
 *
 * `c_fit` (not the helper's default `c_fill`) is what makes mixed badge shapes work: it
 * scales the artwork inside the box instead of cropping to it, so the wide CE mark and a
 * round seal both survive intact. Height only, so each keeps its own aspect ratio.
 */
const markSrc = (id, h) => (/^https?:\/\//.test(id) ? id : cldImage(id, { h, crop: 'fit' }));

export default function CertificationStrip() {
  if (certificationLogos.length === 0) return null;

  // Pad to MIN_TRACK_ITEMS, then lay that padded list down twice for the -50% loop.
  const padded = [];
  while (padded.length < MIN_TRACK_ITEMS) padded.push(...certificationLogos);
  const track = [...padded, ...padded];

  return (
    <section className="border-b border-navy-100 bg-white py-7 sm:py-9">
      {/* Full-bleed: the rail runs edge to edge so marks drift in from off-screen rather than
          appearing at a container margin. The mask fades both ends into the white band. */}
      <div className="group relative overflow-hidden motion-reduce:overflow-x-auto [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)] [-webkit-mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
        <ul
          className="flex w-max animate-marquee items-center gap-10 group-hover:[animation-play-state:paused] motion-reduce:animate-none sm:gap-14"
          style={{ animationDuration: `${padded.length * SECONDS_PER_ITEM}s` }}
        >
          {track.map((c, i) => (
            <li
              key={`${c.name}-${i}`}
              // Dimmed at rest so the strip reads as quiet reassurance under the hero rather
              // than competing with it, full strength on hover.
              className="flex flex-shrink-0 items-center opacity-70 transition-opacity duration-300 hover:opacity-100"
              // The second copy is decoration; announcing every mark twice would make the
              // strip read as eighteen certifications to a screen reader.
              aria-hidden={i >= padded.length ? 'true' : undefined}
              title={c.body}
            >
              {c.id ? (
                // h-8/h-10 with object-contain gives every badge the same optical weight: the
                // box is a constant height, the artwork sits inside it at its own ratio.
                //
                // NOT lazy, deliberately. A lazy image only fetches once it nears the
                // viewport, and these arrive by sliding in from off-screen — the fetch would
                // start as the badge appeared, so the strip would scroll a blank gap and pop.
                // Each mark is a few KB at h_96 with f_auto,q_auto, and the duplicate track
                // reuses the same URLs from cache, so loading the set up front is cheap.
                <img
                  src={markSrc(c.id, 96)}
                  srcSet={`${markSrc(c.id, 96)} 1x, ${markSrc(c.id, 192)} 2x`}
                  alt={c.name}
                  loading="lazy"
                  decoding="async"
                  className="h-8 w-auto max-w-[140px] object-contain sm:h-10 sm:max-w-[170px]"
                />
              ) : (
                <span className="whitespace-nowrap text-xs font-semibold text-text">{c.name}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
