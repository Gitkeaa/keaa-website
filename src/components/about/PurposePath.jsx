import { motion, useReducedMotion } from 'framer-motion';
import { company } from '../../data/company';
import { img, atWidth, localPhoto, localPhotoSrcSet } from '../../data/images';
import { EASE } from '../../lib/motion';
import { useLT } from '../../i18n/LocaleContext';

/**
 * OUR PURPOSE — the vision / mission / core-values band on the About page.
 * Replaces the old three-column VISION MISSION VALUES block.
 *
 * ---------------------------------------------------------------------------
 * HOW THE CONNECTOR WORKS (read this before nudging the layout)
 * ---------------------------------------------------------------------------
 * The connector path between the steps is NOT an SVG and contains no pixel
 * coordinates. Each elbow is a plain <div> carrying two borders and one corner
 * radius, placed with col-start / col-end on the SAME `grid-cols-12 gap-x-8`
 * track the medallions sit on. A left+bottom border with rounded-bl reads as
 * "descend, then run right"; a right+bottom border with rounded-br reads as
 * "descend, then run left".
 *
 * Two consequences, both deliberate:
 *   1. The elbows re-land on the medallion centres at every container width.
 *      There is no viewBox to keep in sync and no aspect ratio to lock, so the
 *      section is free to grow taller when the copy grows. Connector rows are
 *      their own grid rows, so a longer paragraph simply pushes the next row
 *      down — it can never collide with the step below it.
 *   2. The `-mx-4` on every elbow is LOAD-BEARING and is coupled to `gap-x-8`.
 *      A medallion placed `col-span-2 justify-self-center` centres on a grid
 *      LINE, i.e. the midpoint of a 32px gutter, while a `col-start-n` edge
 *      sits 16px to one side of it. -mx-4 (16px) pulls each terminus back onto
 *      the line. Change the gutter and every terminus drifts by half the delta.
 *
 * The grid lines the path is written against:
 *   step 01 medallion  col-start-1 col-span-2  -> centre line 2
 *   step 02 medallion  col-start-5 col-span-2  -> centre line 6
 *   step 03 medallion  col-start-2 col-span-2  -> centre line 3
 * Every col-span on a medallion must stay EVEN, or its centre falls inside a
 * track instead of on a line and no col-start can address it.
 *
 * ---------------------------------------------------------------------------
 * COLOUR: brand blue, not gold
 * ---------------------------------------------------------------------------
 * The client's reference drew this whole diagram — connector, rings, dots,
 * underlines, dividers — in gold. It is built in `primary` instead, on request.
 *
 * That also happens to be the safer call. index.css line 85 restricts `accent`
 * (#E7B321) to `surface-deep`, because gold measures 1.93:1 on white; the gold
 * focus ring was removed for the same reason. Everything here is aria-hidden
 * decoration, which WCAG 1.4.11 does exempt, so gold would have been arguable —
 * but only arguable, and it would have sat at the edge of a rule the rest of the
 * site keeps. `primary` needs no exemption argument at all.
 *
 * Do not reintroduce `accent` here, and do not reach for the legacy `gold-700`
 * scale, which the Tailwind config explicitly de-sanctions. The eyebrow stays
 * `text-primary-darker` per the house rule for a light surface — no copy in this
 * section should be promoted to a decorative colour.
 *
 * ---------------------------------------------------------------------------
 * BACKGROUND
 * ---------------------------------------------------------------------------
 * hero2.jpg is the light sibling of footer.jpg — the same scaffold wireframe
 * and dotted world map the reference calls for, already in public/images, so no
 * external request and the consent gate is satisfied. It is 750 KB served raw
 * from public/ with no Cloudinary treatment, which would be indefensible for a
 * 6%-opacity texture EXCEPT that About.jsx renders CtaBand, which renders
 * BrandTexture, which already requests this exact file. This is a cache hit.
 * If CtaBand is ever removed from About, either drop this texture or route the
 * file through Cloudinary first.
 *
 * ---------------------------------------------------------------------------
 * MOTION
 * ---------------------------------------------------------------------------
 * Locally guarded motion.li rather than Reveal/StaggerItem: Reveal.jsx does not
 * consult useReducedMotion, and framer-motion animates via JS so the global
 * prefers-reduced-motion block in index.css does not reach it. Fixing that gap
 * inside Reveal.jsx is a three-line change that would fix ~30 call sites at
 * once and let this component drop its local motion config — worth doing
 * separately.
 */

