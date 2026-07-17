import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import StatusSelect from '../components/StatusSelect';
import { useApi } from '../api/useApi';
import { api } from '../api/client';

const STATUS_OPTIONS = ['new', 'shortlisted', 'interview', 'rejected', 'hired'];

export default function AdminCareers() {
  const { data, loading, error, setData } = useApi('/api/careers');
  const rows = data || [];
  const [busyId, setBusyId] = useState(null);

  const changeStatus = async (id, status) => {
    setBusyId(id);
    try {
      await api.patch(`/api/careers/${id}/status`, { status });
      setData((cur) => (cur || []).map((a) => (a.id === id ? { ...a, status } : a)));
    } finally {
      setBusyId(null);
    }
  };

  const columns = [
    { key: 'name', label: 'Applicant', render: (a) => <span className="font-medium text-navy-900">{a.name}</span> },
    { key: 'position', label: 'Applied for', render: (a) => <span className="text-slate-700">{a.position}</span> },
    { key: 'experience', label: 'Experience', render: (a) => <span className="text-slate-500">{a.experience}</span> },
    { key: 'location', label: 'Location', render: (a) => <span className="text-slate-500">{a.location}</span> },
    { key: 'createdAt', label: 'Applied', render: (a) => <span className="text-slate-500">{(a.createdAt || '').slice(0, 10)}</span> },
    {
      key: 'status',
      label: 'Status',
      render: (a) => (
        <StatusSelect value={a.status} options={STATUS_OPTIONS} busy={busyId === a.id} onChange={(s) => changeStatus(a.id, s)} />
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Job Applications" subtitle="Applications received through the careers page." />
      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <DataTable columns={columns} rows={loading ? [] : rows} empty={loading ? 'Loading…' : 'No applications yet.'} />
    </>
  );
}
