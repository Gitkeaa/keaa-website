import { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate } from 'framer-motion';

/**
 * Animates a number counting up from 0 to `value` when scrolled into view.
 * Accepts a `value` like 30 and optional `prefix`/`suffix` (e.g. suffix="+").
 * Non-numeric characters in the passed value are preserved as a static
 * suffix automatically if `value` is given as a string like "30+".
 */
export default function AnimatedCounter({ value, prefix = '', suffix = '', duration = 1.4, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = useState(0);

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
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, numeric, duration, countable]);

  if (!countable) {
    return (
      <span className={className}>
        {prefix}
        {value}
        {suffix}
      </span>
    );
  }

  return (
    <motion.span ref={ref} className={className}>
      {prefix}
      {decimals > 0 ? display.toFixed(decimals) : Math.round(display).toLocaleString()}
      {trailing}
      {suffix}
    </motion.span>
  );
}
