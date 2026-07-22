import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Check, ArrowDown, Info } from 'lucide-react';

/**
 * The contextual help drawer — a right-hand slide-over that renders one guide object from
 * useSop.js. It is dumb on purpose: it shows whichever of { purpose, checklist, workflow,
 * important } the guide carries and nothing else, so the same drawer serves a page guide and
 * a role's complete SOP without special-casing either.
 *
 * Uses the admin console's own utility classes (bg-white, border-slate-200, text-navy-900,
 * text-slate-500) so the `.admin-dark` overrides theme it for free. Sits at z-50, above the
 * z-30 topbar. Escape and a backdrop click close it, matching the console's other overlays.
 */
export default function HelpDrawer({ guide, onClose }) {
  const open = Boolean(guide);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-navy-950/50"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label={`${guide.title} help`}
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col overflow-y-auto bg-white shadow-xl"
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-6 py-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary-darker">
                  Guide
                </p>
                <h2 className="mt-0.5 font-display text-lg font-bold text-navy-900">{guide.title}</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close help"
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-7 px-6 py-6">
              {guide.purpose && (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Purpose</h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy-800">{guide.purpose}</p>
                </section>
              )}

              {guide.checklist?.length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Your checklist</h3>
                  <ul className="mt-2 space-y-2">
                    {guide.checklist.map((item) => (
                      <li key={item} className="flex gap-2.5 text-sm text-navy-800">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-dark" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {guide.workflow?.length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Workflow</h3>
                  <ol className="mt-3 space-y-0">
                    {guide.workflow.map((stage, i) => (
                      <li key={stage}>
                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-medium text-navy-800">
                          {stage}
                        </div>
                        {i < guide.workflow.length - 1 && (
                          <div className="flex justify-center py-1" aria-hidden>
                            <ArrowDown className="h-3.5 w-3.5 text-slate-400" />
                          </div>
                        )}
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {guide.important?.length > 0 && (
                <section className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary-darker">
                    <Info className="h-3.5 w-3.5" /> Important
                  </h3>
                  <ul className="mt-2 space-y-1.5">
                    {guide.important.map((note) => (
                      <li key={note} className="flex gap-2 text-sm text-navy-800">
                        <span aria-hidden className="text-primary-dark">•</span>
                        {note}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
