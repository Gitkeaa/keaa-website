import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Pause, Play, X } from 'lucide-react';
import { droneFilmUrl, heroFilms } from '../../data/content';
import { useLT } from '../../i18n/LocaleContext';
import { isPrerender } from '../../lib/prerender';
import { entryInitial } from '../../lib/firstPaint';

/**
 * How long each second-line phrase holds before the next one takes over.
 *
 * One second is what was asked for. It is FAST — "garden hardware, and custom-fabricated
 * solutions." is 49 characters, which most people cannot finish reading in that time, so the
 * headline reads more as motion than as a sentence. Raise this to ~2600 if it should be
 * readable rather than kinetic; nothing else needs touching.
 */
const ROTATE_MS = 2600;

/**
 * The swap itself, in two halves: the phrase that is leaving fades out over FADE_MS, and only
 * once it is gone does the next one fade in over the same FADE_MS.
 *
 * This used to be a single cross-fade, which is what produced the double exposure. Every
 * phrase is stacked in one grid cell, so fading one up while the other faded down painted
 * both at once for half a second, and because they are different lengths the overlap read as
 * two headlines printed on top of each other rather than as a dissolve.
 *
 * SWAP_MS is deliberately longer than FADE_MS. Otherwise the timer that changes the phrase
 * and the CSS transition that empties the old one finish on the same frame, and whichever
 * loses by a frame puts the incoming phrase on screen while the outgoing one still has a few
 * percent of opacity left. That is the flash this sequencing exists to remove, so the timer
 * is given a couple of frames of margin.
 *
 * FADE_MS twice over is about the 500ms the cross-fade took, so the cadence is unchanged.
 */
const FADE_MS = 220;
const SWAP_MS = FADE_MS + 40;

