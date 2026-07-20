import { useEffect, useState } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';

/**
 * Floating back-to-top button with a circular scroll-progress ring.
 * Appears after scrolling past one viewport height.
 */
export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={scrollTop}
          aria-label="Back to top"
          /* Offset above the consent bar for the same reason as the chat launcher —
             see the note there and `--consent-bar-h` in CookieConsent. */
          style={{ bottom: 'calc(1.5rem + var(--consent-bar-h, 0px))' }}
          className="fixed right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-navy-800 text-primary-light shadow-lg transition-[bottom] duration-300"
        >
          <svg aria-hidden className="absolute inset-0 -rotate-90" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="21" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
            <motion.circle
              cx="24"
              cy="24"
              r="21"
              fill="none"
              stroke="#8CCDF3"
              strokeWidth="2"
              strokeLinecap="round"
              style={{ pathLength: progress }}
            />
          </svg>
          <span className="relative text-[13px] font-bold uppercase tracking-[0.12em]">Top</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
