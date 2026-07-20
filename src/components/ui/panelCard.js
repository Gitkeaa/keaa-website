/**
 * The panel each Home band sits in.
 *
 * The border is deliberately faint — a dark hairline at 7% — so it registers as an edge
 * rather than as a box, and the hover lifts only 4px, because a page of these all springing
 * about would be worse than no hover at all.
 *
 * It lives here rather than inline because five bands share it: tune the border or lift once
 * and every panel follows. The radius is not ours to pick — rounded-card is the site-wide
 * token in tailwind.config.js, so every box on the site turns the same corner.
 * Keep it a single-line string — Tailwind scans source
 * text for class names, so a class split across a concatenation would never be generated.
 *
 * Anything placed inside a panel should drop its own drop-shadow and hover-lift: the panel
 * carries the elevation, and stacking a second one inside only muddies both.
 */
export const PANEL_CARD =
  'rounded-card bg-surface-raised p-6 shadow-[0_1px_2px_-1px_rgb(var(--color-text)_/_0.04)] ring-1 ring-text/[0.07] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_1px_2px_-1px_rgb(var(--color-text)_/_0.06),0_24px_56px_-36px_rgb(var(--color-text)_/_0.28)] hover:ring-text/[0.12] sm:p-9 lg:p-12';
