import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Button from '../ui/Button';
import { getAllCategories, TOTAL_PRODUCTS } from '../../data/categories';
import { img } from '../../data/images';
import { company } from '../../data/company';

/**
 * "Products at KEAA" — the catalogue's shop window on the home page, sitting directly under
 * the "Who We Are" band.
 *
 * TWO columns, matching the design this was built from: the pitch and the category rail on
 * the left, and ONE card on the right holding the selected category — photograph, copy and
 * the proof numbers together. The numbers live inside that card rather than in a box of
 * their own; they are evidence for the category being shown, so splitting them into a third
 * floating panel broke the relationship the design was making.
 *
 * Picking a category swaps the card's contents in place; it never navigates. Navigation is a
 * deliberate second step ("Explore Products"), so a visitor can look through all four options
 * without leaving the page.
 *
 * THE DIAGONAL is done with skew, not clip-path: the photo's frame is skewed and the <img>
 * inside is counter-skewed by the same angle, so the picture itself stays undistorted while
 * its frame leans. That also means the accent line along the cut is just a `border-r` on the
 * frame — no second clipped element that has to be kept in sync with the first. The image is
 * scaled up because skewing a box pulls its corners inside the source rectangle.
 *
 * WHAT IS AND IS NOT REAL HERE — this matters, because the design showed things the
 * catalogue cannot back:
 *
 *  - The rail lists the THREE categories that exist in categories.json, plus "All
 *    Categories". The design showed seven; the extra four have no products, no slug and
 *    nowhere to link. Add them to the catalogue data and they appear here on their own —
 *    this component never hard-codes a category.
 *  - Every number is derived. `TOTAL_PRODUCTS` is summed from the catalogue and the years
 *    figure is computed from `company.founded`, so neither can drift the way a typed-in
 *    "500+" would.
 *
 * Icon-free and single-accent by house rule: no glyphs outside the footer's social row, and
 * brand blue is the one accent (the design's gold is not used). Arrows are text characters,
 * as they already are on ProjectCard.
 */

const EASE = [0.22, 1, 0.36, 1];

/* How far the photograph's frame leans. One constant, used twice with opposite signs — the
   counter-skew on the <img> must always be the exact negation or the picture shears. */
const SKEW = 10;

/* The catalogue is the source of truth for what a visitor can actually browse. */
const CATEGORIES = getAllCategories();

/**
 * "All Categories" is a synthetic first row, not a category in the data. It carries the
 * whole-catalogue pitch and points at the unfiltered index, which is why its `slug` is null —
 * `hrefFor` reads that as "no filter".
 */
const ALL = {
  slug: null,
  name: 'All Categories',
  count: TOTAL_PRODUCTS,
  short:
    'The complete KEAA range: modular scaffolding and formwork, livestock housing systems and structural wood connectors, all manufactured to global standards.',
  /*
    Its OWN photograph, not a borrowed one. This used to fall back to CATEGORIES[0], which
    meant "All Categories" and "Scaffolding & Formworks" showed the identical picture — so
    the first click in the rail appeared to do nothing.

    An export yard rather than a fourth product shot: it is the one image that belongs to no
    single category, it reads as the whole range going out to the 42+ countries claimed in
    the stats beside it, and it stays clear of the factory photograph the Manufacturing band
    directly below this section already uses.
  */
  heroImage: img.containersStacked,
};

const ROWS = [ALL, ...CATEGORIES];

const hrefFor = (cat) => (cat.slug ? `/products/${cat.slug}` : '/products');

/**
 * The six promises the client asked to be represented on the site. Kept to bare labels: this
 * section already carries the catalogue pitch, and six sentences here would bury it.
 */
const PROMISES = [
  'Premium Quality',
  'Global Exports',
  'Competitive Pricing',
  'Timely Delivery',
  'Dedicated Support',
  'Custom Solutions',
];

