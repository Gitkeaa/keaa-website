import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import AnimatedCounter from './AnimatedCounter';
import { EASE } from '../../lib/motion';

/**
 * The interior-page hero, rebuilt to match the homepage: a light stage with the
 * photograph bleeding in from the right, rather than a dark navy block.
 *
 * Three things are load-bearing.
 *
 *  1. Every page passes a different image, so unlike the homepage hero the scrim cannot
 *     be solved against measured pixels. It is solved against the worst case instead —
 *     the copy stays legible even if the pixel behind it were pure black.
 *
 *  2. The copy column is capped at 34rem. That is not cosmetic. The accent colour
 *     (`primary-dark`) is a mid-tone, and a mid-tone's worst backdrop is another
 *     mid-tone, not black: at 55% of the viewport the scrim has thinned to ~0.56 and the
 *     accent measures 1.39:1. Capped at 34rem the headline ends near 46%, where the
 *     scrim still holds ~0.83 and the accent clears 3:1. Widen the column and you must
 *     re-solve the gradient.
 *
 *  3. Every page image is graded to the brand blue. The stock photos are warm — orange
 *     steel, amber dusk — and the `color` blend rewrites hue while keeping luminance,
 *     so eight different pages read as one brand.
 */

/**
 * The stock photographs are warm — orange steel, amber dusk — the literal complement of
 * the brand blue, so they need desaturating hard and re-hueing to read as one brand.
 *
 * Changing these is safe for contrast. `mix-blend-mode: color` rewrites hue and leaves
 * luminance alone, and the scrim below is solved against a pure-black backdrop anyway.
 */
const GRADE = { filter: 'saturate(0.4) contrast(1.2) brightness(0.99)', tint: 0.55 };

/**
 * Rides the FULL tier like the homepage hero: edge-to-edge, no width cap, with the shared
 * responsive gutter (`.container-full` → padding-inline: var(--gutter)). It reads as
 * left-anchored because the copy is capped at max-w-[34rem] on the left, so it
 * deliberately breaks alignment with the centred sections below.
 *
 * Moving the copy left (the tokenised gutter is ≤72px vs the old 96px) only shortens its
 * right edge as a percentage of the viewport, which increases scrim coverage behind it —
 * a safe direction for the contrast solve.
 */
const GUTTER = 'container-full';

/**
 * `align="center"` is for the imageless heroes only (the legal pages). The default
 * left anchor is load-bearing for the contrast solve above — it depends on the copy
 * sitting where the scrim is thickest — so centring copy OVER a photo would break it.
 * With no image there is no scrim and no solve, so centring is free.
 */
