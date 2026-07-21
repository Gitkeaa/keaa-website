import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import StatusSelect from '../components/StatusSelect';
import { useApi } from '../api/useApi';
import { api } from '../api/client';

/**
 * Export Inquiries — the export-tab submissions from the public RFQ form.
 *
 * It is not a separate table: the public form writes both quote and export requests to
 * /api/rfq, tagged with `type`. This screen reads that one endpoint and shows only the
 * export ones, and status changes go back through the SAME /api/rfq/{id}/status route — so
 * the Export desk and the RFQ desk stay one dataset, just two filtered views of it.
 */
const STATUS_OPTIONS = ['new', 'in-review', 'quoted', 'closed'];

export default function AdminExportInquiries() {
  const { data, loading, error, setData } = useApi('/api/rfq');
  const rows = (data || []).filter((r) => r.type === 'export');
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
    { key: 'country', label: 'Destination', render: (r) => <span className="text-slate-500">{r.country}</span> },
    { key: 'category', label: 'Product Line', render: (r) => <span className="text-slate-600">{r.category}</span> },
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
      <PageHeader title="Export Inquiries" subtitle="International / export enquiries submitted from the website’s Export tab." />
      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <DataTable
        columns={columns}
        rows={loading ? [] : rows}
        empty={loading ? 'Loading…' : 'No export inquiries yet.'}
      />
    </>
  );
}
