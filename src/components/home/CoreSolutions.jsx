import { motion, useReducedMotion } from 'framer-motion';
import Button from '../ui/Button';
import { PANEL_CARD } from '../ui/panelCard';
import { cldImage, cldSrcSet } from '../../data/cloudinary';

/**
 * The Home page's "Who We Are" band: the overview copy and its three pillars, beside a
 * photograph of the works.
 *
 * This used to carry the product-category cards underneath as well. They were removed so the
 * band says who KEAA is and nothing else — the catalogue is reached from the Products nav
 * item and the /products page instead.
 *
 *  - `whitespace-pre-line` plus `\n` in the pillar titles keeps their two-line break
 *    identical at every width, rather than letting it reflow.
 */

const EASE = [0.22, 1, 0.36, 1];

/** Cloudinary public_id for the works photograph that sits beside the copy. */
const WHO_WE_ARE = 'About_us_2_cd9rr8';

/**
 * The three pillars beside the overview copy. The reach figure is the same 42+ the rest of
 * the site quotes, so this block can never drift to a different number.
 */
const PILLARS = [
  { title: 'Engineering\nExcellence', desc: 'Precision-engineered products built to last.' },
  { title: 'Quality\nAssurance', desc: 'Strict quality control at every stage.' },
  { title: 'Global\nCommitment', desc: 'Trusted by customers in 42+ countries.' },
];

export default function CoreSolutions() {
  const reduce = useReducedMotion();

  const rise = (delay = 0) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: 0.6, delay, ease: EASE },
  });

  return (
    <section className="section-pad bg-surface-bright">
      <div className="container-page">
        {/* The whole band sits in one panel so it reads as its own object rather than loose
            copy on the page. See panelCard.js for why the border and the lift are so faint. */}
        <div className={PANEL_CARD}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-center lg:gap-12">
          {/* Overview — "Who We Are": copy, then the three pillars. */}
          <motion.div {...rise()}>
            <span className="eyebrow text-primary-darker">About KEAA</span>

            <h2 className="mt-3 font-display text-4xl font-bold leading-[1.06] tracking-[-0.025em] text-text sm:text-5xl">
              Who We Are
            </h2>

            <p className="body-copy mt-5 max-w-[34rem]">
              KEAA International is a globally trusted engineering and manufacturing company
              specializing in high-performance scaffolding, formwork, and industrial solutions.
              Backed by decades of expertise, advanced manufacturing facilities, and an
              unwavering commitment to quality, we deliver innovative products that enhance
              safety, improve efficiency, and support sustainable infrastructure development
              across more than 42 countries worldwide.
            </p>

            {/* Phone: two columns so the three pillars fill the width instead of stacking into
                a tall single file. Desktop is untouched — `sm:` still drives the 3-up row. */}
            <dl className="mt-9 grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-3 sm:gap-6">
              {PILLARS.map(({ title, desc }) => (
                <div key={title}>
                  <dt className="whitespace-pre-line font-display text-[15px] font-bold leading-snug text-text">
                    {title}
                  </dt>
                  <dd className="mt-2 text-[13px] leading-relaxed text-text-muted">{desc}</dd>
                </div>
              ))}
            </dl>

            {/* Closes the band with the one action it should lead to — the full story on the
                About page. Same navy treatment as "Our Story" below, so the two read as a pair. */}
            <Button to="/about" variant="navy" className="mt-9">
              Know More
            </Button>
          </motion.div>

          {/* The "Who We Are" photograph — KEAA's own works, supplied for this section. It
              replaces the stock category shot that used to sit here, so this band now shows
              the company rather than one product line. */}
          <motion.div {...rise(0.1)} className="relative">
            {/* No drop shadow of its own — the card around it carries the elevation, and
                stacking one inside the other only muddies both. */}
            <div className="relative overflow-hidden rounded-card ring-1 ring-text/[0.06]">
              {/* Served from Cloudinary so `f_auto,q_auto` hands each browser WebP/AVIF at the
                  width it actually renders — tens of KB rather than the ~580 KB original. */}
              <img
                src={cldImage(WHO_WE_ARE, { w: 1200 })}
                srcSet={cldSrcSet(WHO_WE_ARE)}
                sizes="(min-width: 1024px) 46vw, 92vw"
                alt="Inside KEAA International's plant: a branded overhead crane above the machining lines, with racked steel tube, section and coil stock"
                loading="lazy"
                decoding="async"
                className="aspect-[16/10] w-full object-cover"
              />

              {/* Reach badge. `42+` is the figure company.js already publishes. */}
              <div className="absolute right-4 top-4 rounded-card bg-surface-raised/[0.92] px-3.5 py-2.5 shadow-lg ring-1 ring-border backdrop-blur-sm sm:right-5 sm:top-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-darker">
                  Trusted by
                </p>
                <p className="mt-1 text-body-compact font-semibold leading-tight text-text">42+ Countries</p>
              </div>
            </div>
          </motion.div>
        </div>
        </div>
      </div>
    </section>
  );
}