export default function PageHero({
  eyebrow,
  title,
  accent,
  desc,
  crumbs = [],
  stats = [],
  image,
  images,
  align = 'left',
}) {
  const centered = align === 'center';
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const drift = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const parallax = reduce ? 0 : drift;

  // `images` (an array) turns the hero photo into a slow crossfade slideshow; `image` (single)
  // is the still-image path every other page uses. Both share the same grade + scrim treatment.
  const slides = images && images.length ? images : image ? [image] : [];
  const media = slides.length > 0;
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    if (reduce || slides.length < 2) return undefined; // one image, or reduced motion: no cycling
    const t = setInterval(() => setSlide((s) => (s + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [reduce, slides.length]);

  return (
    <section
      ref={ref}
      /* The tall min-height exists to give the photograph room; a centred, imageless legal
         hero has no photo, so that height just becomes empty space above and below a short
         heading. There it collapses to its own padding + content instead. */
      className={`relative isolate flex items-center overflow-hidden bg-surface-bright ${
        centered ? '' : 'min-h-[420px] sm:min-h-[460px] lg:min-h-[500px]'
      }`}
    >
      {media && (
        <div className="absolute inset-0 z-0" style={{ isolation: 'isolate' }}>
          <motion.div
            initial={{ scale: reduce ? 1 : 1.06 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.4, ease: EASE }}
            style={{ y: parallax }}
            className="absolute -top-[8%] left-0 right-0 h-[116%]"
          >
            {/* Slides stacked and crossfaded; a single image is just a one-item slideshow that
                never changes. All eager, NOT lazy: a slide sits at opacity 0 until its turn,
                and the browser treats a lazy off-screen-looking image as deferrable, so it
                would still be unloaded when the crossfade reaches it and fade in to nothing. */}
            {slides.map((src, i) => (
              <img
                key={src}
                src={src}
                alt=""
                loading="eager"
                className={`absolute inset-0 h-full w-full object-cover object-[55%_40%] transition-opacity duration-1000 ${
                  i === slide ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ filter: GRADE.filter }}
              />
            ))}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(175deg, rgb(var(--color-photo-tint-top)) 0%, rgb(var(--color-photo-tint-mid)) 58%, rgb(var(--color-photo-tint-base)) 100%)',
                mixBlendMode: 'color',
                opacity: GRADE.tint,
              }}
            />
          </motion.div>
        </div>
      )}

      {/* Draughtsman's grid — a texture, not a pattern. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          backgroundImage:
            'linear-gradient(rgb(var(--color-primary-dark) / 0.05) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--color-primary-dark) / 0.05) 1px, transparent 1px)',
          backgroundSize: '34px 34px',
          WebkitMaskImage: 'radial-gradient(100% 120% at 10% 40%, #000 22%, transparent 72%)',
          maskImage: 'radial-gradient(100% 120% at 10% 40%, #000 22%, transparent 72%)',
        }}
      />

      {media && (
        <>
          {/* Below lg the copy spans most of the width, so the photo is held right back. */}
          <div
            aria-hidden
            className="absolute inset-0 z-[1] lg:hidden"
            style={{
              background:
                'linear-gradient(180deg, rgb(var(--color-surface-bright) / 0.95) 0%, rgb(var(--color-surface-bright) / 0.88) 100%)',
            }}
          />
          {/* Holds 0.96 -> 0.82 across the copy (which ends by 46%), then falls away fast.
              The stops out to 48% are what the contrast solve depends on; the tail past
              56% only decides how quickly the photograph is unveiled. */}
          <div
            aria-hidden
            className="absolute inset-0 z-[1] hidden lg:block"
            style={{
              background:
                'linear-gradient(90deg, rgb(var(--color-surface-bright) / 0.96) 0%, rgb(var(--color-surface-bright) / 0.92) 20%, rgb(var(--color-surface-bright) / 0.86) 40%, rgb(var(--color-surface-bright) / 0.82) 48%, rgb(var(--color-surface-bright) / 0.48) 55%, rgb(var(--color-surface-bright) / 0.16) 62%, rgb(var(--color-surface-bright) / 0) 68%)',
            }}
          />
          {/* Settles the photo into whatever section follows. */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 z-[1] h-24 bg-gradient-to-t from-surface-tint to-transparent"
          />
        </>
      )}

      <div className={`${GUTTER} relative z-10 py-14 sm:py-16 lg:py-20 ${centered ? 'text-center' : ''}`}>
        {crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className={`mb-5 flex items-center gap-1.5 text-xs text-text-strong ${centered ? 'justify-center' : ''}`}>
            {crumbs.map((c, i) => (
              <span key={c.label} className="flex items-center gap-1.5">
                {i > 0 && (
                  <span aria-hidden className="text-primary">
                    /
                  </span>
                )}
                {c.to ? (
                  <Link
                    to={c.to}
                    className="border-b border-transparent pb-0.5 transition-colors hover:border-primary hover:text-primary-darker"
                  >
                    {c.label}
                  </Link>
                ) : (
                  <span className="font-medium text-text" aria-current="page">
                    {c.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        )}

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          {eyebrow && <span className="eyebrow text-primary-darker">{eyebrow}</span>}
          {/* 34rem — see note 2 at the top of this file. Centred heroes have no image and
              so no contrast solve to protect: the cap only balances the line, and mx-auto
              centres it. */}
          <h1
            className={`mt-3 max-w-[34rem] font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-text sm:text-4xl lg:text-5xl ${
              centered ? 'mx-auto' : ''
            }`}
          >
            {title} {accent && <span className="text-primary-dark">{accent}</span>}
          </h1>
          {/* Satoshi Light lead. Kept capped at 30rem, NOT the .body-copy 768px measure —
              the copy column width is load-bearing for the hero contrast solve (see note
              2 above). Only the type is upgraded: 300 weight, 1.8 line-height, 0.2px ink. */}
          {/* Same body token as every other reading paragraph — this was 17px stepping to
              18px at `sm`, which made the interior-page intro a different size from the
              copy directly beneath it. */}
          {desc && <p className={`mt-5 max-w-[30rem] text-body text-text-body ${centered ? 'mx-auto' : ''}`}>{desc}</p>}
        </motion.div>

        {stats.length > 0 && (
          <div className="mt-9 flex max-w-[34rem] flex-wrap gap-x-10 gap-y-5 border-t border-primary/20 pt-7">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="font-display text-2xl font-bold leading-none text-primary-dark">
                  {/* `block` widens AnimatedCounter's observed box: it watches its own inline
                      span with a -40px inset, and a short value at the container's left edge
                      would otherwise never trigger. */}
                  {reduce ? s.value : <AnimatedCounter value={s.value} className="block" />}
                </div>
                <div className="mt-1 text-xs text-text-strong">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
