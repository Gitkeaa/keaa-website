import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Mail, Briefcase, Globe2, Bell, BellOff } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { useAdminAuth } from '../auth/AdminAuthContext';
import { moduleAccess } from '../auth/roles';
import { api } from '../api/client';

/**
 * Notifications — a recent-activity feed, assembled on the fly from the data the signed-in
 * role is actually allowed to see. There is no notifications table: Sales sees new RFQ +
 * enquiries, HR sees new applications, Marketing sees enquiries, and a role with no data
 * access (Employee) simply sees an empty, all-caught-up state. Because it reads the same
 * endpoints the module screens do, it can never show something the backend would deny.
 */

// Each source: the module key that gates it, its endpoint, and how to render one record.
const SOURCES = [
  {
    moduleKey: 'rfq', path: '/api/rfq', icon: FileText, tone: 'text-primary-darker bg-primary/10',
    to: '/admin/rfq', filter: (r) => r.type !== 'export',
    title: (r) => `New RFQ from ${r.name || 'a visitor'}`,
    subtitle: (r) => [r.company, r.country].filter(Boolean).join(' · '),
  },
  {
    moduleKey: 'rfq', path: '/api/rfq', icon: Globe2, tone: 'text-amber-700 bg-amber-100',
    to: '/admin/export-inquiries', filter: (r) => r.type === 'export',
    title: (r) => `Export inquiry from ${r.name || 'a visitor'}`,
    subtitle: (r) => [r.company, r.country].filter(Boolean).join(' · '),
  },
  {
    moduleKey: 'contacts', path: '/api/contact', icon: Mail, tone: 'text-emerald-700 bg-emerald-100',
    to: '/admin/contacts',
    title: (r) => `Message from ${r.name || 'a visitor'}`,
    subtitle: (r) => r.subject || r.email,
  },
  {
    moduleKey: 'applications', path: '/api/careers', icon: Briefcase, tone: 'text-navy-700 bg-navy-100',
    to: '/admin/careers',
    title: (r) => `Application: ${r.name || 'a candidate'}`,
    subtitle: (r) => [r.position, r.location].filter(Boolean).join(' · '),
  },
];

export default function AdminNotifications() {
  const { role } = useAdminAuth();
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!role) return;
    let alive = true;

    // Only hit the endpoints this role can read; de-duplicate the path so /api/rfq is
    // fetched once even though two sources derive from it.
    const active = SOURCES.filter((s) => moduleAccess(role, s.moduleKey));
    const paths = [...new Set(active.map((s) => s.path))];

    Promise.allSettled(paths.map((p) => api.get(p)))
      .then((results) => {
        if (!alive) return;
        const byPath = {};
        paths.forEach((p, i) => {
          byPath[p] = results[i].status === 'fulfilled' && Array.isArray(results[i].value) ? results[i].value : [];
        });
        const feed = [];
        active.forEach((s) => {
          (byPath[s.path] || [])
            .filter((r) => (s.filter ? s.filter(r) : true))
            .forEach((r) => {
              feed.push({
                key: `${s.to}-${r.id}`,
                icon: s.icon,
                tone: s.tone,
                to: s.to,
                title: s.title(r),
                subtitle: s.subtitle(r),
                time: r.createdAt || '',
                fresh: r.status === 'new' || r.status === 'unread',
              });
            });
        });
        feed.sort((a, b) => (b.time || '').localeCompare(a.time || ''));
        setItems(feed);
      })
      .catch(() => alive && setError('Could not load activity.'));

    return () => {
      alive = false;
    };
  }, [role]);

  const loading = items === null && !error;
  const freshCount = (items || []).filter((n) => n.fresh).length;

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="Recent activity across the areas you manage."
        actions={
          freshCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary-darker">
              <Bell className="h-3.5 w-3.5" /> {freshCount} new
            </span>
          ) : null
        }
      />

      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <ul className="divide-y divide-slate-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="flex items-center gap-4 px-5 py-4">
                <span className="h-9 w-9 animate-pulse rounded-lg bg-slate-100" />
                <span className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
              </li>
            ))}
          </ul>
        ) : (items || []).length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-5 py-16 text-center">
            <BellOff className="h-8 w-8 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">You’re all caught up</p>
            <p className="text-xs text-slate-400">New activity in your areas will show up here.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((n) => {
              const Icon = n.icon;
              return (
                <li key={n.key}>
                  <Link to={n.to} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50">
                    <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${n.tone}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-navy-900">
                        {n.title}
                        {n.fresh && <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-primary align-middle" aria-label="new" />}
                      </p>
                      {n.subtitle && <p className="truncate text-xs text-slate-400">{n.subtitle}</p>}
                    </div>
                    <span className="flex-shrink-0 text-xs text-slate-400">{(n.time || '').slice(0, 10)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
