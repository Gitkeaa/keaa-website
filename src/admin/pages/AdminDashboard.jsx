import { ADMIN_ICONS as Icons } from '../adminIcons';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import StatusPill from '../components/StatusPill';
import { useAdminAuth } from '../auth/AdminAuthContext';
import { useApi } from '../api/useApi';

const QUICK = [
  { label: 'Review RFQ requests', to: '/admin/rfq', icon: 'FileText' },
  { label: 'Read contact messages', to: '/admin/contacts', icon: 'Mail' },
  { label: 'Manage products', to: '/admin/products', icon: 'Package' },
  { label: 'Add a team member', to: '/admin/users', icon: 'UserPlus' },
];

export default function AdminDashboard() {
  const { user } = useAdminAuth();
  const { data: summary, loading, error } = useApi('/api/dashboard/summary');
  const { data: rfq } = useApi('/api/rfq');

  const tiles = summary
    ? [
        { id: 'rfq', label: 'Open RFQ Requests', value: summary.openRfq, icon: 'FileText', tone: 'primary' },
        { id: 'contacts', label: 'Unread Messages', value: summary.unreadMessages, icon: 'Mail', tone: 'gold' },
        { id: 'applications', label: 'New Applications', value: summary.newApplications, icon: 'Briefcase', tone: 'emerald' },
        { id: 'products', label: 'Catalogue Products', value: summary.products, icon: 'Package', tone: 'navy' },
      ]
    : [];

  const recent = (rfq || []).slice(0, 5);

  return (
    <>
      <PageHeader
        title={`Welcome, ${user?.name?.split(' ')[0] || 'Admin'}`}
        subtitle="Live overview of activity across the KEAA site."
      />

      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading && !summary
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[104px] animate-pulse rounded-xl border border-slate-200 bg-white" />
            ))
          : tiles.map(({ id, ...t }) => <StatCard key={id} {...t} />)}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Recent RFQ */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="font-display text-base font-bold text-navy-900">Recent RFQ Requests</h2>
              <Link to="/admin/rfq" className="text-sm font-medium text-primary-darker hover:underline">View all</Link>
            </div>
            <ul className="divide-y divide-slate-100">
              {recent.length === 0 && <li className="px-5 py-8 text-center text-sm text-slate-400">No requests yet.</li>}
              {recent.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-navy-800">{r.name} — {r.company}</p>
                    <p className="truncate text-xs text-slate-400">{r.category} · {r.country}</p>
                  </div>
                  <StatusPill status={r.status} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Quick actions */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-base font-bold text-navy-900">Quick Actions</h2>
          <div className="mt-4 space-y-2">
            {QUICK.map((q) => {
              const Icon = Icons[q.icon] || Icons.ArrowRight;
              return (
                <Link
                  key={q.to}
                  to={q.to}
                  className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2.5 text-sm font-medium text-navy-700 transition-colors hover:border-primary/40 hover:bg-slate-50"
                >
                  <Icon className="h-4 w-4 text-primary-darker" />
                  {q.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
