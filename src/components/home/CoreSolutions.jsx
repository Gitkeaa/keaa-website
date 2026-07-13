import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Layers,
  Warehouse,
  Hammer,
  Globe2,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import Button from '../ui/Button';
import { getAllCategories } from '../../data/productHelpers';

/**
 * The Home page's "Who We Are" and "Our Product Categories" sections, merged into one
 * band: the overview copy sits beside the lead category, and the rest run underneath.
 *
 * Notes worth keeping:
 *
 *  - Categories come from the catalogue itself, so these cards can only ever link to
 *    pages that exist. They used to come from the legacy 5-category list, which named
 *    lines with no catalogue page and linked to `/products#anchor` hashes the router's
 *    scroll-to-top swallowed.
 *  - The first category is the featured one. Reorder the data and this follows; nothing
 *    here hardcodes a slug.
 *  - The overlay card on the featured photo is the only dark surface in the section. It
 *    sits over sky, so the navy is held at 92% -- at 85% a bright frame lifted the
 *    composite enough to drop the secondary line under AA.
 *  - `whitespace-pre-line` plus `\n` in the promise labels, matching CtaBand, so the two
 *    strips break their lines the same way.
 */

// categoryMeta names its icon as a string; map it to the component here.
const CATEGORY_ICONS = { Layers, Warehouse, Hammer };

const PROMISES = [
  'Premium Quality\nAssured',
  'On-time\nDelivery',
  'Competitive\nPricing',
  'Global Standards\nCompliant',
  'Dedicated\nSupport',
];

const EASE = [0.22, 1, 0.36, 1];

