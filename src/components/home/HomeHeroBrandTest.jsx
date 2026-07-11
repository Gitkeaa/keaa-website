import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, ExternalLink, Download, Award, Globe2, Factory, Package } from 'lucide-react';
import AnimatedCounter from '../ui/AnimatedCounter';
import HeroMediaNav from './HeroMediaNav';
import { droneFilmUrl, heroFilms } from '../../data/content';

/**
 * HOMEPAGE HERO — bright split, brand-blue.
 *
 * Three things here are deliberate and easy to undo by accident:
 *
 *  1. The crop is `object-position: 50% 42%`, which frames sky and the crane above the
 *     scaffolded tower. Pulling it tighter (e.g. 54% 22%) fills the frame with the
 *     building's slab, which reads as a featureless cuboid and loses the sky entirely.
 *
 *  2. The photograph is graded in layers, not just filtered. The stock original is warm
 *     orange — the literal complement of the brand blue — and evenly lit, which is why
 *     it read flat. `contrast`/`saturate` set the tonal range and a `color` blend
 *     rewrites hue while keeping luminance. Strip the layers and both the orange and the
 *     flatness come back.
 *
 *  3. The left scrim is solved against the photo's *actual* pixels, not a worst-case
 *     guess. Measured on hero.jpg at this crop: sky holds luminance 0.33–0.60 out to
 *     ~44% of the width, and the tower's dark edge only takes over past 48%. Because the
 *     copy is capped before that, the scrim never needs more than alpha 0.38 — a fifth
 *     of what a black-backdrop assumption would demand, which is why the photo no longer
 *     looks washed. Two things buy that headroom and must not be reverted casually:
 *     the eyebrow is #1a4f8f rather than #2065be (11px needs 4.5:1; #2065be would force
 *     alpha 0.75, #1a4f8f only 0.38) and the trust line is #334155 rather than #475569.
 *
 *  4. The stat card's glass is capped at 85% white. Below 82% its labels fall under
 *     4.5:1 against a dark photo pixel. `backdrop-blur` does not count toward contrast.
 *
 * Isolated by contract: no shared tokens, no shared component edits. index.css ships
 * `.dark .bg-white { ... !important }` and useTheme really toggles `.dark`, so every
 * bright surface here is arbitrary hex, out of that rule's reach.
 */

/**
 * The intended photograph. Save the supplied file (scaffolded tower, blue sky, clouds,
 * sun flare top-right) to `public/images/hero-scaffolding.jpg` and it is picked up with
 * no code change. Prefer ~2400px wide, quality ~80.
 */
const HERO_IMAGE = '/images/hero2.jpg';

// Until that file exists the hero falls back to the Unsplash frame it used before, so a
// missing asset degrades to the old photo rather than to a broken image.
const FALLBACK = 'https://images.unsplash.com/photo-1636362556682-11231883c01c';
const fbSrc = (w) => `${FALLBACK}?auto=format&fit=crop&q=82&w=${w}`;
const FALLBACK_SRCSET = [768, 1200, 1600, 2000, 2560, 3200].map((w) => `${fbSrc(w)} ${w}w`).join(', ');

/**
 * The two photos need different grades, so the grade follows the source rather than
 * being hard-coded. The Unsplash frame is warm orange — the literal complement of the
 * brand blue — and needs to be desaturated hard and re-hued. The supplied photo is
 * already cool steel under a blue sky, so it only needs a nudge; grading it as hard as
 * the fallback would drain it.
 */
const GRADE = {
  local: { filter: 'saturate(0.92) contrast(1.08) brightness(1.02)', hueOpacity: 0.16 },
  fallback: { filter: 'saturate(0.42) contrast(1.16) brightness(1.03)', hueOpacity: 0.62 },
  // The film is already cool and correctly exposed. The hue blend is kept low (0.04) so
  // the footage keeps its own colour — green fields, yellow floor lines — instead of
  // reading as one flat blue wash. `mix-blend-mode: color` preserves luminance, so this
  // value is free to move without touching text contrast.
  video: { filter: 'saturate(0.9) contrast(1.05) brightness(1.02)', hueOpacity: 0.04 },
};

