import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ArrowUpRight, ShieldCheck, Award } from 'lucide-react';
import { company } from '../data/company';

const BASE_KEY = 'keaa-floating-promos';
const MAX_CLOSES = 2;
const VISIBLE_MS = 3000; // each certificate stays on screen 3s…
const GAP_MS = 2000; // …then leaves, and the next arrives after a 2s gap
const REAPPEAR_MS = 5000; // reappear this soon after a manual close
const rand = (min, max) => min + Math.random() * (max - min);

const closesKey = `${BASE_KEY}:closes`;
const readCloses = () => {
  try {
    return parseInt(sessionStorage.getItem(closesKey) || '0', 10) || 0;
  } catch (_) {
    return 0;
  }
};

const certs = company.certifications || [];

/*
 * Floating "Globally Certified" rotator that runs on every page. It cycles
 * through KEAA's quality certifications one at a time (as one leaves, the next
 * arrives), ~3s each. Every card shares the exact same size/layout, and the CTA
 * opens the official certificate directly. Anchored bottom-left so it clears
 * the bottom-right chatbot / back-to-top. Pauses on hover; close reappears after
 * 5s; two closes → gone for this session.
 */
export default function FloatingPromos() {
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const hideTimer = useRef();
  const nextTimer = useRef();
  const firstTimer = useRef();

  useEffect(() => {
    setDismissed(readCloses() >= MAX_CLOSES || certs.length === 0);
  }, []);

  const clearTimers = () => {
    clearTimeout(hideTimer.current);
    clearTimeout(nextTimer.current);
    clearTimeout(firstTimer.current);
  };

  const advance = (delay) => {
    clearTimeout(nextTimer.current);
    nextTimer.current = setTimeout(() => {
      setIndex((i) => (i + 1) % certs.length);
      setShow(true);
      startHide();
    }, delay);
  };

  const startHide = (ms = VISIBLE_MS) => {
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      setShow(false); // one leaves…
      advance(GAP_MS); // …the next arrives after the 2s gap
    }, ms);
  };

  useEffect(() => {
    if (dismissed) return undefined;
    firstTimer.current = setTimeout(() => {
      setShow(true);
      startHide();
    }, rand(2500, 4000));
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dismissed]);

  const close = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    clearTimers();
    setShow(false);
    const count = readCloses() + 1;
    try {
      sessionStorage.setItem(closesKey, String(count));
    } catch (_) {
      /* ignore */
    }
    if (count >= MAX_CLOSES) {
      setDismissed(true);
    } else {
      advance(REAPPEAR_MS);
    }
  };

  if (dismissed) return null;

  const cert = certs[index];

  return (
    <div className="pointer-events-none fixed bottom-6 left-4 z-40 w-[330px] max-w-[calc(100vw-2rem)] sm:left-6">
      <AnimatePresence mode="wait">
        {show && (
          <motion.div
            key={cert.name}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={clearTimers}
            onMouseLeave={() => startHide(2000)}
            className="pointer-events-auto relative flex h-[192px] flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white/95 p-4 shadow-2xl shadow-navy-950/10 backdrop-blur-sm"
            role="status"
            aria-live="polite"
          >
            <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400" />

            <button
              onClick={close}
              aria-label="Dismiss notification"
              className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full text-ink/40 transition-colors hover:bg-navy-50 hover:text-navy-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              <ShieldCheck className="h-3.5 w-3.5" /> Globally Certified
            </span>

            <p className="mt-1.5 truncate pr-5 font-display text-sm font-bold leading-snug text-navy-800">
              {cert.name} Certified
            </p>
            <p className="mt-0.5 truncate text-xs text-ink/55">{cert.body}</p>

            <div className="mt-3 flex h-9 items-center">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Award className="h-5 w-5" />
              </span>
            </div>

            <a
              href={cert.image}
              target="_blank"
              rel="noopener noreferrer"
              title="View the official certificate"
              className="group mt-auto flex w-full items-center justify-center gap-1.5 rounded-xl bg-navy-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-navy-900 hover:shadow-lg"
            >
              View Certificate
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
