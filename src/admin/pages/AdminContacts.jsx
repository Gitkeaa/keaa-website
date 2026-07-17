import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import StatusSelect from '../components/StatusSelect';
import { useApi } from '../api/useApi';
import { api } from '../api/client';

const STATUS_OPTIONS = ['unread', 'read', 'replied'];

export default function AdminContacts() {
  const { data, loading, error, setData } = useApi('/api/contact');
  const rows = data || [];
  const [busyId, setBusyId] = useState(null);

  const changeStatus = async (id, status) => {
    setBusyId(id);
    try {
      await api.patch(`/api/contact/${id}/status`, { status });
      setData((cur) => (cur || []).map((m) => (m.id === id ? { ...m, status } : m)));
    } finally {
      setBusyId(null);
    }
  };

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
    {
      key: 'status',
      label: 'Status',
      render: (m) => (
        <StatusSelect value={m.status} options={STATUS_OPTIONS} busy={busyId === m.id} onChange={(s) => changeStatus(m.id, s)} />
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Contact Messages" subtitle="Enquiries submitted through the contact form." />
      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <DataTable columns={columns} rows={loading ? [] : rows} empty={loading ? 'Loading…' : 'No messages yet.'} />
    </>
  );
}
