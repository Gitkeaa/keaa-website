/**
 * The little navy prompt that drops from a header control on hover or focus — "Change
 * region & language", "Search products & pages". Shared so every header hint is the same
 * chip in the same place: both the search icon and the region/language control use it, and
 * a change here moves all of them together.
 *
 * `aria-hidden`: each trigger already carries an `aria-label` that says what it does, so a
 * visible hint is a sighted-only affordance — announcing it too would just repeat the label.
 * `pointer-events-none` so it can never sit between the pointer and the control it describes.
 *
 * Centred under the trigger (`left-1/2 -translate-x-1/2`). Callers decide WHEN it shows;
 * this only decides what it looks like.
 */
export default function HeaderHint({ show, children }) {
  if (!show) return null;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-navy-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-cardHover"
    >
      {children}
    </div>
  );
}