/**
 * The five core values are plain sentences in company.js with no title, icon or
 * lead field, so the bold lead word is DERIVED rather than duplicated here.
 * Scan to the first stop-word:
 *   'Integrity in everything we do'                 -> Integrity | in everything we do
 *   'Continuous improvement and in-house innovation' -> Continuous improvement | in-house innovation
 * Deliberately keyed off the sentence itself, not the array index, so
 * reordering company.values.values cannot silently mismatch copy and icon.
 */
const STOP_WORDS = new Set([
  'in',
  'to',
  'and',
  'for',
  'towards',
  'at',
  'of',
  'with',
  'on',
  'across',
]);

export function splitLead(sentence) {
  const words = String(sentence).trim().split(/\s+/);
  let i = 0;
  while (i < words.length && !STOP_WORDS.has(words[i].toLowerCase())) i += 1;
  // No stop-word, opens with one, or an implausibly long lead: fall back to one word.
  if (i === 0 || i > 3 || i === words.length) i = 1;
  const tail = words.slice(i);
  // 'Continuous improvement | and in-house innovation' reads better without the conjunction.
  if (tail[0] && tail[0].toLowerCase() === 'and') tail.shift();
  return { lead: words.slice(0, i).join(' '), rest: tail.join(' ') };
}

/**
 * A round photo on a white disc, with an offset dashed ring and the dots where the
 * connector path lands. The photo is delivered at 400px through Cloudinary (atWidth):
 * the disc is at most 112px (lg:h-28), so 400px stays crisp to ~3x DPR without shipping
 * the 1920px original into a thumbnail.
 *
 * `stub` draws the connector THROUGH the medallion's column, from the row's edge to the
 * medallion's centre, hidden behind the opaque disc where they overlap. This is what makes
 * the connector height-independent, and it is the whole reason the cell is `self-stretch`.
 *
 * Without it the elbows have to meet the medallion's rim directly, which only works while
 * the text column happens to be the same height as the medallion: the medallion is centred
 * in its row, so any extra copy pushes the rim away from the row edge and opens a gap in
 * the middle of the path. That is not hypothetical — adding one line of height to the step
 * titles took the gap from 14px to 66px. Now the stub always spans exactly half the row,
 * so the join lands on the boundary no matter how tall the copy grows.
 */
function Medallion({ image, alt, dots = [], stub = [] }) {
  return (
    <div className="relative flex h-full items-center justify-center">
      {/* lg only: below that the <ol>'s own left rail carries the connection. */}
      {stub.includes('up') && (
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-0 hidden h-1/2 w-0.5 -translate-x-1/2 bg-primary lg:block"
        />
      )}
      {stub.includes('down') && (
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-1/2 hidden h-1/2 w-0.5 -translate-x-1/2 bg-primary lg:block"
        />
      )}
      <div className="relative h-16 w-16 shrink-0 sm:h-20 sm:w-20 lg:h-28 lg:w-28">
      <span
        aria-hidden="true"
        className="absolute -inset-3 translate-x-[3px] translate-y-[3px] rounded-full border border-dashed border-primary/45"
      />
      <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-surface-raised shadow-card ring-1 ring-border">
        <img
          src={atWidth(image, 400)}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </span>
      {dots.includes('top') && (
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-4 ring-surface-bright"
        />
      )}
      {dots.includes('bottom') && (
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-1/2 h-3 w-3 -translate-x-1/2 translate-y-1/2 rounded-full bg-primary ring-4 ring-surface-bright"
        />
      )}
      </div>
    </div>
  );
}

/* Shared class strings. Single unbroken literals — Tailwind scans raw source
   text, so a class split across a concatenation would never be generated. */
const STEP_ROW =
  'grid grid-cols-[4rem_minmax(0,1fr)] items-start gap-x-6 sm:grid-cols-[5rem_minmax(0,1fr)] sm:gap-x-8 lg:grid-cols-12 lg:items-center lg:gap-x-8';
