import { Children, useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * A horizontal rail of cards with prev / dots / next underneath.
 *
 * It is a native scroll container with scroll-snap rather than a transformed track, so touch,
 * trackpad and keyboard scrolling all work for free and the buttons below only have to nudge
 * `scrollLeft`. The dots read their state back from the real scroll position, which means
 * dragging the rail keeps them in sync with no extra bookkeeping.
 *
 * Children supply their own width and `flex-none snap-start` — the rail cannot know how many
 * cards should be visible at each breakpoint, and that differs per use.
 *
 * `labels` gives each dot an accessible name. Pass one per child; anything missing falls back
 * to a positional label.
 */
export default function CardRail({ label, labels = [], children }) {
  const count = Children.count(children);
  const trackRef = useRef(null);
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  /** One card plus the gap after it — the distance a single step scrolls. */
  const step = useCallback(() => {
    const t = trackRef.current;
    const first = t?.firstElementChild;
    if (!t || !first) return 0;
    const gap = parseFloat(getComputedStyle(t).columnGap) || 0;
    return first.offsetWidth + gap;
  }, []);

  const sync = useCallback(() => {
    const t = trackRef.current;
    if (!t) return;
    const s = step();
    setActive(s ? Math.round(t.scrollLeft / s) : 0);
    setAtStart(t.scrollLeft <= 2);
    // 2px of slack: sub-pixel widths mean scrollLeft rarely lands exactly on the end.
    setAtEnd(t.scrollLeft + t.clientWidth >= t.scrollWidth - 2);
  }, [step]);

  useEffect(() => {
    const t = trackRef.current;
    if (!t) return undefined;
    sync();
    t.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    return () => {
      t.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, [sync]);

  const goTo = (i) => {
    const t = trackRef.current;
    if (!t) return;
    const target = Math.max(0, Math.min(count - 1, i));
    t.scrollTo({ left: target * step(), behavior: reduce ? 'auto' : 'smooth' });
  };

  const arrow =
    'flex h-9 w-9 flex-none items-center justify-center rounded-full text-lg text-navy-800 transition-colors hover:bg-navy-900/[0.06] disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent';

  return (
    <>
      <div
        ref={trackRef}
        role="region"
        aria-label={label}
        tabIndex={0}
        className="mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      <div className="mt-8 flex items-center justify-center gap-2">
        <button type="button" onClick={() => goTo(active - 1)} disabled={atStart} aria-label="Previous" className={arrow}>
          &lsaquo;
        </button>

        <div className="flex items-center gap-2.5 rounded-full bg-navy-900/[0.05] px-4 py-2.5">
          {Array.from({ length: count }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={labels[i] || `Go to item ${i + 1}`}
              aria-current={i === active ? 'true' : undefined}
              /* 16px hit area around an 8px dot — the ink stays small, the target does not. */
              className="group flex h-4 items-center"
            >
              <span
                aria-hidden
                className={`block h-2 rounded-full transition-all duration-300 ${
                  i === active ? 'w-6 bg-navy-900' : 'w-2 bg-navy-900/25 group-hover:bg-navy-900/50'
                }`}
              />
            </button>
          ))}
        </div>

        <button type="button" onClick={() => goTo(active + 1)} disabled={atEnd} aria-label="Next" className={arrow}>
          &rsaquo;
        </button>
      </div>
    </>
  );
}
