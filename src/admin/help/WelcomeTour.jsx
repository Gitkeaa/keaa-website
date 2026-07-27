import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { EASE } from '../../lib/motion';

/**
 * A one-time welcome walkthrough, shown on the first visit to the console and never again.
 *
 * Deliberately a CENTERED step card, not an element-spotlight tour: the elements a spotlight
 * would point at differ by role (a Business Development rep sees a territory card an Employee
 * never does), so anchoring to them is fragile. Descriptive steps say the same thing without
 * breaking when the layout differs.
 *
 * The "seen" flag lives in localStorage for now, so it is per-browser — a new device shows the
 * tour again. PHASE 2 moves this to a per-user field on the profile so it is truly once-ever,
 * and adds a "Replay tour" entry in the help drawer.
 */
const SEEN_KEY = 'keaa-admin-tour-v1';

const STEPS = [
  {
    title: 'Welcome to the KEAA console',
    body: 'A quick tour of where things are. It takes ten seconds and you will not see it again.',
  },
  {
    title: 'This is your dashboard',
    body: 'Your territory, your SOP checklist, and the inquiries waiting on you, all in one place and updated live.',
  },
  {
    title: 'Your SOP, always in view',
    body: 'The SOP card is your daily checklist. "View complete SOP" opens the full guide for your role.',
  },
  {
    title: 'Help on every screen',
    body: 'The Help button, top-right, explains whatever page you are on. That is it, you are ready to go.',
  },
];

function seen() {
  try {
    return localStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return true; // storage blocked — treat as seen rather than nagging every load
  }
}

export default function WelcomeTour() {
  const [open, setOpen] = useState(() => !seen());
  const [step, setStep] = useState(0);

  const finish = () => {
    try {
      localStorage.setItem(SEEN_KEY, '1');
    } catch {
      /* storage blocked — it just re-shows next time, no worse than today */
    }
    setOpen(false);
  };

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.28, ease: EASE }}
            role="dialog"
            aria-modal="true"
            aria-label="Welcome tour"
            className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-xl"
          >
            <button
              type="button"
              onClick={finish}
              aria-label="Skip the tour"
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>

            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary-darker">
              Step {step + 1} of {STEPS.length}
            </p>
            <h2 className="mt-1.5 font-display text-xl font-bold text-navy-900">{current.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{current.body}</p>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex gap-1.5" aria-hidden>
                {STEPS.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === step ? 'w-5 bg-primary-dark' : 'w-1.5 bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s - 1)}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  >
                    Back
                  </button>
                )}
                {!isLast && (
                  <button
                    type="button"
                    onClick={finish}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:text-slate-600"
                  >
                    Skip
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => (isLast ? finish() : setStep((s) => s + 1))}
                  className="rounded-lg bg-primary-dark px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-darker"
                >
                  {isLast ? 'Get started' : 'Next'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
