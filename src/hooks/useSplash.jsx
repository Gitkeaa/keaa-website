import { createContext, useContext } from 'react';

/**
 * Has the intro splash finished?
 *
 * The splash is an overlay, so the route tree mounts underneath it from t=0 (that is what
 * puts the page's copy and its LCP image in the DOM for crawlers). But framer-motion's
 * `whileInView` is driven by IntersectionObserver, and IntersectionObserver does not know
 * about occlusion: an element sitting behind an opaque full-screen overlay still counts as
 * "in view". Left alone, every above-the-fold entrance animation would therefore fire at
 * t=0, run to completion behind the splash, and be finished by the time anyone saw it.
 *
 * So the entrance animations hold at their `initial` state until this flag flips, then
 * play — reproducing exactly what a first-time visitor sees today.
 *
 * Holding at `initial` means opacity 0, which is the same thing every below-the-fold
 * `Reveal` on the site already does before you scroll to it. The markup and the <img> are
 * in the DOM either way, so neither crawling nor image loading is affected.
 *
 * Defaults to `true` so that any component used outside the provider (or in a test)
 * animates normally rather than freezing invisibly.
 */
const SplashContext = createContext(true);

export function SplashProvider({ done, children }) {
  return <SplashContext.Provider value={done}>{children}</SplashContext.Provider>;
}

export default function useSplashDone() {
  return useContext(SplashContext);
}