/* `primary-deep` (#1A4F8F) — the darkest blue on the brand scale, the same one the
   medallion icons carry, so the step marker and its icon read as one system.
   font-mono is the sanctioned face for step numbers per tailwind.config.js.
   In normal flow, NOT absolutely positioned. Absolute placement has to guess an
   offset that clears the title, and at lg the glyph is 104px tall while the largest
   sane offset lifted it only 48px — every step overlapped its own heading by 32px.
   A block in flow cannot collide by construction, and it matches the reference,
   where the numeral sits above the title rather than behind it. -ml-1 corrects the
   mono side-bearing so the digits optically align with the title's stem. */
const NUMERAL =
  'block -ml-1 select-none font-mono text-5xl font-medium leading-[0.85] text-primary-deep sm:text-6xl lg:text-[104px]';
const TITLE =
  'relative font-display text-xl font-bold uppercase tracking-[0.06em] text-text lg:text-2xl';
const UNDERLINE = 'mt-3 block h-[3px] w-12 rounded-full bg-primary';
/* A ch-based measure, not a column count: company.values.mission is a single long
   sentence and .container-page runs to 1760px, so without this it would set a
   ~150-character line at desktop widths.
   No font-light: index.css deliberately sets reading copy to weight 400, because the
   client reported Light-weight text reading as grey even at pure black (#000). This
   paragraph matches the page's other `text-body-compact ... text-ink` copy. */
const PARA = 'mt-4 max-w-[54ch] text-body-compact leading-relaxed text-ink';

