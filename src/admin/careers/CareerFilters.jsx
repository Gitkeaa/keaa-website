import { Search, X } from 'lucide-react';
import { STATUSES } from './atsConfig';

/**
 * Search + filter bar. Search matches name / email / phone; the selects filter by position,
 * status and experience; the date picks applications on or after a day. Position and experience
 * options are derived from the live data so they always match what the rows actually contain.
 */
export default function CareerFilters({ filters, setFilters, positions, experiences }) {
  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v }));
  const reset = () => setFilters({ q: '', position: '', status: '', experience: '', date: '' });
  const active = filters.q || filters.position || filters.status || filters.experience || filters.date;
  const inputCls = 'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-navy-800 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20';

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3">
      <div className="relative min-w-[200px] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input value={filters.q} onChange={(e) => set('q', e.target.value)} aria-label="Search name, email or phone" placeholder="Search name, email or phone" className={`${inputCls} w-full pl-9`} />
      </div>
      <select value={filters.position} onChange={(e) => set('position', e.target.value)} className={inputCls} aria-label="Filter by position">
        <option value="">All positions</option>
        {positions.map((p) => <option key={p} value={p}>{p}</option>)}
      </select>
      <select value={filters.status} onChange={(e) => set('status', e.target.value)} className={inputCls} aria-label="Filter by status">
        <option value="">All statuses</option>
        {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
      </select>
      <select value={filters.experience} onChange={(e) => set('experience', e.target.value)} className={inputCls} aria-label="Filter by experience">
        <option value="">All experience</option>
        {experiences.map((x) => <option key={x} value={x}>{x}</option>)}
      </select>
      <input type="date" value={filters.date} onChange={(e) => set('date', e.target.value)} className={inputCls} aria-label="Applied on or after" title="Applied on or after" />
      {active && (
        <button type="button" onClick={reset} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
          <X className="h-3.5 w-3.5" /> Reset
        </button>
      )}
    </div>
  );
}
