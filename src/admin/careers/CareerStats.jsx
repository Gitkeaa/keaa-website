import StatCard from '../components/StatCard';

/**
 * Six KPI cards computed from the current application list. Clicking a card sets the table's
 * status filter (Total clears it). Reuses the dashboard's StatCard + grid + skeleton pattern.
 */
const CARDS = [
  { key: null, label: 'Total Applications', icon: 'Briefcase', tone: 'primary' },
  { key: 'new', label: 'New', icon: 'UserPlus', tone: 'navy' },
  { key: 'under-review', label: 'Under Review', icon: 'Clock', tone: 'gold' },
  { key: 'interview-scheduled', label: 'Interviews Scheduled', icon: 'Calendar', tone: 'primary' },
  { key: 'selected', label: 'Selected', icon: 'UserCheck', tone: 'emerald' },
  { key: 'rejected', label: 'Rejected', icon: 'XCircle', tone: 'gold' },
];

export default function CareerStats({ apps, active, onPick, loading }) {
  const count = (key) => (key ? apps.filter((a) => a.status === key).length : apps.length);
  return (
    <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
      {loading
        ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-[104px] animate-pulse rounded-xl border border-slate-200 bg-white" />)
        : CARDS.map((c) => {
            const isActive = active === c.key;
            return (
              <button
                key={c.label}
                type="button"
                onClick={() => onPick(c.key)}
                className={`rounded-xl text-left outline-none transition ${isActive ? 'ring-2 ring-primary ring-offset-1' : 'hover:-translate-y-0.5'}`}
              >
                <StatCard label={c.label} value={count(c.key)} icon={c.icon} tone={c.tone} />
              </button>
            );
          })}
    </div>
  );
}
