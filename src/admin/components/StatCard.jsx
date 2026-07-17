import * as Icons from 'lucide-react';

const TONES = {
  primary: 'bg-primary/10 text-primary-darker',
  gold: 'bg-amber-100 text-amber-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  navy: 'bg-navy-100 text-navy-700',
};

/** A dashboard KPI tile: label, big value, delta note and an icon chip. */
export default function StatCard({ label, value, delta, icon, tone = 'primary' }) {
  const Icon = Icons[icon] || Icons.Activity;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 font-display text-3xl font-bold text-navy-900">{value}</p>
        </div>
        <span className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg ${TONES[tone] || TONES.primary}`}>
          <Icon className="h-5 w-5" strokeWidth={2} />
        </span>
      </div>
      {delta && <p className="mt-3 text-xs font-medium text-slate-400">{delta}</p>}
    </div>
  );
}
