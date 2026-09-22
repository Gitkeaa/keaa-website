import { useEffect, useRef, useState } from 'react';
import { hasPainted } from '../../lib/firstPaint';
import { motion, useInView, animate } from 'framer-motion';
import { EASE } from '../../lib/motion';

const DURATION = 1.4;

/**
 * Animates a number counting up from 0 to `value` when scrolled into view.
 * Non-numeric characters in the passed value are preserved as a static
 * suffix automatically if `value` is given as a string like "30+".
 */
export default function AnimatedCounter({ value, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  /**
   * Starts at the FINAL value on the first paint of a page load, and counts up on every mount
   * after that.
   *
   * Prerendering snapshots the page once the counter has finished, so the HTML says "42". A
   * fresh React render starting from 0 says "0", and that single difference is enough for React
   * to reject the prerendered markup and rebuild the whole tree, which is worth 0.31 of layout
   * shift. See lib/firstPaint.js.
   */
  const [display, setDisplay] = useState(() => (hasPainted() ? 0 : Number.NaN));

  // Split numeric part from any trailing characters (e.g. "30+" -> 30, "+")
  const match = String(value).match(/^([\d.,]+)(.*)$/);
  const numeric = match ? parseFloat(match[1].replace(/,/g, '')) : 0;
  const trailing = match ? match[2] : '';
  const decimals = match && match[1].includes('.') ? match[1].split('.')[1].length : 0;

  /**
   * Values that do not begin with a digit — "ISO", "EN 1090", "DIN EN 1461" — never
   * matched, so `numeric` fell to 0 and the component rendered a literal "0" where a
   * standard's name belonged. There is nothing to count, so render the string as given.
   */
  const countable = match !== null;

  useEffect(() => {
    if (!inView || !countable) return;
    const controls = animate(0, numeric, {
      duration: DURATION,
      ease: EASE,
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, numeric, countable]);

  if (!countable) {
    return <span className={className}>{value}</span>;
  }

  return (
    <motion.span ref={ref} className={className}>
      {(() => {
        // NaN is the first-paint sentinel: render the destination, not the start.
        const n = Number.isNaN(display) ? numeric : display;
        return decimals > 0 ? n.toFixed(decimals) : Math.round(n).toLocaleString();
      })()}
      {trailing}
    </motion.span>
  );
}
