import { ADMIN_ICONS as Icons } from '../adminIcons';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import StatusPill from '../components/StatusPill';
import InquiryManager from '../components/InquiryManager';
import AdminCharts from '../components/AdminCharts';
import SopCard from '../components/SopCard';
import FeedbackCard from '../components/FeedbackCard';
import ResourceLibrary from '../components/ResourceLibrary';
import { useAdminAuth } from '../auth/AdminAuthContext';
import { useApi } from '../api/useApi';
import { ROLES, moduleAccess } from '../auth/roles';

// Each quick action names its module; a `manage` action is hidden unless the role can actually
// do it (so e.g. Admin, who can only VIEW users, never sees a dead "Add a team member").
const QUICK = [
  { label: 'Review RFQ requests', to: '/portal/rfq', icon: 'FileText', module: 'rfq' },
  { label: 'Read contact messages', to: '/portal/contacts', icon: 'Mail', module: 'contacts' },
  { label: 'Review site feedback', to: '/portal/feedback', icon: 'MessageSquare', module: 'feedback' },
  { label: 'Manage products', to: '/portal/products', icon: 'Package', module: 'products', manage: true },
  { label: 'Add a team member', to: '/portal/users', icon: 'UserPlus', module: 'users', manage: true },
];
const quickFor = (role) =>
  QUICK.filter((q) => (q.manage ? moduleAccess(role, q.module) === 'manage' : moduleAccess(role, q.module) != null));

export default function AdminDashboard() {
  const { user, role } = useAdminAuth();
  if (role === ROLES.BUSINESS_DEVELOPMENT) return <RepDashboard user={user} />;
  return <ManagerDashboard user={user} />;
}

