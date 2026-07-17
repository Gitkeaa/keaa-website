import { UserPlus } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import StatusPill from '../components/StatusPill';
import { useApi } from '../api/useApi';
import { ROLE_LABELS } from '../auth/roles';

const columns = [
  {
    key: 'name',
    label: 'Name',
    render: (u) => (
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-navy-100 text-xs font-bold uppercase text-navy-700">
          {(u.name || '?').charAt(0)}
        </span>
        <span className="font-medium text-navy-900">{u.name}</span>
      </div>
    ),
  },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role', render: (u) => <span className="text-slate-600">{ROLE_LABELS[u.role] || u.role}</span> },
  { key: 'active', label: 'Status', render: (u) => <StatusPill status={u.active ? 'active' : 'inactive'} /> },
  {
    key: 'lastActive',
    label: 'Last active',
    render: (u) => <span className="text-slate-500">{u.lastActive ? u.lastActive.slice(0, 10) : '—'}</span>,
  },
];

export default function AdminUsers() {
  const { data, loading, error } = useApi('/api/users');
  const rows = data || [];

  return (
    <>
      <PageHeader
        title="User Management"
        subtitle="Team members with access to the admin console."
        actions={
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg bg-primary-dark px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-darker"
          >
            <UserPlus className="h-4 w-4" /> Add User
          </button>
        }
      />
      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <DataTable columns={columns} rows={loading ? [] : rows} empty={loading ? 'Loading…' : 'No users yet.'} />
    </>
  );
}
