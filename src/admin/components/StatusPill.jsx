/**
 * A small status badge. Tones are keyed by the status strings used across the mock data
 * (new, in-review, quoted, unread, active, …); anything unmapped falls back to slate.
 */
const TONES = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  blue: 'bg-primary/10 text-primary-darker ring-primary/25',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  slate: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  red: 'bg-red-50 text-red-700 ring-red-600/20',
  navy: 'bg-navy-50 text-navy-700 ring-navy-600/20',
};

const STATUS_TONE = {
  active: 'green',
  new: 'blue',
  unread: 'blue',
  shortlisted: 'blue',
  'in-review': 'amber',
  interview: 'amber',
  read: 'slate',
  inactive: 'slate',
  closed: 'slate',
  quoted: 'green',
  replied: 'green',
  rejected: 'red',
};

const label = (s) => String(s).replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export default function StatusPill({ status, tone }) {
  const t = TONES[tone || STATUS_TONE[status] || 'slate'];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${t}`}>
      {label(status)}
    </span>
  );
}
