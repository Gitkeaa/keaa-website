import { Link } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Button from '../ui/Button';

/**
 * The framed hero carousel used on every interior page except Home — in the style of the
 * client's benchmark (lely.com): a rounded, inset card with a slow crossfade of real KEAA
 * photography where the COPY changes with the photo, so the hero tells a short rotating story
 * rather than one caption over a moving background.
 *
 *   slides   — [{ image, title, accent?, desc? }], one entry per photo+copy pair.
 *   eyebrow  — the page label, shown above every slide's heading.
 *   interval — ms per slide (default 8000). Static under reduced motion.
 *   scrollTo — id the "Explore" hint jumps to.
 *
 * Below the copy sits a control bar: dots on the left, prev/next + Explore on the right. Any
 * change — a click or the timer — restarts the clock, so it never advances the instant you tap.
 */
export default function GalleryHero({ slides = [], crumbs = [], cta, interval = 8000 }) {
  const reduce = useReducedMotion();
  const [slide, setSlide] = useState(0);
  const count = slides.length;

  const go = useCallback((n) => setSlide((count + (n % count)) % count), [count]);

  // setTimeout keyed on `slide`: every change (auto OR manual) reschedules the next advance,
  // so a manual click resets the clock instead of firing again immediately.
  useEffect(() => {
    if (reduce || count < 2) return undefined;
    const t = setTimeout(() => go(slide + 1), interval);
    return () => clearTimeout(t);
  }, [slide, reduce, count, interval, go]);

  const active = slides[slide] || {};
  const arrow =
    'flex h-9 w-9 items-center justify-center rounded-full bg-white/12 text-lg text-white backdrop-blur-sm transition-colors hover:bg-white/25';

  return (
    <section className="px-3 sm:px-5 lg:px-6">
      <div className="relative isolate flex min-h-[520px] overflow-hidden rounded-3xl lg:min-h-[600px]">
        {/* ---- crossfading photography ---- */}
        {slides.map((s, i) => (
          <img
            key={s.image}
            src={s.image}
            alt=""
            loading="eager"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              i === slide ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/35 to-navy-950/10"
        />

        {/* ---- breadcrumb ---- */}
        {crumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="absolute left-6 top-5 z-10 flex items-center gap-1.5 text-xs text-white/85 sm:left-10 sm:top-8 lg:left-12"
          >
            {crumbs.map((c, i) => (
              <span key={c.label} className="flex items-center gap-1.5">
                {i > 0 && <span aria-hidden className="text-white/45">/</span>}
                {c.to ? (
                  <Link to={c.to} className="border-b border-transparent pb-0.5 transition-colors hover:border-white/70">
                    {c.label}
                  </Link>
                ) : (
                  <span aria-current="page">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        {/* ---- copy (changes per slide) then the control bar ---- */}
        <div className="relative z-10 mt-auto flex w-full flex-col gap-8 p-6 sm:p-10 lg:p-12">
          <motion.div
            key={slide}
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
          >
            {/* Just the heading and the line under it — the eyebrow and the stats row were
                removed on request, so each slide is one main heading + one body line. */}
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-[-0.02em] text-white sm:text-5xl lg:text-6xl">
              {active.title} {active.accent && <span className="text-primary-light">{active.accent}</span>}
            </h1>
            {active.desc && (
              <p className="mt-4 max-w-xl text-body leading-relaxed text-white/85">{active.desc}</p>
            )}

            {cta && (
              <Button to={cta.to} variant="primary" className="mt-7">
                {cta.label}
              </Button>
            )}
          </motion.div>

          {/* ---- control bar: prev/next arrows, right-aligned ---- */}
          {count > 1 && (
            <div className="flex items-center justify-end gap-3">
              <button type="button" onClick={() => go(slide - 1)} aria-label="Previous slide" className={arrow}>
                &lsaquo;
              </button>
              <button type="button" onClick={() => go(slide + 1)} aria-label="Next slide" className={arrow}>
                &rsaquo;
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
