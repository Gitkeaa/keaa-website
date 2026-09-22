/**
 * "Is this the first paint of this page load?"
 *
 * WHY IT EXISTS
 * -------------
 * Every page is prerendered to real HTML and the browser paints it immediately. React then has
 * to adopt that markup rather than rebuild it, or the document collapses for a frame and
 * everything below snaps back into place: a Cumulative Layout Shift of about 0.31 sitewide,
 * which fails the Core Web Vital on every page.
 *
 * Adopting it means React's FIRST render has to produce the same DOM the build produced. The
 * one thing that reliably breaks that is entry animation. A prerendered page is snapshotted
 * after its animations have settled, so the HTML says opacity 1. A fresh React render with
 * `initial={{ opacity: 0 }}` says opacity 0. Same component, different bytes, hydration fails,
 * React throws the markup away, and the shift comes back.
 *
 * So on the first render, and only then, entry animations are skipped: elements render where
 * they finish rather than where they start. From the second render onwards, which is every
 * in-app navigation and anything mounted later, animation behaves exactly as before.
 *
 * WHY A MODULE FLAG RATHER THAN CONTEXT OR STATE
 * ----------------------------------------------
 * It has to be readable DURING the first render, synchronously, by any component at any depth.
 * State would need a re-render to flip, which is the thing we are trying to avoid, and context
 * would make every animated component a consumer for a value that changes once. A module-scope
 * boolean is read once per render and costs nothing.
 *
 * It flips in a rAF scheduled by App, after the browser has painted the hydrated markup. rAF
 * rather than an effect because effects run before paint, and flipping early would let an
 * animation start mid-hydration.
 */

let painted = false;

/** False during the first render pass of a page load, true forever after. */
export const hasPainted = () => painted;

/** Called once by the app root, after the first paint. */
export function markPainted() {
  painted = true;
}

/**
 * The `initial` prop for a framer-motion entry animation.
 *
 * Pass the animation's starting state. Returns it normally, or `false` on the first paint,
 * which is framer-motion's documented way of saying "render at the end state, do not animate
 * in". The element still animates on every later mount.
 *
 *   <motion.div initial={entryInitial({ opacity: 0, y: 24 })} whileInView={{ opacity: 1, y: 0 }}>
 */
export const entryInitial = (from) => (painted ? from : false);
