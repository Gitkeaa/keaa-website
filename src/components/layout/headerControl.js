/**
 * The one interaction idiom every header control shares.
 *
 * The utility controls (search, region, account, menu) used to fill with `bg-navy-50` on
 * hover while the nav items beside them only grew an underline. Two different answers to the
 * same gesture in one row — the nav read as flat and the utilities read as buttons, and on a
 * tap the filled block was the loudest thing in the header. They now react identically: text
 * darkens, a `primary-dark` rule grows in from the left, no background ever.
 *
 * Why `scale-x` rather than the nav's `w-0 → w-full`: these controls carry horizontal padding
 * (the nav items do not), so a width animation would draw the rule under the padding too and
 * overshoot the label. Insetting with `left/right` and scaling from `origin-left` gives the
 * same left-to-right growth, correctly bounded to the content.
 *
 * `h-10` is kept so every control sits on one optical line with the quote CTA.
 *
 * Deliberately NO `focus-visible:outline-none` and no ring. Tailwind emits that utility at
 * specificity (0,2,0), which beats the site-wide `button:focus-visible` outline in index.css
 * at (0,1,1) — so adding it silently repaints the global indicator as `2px solid transparent`
 * and leaves only whatever ring replaces it. A `ring-primary/40` reads as rgb(176,207,232) on
 * this white header: 1.62:1, below the 3:1 that rule was written to hit (see the comment above
 * it). Letting the global outline through gives these controls the same 3.89:1 indicator, and
 * the same 2px offset, as every other control on the site. It matters more here than it looks:
 * now that hover and tap no longer paint a background block, the outline is the only thing
 * that marks which control has focus.
 */

const BASE =
  'relative flex h-10 items-center gap-2 px-2 text-sm font-semibold transition-colors ' +
  'after:absolute after:bottom-1.5 after:left-2 after:right-2 after:h-0.5 after:origin-left ' +
  'after:scale-x-0 after:bg-primary-dark after:transition-transform after:duration-200 after:content-[""]';

/** Resting / hover state. */
export const headerControl = `${BASE} text-ink hover:text-navy-900 hover:after:scale-x-100`;

/** The control whose panel is currently open — held in the hovered state so the row shows
 *  which disclosure is responsible for the panel below it. */
export const headerControlOpen = `${BASE} text-navy-900 after:scale-x-100`;

/** Pick one by state. */
export const headerControlCls = (open) => (open ? headerControlOpen : headerControl);