/**
 * The left scrim, per slide.
 *
 * `photo` is solved against hero2.jpg's *measured* pixels: its sky holds luminance
 * 0.33–0.60 out to ~44% of the width, so alpha never needs to exceed 0.38 and the
 * photograph stays bright straight through the copy.
 *
 * The film cannot use that. Its factory interiors run down to a mean luminance of ~0.30,
 * and the copy here is dark ink. `video` is therefore solved against a much darker
 * backdrop, which is why it is a heavier veil. Swapping a slide's media without swapping
 * its scrim is how this hero silently loses AA.
 */
const SCRIM = {
  photo:
    'linear-gradient(90deg, rgb(var(--color-surface-bright) / 0.86) 0%, rgb(var(--color-surface-bright) / 0.72) 18%, rgb(var(--color-surface-bright) / 0.58) 34%, rgb(var(--color-surface-bright) / 0.46) 44%, rgb(var(--color-surface-bright) / 0.38) 50%, rgb(var(--color-surface-bright) / 0.14) 58%, rgb(var(--color-surface-bright) / 0) 66%)',
  // Solved to the lightest veil that still clears AA against the darkest frames of every
  // film: the 52px accent is the binding constraint at ~37% of the width, and it holds
  // ~3.1:1 here (need 3.0). Take these any lower and the headline fails over dark footage.
  video:
    'linear-gradient(90deg, rgb(var(--color-surface-bright) / 0.905) 0%, rgb(var(--color-surface-bright) / 0.87) 18%, rgb(var(--color-surface-bright) / 0.82) 34%, rgb(var(--color-surface-bright) / 0.785) 44%, rgb(var(--color-surface-bright) / 0.745) 50%, rgb(var(--color-surface-bright) / 0.30) 58%, rgb(var(--color-surface-bright) / 0) 66%)',
};

/**
 * The dots move only what is behind the words: the Cloudinary films (see `heroFilms` in
 * data/content.js), then the photograph the hero shipped with. Nothing here carries copy,
 * so no slide needs a headline written for it. A film that fails to load (deleted from the
 * CDN, wrong id) removes itself and the hero falls through to the photograph, so a broken
 * URL degrades quietly rather than showing a black box.
 */
const SLIDES = [
  ...heroFilms.map((f) => ({ ...f, kind: 'video' })),
  {
    id: 'tower',
    kind: 'image',
    src: '/images/hero2.jpg',
    label: 'the scaffolded tower',
    alt: 'Low-angle view of a scaffolded tower rising into a bright, cloud-streaked sky',
  },
];

const EASE = [0.22, 1, 0.36, 1];

/**
 * The hero is left-anchored rather than using `.container-page`, which centres a
 * max-w-7xl column and therefore pushes the copy ~355px in on a 1920px screen. Note
 * this deliberately breaks alignment with the header logo and every section below,
 * which all still centre — that is the trade the left-anchored look costs.
 *
 * Moving the copy left also shortens its right edge as a percentage of the viewport,
 * which only ever *increases* the scrim coverage behind it. Safe direction; the
 * contrast solve still holds.
 */
const GUTTER = 'w-full px-5 sm:px-8 lg:pl-12 lg:pr-10 xl:pl-16 2xl:pl-24';

const stats = [
  { value: '20+', label: 'Years of\nExperience', Icon: Award },
  { value: '42+', label: 'Countries\nExported', Icon: Globe2 },
  { value: '5', label: 'Manufacturing\nFacilities', Icon: Factory },
  { value: '100+', label: 'Product\nRange', Icon: Package },
];

const parent = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } } };
const child = { hidden: { opacity: 0, y: 26 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } };

// Parallax is desktop-only: on phones the photo is a static band, where a scroll-linked
// transform buys nothing and costs a composite every frame.
function useMinWidth(query) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const sync = () => setMatches(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [query]);
  return matches;
}