/* ---------------- Sales / Marketing rep ---------------- */
function RepDashboard({ user }) {
  const { role } = useAdminAuth();
  const seesFeedback = moduleAccess(role, 'feedback') != null;
  const { data: profile } = useApi('/api/profile');
  const list = (csv) => (csv ? csv.split(',').map((s) => s.trim()).filter(Boolean) : []);
  const countries = list(profile?.assignedCountries);
  const categories = list(profile?.assignedCategories);

  return (
    <>
      <PageHeader title={`Welcome, ${user?.name?.split(' ')[0] || 'there'}`} subtitle="Your territory, workflow and assigned inquiries." />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* My Territory */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-base font-bold text-navy-900">My Territory</h2>
          <p className="mt-0.5 text-sm text-slate-500">Inquiries matching these are assigned to you automatically.</p>
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Assigned Countries</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {countries.length ? countries.map((c) => <span key={c} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary-darker">{c}</span>)
                : <span className="text-sm text-slate-400">None assigned yet.</span>}
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Assigned Product Categories</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {categories.length ? categories.map((c) => <span key={c} className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">{c}</span>)
                : <span className="text-sm text-slate-400">None assigned yet.</span>}
            </div>
          </div>
        </div>

        {/* SOP — role checklist, from the shared help content (help/sopContent.js). */}
        <SopCard />
      </div>

      <div className="mt-6">
        <h2 className="mb-3 font-display text-base font-bold text-navy-900">My Inquiries</h2>
        <InquiryManager />
      </div>

      {/* Site feedback is NOT an inquiry and is never assigned to a territory, so it sits outside
          "My Inquiries" above — it is the whole site's feedback, shown to this desk because they
          are the ones who act on it. Mounted only when the role may read it (see FeedbackCard). */}
      {seesFeedback && (
        <div className="mt-6">
          <FeedbackCard />
        </div>
      )}

      {/* Every catalogue, deck and logo file, downloadable by any role. */}
      <div className="mt-6">
        <ResourceLibrary />
      </div>
    </>
  );
}

/* ---------------- Admin / Super Admin ---------------- */
function ManagerDashboard({ user }) {
  const { role } = useAdminAuth();
  const quick = quickFor(role);
  const seesFeedback = moduleAccess(role, 'feedback') != null;
  const { data: summary, loading, error } = useApi('/api/dashboard/summary');
  const { data: rfq } = useApi('/api/inquiries');

  const tiles = summary
    ? [
        { id: 'rfq', label: 'Open RFQ Requests', value: summary.openRfq, icon: 'FileText', tone: 'primary' },
        { id: 'contacts', label: 'Unread Messages', value: summary.unreadMessages, icon: 'Mail', tone: 'gold' },
        { id: 'applications', label: 'New Applications', value: summary.newApplications, icon: 'Briefcase', tone: 'emerald' },
        { id: 'products', label: 'Catalogue Products', value: summary.products, icon: 'Package', tone: 'navy' },
        // Feedback carries two numbers that only mean something together: how many nobody has
        // looked at, and what visitors actually think. The count is the value, the average rides
        // in the delta line, so it stays one tile. `avgRating` is null (not 0) on an empty table.
        ...(seesFeedback
          ? [{
              id: 'feedback',
              label: 'New Feedback',
              value: summary.newFeedback ?? 0,
              delta: summary.avgRating != null ? `Average rating ${summary.avgRating} out of 5` : 'No ratings yet',
              icon: 'MessageSquare',
              tone: 'primary',
            }]
          : []),
      ]
    : [];

  const recent = (rfq || []).slice(0, 5);

  return (
    <>
      <PageHeader title={`Welcome, ${user?.name?.split(' ')[0] || 'Admin'}`} subtitle="Live overview of activity across the KEAA site." />

      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {/* Both column counts are written out in full: Tailwind scans source as text, so a class
          assembled from a variable is never generated. */}
      <div className={`grid gap-4 sm:grid-cols-2 ${seesFeedback ? 'xl:grid-cols-5' : 'xl:grid-cols-4'}`}>
        {loading && !summary
          ? Array.from({ length: seesFeedback ? 5 : 4 }).map((_, i) => <div key={i} className="h-[104px] animate-pulse rounded-xl border border-slate-200 bg-white" />)
          : tiles.map(({ id, ...t }) => <StatCard key={id} {...t} />)}
      </div>

      {/* Pictorial overview — monthly inquiry volume + current pipeline split. */}
      <AdminCharts inquiries={rfq || []} />

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="font-display text-base font-bold text-navy-900">Recent Inquiries</h2>
              <Link to="/portal/rfq" className="text-sm font-medium text-primary-darker hover:underline">View all</Link>
            </div>
            <ul className="divide-y divide-slate-100">
              {recent.length === 0 && <li className="px-5 py-8 text-center text-sm text-slate-400">No inquiries yet.</li>}
              {recent.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-navy-800">{r.name}{r.company ? `, ${r.company}` : ''}</p>
                    <p className="truncate text-xs text-slate-400">{r.category || '—'} · {r.country || '—'} · {r.assignedUserName || 'Unassigned'}</p>
                  </div>
                  <StatusPill status={r.status} />
                </li>
              ))}
            </ul>
          </div>

          {/* Sits under Recent Inquiries rather than beside it: feedback is a stream to read, so
              it wants the same width as the inquiry list, not the narrow sidebar column. Mounted
              only when the role may read it (see FeedbackCard). */}
          {seesFeedback && <FeedbackCard />}
        </div>

        <div className="space-y-6">
          {quick.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-display text-base font-bold text-navy-900">Quick Actions</h2>
              <div className="mt-4 space-y-2">
                {quick.map((q) => {
                  const Icon = Icons[q.icon] || Icons.ArrowRight;
                  return (
                    <Link key={q.to} to={q.to} className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2.5 text-sm font-medium text-navy-700 transition-colors hover:border-primary/40 hover:bg-slate-50">
                      <Icon className="h-4 w-4 text-primary-darker" />
                      {q.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
          <SopCard />
        </div>
      </div>

      {/* Every catalogue, deck and logo file, downloadable by any role. */}
      <div className="mt-6">
        <ResourceLibrary />
      </div>
    </>
  );
}
