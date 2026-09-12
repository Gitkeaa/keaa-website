import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Play } from 'lucide-react';
import { droneFilmUrl, heroFilms } from '../../data/content';
import { useLT } from '../../i18n/LocaleContext';

/**
 * How long each second-line phrase holds before the next one takes over.
 *
 * The longest phrase is 46 characters — roughly eight words, about 2.4s of reading at an
 * average pace — and the staggered fade below eats 0.5s of whatever this is set to. 3.5s
 * therefore leaves ~3s at full opacity, which is enough to finish the line instead of merely
 * glimpsing it. Anything under ~2.5s reads as motion rather than as a sentence.
 */
const ROTATE_MS = 3500;

/**
 * HOMEPAGE HERO — Lely-style single film.
 *
 * A rounded, inset full-bleed card (matching the interior GalleryHero): the KEAA cinematic
 * film plays edge-to-edge as the background, a dark gradient weights the bottom so the copy
 * reads as white over any frame, and ONLY the essentials sit on top — a trust eyebrow, one
 * heading, one line and a single CTA. Everything that used to crowd the film (the four stat
 * tiles) now lives in its own calm band directly below, so the film stays clean.
 *
 * The film autoplays natively (`autoPlay muted loop playsInline`) so it runs on every device
 * and even under reduced-motion — a muted background film is content, not gratuitous motion,
 * and a large share of Windows visitors browse with OS animations off. Data Saver is the one
 * opt-out: it falls back to the poster still so a metered connection is never charged. If the
 * film is missing or 404s, the poster (a still lifted from the same film) stands in.
 */

const EASE = [0.22, 1, 0.36, 1];

/**
 * The visitor's Data Saver signal. When it is on, the film stays a poster still so a metered
 * phone is never charged for an ambient background. Chromium-only API — undefined elsewhere,
 * where it reads as "not saving" and the film plays, which is the intended default.
 */
function useSaveData() {
  const [save, setSave] = useState(false);
  useEffect(() => {
    const c = navigator.connection;
    if (!c) return undefined;
    const sync = () => setSave(!!c.saveData);
    sync();
    c.addEventListener?.('change', sync);
    return () => c.removeEventListener?.('change', sync);
  }, []);
  return save;
}

