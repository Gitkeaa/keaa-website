import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  Check,
  ListChecks,
  CheckCircle2,
  Star,
  Lightbulb,
  AlertTriangle,
  Link2,
  ChevronDown,
  Clock,
} from 'lucide-react';
import { moduleLabel } from '../auth/roles';

/**
 * The contextual help drawer — a right-hand slide-over that renders one guide object from
 * useSop.js as a premium enterprise knowledge panel (the reference points are Salesforce Help,
 * SAP Fiori and ServiceNow articles).
 *
 * It is content-driven: it lays out whichever of the standard sections the guide carries, in a
 * fixed order, and hides the rest, so the same drawer serves a role SOP and a module guide
 * without special-casing either. Long guides collapse their tail behind a Read more toggle so a
 * short guide is never padded and a long one never forces a wall of scrolling.
 *
 * Standard section order: Purpose, Workflow, Responsibilities, Checklist, Best Practices,
 * Important Notes, Quick Tips, Related Modules.
 *
 * Uses the console's own utility classes (bg-white, border-slate-200, text-navy-900,
 * text-slate-500) so `.admin-dark` themes it for free, and brand colours only (primary / navy /
 * slate) per the client rule. Sits at z-50 above the z-30 topbar; Escape and a backdrop click
 * close it.
 */

const fmtDate = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

/** The five structured body sections, in render order, with their heading + icon. */
const BODY_SECTIONS = [
  { key: 'responsibilities', title: 'Responsibilities', Icon: ListChecks },
  { key: 'checklist', title: 'Checklist', Icon: CheckCircle2 },
  { key: 'bestPractices', title: 'Best Practices', Icon: Star },
  { key: 'important', title: 'Important Notes', Icon: AlertTriangle, tone: 'accent' },
  { key: 'quickTips', title: 'Quick Tips', Icon: Lightbulb, tone: 'soft' },
];

/** Split the present body sections into a visible preview and a collapsible tail, driven by how
 *  much content there is — a short guide shows everything, a long one collapses its tail. */
function splitSections(guide) {
  const present = BODY_SECTIONS.filter((s) => guide[s.key]?.length > 0);
  const counts = present.map((s) => guide[s.key].length);
  const total = counts.reduce((a, b) => a + b, 0);
  if (total <= 9) return { preview: present, more: [] };

  let cum = 0;
  let splitAt = present.length;
  for (let i = 0; i < present.length; i += 1) {
    cum += counts[i];
    if (cum >= 6 && i + 1 < present.length) {
      splitAt = i + 1;
      break;
    }
  }
  return { preview: present.slice(0, splitAt), more: present.slice(splitAt) };
}

export default function HelpDrawer({ guide, onClose, onOpenRelated }) {
  const open = Boolean(guide);
  const [expanded, setExpanded] = useState(false);

  // Collapse the tail again whenever a different guide is shown (incl. a related-module jump).
  useEffect(() => setExpanded(false), [guide?.title]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const updated = guide ? fmtDate(guide.updatedAt) : null;
  const { preview, more } = guide ? splitSections(guide) : { preview: [], more: [] };
  const related = (guide?.related || []).filter(Boolean);

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
            aria-label={`${guide.title} guide`}
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-slate-50 shadow-xl"
          >
            {/* Header */}
            <div className="flex-shrink-0 border-b border-slate-200 bg-white px-6 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary-darker">
                      Guide
                    </p>
                    {guide.department && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        {guide.department}
                      </span>
                    )}
                  </div>
                  <h2 className="mt-1 font-display text-lg font-bold leading-tight text-navy-900">
                    {guide.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close guide"
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {(updated || guide.version) && (
                <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                  {guide.version != null && (
                    <span className="rounded border border-primary/20 bg-primary/5 px-1.5 py-0.5 font-semibold text-primary-darker">
                      v{guide.version}
                    </span>
                  )}
                  {updated && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Updated {updated}
                      {guide.updatedBy ? ` by ${guide.updatedBy}` : ''}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Body */}
            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
              {/* Purpose — the lead */}
              {guide.purpose && (
                <p className="text-[15px] font-medium leading-relaxed text-navy-800">{guide.purpose}</p>
              )}

              {/* Workflow — vertical enterprise stepper */}
              {guide.workflow?.length > 0 && <Workflow stages={guide.workflow} />}

              {/* Preview body sections */}
              {preview.map((s) => (
                <ListSection key={s.key} title={s.title} Icon={s.Icon} tone={s.tone} items={guide[s.key]} />
              ))}

              {/* Collapsible tail */}
              {more.length > 0 && (
                <>
                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.div
                        key="more"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="space-y-5 overflow-hidden"
                      >
                        {more.map((s) => (
                          <ListSection key={s.key} title={s.title} Icon={s.Icon} tone={s.tone} items={guide[s.key]} />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-primary-darker hover:underline"
                  >
                    {expanded ? 'Read less' : 'Read more'}
                    <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                  </button>
                </>
              )}

              {/* Related modules */}
              {related.length > 0 && (
                <section className="border-t border-slate-200 pt-5">
                  <SectionHeading title="Related Modules" Icon={Link2} />
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {related.map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => onOpenRelated?.(key)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-navy-700 transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary-darker"
                      >
                        <Link2 className="h-3.5 w-3.5 text-slate-400" />
                        {moduleLabel(key)}
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ---------------- section primitives ---------------- */

function SectionHeading({ title, Icon }) {
  return (
    <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
      <Icon className="h-3.5 w-3.5 text-slate-400" />
      {title}
    </h3>
  );
}

/** A titled card of list items. `tone` picks the visual weight:
 *  default = plain card, 'accent' = brand-tinted (Important Notes), 'soft' = subtle (Quick Tips). */
function ListSection({ title, Icon, items, tone }) {
  const accent = tone === 'accent';
  const soft = tone === 'soft';
  const cardCls = accent
    ? 'rounded-xl border border-primary/20 bg-primary/5 p-4'
    : soft
      ? 'rounded-xl border border-slate-200 bg-white/60 p-4'
      : 'rounded-xl border border-slate-200 bg-white p-4';

  return (
    <section className={cardCls}>
      <h3
        className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide ${
          accent ? 'text-primary-darker' : 'text-slate-500'
        }`}
      >
        <Icon className={`h-3.5 w-3.5 ${accent ? 'text-primary-dark' : 'text-slate-400'}`} />
        {title}
      </h3>
      <ul className="mt-2.5 space-y-2">
        {items.map((item, i) => (
          <li key={`${i}-${item}`} className="flex gap-2.5 text-sm leading-relaxed text-navy-800">
            {accent ? (
              <span aria-hidden className="mt-0.5 flex-shrink-0 text-primary-dark">
                •
              </span>
            ) : (
              <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-dark" />
            )}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Vertical stepper for a workflow pipeline — numbered nodes joined by a connector line. */
function Workflow({ stages }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <SectionHeading title="Workflow" Icon={ListChecks} />
      <ol className="relative mt-3">
        {stages.map((stage, i) => (
          <li key={`${i}-${stage}`} className="relative flex gap-3 pb-4 last:pb-0">
            {i < stages.length - 1 && (
              <span aria-hidden className="absolute left-[11px] top-6 h-[calc(100%-1.5rem)] w-px bg-slate-200" />
            )}
            <span className="relative z-10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary-darker ring-1 ring-primary/30">
              {i + 1}
            </span>
            <span className="pt-0.5 text-sm font-medium text-navy-800">{stage}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