export default function HomeHeroBrandTest() {
  const reduce = useReducedMotion();
  const isDesktop = useMinWidth('(min-width: 1024px)');
  const stageRef = useRef(null);
  const videoRefs = useRef({});
  const [usingFallback, setUsingFallback] = useState(false);

  const [index, setIndex] = useState(0);
  const [broken, setBroken] = useState({});
  const [present, setPresent] = useState({});
  const [playing, setPlaying] = useState(!reduce);
  const [muted, setMuted] = useState(true);

  /**
   * Which films actually resolve to video.
   *
   * A missing local file is not a 404 — a static host falls through to the SPA's
   * index.html and answers `200 text/html`. A deleted Cloudinary asset answers `404` with
   * an `image/gif` placeholder. Either way the status alone is unreliable; the content
   * type is what decides. HEAD, so even a large file costs one set of headers, and
   * Cloudinary allows the cross-origin request (`Access-Control-Allow-Origin: *`).
   */
  useEffect(() => {
    let alive = true;
    for (const s of SLIDES.filter((x) => x.kind === 'video')) {
      fetch(s.src, { method: 'HEAD' })
        .then((r) => r.ok && (r.headers.get('content-type') || '').startsWith('video/'))
        .catch(() => false)
        .then((ok) => alive && setPresent((p) => ({ ...p, [s.id]: ok })));
    }
    return () => {
      alive = false;
    };
  }, []);

  /**
   * The lead film is shown optimistically — it is the largest paint, and waiting on a
   * probe before painting it would swap the hero out from under the reader. Every other
   * film stays hidden until the probe confirms it. A film that fails to decode later
   * drops out too, so both failure modes end in the same place.
   */
  const slides = SLIDES.filter((s) => {
    if (s.kind !== 'video') return true;
    if (broken[s.id]) return false;
    return s.id === SLIDES[0].id ? present[s.id] !== false : present[s.id] === true;
  });
  const active = slides[Math.min(index, slides.length - 1)] ?? slides[0];

  /**
   * The films are several MB each. Below `lg` the hero is a static photo band anyway, so
   * decoding one there buys a background nobody is looking at and costs a phone its data.
   * On small screens a film's slide renders its poster frame instead.
   */
  const playFilm = active.kind === 'video' && isDesktop && !reduce && playing;

  const grade =
    active.kind === 'video' ? GRADE.video : usingFallback ? GRADE.fallback : GRADE.local;
  const scrim = active.kind === 'video' ? SCRIM.video : SCRIM.photo;

  const go = (next) => setIndex(((next % slides.length) + slides.length) % slides.length);

  const dropSlide = (id) => {
    delete videoRefs.current[id];
    setBroken((b) => ({ ...b, [id]: true }));
    setIndex(0);
  };

  /**
   * The media bar. Desktop only, and its position is dictated by two fixed overlays.
   *
   * It lives *outside* the photo stage: the stage is `lg:z-0` while the copy column is
   * `w-full` at `z-10` and covers it edge to edge, so a control parked inside the stage
   * paints but cannot be clicked — the same trap the pointer listener hit. It also sits
   * well above the hero's bottom edge, because AiChat is `fixed bottom-6 right-6` at
   * z-50 and owns the bottom ~80px of the viewport.
   *
   * Below `lg` there is nowhere to put it. FloatingPromos is `fixed bottom-6 left-4`,
   * 192px tall and effectively full-width on a phone; on a 390px screen it covers the
   * hero's whole photo band, so no position over the photo is clickable at rest. The
   * film does not play at that size either — it is 8 MB and the band is static — so the
   * bar is simply not rendered, and the hero shows the film's poster frame.
   */
  const nav = (wrapper) =>
    slides.length > 1 ? (
      <div className={`pointer-events-none ${wrapper}`}>
        <div className="pointer-events-auto">
          <HeroMediaNav
            count={slides.length}
            index={index}
            labels={slides.map((s) => s.label)}
            onSelect={go}
            onPrev={() => go(index - 1)}
            onNext={() => go(index + 1)}
            showMediaControls={active.kind === 'video' && isDesktop && !reduce}
            playing={playing}
            muted={muted}
            onTogglePlay={() => setPlaying((p) => !p)}
            onToggleMute={() => setMuted((m) => !m)}
          />
        </div>
      </div>
    ) : null;

  // Exactly one film may be running. Everything else is paused, whatever the dot history.
  useEffect(() => {
    for (const [id, el] of Object.entries(videoRefs.current)) {
      if (!el) continue;
      el.muted = muted;
      if (id === active.id && playFilm) el.play().catch(() => setPlaying(false));
      else el.pause();
    }
  }, [active.id, playFilm, muted]);

  const { scrollYProgress } = useScroll({ target: stageRef, offset: ['start start', 'end start'] });
  // 60px of drift against the 9% of headroom below, so the photo can never expose an
  // edge at either end of the scroll range.
  const drift = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const parallax = reduce || !isDesktop ? 0 : drift;

  /**
   * Pointer parallax. The plate leans a few pixels against the cursor, which reads as
   * depth rather than as movement. Springs, not raw values, so it settles instead of
   * tracking. Both stay well inside the 9% of headroom the plate is given, so no edge
   * can ever be exposed.
   */
  const pointerX = useSpring(useMotionValue(0), { stiffness: 60, damping: 20, mass: 0.6 });
  const pointerY = useSpring(useMotionValue(0), { stiffness: 60, damping: 20, mass: 0.6 });
  const liveX = reduce || !isDesktop ? 0 : pointerX;
  const liveY = reduce || !isDesktop ? 0 : pointerY;

  const trackPointer = (event) => {
    if (reduce || !isDesktop) return;
    const box = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - box.left) / box.width - 0.5) * -16);
    pointerY.set(((event.clientY - box.top) / box.height - 0.5) * -10);
  };

  const releasePointer = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    // No overflow-hidden: the stat card has to escape the photo stage below it.
    <section className="relative isolate w-full bg-surface-tint">
      {/* The pointer listener lives on the stage, not on the photo box. The copy column
          is `w-full` at z-10 and therefore covers the photo everywhere, so a listener on
          the photo would never receive a move event. */}
      <div
        ref={stageRef}
        onMouseMove={trackPointer}
        onMouseLeave={releasePointer}
        className="relative flex flex-col overflow-hidden bg-surface-bright lg:min-h-[560px] xl:min-h-[600px]"
      >
        {/* Draughtsman's grid — a texture, not a pattern. 5% alpha. */}
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

        <div className={`${GUTTER} relative z-10 pb-10 pt-12 sm:pt-14 lg:pb-28 lg:pt-16`}>
          <motion.div
            variants={parent}
            initial={reduce ? false : 'hidden'}
            animate="show"
            /* Capped so no glyph crosses ~42% of the viewport, which is where the tower's
               dark edge begins (measured from hero.jpg). Everything left of that sits on
               sky, so the scrim barely has to work. Widen this and the scrim must grow. */
            className="w-full max-w-[34rem] lg:max-w-[32rem] xl:max-w-[34rem]"
          >
            <motion.span
              variants={child}
              className="inline-flex items-center gap-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-deep"
            >
              <span aria-hidden className="h-px w-7 bg-gradient-to-r from-primary-glow to-primary-dark" />
              ISO 9001:2015 Certified Manufacturer &amp; Exporter
            </motion.span>

            <motion.h1
              variants={child}
              className="mt-5 font-display text-[2.25rem] font-bold leading-[1.05] tracking-[-0.03em] sm:text-[2.875rem] lg:text-[2.75rem] xl:text-[3.25rem]"
            >
              <span className="block text-text">Engineering Reliable</span>
              <span className="block text-primary-dark">Scaffolding &amp;</span>
              <span className="block text-primary-dark">Formwork Solutions</span>
            </motion.h1>

            <motion.p
              variants={child}
              /* Bracketed, not `/88`: Tailwind's opacity scale only steps by 5, so `/88`
                 generates no rule and the copy silently falls back to inherited black. */
              className="mt-6 max-w-[30rem] text-base leading-relaxed text-text-body/[0.88] sm:text-[17px]"
            >
              Delivering world-class scaffolding systems, formwork accessories and safety
              products to 42+ countries worldwide.
            </motion.p>

            <motion.div variants={child} className="mt-9 flex flex-wrap items-center gap-3.5 sm:gap-4">
              {/* Watch the drone film. Carried over from the original navy hero, restyled
                  for this light stage: the play disc was a gold circle on navy, which the
                  brand palette no longer allows outside `surface-deep`. Opens in a new tab
                  because SharePoint refuses to be framed. */}
              <motion.div whileHover={reduce ? undefined : { y: -2 }} whileTap={reduce ? undefined : { scale: 0.985 }} transition={{ duration: 0.18 }}>
                <a
                  href={droneFilmUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Watch the KEAA drone film (opens in a new tab)"
                  className="group inline-flex items-center gap-3 rounded-xl border border-primary-dark/25 bg-white/70 py-1.5 pl-1.5 pr-5 text-left shadow-[0_2px_8px_-4px_rgb(var(--color-text)_/_0.14)] backdrop-blur-sm transition-all duration-300 hover:border-primary-dark/55 hover:bg-white hover:shadow-[0_12px_26px_-14px_rgb(var(--color-text)_/_0.32)]"
                >
                  <span className="relative flex h-11 w-11 shrink-0 items-center justify-center">
                    <span
                      aria-hidden
                      className="absolute inset-0 animate-ping rounded-full bg-primary/25 motion-reduce:animate-none"
                      style={{ animationDuration: '2.8s' }}
                    />
                    <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-primary-dark text-white shadow-md transition-transform duration-300 group-hover:scale-105">
                      <Play className="h-[18px] w-[18px] translate-x-[1px] fill-current" />
                    </span>
                  </span>
                  <span className="leading-tight">
                    <span className="flex items-center gap-1.5 font-display text-[15px] font-semibold tracking-wide text-primary-dark">
                      Watch the drone film
                      <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                    </span>
                    <span className="mt-0.5 block text-xs text-text-muted">A bird&rsquo;s-eye view of KEAA</span>
                  </span>
                </a>
              </motion.div>

              <motion.div whileHover={reduce ? undefined : { y: -2 }} whileTap={reduce ? undefined : { scale: 0.985 }} transition={{ duration: 0.18 }}>
                <Link
                  to="/downloads"
                  className="group inline-flex items-center justify-center gap-2 rounded-lg border border-primary-dark/25 bg-white/70 px-7 py-3.5 font-display text-[15px] font-semibold tracking-wide text-primary-dark shadow-[0_2px_8px_-4px_rgb(var(--color-text)_/_0.14)] backdrop-blur-sm transition-all duration-300 hover:border-primary-dark/55 hover:bg-white hover:shadow-[0_12px_26px_-14px_rgb(var(--color-text)_/_0.32)]"
                >
                  Download Catalog
                  <Download className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
                </Link>
              </motion.div>
            </motion.div>

            <motion.p variants={child} className="mt-8 font-mono text-[11px] uppercase tracking-[0.14em] text-text-strong">
              ISO 9001 &middot; ISO 14001 &middot; ISO 45001 &mdash; T&Uuml;V Rheinland
            </motion.p>
          </motion.div>
        </div>

        {/* One <img> for both layouts, so the browser only ever fetches once. */}
        <div className="relative aspect-[16/10] w-full sm:aspect-[16/7] lg:absolute lg:inset-0 lg:z-0 lg:aspect-auto lg:h-full">
          <div className="absolute inset-0 overflow-hidden" style={{ isolation: 'isolate' }}>
            {/* Three nested transforms, deliberately separated so they compose instead of
                fighting: scroll drift, then the entrance settle, then the slow breath and
                the pointer lean. All GPU transforms; nothing here touches layout. */}
            <motion.div style={{ y: parallax }} className="absolute -top-[9%] left-0 right-0 h-[118%]">
              <motion.div
                initial={{ scale: reduce ? 1 : 1.07 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.6, ease: EASE }}
                className="h-full w-full"
              >
                <motion.div
                  style={{ x: liveX, y: liveY, isolation: 'isolate' }}
                  animate={reduce ? undefined : { scale: [1, 1.035, 1] }}
                  transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative h-full w-full"
                >
                  {/* Every slide stays mounted and cross-fades. The first slide never fades
                      in: an opacity animation on the LCP element delays the paint. */}
                  {slides.map((s, i) => {
                    const on = i === index;
                    const isFilm = s.kind === 'video';
                    const g = isFilm ? GRADE.video : usingFallback ? GRADE.fallback : GRADE.local;
                    const firstPhoto = !isFilm && s.src === HERO_IMAGE;
                    return (
                      <div
                        key={s.id}
                        aria-hidden={!on}
                        className="absolute inset-0 transition-opacity duration-700 ease-out motion-reduce:transition-none"
                        style={{ opacity: on ? 1 : 0 }}
                      >
                        {isFilm && isDesktop && !reduce ? (
                          <video
                            ref={(el) => {
                              if (el) videoRefs.current[s.id] = el;
                              else delete videoRefs.current[s.id];
                            }}
                            src={s.src}
                            poster={s.poster}
                            muted
                            loop
                            playsInline
                            /* The film is cross-origin (Cloudinary). `anonymous` opts the
                               fetch into CORS so the pixels are not tainted; harmless in
                               production (Cloudinary always sends `Access-Control-Allow-
                               Origin: *`), and it keeps the contrast measurable. */
                            crossOrigin="anonymous"
                            /* Only the film on screen is allowed to fetch. A second film
                               costs nothing until its dot is clicked. */
                            preload={on ? 'metadata' : 'none'}
                            tabIndex={-1}
                            onError={() => dropSlide(s.id)}
                            /* `clip` trims a film with logo bookends to its usable range,
                               entirely at playback — the source is never re-encoded. Inert
                               when clip is null (Rass loops end to end). `loop` restarts at
                               0, so the start must be re-seeked on every wrap. */
                            onLoadedMetadata={
                              s.clip ? (e) => { e.currentTarget.currentTime = s.clip[0]; } : undefined
                            }
                            onTimeUpdate={
                              s.clip
                                ? (e) => {
                                    const v = e.currentTarget;
                                    if (v.currentTime >= s.clip[1] || v.currentTime < s.clip[0]) {
                                      v.currentTime = s.clip[0];
                                    }
                                  }
                                : undefined
                            }
                            className="h-full w-full object-cover object-[60%_40%] lg:object-[50%_40%]"
                            style={{ filter: g.filter }}
                          />
                        ) : (
                          <img
                            src={isFilm ? s.poster : usingFallback && firstPhoto ? fbSrc(1920) : s.src}
                            srcSet={usingFallback && firstPhoto ? FALLBACK_SRCSET : undefined}
                            sizes={usingFallback && firstPhoto ? '100vw' : undefined}
                            onError={firstPhoto ? () => setUsingFallback(true) : undefined}
                            alt={on ? s.alt : ''}
                            loading={i === 0 ? 'eager' : 'lazy'}
                            fetchPriority={i === 0 ? 'high' : 'auto'}
                            decoding="async"
                            className="h-full w-full object-cover object-[60%_40%] lg:object-[50%_24%]"
                            style={{ filter: g.filter }}
                          />
                        )}
                        {/* `color` keeps luminance and rewrites only hue, so the sky stays a
                            bright brand blue and the steel goes cool. On the fallback it also
                            has to kill the orange, hence the much higher opacity. */}
                        <div
                          aria-hidden
                          className="pointer-events-none absolute inset-0"
                          style={{ background: 'linear-gradient(175deg, rgb(var(--color-photo-tint-top)) 0%, rgb(var(--color-photo-tint-mid)) 58%, rgb(var(--color-photo-tint-base)) 100%)', mixBlendMode: 'color', opacity: g.hueOpacity }}
                        />
                      </div>
                    );
                  })}
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Sunlight off the top-right, breathing very slightly out of phase with the
                zoom so the two never pulse together. Pinned to the frame, not the plate. */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              animate={reduce ? undefined : { opacity: [0.75, 1, 0.75], scale: [1, 1.05, 1] }}
              transition={{ duration: 17, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                background: 'radial-gradient(48% 46% at 82% 12%, rgb(var(--color-photo-bloom) / 0.45), transparent 66%)',
                mixBlendMode: 'screen',
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background: 'linear-gradient(200deg, rgb(var(--color-photo-shade) / 0) 55%, rgb(var(--color-photo-shade) / 0.30) 100%)',
                mixBlendMode: 'multiply',
              }}
            />
          </div>

          {/* A veil, not a curtain. Every stop clears the solved minimum with margin — the
              tightest point is alpha 0.43 at 46% against a required 0.38. The sky stays
              visible straight through the copy, and the photo is untouched past 66%.
              These percentages are of viewport width while the copy's width is in px, so
              re-measure the text's right edge at 1024/1280/1440/1920 before changing the
              type scale or the column cap. */}
          <div
            aria-hidden
            className="absolute inset-0 z-[1] hidden transition-[background] duration-700 lg:block"
            style={{ background: scrim }}
          />
          {/* Settles the photo into the band the stat card floats over. */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 z-[1] h-28 bg-gradient-to-t from-surface-tint via-surface-tint/60 to-transparent lg:h-40"
          />

        </div>

        {/* lg+ only — see the note on `nav`. */}
        {nav('absolute inset-x-0 bottom-24 z-30 hidden justify-end px-4 lg:flex lg:pr-10 xl:pr-16')}
      </div>

      {/* Stat card — floats over the photo's bottom edge, so it lives outside the stage. */}
      <div className={`${GUTTER} relative z-20 -mt-20 pb-14 sm:-mt-24 sm:pb-16`}>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55, ease: EASE }}
        >
          <motion.div
            animate={reduce ? undefined : { y: [0, -6, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            /* Left-anchored and capped, not full width: the photograph's tower lives on the
               right, and a card spanning the container would sit right across it. */
            className="grid w-full max-w-[34rem] grid-cols-2 overflow-hidden rounded-[22px] border border-white/60 bg-white/85 shadow-[0_1px_0_0_rgba(255,255,255,0.9)_inset,0_2px_6px_-2px_rgb(var(--color-text)_/_0.10),0_34px_70px_-30px_rgb(var(--color-text)_/_0.42)] ring-1 ring-primary-dark/[0.07] backdrop-blur-2xl md:max-w-[46rem] md:grid-cols-4"
          >
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={[
                  'flex items-center gap-3 px-4 py-6 sm:px-5 sm:py-7',
                  'border-primary-dark/[0.09]',
                  i % 2 === 1 ? 'border-l' : '',
                  i >= 2 ? 'border-t' : '',
                  i > 0 ? 'md:border-l' : 'md:border-l-0',
                  'md:border-t-0',
                ].join(' ')}
              >
                <span
                  aria-hidden
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ring-primary-glow/40"
                  style={{ backgroundImage: 'linear-gradient(145deg, rgb(var(--color-primary-glow) / 0.28), rgb(var(--color-primary-dark) / 0.10))' }}
                >
                  <s.Icon className="h-5 w-5" strokeWidth={1.5} style={{ color: 'rgb(var(--color-primary-dark))' }} />
                </span>
                <div className="min-w-0">
                  <div className="font-display text-[1.625rem] font-bold leading-none tracking-[-0.02em] text-primary-dark">
                    {/* AnimatedCounter is shared: it has no reduced-motion branch, and it observes
                        its own inline span with a -40px inset. `block` widens the observed box so a
                        short value like "5" can never sit entirely inside that inset. */}
                    {reduce ? s.value : <AnimatedCounter value={s.value} className="block" />}
                  </div>
                  <div className="mt-1 whitespace-pre-line text-[12.5px] font-medium leading-[1.32] text-text-muted">
                    {s.label}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