/**
 * HOMEPAGE HERO — Lely-style single film.
 *
 * A rounded, inset full-bleed card (matching the interior GalleryHero): the KEAA cinematic
 * film plays edge-to-edge as the background, a dark gradient weights the bottom so the copy
 * reads as white over any frame, and ONLY the essentials sit on top — a trust eyebrow, one
 * heading, one line and a single CTA. Everything that used to crowd the film (the four stat
 * tiles) now lives in its own calm band directly below, so the film stays clean.
 *
 * The film is `muted loop playsInline` so it runs on every device and even under
 * reduced-motion — a muted background film is content, not gratuitous motion, and a large
 * share of Windows visitors browse with OS animations off. It does NOT carry `autoPlay`: an
 * IntersectionObserver plays it while the hero is on screen and pauses it the moment it is
 * not (see the note above `heroRef`). Data Saver is the other opt-out: it falls back to the
 * poster still so a metered connection is never charged. If the film is missing or 404s, the
 * poster (a still lifted from the same film) stands in.
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
    lt('hero.title2', 'Scaffolding Solutions'),
    lt('hero.title2b', 'Formwork Solutions'),
    lt('hero.title2c', 'Safety Products Solutions'),
    lt('hero.title2d', 'Livestock Housing Solutions'),
    lt('hero.title2e', 'Garden Hardware Solutions'),
    lt('hero.title2f', 'Custom Fabricated Solutions')
  ];

  /*
   * Reduced motion holds phrase 0 and never starts the timer. Text that rewrites itself once a
   * second is exactly the kind of motion that setting exists to stop, and unlike the muted
   * background film this carries meaning a visitor has to read.
   */
  /*
   * Two pieces of state, not one. `phraseIdx` is which phrase owns the line; `shown` is
   * whether it is currently on screen. The swap drops `shown` first, waits for the fade to
   * finish, and only then moves the index and raises it again — which is what guarantees
   * that exactly one phrase is ever visible.
   */
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [shown, setShown] = useState(true);

  useEffect(() => {
    if (reduce) return undefined;
    let swap;
    const id = setInterval(() => {
      setShown(false);
      clearTimeout(swap);
      swap = setTimeout(() => {
        setPhraseIdx((i) => (i + 1) % ROTATING.length);
        setShown(true);
      }, SWAP_MS);
    }, ROTATE_MS);
    return () => {
      clearInterval(id);
      clearTimeout(swap);
    };
    // ROTATING is rebuilt every render (it closes over `lt`), so its identity is not a useful
    // dependency — its LENGTH is what the timer cares about, and that is fixed.
  }, [reduce, ROTATING.length]);

  const film = heroFilms[0] || null;
  // Phones pull the smaller w_720 rendition; desktop the w_1920. Same clip, fewer bytes.
  const filmSrc = film ? (isDesktop || !film.srcMobile ? film.src : film.srcMobile) : null;
  const poster = film?.poster ?? '/images/hero2.jpg';
  const showVideo = Boolean(film) && !saveData && !filmBroken;

  /**
   * THE FILM IS NOT ALLOWED TO BE THE LARGEST CONTENTFUL PAINT.
   *
   * It was. The hero rendered a <video preload="auto"> with a poster, so the browser began
   * pulling 3.5 MB of video during the initial load and Lighthouse measured the moment the
   * film painted as the LCP: 6.2 seconds on mobile, which on its own held the homepage to a
   * performance score of 63.
   *
   * The poster still is the same picture at a fraction of the size. So the poster is now a
   * real <img>, painted immediately, and the film is mounted only AFTER the first load has
   * settled, fading in over the top. LCP becomes the poster, the film still plays, and
   * nothing about how the hero looks changes.
   *
   * requestIdleCallback rather than a timer: it waits for the main thread to be free, which
   * is the condition that actually matters, and degrades to a short timeout where it does
   * not exist (Safari). Reduced motion and Save-Data never reach here, because showVideo is
   * already false for them.
   */
  const [filmReady, setFilmReady] = useState(false);
  useEffect(() => {
    if (!showVideo) return undefined;
    /**
     * Never during prerendering. The prerenderer IS a headless browser, so the idle callback
     * below fires before the snapshot is taken and the <video> ends up baked into the
     * delivered HTML. It would then start loading on the browser's first parse, which is
     * exactly the 3.5 MB download this whole change exists to move off the critical path.
     */
    if (isPrerender()) return undefined;
    const start = () => setFilmReady(true);
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(start, { timeout: 2500 });
      return () => window.cancelIdleCallback?.(id);
    }
    const id = setTimeout(start, 1200);
    return () => clearTimeout(id);
  }, [showVideo]);

  /**
   * THE FILM PLAYS ONLY WHILE THE HERO IS ON SCREEN.
   *
   * It used to carry `autoPlay` and run for as long as the page was open, looping, whether or
   * not anybody could see it. On a looping background film that is the single largest draw on
   * the Cloudinary account: delivery is metered per second of video, so a reader who leaves
   * the homepage open while reading further down was being charged for a film playing behind
   * them. Pausing it off screen costs nothing visually and stops that entirely.
   *
   * `autoPlay` is gone and the observer starts playback instead, so a visitor who arrives
   * deep-linked below the hero never downloads the film at all. An IntersectionObserver
   * callback fires once as soon as it observes, so the ordinary case (hero on screen at load)
   * still starts the film immediately.
   *
   * RESUMES, NEVER RESTARTS: pause() and play() both leave `currentTime` alone, and nothing
   * here touches `src` or calls load().
   *
   * 0.25 is comfortably reachable. `intersectionRatio` is measured against the TARGET, so a
   * hero taller than the viewport can never reach 1.0; this one is capped at 72vh/80vh, and
   * even a 500px hero in a 400px landscape viewport peaks at 0.8.
   */
  const heroRef = useRef(null);
  const videoRef = useRef(null);
  // Starts true so the film plays on an ordinary load without waiting for the first callback,
  // and so the floating card can never flash before the observer has had its say.
  const [heroVisible, setHeroVisible] = useState(true);

  useEffect(() => {
    if (!showVideo || !filmReady) return undefined;
    const hero = heroRef.current;
    if (!hero) return undefined;

    // No observer (very old browser): treat the hero as always visible, which is the old
    // behaviour, rather than a hero that never moves.
    if (typeof IntersectionObserver !== 'function') {
      setHeroVisible(true);
      return undefined;
    }

    const io = new IntersectionObserver(([entry]) => setHeroVisible(entry.isIntersecting), {
      threshold: 0.25,
    });
    io.observe(hero);
    return () => io.disconnect();
  }, [showVideo, filmReady]);

  /**
   * THE FLOATING CARD, DESKTOP ONLY.
   *
   * Scroll the hero off screen on a wide viewport and the film carries on in a small card at
   * the bottom right; scroll back and the card goes away and the hero takes over again.
   * Below 1024px it never appears at all and the film simply pauses off screen, which is the
   * behaviour phones and tablets keep.
   *
   * WHY A SECOND <video> RATHER THAN MOVING THE FIRST ONE. Moving the element would be
   * neater and would need no seeking, but it cannot work here: the hero card carries
   * `isolate`, which opens a stacking context, and a `position: fixed` child of it is sealed
   * inside that context. Measured, not assumed — a probe at z-index 2147483647 inside the
   * hero still painted UNDER the section below it. Taking `isolate` off the hero to allow
   * the escape would reorder the scrim and the copy sitting over the film, which is a much
   * worse trade than one extra element.
   *
   * So there are two elements and NEVER two playing: whichever one is not on duty is paused
   * before the other starts. `resumeAtRef` is written by whichever is playing (`timeupdate`
   * fires about four times a second) and read by the other as it takes over, so the film
   * carries on from where it was rather than restarting. The clip is the same URL and is
   * already in the browser cache, so the handover costs a seek, not a download.
   */
  const [dismissed, setDismissed] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const resumeAtRef = useRef(0);
  const floatRef = useRef(null);

  const floating = isDesktop && showVideo && filmReady && !heroVisible && !dismissed;

  // Back at the hero, the card is offered again and a pause made inside it is forgotten:
  // arriving at the top of the page should always find the film running.
  useEffect(() => {
    if (heroVisible) {
      setDismissed(false);
      setUserPaused(false);
    }
  }, [heroVisible]);

  /**
   * One place decides which element is playing, so the two can never both be running.
   * `floating` flipping is what moves the duty between them; the ref carries the position.
   */
  useEffect(() => {
    const hero = videoRef.current;
    const float = floatRef.current;
    const wanted = floating ? float : hero;
    const other = floating ? hero : float;

    other?.pause();
    if (!wanted) return;

    // Take over from wherever the other one had got to.
    if (Number.isFinite(resumeAtRef.current) && Math.abs(wanted.currentTime - resumeAtRef.current) > 0.3) {
      try {
        wanted.currentTime = resumeAtRef.current;
      } catch {
        /* seeking before metadata lands throws; onLoadedMetadata sets it again */
      }
    }

    if (userPaused || (!heroVisible && !floating)) {
      wanted.pause();
      return;
    }
    // play() rejects when the browser blocks playback. Muted and playsInline should never be
    // blocked, but an unhandled rejection is console noise either way.
    const p = wanted.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  }, [floating, heroVisible, userPaused, filmReady]);

  const rememberTime = (e) => {
    resumeAtRef.current = e.currentTarget.currentTime;
  };

  return (
    <>
      {/* ---- HERO: full-bleed film in a rounded inset card ---- */}
      <section className="px-3 sm:px-5 lg:px-6">
        <div
          ref={heroRef}
          className="relative isolate flex min-h-[max(500px,72vh)] overflow-hidden rounded-3xl lg:min-h-[max(706px,80vh)]"
        >
          {/* The poster, always. This is the element the browser paints first and the one
              LCP is measured against, so it is eager, high priority and responsive. It stays
              underneath the film rather than being replaced, which is also what stops a flash
              of empty box if the film is slow or never arrives. */}
          <img
            src={poster}
            srcSet={film?.posterSrcSet}
            sizes="100vw"
            alt=""
            loading="eager"
            // Lowercase: React 18.3 drops the camelCase spelling with a warning.
            fetchpriority="high"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />

          {showVideo && filmReady && (
            <video
              key={filmSrc}
              ref={videoRef}
              src={filmSrc}
              /* No `autoPlay`. The IntersectionObserver above starts and stops playback, so
                 the film runs only while the hero is actually on screen. */
              muted
              loop
              playsInline
              /* Nothing is fetched until this element mounts, which is after first paint, and
                 `metadata` keeps that to the header rather than the clip: the observer asks
                 for the frames when the hero is visible, and never if it is not. */
              preload="metadata"
              /* Cross-origin (Cloudinary, which always sends Access-Control-Allow-Origin: *). */
              crossOrigin="anonymous"
              tabIndex={-1}
              aria-hidden
              /* A dead CDN id falls through to the poster underneath rather than a black box. */
              onError={() => setFilmBroken(true)}
              onTimeUpdate={rememberTime}
              className="absolute inset-0 h-full w-full object-cover motion-safe:animate-[fadeIn_600ms_ease-out]"
            />
          )}

          {/*
            The floating card. Portalled to <body> rather than rendered here, because this
            hero card is `isolate` and a fixed child of it cannot rise above the sections
            further down the page whatever z-index it is given.

            `bottom` clears two things already in that corner: the chat launcher (h-14 at
            bottom-6, so its top edge is at 80px) and the consent bar while it is up, via the
            same `--consent-bar-h` contract CookieConsent publishes for the other widgets.
          */}
          {typeof document !== 'undefined' &&
            createPortal(
              <AnimatePresence>
                {floating && (
                  <motion.div
                    initial={reduce ? false : { opacity: 0, scale: 0.9, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 16 }}
                    transition={{ duration: 0.32, ease: EASE }}
                    style={{ bottom: 'calc(6rem + var(--consent-bar-h, 0px))' }}
                    className="fixed right-6 z-[60] w-[288px] overflow-hidden rounded-card bg-navy-950 shadow-cardHover ring-1 ring-white/15"
                  >
                    <video
                      ref={floatRef}
                      src={filmSrc}
                      muted
                      loop
                      playsInline
                      preload="auto"
                      crossOrigin="anonymous"
                      tabIndex={-1}
                      aria-hidden
                      onTimeUpdate={rememberTime}
                      /* Metadata arrives after the element mounts, and a seek before that
                         throws, so the handover position is applied again here. */
                      onLoadedMetadata={(e) => {
                        try {
                          e.currentTarget.currentTime = resumeAtRef.current || 0;
                        } catch {
                          /* nothing to do: it simply starts from the top */
                        }
                      }}
                      className="block aspect-video w-full object-cover"
                    />

                    <div className="absolute right-2 top-2 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setUserPaused((v) => !v)}
                        aria-label={
                          userPaused
                            ? lt('hero.floatPlay', 'Play the film')
                            : lt('hero.floatPause', 'Pause the film')
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-950/70 text-white backdrop-blur-sm transition-colors hover:bg-navy-950"
                      >
                        {userPaused ? (
                          <Play aria-hidden className="h-4 w-4" strokeWidth={2} />
                        ) : (
                          <Pause aria-hidden className="h-4 w-4" strokeWidth={2} />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDismissed(true)}
                        aria-label={lt('hero.floatClose', 'Close the floating film')}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-950/70 text-white backdrop-blur-sm transition-colors hover:bg-navy-950"
                      >
                        <X aria-hidden className="h-4 w-4" strokeWidth={2} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>,
              document.body
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
              initial={reduce ? false : entryInitial({ opacity: 0, y: 18 })}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="max-w-5xl"
            >
              {/*
                TWO LINES, ALWAYS — bottom-left, broken where the copy reads best rather than
                wherever the box happens to run out. The two spans are the break; the fluid
                size is what stops either of them wrapping again.

                The sizes are measured, not guessed. The longer line needs roughly 14.5x its
                font size in width, so the largest size that still fits is column ÷ 14.5, and
                each step below stays under that for every width in its range (the three steps
                exist because the card's own padding changes at `sm` and `lg`, which moves the
                column width). Widening to max-w-4xl is what lets the desktop headline stay at
                60px and still make it in two lines.

                Below ~360px there is no honest answer: two lines would need type smaller than
                the body copy, so the lower clamp holds at 18px and a very small phone gets a
                third line instead of an unreadable headline.

                If the wording changes, re-measure. A longer line silently wraps to three.
              */}
              <h1 className="font-display text-[clamp(1.125rem,calc(6.4vw-4.6px),2.25rem)] font-bold leading-[1.08] tracking-[-0.02em] text-white sm:text-[clamp(2rem,calc(6.4vw-8.8px),3rem)] lg:text-[clamp(3rem,calc(4.375vw+8.2px),3.75rem)]">
                <span className="block">{lt('hero.title1', 'Engineering Reliable')}</span>
                {/*
                  The second line cycles. Every phrase is in the DOM at once, stacked in a
                  single grid cell (every child at grid-area 1/1), which is what keeps this
                  stable: the box is always as tall as the LONGEST phrase, so the hero cannot
                  jump every second as the text swaps, and no height has to be measured in JS.

                  Stacking them is also why the fade has to be SEQUENCED rather than crossed.
                  Two phrases at partial opacity in the same cell are printed over each other,
                  not blended, so the old line stayed legible under the new one for the length
                  of the transition. Only the phrase that is both current AND `shown` is opaque
                  now, and `shown` is false for the whole of the outgoing fade — see FADE_MS.

                  They are rendered, not swapped in and out, so the heading still reads as one
                  complete sentence to a screen reader and search engines see the whole product
                  range — and nothing is announced on a timer, which an aria-live region here
                  would do once a second, unusably.

                  These phrases are far longer than the single line this h1 was measured for
                  (49 characters against 32), so the longest ones wrap. That is deliberate: the
                  alternative is shrinking the headline by a third at every width to fit the
                  worst case on one line.
                */}
                <span className="grid text-primary-light">
                  {ROTATING.map((phrase, i) => (
                    <span
                      key={phrase}
                      /* The duration is inline rather than a `duration-*` class because it has
                         to stay tied to FADE_MS above: the timer and the transition are two
                         halves of one movement, and a Tailwind class would let them drift
                         apart the moment either is tuned. */
                      style={{ gridArea: '1 / 1', transitionDuration: `${FADE_MS}ms` }}
                      className={`block transition-opacity ${
                        i === phraseIdx && shown ? 'opacity-100' : 'opacity-0'
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
                {lt('hero.tagline', 'Equipped for Future')}
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
