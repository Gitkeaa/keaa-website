import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';
import useSplashDone from '../../hooks/useSplash';

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

const EASE = [0.22, 1, 0.36, 1];

/**
 * The stock photographs are warm — orange steel, amber dusk — the literal complement of
 * the brand blue, so they need desaturating hard and re-hueing to read as one brand.
 *
 * Changing these is safe for contrast. `mix-blend-mode: color` rewrites hue and leaves
 * luminance alone, and the scrim below is solved against a pure-black backdrop anyway.
 */
const GRADE = { filter: 'saturate(0.4) contrast(1.2) brightness(0.99)', tint: 0.55 };

/**
 * Left-anchored, like the homepage hero, rather than `.container-page` — which centres a
 * max-w-7xl column and pushes the copy ~355px in on a 1920px screen.
 *
 * This deliberately breaks alignment with the sections below, which all still centre.
 * That is the trade the left-anchored look costs, and the homepage already pays it.
 * Moving the copy left only shortens its right edge as a percentage of the viewport,
 * which increases scrim coverage behind it — a safe direction for the contrast solve.
 */
const GUTTER = 'w-full px-5 sm:px-8 lg:pl-12 lg:pr-10 xl:pl-16 2xl:pl-24';

export default function PageHero({ eyebrow, title, accent, desc, crumbs = [], stats = [], image }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const drift = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const parallax = reduce ? 0 : drift;
  const splashDone = useSplashDone();

  const media = image;

  return (
    <section
      ref={ref}
      className="relative isolate flex min-h-[420px] items-center overflow-hidden bg-surface-bright sm:min-h-[460px] lg:min-h-[500px]"
    >
      {media && (
        <div className="absolute inset-0 z-0" style={{ isolation: 'isolate' }}>
          <motion.div
            initial={{ scale: reduce ? 1 : 1.06 }}
            animate={splashDone ? { scale: 1 } : undefined}
            transition={{ duration: 1.4, ease: EASE }}
            style={{ y: parallax }}
            className="absolute -top-[8%] left-0 right-0 h-[116%]"
          >
            {/* No opacity animation: this is the page's largest paint. */}
            <img
              src={image}
              alt=""
              className="h-full w-full object-cover object-[55%_40%]"
              style={{ filter: GRADE.filter }}
            />
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

      <div className={`${GUTTER} relative z-10 py-14 sm:py-16 lg:py-20`}>
        {crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-xs text-text-strong">
            {crumbs.map((c, i) => (
              <span key={c.label} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="h-3 w-3 text-primary" />}
                {c.to ? (
                  <Link to={c.to} className="transition-colors hover:text-primary-darker">
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
          animate={splashDone ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6, ease: EASE }}
        >
          {eyebrow && <span className="eyebrow text-primary-darker">{eyebrow}</span>}
          {/* 34rem — see note 2 at the top of this file. */}
          <h1 className="mt-3 max-w-[34rem] font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-text sm:text-4xl lg:text-5xl">
            {title} {accent && <span className="text-primary-dark">{accent}</span>}
          </h1>
          {desc && <p className="mt-4 max-w-[30rem] text-base leading-relaxed text-text-body sm:text-[17px]">{desc}</p>}
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
