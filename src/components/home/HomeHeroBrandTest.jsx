import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Play } from 'lucide-react';
import { droneFilmUrl, heroFilms } from '../../data/content';
import { useLT } from '../../i18n/LocaleContext';

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
                <span className="block">{lt('hero.title2', 'Scaffolding & Formwork Solutions')}</span>
              </h1>
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
