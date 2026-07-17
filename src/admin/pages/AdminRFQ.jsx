import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import StatusPill from '../components/StatusPill';
import { rfqRequests } from '../data/mock';

const columns = [
  { key: 'id', label: 'Reference', render: (r) => <span className="font-mono text-xs font-semibold text-navy-800">{r.id}</span> },
  { key: 'name', label: 'Contact', render: (r) => <span className="font-medium text-navy-900">{r.name}</span> },
  { key: 'company', label: 'Company' },
  { key: 'country', label: 'Country', render: (r) => <span className="text-slate-500">{r.country}</span> },
  { key: 'category', label: 'Category', render: (r) => <span className="text-slate-600">{r.category}</span> },
  { key: 'date', label: 'Received', render: (r) => <span className="text-slate-500">{r.date}</span> },
  { key: 'status', label: 'Status', render: (r) => <StatusPill status={r.status} /> },
];

export default function AdminRFQ() {
  return (
    <>
      <PageHeader title="RFQ Requests" subtitle="Quotation requests submitted from the website." />
      <DataTable columns={columns} rows={rfqRequests} empty="No RFQ requests yet." />
    </>
  );
}
