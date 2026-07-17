import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import StatusPill from '../components/StatusPill';
import { contactMsgs } from '../data/mock';

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
  { key: 'date', label: 'Received', render: (m) => <span className="text-slate-500">{m.date}</span> },
  { key: 'status', label: 'Status', render: (m) => <StatusPill status={m.status} /> },
];

export default function AdminContacts() {
  return (
    <>
      <PageHeader title="Contact Messages" subtitle="Enquiries submitted through the contact form." />
      <DataTable columns={columns} rows={contactMsgs} empty="No messages yet." />
    </>
  );
}
