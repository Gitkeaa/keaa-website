import { Check, X, Circle } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { useApi } from '../api/useApi';
import { ROLES, ROLE_LABELS, MODULES, moduleAccess } from '../auth/roles';

/**
 * Roles & Permissions — a read-only, at-a-glance map of the whole access model.
 *
 * It is not a separate data source: the matrix is rendered straight from MODULES in
 * auth/roles.js (the single source of truth the sidebar and route guard also read), and the
 * staff counts come from the existing /api/users list. So this screen can never drift from
 * what the app actually enforces. Editing permissions live (a DB-backed matrix) is a later
 * step; today the matrix is code, and this is the window onto it.
 *
 * SUPER_ADMIN only — the route guard (AdminLayout) enforces that; this page just displays.
 */
const ROLE_ORDER = Object.values(ROLES); // SUPER_ADMIN, ADMIN, SALES, MARKETING, HR, EMPLOYEE

export default function AdminRoles() {
  const { data: users, loading, error } = useApi('/api/users');
  const list = Array.isArray(users) ? users : [];

  const countByRole = ROLE_ORDER.reduce((acc, r) => {
    acc[r] = list.filter((u) => u.role === r).length;
    return acc;
  }, {});
  const activeCount = list.filter((u) => u.active).length;
  const liveModules = MODULES.filter((m) => m.implemented).length;

  return (
    <>
      <PageHeader
        title="Roles & Permissions"
        subtitle="Who can open — and change — each part of the console. This mirrors exactly what the backend enforces."
      />

      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Staff Accounts" value={loading ? '—' : list.length} icon="Users" tone="primary" />
        <StatCard label="Active" value={loading ? '—' : activeCount} icon="Activity" tone="emerald" />
        <StatCard label="Roles" value={ROLE_ORDER.length} icon="ShieldCheck" tone="navy" />
        <StatCard label="Live Modules" value={`${liveModules} / ${MODULES.length}`} icon="LayoutDashboard" tone="gold" />
      </div>

      {/* Permission matrix */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <h2 className="font-display text-base font-bold text-navy-900">Access Matrix</h2>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" /> Manage</span>
            <span className="inline-flex items-center gap-1.5"><span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">View</span> Read-only</span>
            <span className="inline-flex items-center gap-1.5"><X className="h-3.5 w-3.5 text-slate-300" /> No access</span>
          </div>
        </div>

        {/* Scrolls horizontally on narrow screens rather than breaking the layout. */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left">
                <th className="sticky left-0 z-10 bg-white px-5 py-3 font-semibold text-slate-500">Module</th>
                {ROLE_ORDER.map((r) => (
                  <th key={r} className="px-3 py-3 text-center font-semibold text-navy-800">{ROLE_LABELS[r]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODULES.map((m) => (
                <tr key={m.key} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                  <td className="sticky left-0 z-10 bg-white px-5 py-3">
                    <span className="flex items-center gap-2">
                      <Circle
                        className={`h-2 w-2 flex-shrink-0 ${m.implemented ? 'fill-emerald-500 text-emerald-500' : 'fill-slate-300 text-slate-300'}`}
                        aria-hidden
                      />
                      <span className="font-medium text-navy-800">{m.label}</span>
                      {!m.implemented && (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">soon</span>
                      )}
                    </span>
                  </td>
                  {ROLE_ORDER.map((r) => {
                    const access = moduleAccess(r, m.key);
                    return (
                      <td key={r} className="px-3 py-3 text-center">
                        {access === 'manage' && <Check className="mx-auto h-4 w-4 text-emerald-600" aria-label="Manage" />}
                        {access === 'view' && (
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">View</span>
                        )}
                        {access === null && <X className="mx-auto h-4 w-4 text-slate-200" aria-label="No access" />}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff grouped by role */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {ROLE_ORDER.map((r) => {
          const members = list.filter((u) => u.role === r);
          return (
            <div key={r} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-navy-900">{ROLE_LABELS[r]}</h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{countByRole[r]}</span>
              </div>
              <ul className="mt-3 space-y-2">
                {members.length === 0 && <li className="text-xs text-slate-400">No accounts.</li>}
                {members.map((u) => (
                  <li key={u.id} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-navy-800">{u.name}</p>
                      <p className="truncate text-xs text-slate-400">{u.email}</p>
                    </div>
                    {!u.active && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">inactive</span>}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </>
  );
}