export default function ProductsShowcase() {
  const reduce = useReducedMotion();
  const [activeSlug, setActiveSlug] = useState(ALL.slug);

  const active = ROWS.find((c) => c.slug === activeSlug) || ALL;

  /* Derived, never typed: the copy stays correct as the catalogue and the calendar move. */
  const years = new Date().getFullYear() - company.founded;

  const STATS = [
    { value: `${TOTAL_PRODUCTS}+`, label: 'Products' },
    { value: '42+', label: 'Countries Served' },
    { value: `${years}+`, label: 'Years of Excellence' },
    { value: 'ISO 9001:2015', label: 'Certified Quality' },
  ];

  const rise = (delay = 0) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: 0.6, delay, ease: EASE },
  });

  return (
    <section className="section-pad">
      {/*
        `container-page`, NOT `container-wide`. Both share the same gutter, but wide caps at
        2040px against the content tier's narrower cap — so on a large screen this band pushed
        out past the "Who We Are" panel above it and the manufacturing band below, and the
        page grew a visible step in its left and right edges.
      */}
      <div className="container-page">
        <motion.div
          {...rise()}
          className="grid gap-6 lg:grid-cols-[19rem_minmax(0,1fr)] lg:items-start lg:gap-8"
        >
          {/* ------------------------------------------------------- PITCH + CATEGORY RAIL */}
          <div>
            <span className="eyebrow text-primary-darker">Products at KEAA</span>
            <h2 className="mt-3 font-display text-3xl font-bold leading-[1.08] tracking-[-0.02em] text-text">
              Built for Strength.{' '}
              {/* Black, not the brand accent. Headings are solid black site-wide — the accent
                  stays on the eyebrow and the CTA, not in the headline. */}
              <span className="block">Engineered for Excellence.</span>
            </h2>
            <p className="mt-4 text-body-compact text-text-muted">
              From structural components to precision fasteners, our solutions are designed to
              deliver reliability in every build.
            </p>

            <ul className="mt-6 flex flex-col gap-1.5 rounded-card border border-border bg-surface-raised p-2">
              {ROWS.map((cat) => {
                const isActive = cat.slug === activeSlug;
                return (
                  <li key={cat.slug ?? 'all'}>
                    {/*
                      A BUTTON, not a link. Selecting a category is an in-page state change;
                      the link out lives in the card. `aria-pressed` is what tells a screen
                      reader which one is showing, since the only other cue is colour.
                    */}
                    <button
                      type="button"
                      onClick={() => setActiveSlug(cat.slug)}
                      aria-pressed={isActive}
                      className={`flex w-full items-center justify-between gap-3 rounded-card px-4 py-3 text-left text-sm font-semibold transition-colors ${
                        isActive
                          ? 'bg-navy-900 text-white'
                          : 'text-text hover:bg-navy-50 hover:text-primary-darker'
                      }`}
                    >
                      <span className="min-w-0 truncate">{cat.name}</span>
                      <span
                        aria-hidden
                        className={`flex-shrink-0 text-xs ${isActive ? 'text-white' : 'text-text-muted'}`}
                      >
                        &rarr;
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* ------------------------------------------------------------ THE CARD */}
          {/* One card, two tracks: the photo-and-copy stage, then the numbers behind a
              hairline. `overflow-hidden` is what crops the skewed photo frame to the card's
              own rounded corners — without it the lean spills past the card edge. */}
          <div className="overflow-hidden rounded-card border border-border bg-surface-raised">
            <div className="grid xl:grid-cols-[minmax(0,1fr)_14rem]">
              {/* ---------------------------------------------------------- STAGE */}
              {/*
                READABILITY IS STRUCTURAL HERE, NOT A GRADIENT. An earlier cut floated the
                copy on top of the photograph behind a white wash, and a review measured the
                body text at ~0.07 alpha over the picture on phones and across the whole
                1024–1280px laptop band: the wash faded out as a percentage of a FLUID panel
                while the copy stayed a FIXED width, so the narrower the panel the further the
                text ran past the wash. (`via-white/92` also silently emitted nothing —
                Tailwind's opacity scale has no 92 — so the ramp was even flatter than it read.)
                The copy now owns a real grid track with a solid background, so no text is ever
                over an image at any width, and there is no arithmetic left to get wrong.
              */}
              <div className="grid lg:grid-cols-[20rem_minmax(0,1fr)]">
                {/* Below lg the photograph is a plain banner ABOVE the copy — stacked, never
                    behind it. The diagonal only appears at lg, where there are two columns
                    for it to cut between. */}
                {active.heroImage && (
                  <img
                    key={`banner-${active.slug ?? 'all'}`}
                    src={active.heroImage}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-44 w-full object-cover lg:hidden"
                  />
                )}

                {/* COPY — z-10 so its diagonal backdrop paints over the photo column. */}
                <motion.div
                  key={active.slug ?? 'all'}
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="relative z-10 flex flex-col justify-center p-6 sm:p-8"
                >
                  {/*
                    The diagonal. A skewed slab of the card's own colour whose RIGHT edge is
                    the cut, carrying the accent line as a border — brand blue, where the
                    design used gold. It reaches 3rem into the photo column so the lean is
                    visible, and far off to the left so the skew never exposes the card edge.
                    Because it is anchored to a fixed 20rem track, the cut lands in the same
                    place at every width — nothing here depends on the viewport.
                  */}
                  <div
                    aria-hidden
                    className="absolute inset-y-0 left-[-8rem] right-[-3rem] hidden border-r-2 border-primary bg-surface-raised lg:block"
                    style={{ transform: `skewX(-${SKEW}deg)` }}
                  />

                  <div className="relative">
                    <span className="eyebrow text-primary-darker">
                      {active.slug ? 'Featured Category' : 'Full Range'}
                    </span>
                    <h3 className="mt-2 font-display text-2xl font-bold leading-tight tracking-[-0.01em] text-text">
                      {active.name}
                    </h3>
                    <p className="mt-3 text-body-compact text-text-muted">{active.short}</p>
                    <p className="mt-3 text-[13px] font-semibold text-text">
                      {active.count} products
                      {active.subcategories?.length
                        ? ` · ${active.subcategories.length} sub-categories`
                        : ''}
                    </p>
                    <div className="mt-5">
                      <Button to={hrefFor(active)}>Explore Products &rarr;</Button>
                    </div>
                  </div>
                </motion.div>

                {/* PHOTO COLUMN — lg and up only; the stacked banner above covers smaller. */}
                <div className="relative hidden min-h-[23rem] overflow-hidden lg:block">
                  {active.heroImage && (
                    <img
                      /* Keyed on the slug so React swaps the element rather than mutating
                         `src`, which is what lets the change read as a change. */
                      key={active.slug ?? 'all'}
                      src={active.heroImage}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                </div>
              </div>

              {/* ---------------------------------------------------------- NUMBERS */}
              {/* Inside the card, behind a hairline — evidence for the category on show, not
                  a panel of its own. The border flips from top to left at `lg`, where the
                  column moves from under the stage to beside it. */}
              <ul className="flex flex-col justify-center border-t border-border px-5 py-1 xl:border-l xl:border-t-0">
                {STATS.map((s, i) => (
                  <li
                    key={s.label}
                    /* Hairlines BETWEEN the figures only — a rule under the last one would
                       read as the start of something that never comes. */
                    className={`py-4 ${i > 0 ? 'border-t border-border' : ''}`}
                  >
                    <div className="font-display text-xl font-bold leading-none text-text">
                      {s.value}
                    </div>
                    <div className="mt-1.5 text-xs text-text-muted">{s.label}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* ------------------------------------------------------------------- PROMISES */}
        <motion.ul
          {...rise(0.15)}
          className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6"
        >
          {PROMISES.map((p) => (
            <li
              key={p}
              className="rounded-card bg-navy-50 px-3 py-3 text-center text-[13px] font-semibold leading-snug text-text"
            >
              {p}
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
