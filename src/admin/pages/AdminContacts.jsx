import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import StatusPill from '../components/StatusPill';
import { useApi } from '../api/useApi';

const columns = [
  {
    key: 'name',
    label: 'From',
    render: (m) => (
      <div className="leading-tight">
        <span className="block font-medium text-navy-900">{m.name}</span>
        <span className="block text-xs text-slate-400">{m.email}</span>
      </div>
    ),
  },
  { key: 'subject', label: 'Subject', render: (m) => <span className="text-slate-700">{m.subject}</span> },
  { key: 'createdAt', label: 'Received', render: (m) => <span className="text-slate-500">{(m.createdAt || '').slice(0, 10)}</span> },
  { key: 'status', label: 'Status', render: (m) => <StatusPill status={m.status} /> },
];

export default function AdminContacts() {
  const { data, loading, error } = useApi('/api/contact');
  const rows = data || [];

  return (
    <>
      <PageHeader title="Contact Messages" subtitle="Enquiries submitted through the contact form." />
      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}
      <DataTable columns={columns} rows={loading ? [] : rows} empty={loading ? 'Loading…' : 'No messages yet.'} />
    </>
  );
}
