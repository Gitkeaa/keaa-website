import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import StatusSelect from '../components/StatusSelect';
import { useApi } from '../api/useApi';
import { api } from '../api/client';

const STATUS_OPTIONS = ['new', 'in-review', 'quoted', 'closed'];

export default function AdminRFQ() {
  const { data, loading, error, setData } = useApi('/api/rfq');
  const rows = data || [];
  const [busyId, setBusyId] = useState(null);

  const changeStatus = async (id, status) => {
    setBusyId(id);
    try {
      await api.patch(`/api/rfq/${id}/status`, { status });
      setData((cur) => (cur || []).map((r) => (r.id === id ? { ...r, status } : r)));
    } finally {
      setBusyId(null);
    }
  };

  const columns = [
    { key: 'id', label: 'Ref', render: (r) => <span className="font-mono text-xs font-semibold text-navy-800">#{r.id}</span> },
    { key: 'name', label: 'Contact', render: (r) => <span className="font-medium text-navy-900">{r.name}</span> },
    { key: 'company', label: 'Company' },
    { key: 'country', label: 'Country', render: (r) => <span className="text-slate-500">{r.country}</span> },
    { key: 'category', label: 'Category', render: (r) => <span className="text-slate-600">{r.category}</span> },
    { key: 'createdAt', label: 'Received', render: (r) => <span className="text-slate-500">{(r.createdAt || '').slice(0, 10)}</span> },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <StatusSelect value={r.status} options={STATUS_OPTIONS} busy={busyId === r.id} onChange={(s) => changeStatus(r.id, s)} />
      ),
    },
  ];

  return (
    <>
      <PageHeader title="RFQ Requests" subtitle="Quotation requests submitted from the website." />
      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <DataTable columns={columns} rows={loading ? [] : rows} empty={loading ? 'Loading…' : 'No RFQ requests yet.'} />
    </>
  );
}
