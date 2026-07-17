import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import StatusPill from '../components/StatusPill';
import { useApi } from '../api/useApi';

const columns = [
  { key: 'id', label: 'Ref', render: (r) => <span className="font-mono text-xs font-semibold text-navy-800">#{r.id}</span> },
  { key: 'name', label: 'Contact', render: (r) => <span className="font-medium text-navy-900">{r.name}</span> },
  { key: 'company', label: 'Company' },
  { key: 'country', label: 'Country', render: (r) => <span className="text-slate-500">{r.country}</span> },
  { key: 'category', label: 'Category', render: (r) => <span className="text-slate-600">{r.category}</span> },
  { key: 'createdAt', label: 'Received', render: (r) => <span className="text-slate-500">{(r.createdAt || '').slice(0, 10)}</span> },
  { key: 'status', label: 'Status', render: (r) => <StatusPill status={r.status} /> },
];

export default function AdminRFQ() {
  const { data, loading, error } = useApi('/api/rfq');
  const rows = data || [];

  return (
    <>
      <PageHeader title="RFQ Requests" subtitle="Quotation requests submitted from the website." />
      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}
      <DataTable columns={columns} rows={loading ? [] : rows} empty={loading ? 'Loading…' : 'No RFQ requests yet.'} />
    </>
  );
}