/** Track a media query so phones can be handed the smaller film rendition. */
function useMediaQuery(query) {
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
  const lt = useLT('home');
  const saveData = useSaveData();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [filmBroken, setFilmBroken] = useState(false);

  /*
   * The three second-line phrases. The first keeps the `hero.title2` key it already had, so
   * the translations that exist for it in every locale file still apply; the other two are
   * new keys and fall back to English until they are translated.
   */
  const ROTATING = [
    lt('hero.title2', 'Scaffolding & Formwork Solutions'),
    lt('hero.title2b', 'Safety Products & Livestock Housing Solutions'),
    lt('hero.title2c', 'Garden Hardware & Custom Fabricated Solutions.'),
  ];

  /*
   * Reduced motion holds phrase 0 and never starts the timer. Text that rewrites itself on a
   * loop is exactly the kind of motion that setting exists to stop, and unlike the muted
   * background film this carries meaning a visitor has to read.
   */
  const [phraseIdx, setPhraseIdx] = useState(0);
  useEffect(() => {
    if (reduce) return undefined;
    const id = setInterval(() => setPhraseIdx((i) => (i + 1) % ROTATING.length), ROTATE_MS);
    return () => clearInterval(id);
    // ROTATING is rebuilt every render (it closes over `lt`), so its identity is not a useful
    // dependency — its LENGTH is what the timer cares about, and that is fixed.
  }, [reduce, ROTATING.length]);

  const film = heroFilms[0] || null;
  // Phones pull the smaller w_720 rendition; desktop the w_1920. Same clip, fewer bytes.
  const filmSrc = film ? (isDesktop || !film.srcMobile ? film.src : film.srcMobile) : null;
  const poster = film?.poster ?? '/images/hero2.jpg';
  const showVideo = Boolean(film) && !saveData && !filmBroken;

  return (
    <>
      {/* ---- HERO: full-bleed film in a rounded inset card ---- */}
      <section className="px-3 sm:px-5 lg:px-6">
        <div className="relative isolate flex min-h-[max(500px,72vh)] overflow-hidden rounded-3xl lg:min-h-[max(706px,80vh)]">
          {showVideo ? (
            <video
              key={filmSrc}
              src={filmSrc}
              poster={poster}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              /* Cross-origin (Cloudinary, which always sends Access-Control-Allow-Origin: *). */
              crossOrigin="anonymous"
              tabIndex={-1}
              aria-hidden
              /* A dead CDN id falls through to the poster still rather than a black box. */
              onError={() => setFilmBroken(true)}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <img
              src={poster}
              alt=""
              loading="eager"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}

          {/* Bottom-weighted scrim so white copy clears AA over any frame of the film. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/40 to-navy-950/5"
          />

          {/* Minimal copy, bottom-left. No reserved strip beneath it any more: the badge moved
              to the top of the card, so the headline owns the whole bottom edge again. */}
          <div className="relative z-10 mt-auto flex w-full flex-col p-6 sm:p-10 lg:p-14">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="max-w-7xl"
            >
              {/*
                TWO LINES — bottom-left, broken where the copy reads best rather than wherever
                the box happens to run out. The two spans are the break; the fluid size is what
                stops either of them wrapping again.

                MEASURED, NOT GUESSED. Set nowrap and the widest rotating phrase ("Garden
                Hardware & Custom Fabricated Solutions.") occupies 22.2x its own font size in
                width, so the largest size that still fits one line is column ÷ 22.2. Each step
                below is column ÷ 23.4 — the extra 5% is headroom for a classic Windows
                scrollbar, which `vw` counts but the layout does not get.

                The column is a known function of the viewport because the card's own padding
                changes at the same two breakpoints:
                  base   vw - 72    (section px-3 + card p-6)
                  sm     vw - 120   (section px-5 + card p-10)
                  lg     vw - 160   (section px-6 + card p-14), capped by max-w-7xl at 1280

                which is where each `calc(4.2735vw - Npx)` comes from: vw/23.4 = 4.2735vw, less
                that step's padding ÷ 23.4. The lg cap of 54px is 1280 ÷ 23.4 — the size at
                which the longest phrase still clears the widest the column is ever allowed to
                get. That cap is also why the copy column was widened from max-w-5xl: at 1024px
                the same phrase would only fit at 44px.

                BELOW ~470px THERE IS NO HONEST ANSWER, and the lower clamp is where that shows.
                A 390px phone offers 318px of column, so one line of 46 characters would need a
                14px headline — smaller than the body copy under it. The clamp holds at 18px
                instead and those phones get a third line, which is the readable failure.

                If the wording changes, re-measure: a longer phrase silently wraps to three.
              */}
              <h1 className="font-display text-[clamp(1.125rem,calc(4.2735vw-3.08px),1.75rem)] font-bold leading-[1.08] tracking-[-0.02em] text-white sm:text-[clamp(1.25rem,calc(4.2735vw-5.13px),2.5rem)] lg:text-[clamp(2rem,calc(4.2735vw-6.84px),3.375rem)]">
                <span className="block">{lt('hero.title1', 'Engineering Reliable')}</span>
                {/*
                  The second line cycles. All three phrases are in the DOM at once, stacked in
                  a single grid cell (every child at grid-area 1/1), which is what keeps this
                  stable: the box is always as tall as the LONGEST phrase, so the hero cannot
                  jump every second as the text swaps, and no height has to be measured in JS.

                  They are rendered, not swapped in and out, so the heading still reads as one
                  complete sentence to a screen reader and search engines see the whole product
                  range — and nothing is announced on a timer, which an aria-live region here
                  would do once a second, unusably.

                  The h1 above is sized off the LONGEST of these, not off whichever one is
                  showing, so the type never changes size as the phrases swap — the shorter
                  ones simply sit at the same size and end sooner.
                */}
                <span className="grid">
                  {ROTATING.map((phrase, i) => (
                    <span
                      key={phrase}
                      style={{ gridArea: '1 / 1' }}
                      /*
                        The fade is STAGGERED, not a crossfade. Both phrases share one grid
                        cell, so fading them simultaneously prints one on top of the other and
                        the line is unreadable for the whole transition. The outgoing phrase
                        therefore leaves over 200ms and the incoming one only starts after it
                        (delay-200), so the cell holds at most one phrase at a time.
                      */
                      className={`block transition-opacity ${
                        i === phraseIdx ? 'opacity-100 delay-200 duration-300' : 'opacity-0 duration-200'
                      }`}
                    >
                      {phrase}
                    </span>
                  ))}
                </span>
              </h1>

              {/* Supporting line under the headline. Deliberately small and slightly held back
                  in white/75: at full strength it competes with the headline it is meant to
                  sit under. It is one short phrase, so it never wraps and cannot disturb the
                  measured two-line break above it. */}
              <p className="mt-2.5 font-display text-sm font-semibold tracking-[-0.01em] text-white/75 sm:mt-3.5 sm:text-base lg:text-lg">
                {lt('hero.tagline', 'Equipped for the Future')}
              </p>
            </motion.div>
          </div>

          {/* Aerial film play badge — TOP-right on every size, brand red + "keaa". Opens the
              drone film (SharePoint) in a new tab. It sat bottom-right until the headline grew
              into it on anything narrower than `lg`; the top of the card is empty film at every
              width, so the collision cannot come back. Soft glass pill so it stays legible over
              any frame. */}
          <a
            href={droneFilmUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={lt('hero.filmAria', 'Play the KEAA aerial film (opens in a new tab)')}
            title={lt('hero.filmTitle', 'Watch the KEAA aerial film')}
            className="group absolute right-6 top-6 z-20 inline-flex items-center gap-2.5 rounded-full bg-black/25 py-1.5 pl-1.5 pr-3.5 backdrop-blur-sm transition-all duration-300 hover:bg-black/40 sm:right-8 sm:top-8"
          >
            {/* `bg-signal` is the shared red token (#E11D2A), replacing a hardcoded hex here.
                The film badge is now the ONLY thing on the site that uses it — the assistant
                went back to the brand blue — so if this badge ever changes colour, retire the
                token in index.css with it. */}
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-signal transition-transform duration-300 group-hover:scale-110">
              <Play className="h-3.5 w-3.5 translate-x-[1px] fill-white text-white" strokeWidth={0} />
            </span>
            <span className="font-display text-sm font-bold lowercase tracking-wide text-white">keaa</span>
          </a>
        </div>
      </section>
    </>
  );
}
