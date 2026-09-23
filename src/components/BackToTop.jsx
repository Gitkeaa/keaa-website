import { useEffect, useState } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { useLT } from '../i18n/LocaleContext';
import { entryInitial } from '../lib/firstPaint';

/**
 * Floating back-to-top button with a circular scroll-progress ring.
 * Appears after scrolling past one viewport height.
 */
export default function BackToTop() {
  const lt = useLT('common');
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
          initial={entryInitial({ opacity: 0, scale: 0.6 })}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={scrollTop}
          aria-label={lt('backToTop.label', 'Back to top')}
          /* Bottom-LEFT, and DESKTOP-ONLY (`hidden sm:flex`). On desktop the chat launcher sits
             bottom-right, so the two never overlap; on mobile the launcher moves to bottom-left,
             so this button steps aside there. Offset above the consent bar for the same reason
             as the chat launcher, see `--consent-bar-h` in CookieConsent. `--actionbar-h`
             is the same contract for the phone action bar: this button is visible from
             `sm` and the bar is hidden from `md`, so the two do overlap between 640px
             and 767px. */
          style={{ bottom: 'calc(1.5rem + var(--consent-bar-h, 0px) + var(--actionbar-h, 0px))' }}
          className="fixed left-6 z-40 hidden sm:flex h-12 w-12 items-center justify-center rounded-full bg-navy-800 text-primary-light shadow-lg transition-[bottom] duration-300"
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
          <span className="relative text-[13px] font-bold uppercase tracking-[0.12em]">{lt('backToTop.short', 'Top')}</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
