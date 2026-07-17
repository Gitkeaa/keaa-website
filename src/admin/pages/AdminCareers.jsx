import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import StatusPill from '../components/StatusPill';
import { useApi } from '../api/useApi';

const columns = [
  { key: 'name', label: 'Applicant', render: (a) => <span className="font-medium text-navy-900">{a.name}</span> },
  { key: 'position', label: 'Applied for', render: (a) => <span className="text-slate-700">{a.position}</span> },
  { key: 'experience', label: 'Experience', render: (a) => <span className="text-slate-500">{a.experience}</span> },
  { key: 'location', label: 'Location', render: (a) => <span className="text-slate-500">{a.location}</span> },
  { key: 'createdAt', label: 'Applied', render: (a) => <span className="text-slate-500">{(a.createdAt || '').slice(0, 10)}</span> },
  { key: 'status', label: 'Status', render: (a) => <StatusPill status={a.status} /> },
];

export default function AdminCareers() {
  const { data, loading, error } = useApi('/api/careers');
  const rows = data || [];

  return (
    <>
      <PageHeader title="Job Applications" subtitle="Applications received through the careers page." />
      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}
      <DataTable columns={columns} rows={loading ? [] : rows} empty={loading ? 'Loading…' : 'No applications yet.'} />
    </>
  );
}