/** The hand-drawn rule under the accent phrase. Decorative: no colour contrast duty. */
function Swoosh() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 8"
      preserveAspectRatio="none"
      className="absolute -bottom-1 left-0 h-2 w-full text-primary"
    >
      <path
        d="M1 5.2c34-3.4 68-4.6 101-3.6 33 1 66 4.2 97 5.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function CoreSolutions() {
  const reduce = useReducedMotion();
  const [featured, ...rest] = getAllCategories();
  const FeaturedIcon = CATEGORY_ICONS[featured.icon] || Layers;

  const rise = (delay = 0) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: 0.6, delay, ease: EASE },
  });

  return (
    <section className="section-pad bg-surface-bright">
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-center lg:gap-12">
          {/* Overview */}
          <motion.div {...rise()}>
            <span className="eyebrow text-primary-darker">Who We Are</span>
            <span aria-hidden className="mt-2 block h-0.5 w-10 rounded-full bg-primary-dark" />

            <h2 className="mt-5 font-display text-3xl font-bold leading-[1.15] tracking-[-0.02em] text-text sm:text-4xl">
              Engineering Excellence.{' '}
              <span className="relative inline-block text-primary-dark">
                Building Global Trust.
                <Swoosh />
              </span>
            </h2>

            <p className="mt-5 max-w-[34rem] text-base leading-relaxed text-text-body">
              KEAA International is a leading manufacturer and exporter of scaffolding systems, formwork
              accessories, safety products and industrial solutions, delivering engineering excellence to more
              than 42 countries with precision, quality and reliability.
            </p>

            <Button to="/products" icon={ArrowRight} size="lg" className="mt-8">
              Explore All Solutions
            </Button>
          </motion.div>

          {/* Featured category */}
          <motion.div {...rise(0.1)} className="relative">
            <div className="relative overflow-hidden rounded-2xl shadow-[0_1px_2px_-1px_rgb(var(--color-text)_/_0.08),0_32px_72px_-40px_rgb(var(--color-text)_/_0.45)] ring-1 ring-border">
              <img
                src={featured.heroImage}
                alt={featured.name}
                loading="lazy"
                className="aspect-[16/10] w-full object-cover"
              />

              {/* Reach badge. `42+` is the figure company.js already publishes. */}
              <div className="absolute right-4 top-4 flex items-center gap-3 rounded-xl bg-surface-raised/[0.92] px-3.5 py-2.5 shadow-lg ring-1 ring-border backdrop-blur-sm sm:right-5 sm:top-5">
                <span
                  aria-hidden
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ring-1 ring-border"
                  style={{
                    background:
                      'linear-gradient(150deg, rgb(var(--color-primary-light) / 0.20), rgb(var(--color-primary) / 0.06))',
                  }}
                >
                  <Globe2 className="h-5 w-5 text-primary-dark" strokeWidth={1.6} />
                </span>
                <span className="leading-tight">
                  <span className="block text-[11px] text-text-muted">Trusted by</span>
                  <span className="block text-sm font-semibold text-text">42+ Countries</span>
                </span>
              </div>

              {/* Lead category, laid over the photo */}
              <Link
                to={`/products/${featured.slug}`}
                className="group absolute inset-x-3 bottom-3 flex items-center gap-4 rounded-xl bg-surface-deep/[0.92] p-4 ring-1 ring-white/10 backdrop-blur-sm transition-colors hover:bg-surface-deep sm:inset-x-4 sm:bottom-4 sm:gap-5 sm:p-5"
              >
                {/* Solid blue chip, white glyph — same blue as the arrow disc beside it. */}
                <span
                  aria-hidden
                  className="hidden h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary-dark text-white sm:flex"
                >
                  <FeaturedIcon className="h-6 w-6" strokeWidth={1.6} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-lg font-bold text-white">{featured.name}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-white/75">{featured.short}</span>
                </span>
                <span
                  aria-hidden
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary-dark text-white transition-transform duration-300 group-hover:translate-x-0.5"
                >
                  <ArrowRight className="h-5 w-5" />
                </span>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* The remaining categories */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {rest.map((cat, i) => {
            const Icon = CATEGORY_ICONS[cat.icon] || Layers;
            return (
              <motion.div key={cat.slug} {...rise(0.06 * i)} className="h-full">
                <Link
                  to={`/products/${cat.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl bg-surface-raised shadow-[0_1px_2px_-1px_rgb(var(--color-text)_/_0.06),0_20px_44px_-32px_rgb(var(--color-text)_/_0.35)] ring-1 ring-border transition-all duration-300 hover:-translate-y-1 hover:ring-primary/40"
                >
                  {/* The zoom needs a clip; the icon chip must escape it. Two boxes, so
                      `overflow-hidden` never reaches the chip and halve it. */}
                  <div className="relative">
                    <div className="overflow-hidden">
                      <img
                        src={cat.heroImage}
                        alt={cat.name}
                        loading="lazy"
                        className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <span
                      aria-hidden
                      className="absolute -bottom-6 left-5 flex h-12 w-12 items-center justify-center rounded-full bg-surface-raised shadow-md ring-1 ring-border"
                    >
                      <Icon className="h-5 w-5 text-primary-dark" strokeWidth={1.6} />
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-5 pt-10">
                    <h3 className="font-display text-base font-bold leading-snug text-text">{cat.name}</h3>
                    <div className="mt-2 flex flex-1 items-end justify-between gap-3">
                      <p className="text-[13px] leading-relaxed text-text-muted">{cat.short}</p>
                      <span
                        aria-hidden
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-primary-dark transition-transform duration-300 group-hover:translate-x-1"
                      >
                        <ArrowRight className="h-5 w-5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Promise strip */}
        <motion.ul
          {...rise(0.1)}
          className="mt-6 grid grid-cols-1 gap-5 rounded-2xl bg-surface-raised p-5 shadow-[0_1px_2px_-1px_rgb(var(--color-text)_/_0.06)] ring-1 ring-border sm:grid-cols-2 lg:grid-cols-5 lg:gap-0 lg:divide-x lg:divide-border"
        >
          {PROMISES.map((label) => (
            <li key={label} className="flex items-center gap-3 lg:justify-center lg:px-4">
              <CheckCircle2 aria-hidden className="h-5 w-5 flex-shrink-0 text-primary-dark" strokeWidth={1.7} />
              <span className="whitespace-pre-line text-[13px] font-semibold leading-snug text-text">{label}</span>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