export default function PurposePath() {
  const reduce = useReducedMotion();
  const lt = useLT('about');

  const step = {
    initial: reduce ? false : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.6, ease: EASE },
  };

  const values = company.values.values.map((raw) => {
    const { lead, rest } = splitLead(raw);
    return { raw, lead, rest };
  });

  return (
    <section
      id="purpose"
      aria-labelledby="purpose-heading"
      className="section-pad relative overflow-hidden bg-surface-bright"
    >
      <img
        src={localPhoto('/images/hero2.jpg', 1280)}
        srcSet={localPhotoSrcSet('/images/hero2.jpg')}
        sizes="100vw"
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover opacity-[0.06]"
      />

      <div className="container-page relative">
        {/* EYEBROW — this h2 is the section's accessible name; the steps are its h3s. */}
        <div className="flex flex-col items-center text-center">
          <div className="flex w-full max-w-xl items-center justify-center gap-4">
            <span aria-hidden="true" className="h-px flex-1 bg-primary/30" />
            <h2 id="purpose-heading" className="eyebrow text-primary-darker">
              {lt('purpose.eyebrow', 'Our Purpose')}
            </h2>
            <span aria-hidden="true" className="h-px flex-1 bg-primary/30" />
          </div>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="mt-4 h-5 w-5 stroke-primary"
            strokeWidth="1.25"
            strokeLinejoin="round"
          >
            <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" />
          </svg>
        </div>

        {/* THE STEPS. One DOM tree serves both layouts: below lg each <li> is a
            medallion gutter + content, joined by a single vertical rail; at lg the
            same <li> becomes a 12-column grid and the connector rows switch on.
            A real <ol> so the ordering the zigzag conveys visually is announced,
            which is why the 01/02/03 numerals can be aria-hidden. */}
        <ol className="relative mt-14 space-y-12 lg:mt-20 lg:space-y-0">
          <span
            aria-hidden="true"
            className="absolute bottom-10 left-8 top-10 w-px bg-primary/30 lg:hidden"
          />

          {/* ===== 01 ===== */}
          <motion.li {...step} className={STEP_ROW}>
            {/* self-stretch, not the row's default centring: the stub inside needs the cell
                to be the full row height so it always reaches the connector below. */}
            <div className="lg:col-start-1 lg:col-span-2 lg:justify-self-center lg:self-stretch">
              <Medallion
                image={img.scaffoldOnBuilding}
                alt={lt('purpose.vision.alt', 'Scaffolding erected on a building under construction')}
                dots={['bottom']}
                stub={['down']}
              />
            </div>
            <div className="relative min-w-0 lg:col-start-3 lg:col-span-7">
              <span aria-hidden="true" className={NUMERAL}>
                01
              </span>
              <h3 className={TITLE}>{lt('purpose.vision.title', 'Our Vision')}</h3>
              <span aria-hidden="true" className={UNDERLINE} />
              <p className={PARA}>{lt('purpose.vision.body', company.values.vision)}</p>
            </div>

            {/* connector 01 -> 02: down from line 2, right to line 11, down, left to line 6 */}
            <div
              aria-hidden="true"
              className="hidden h-28 grid-cols-12 grid-rows-2 gap-x-8 lg:col-span-12 lg:grid"
            >
              <div className="col-start-2 col-end-11 row-start-1 -mx-4 rounded-bl-[40px] border-b-2 border-l-2 border-primary" />
              <div className="col-start-6 col-end-11 row-start-2 -mx-4 rounded-br-[40px] border-b-2 border-r-2 border-primary" />
            </div>
          </motion.li>

          {/* ===== 02 ===== */}
          <motion.li {...step} className={STEP_ROW}>
            <div className="lg:col-start-5 lg:col-span-2 lg:justify-self-center lg:self-stretch">
              <Medallion
                image={img.manOnMachine}
                alt={lt('purpose.mission.alt', 'A technician operating machinery on the factory floor')}
                dots={['top', 'bottom']}
                stub={['up', 'down']}
              />
            </div>
            <div className="relative min-w-0 lg:col-start-8 lg:col-span-5">
              <span aria-hidden="true" className={NUMERAL}>
                02
              </span>
              <h3 className={TITLE}>{lt('purpose.mission.title', 'Our Mission')}</h3>
              <span aria-hidden="true" className={UNDERLINE} />
              <p className={PARA}>{lt('purpose.mission.body', company.values.mission)}</p>
            </div>

            {/* connector 02 -> 03: left along the TOP from line 6 to line 3, then down.
                Top+left borders, not bottom+left: this elbow travels right-to-left, so its
                horizontal run has to sit at the top of the row (under medallion 02) and the
                vertical drop on the left (onto medallion 03). Bottom+left draws the same
                corner mirrored — it looks plausible in isolation but both termini land in
                empty space, which is exactly what happened here first time round. */}
            <div
              aria-hidden="true"
              className="hidden h-24 grid-cols-12 gap-x-8 lg:col-span-12 lg:grid"
            >
              <div className="col-start-3 col-end-6 -mx-4 rounded-tl-[40px] border-l-2 border-t-2 border-primary" />
            </div>
          </motion.li>

          {/* ===== 03 ===== */}
          <motion.li {...step} className={STEP_ROW}>
            <div className="lg:col-start-2 lg:col-span-2 lg:justify-self-center lg:self-stretch">
              <Medallion
                image={img.scaffoldMenWorking}
                alt={lt('purpose.values.alt', 'A team working together on a scaffolding site')}
                dots={['top']}
                stub={['up']}
              />
            </div>
            <div className="relative min-w-0 lg:col-start-5 lg:col-span-8">
              <span aria-hidden="true" className={NUMERAL}>
                03
              </span>
              <h3 className={TITLE}>{lt('purpose.values.title', 'Our Core Values')}</h3>
              <span aria-hidden="true" className={UNDERLINE} />

              {/* A balanced 3-across grid: stacked on mobile, 2-up on sm, then 3×2 from lg up.
                  Three columns (not five) keeps any value count that is a multiple of three —
                  the data now holds six — as full, symmetric rows with no orphan trailing item,
                  and gives two-word leads like "Team Empowerment" room to sit on one or two
                  clean lines instead of being crushed into a fifth of the row.

                  Separation: on mobile/sm the page's border-l-2 border-primary/40 accent bar
                  marks each item; from lg it becomes a thin divider between columns. Each row's
                  FIRST cell clears that divider via nth-child(3n+1) rather than :first-child,
                  so the reset repeats per row instead of only clearing the very first item —
                  :first-child would leave a stray rule hanging at the left of the second row.
                  Per-item borders, not divide-x, because divide-x misbehaves once a grid wraps. */}
              <ul className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-0 lg:gap-y-10">
                {values.map(({ raw, lead, rest }, i) => (
                  <li
                    key={raw}
                    className="border-l-2 border-primary/40 pl-4 lg:border-l lg:border-primary/30 lg:px-6 lg:[&:nth-child(3n+1)]:border-l-0 lg:[&:nth-child(3n+1)]:pl-0"
                  >
                    <span className="block font-display text-base font-bold leading-snug text-text">
                      {lt(`purpose.values.${i}.lead`, lead)}
                    </span>
                    {rest ? (
                      <span className="mt-1.5 block text-body-compact leading-relaxed text-ink">
                        {lt(`purpose.values.${i}.rest`, rest)}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          </motion.li>
        </ol>
      </div>
    </section>
  );
}
