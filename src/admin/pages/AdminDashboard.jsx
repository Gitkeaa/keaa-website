import * as Icons from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { useAdminAuth } from '../auth/AdminAuthContext';
import { dashboardStats, recentActivity } from '../data/mock';

const ACTIVITY_ICON = { rfq: 'FileText', contact: 'Mail', application: 'Briefcase' };

export default function AdminDashboard() {
  const { user } = useAdminAuth();
  const hour = 12; // static greeting; a real clock would use new Date() at render
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <>
      <PageHeader
        title={`${greeting}, ${user?.name?.split(' ')[0] || 'Admin'}`}
        subtitle="Here’s what’s happening across the KEAA site today."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map(({ id, ...stat }) => (
          <StatCard key={id} {...stat} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Recent activity */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="font-display text-base font-bold text-navy-900">Recent Activity</h2>
            </div>
            <ul className="divide-y divide-slate-100">
              {recentActivity.map((a) => {
                const Icon = Icons[ACTIVITY_ICON[a.type]] || Icons.Activity;
                return (
                  <li key={a.id} className="flex items-start gap-3 px-5 py-3.5">
                    <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-navy-800">{a.text}</p>
                      <p className="mt-0.5 text-xs text-slate-400">{a.time}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Quick links */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-base font-bold text-navy-900">Quick Actions</h2>
          <div className="mt-4 space-y-2">
            {[
              { label: 'Review new RFQ requests', to: '/admin/rfq', icon: 'FileText' },
              { label: 'Read contact messages', to: '/admin/contacts', icon: 'Mail' },
              { label: 'Manage products', to: '/admin/products', icon: 'Package' },
              { label: 'Add a team member', to: '/admin/users', icon: 'UserPlus' },
            ].map((q) => {
              const Icon = Icons[q.icon] || Icons.ArrowRight;
              return (
                <a
                  key={q.to}
                  href={q.to}
                  className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2.5 text-sm font-medium text-navy-700 transition-colors hover:border-primary/40 hover:bg-slate-50"
                >
                  <Icon className="h-4 w-4 text-primary-darker" />
                  {q.label}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
