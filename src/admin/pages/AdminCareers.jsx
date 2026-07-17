import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import StatusPill from '../components/StatusPill';
import { applications } from '../data/mock';

const columns = [
  { key: 'name', label: 'Applicant', render: (a) => <span className="font-medium text-navy-900">{a.name}</span> },
  { key: 'role', label: 'Applied for', render: (a) => <span className="text-slate-700">{a.role}</span> },
  { key: 'experience', label: 'Experience', render: (a) => <span className="text-slate-500">{a.experience}</span> },
  { key: 'location', label: 'Location', render: (a) => <span className="text-slate-500">{a.location}</span> },
  { key: 'date', label: 'Applied', render: (a) => <span className="text-slate-500">{a.date}</span> },
  { key: 'status', label: 'Status', render: (a) => <StatusPill status={a.status} /> },
];

export default function AdminCareers() {
  return (
    <>
      <PageHeader title="Job Applications" subtitle="Applications received through the careers page." />
      <DataTable columns={columns} rows={applications} empty="No applications yet." />
    </>
  );
}
