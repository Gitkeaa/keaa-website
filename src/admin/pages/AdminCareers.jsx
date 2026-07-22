import { useMemo, useState } from 'react';
import { CheckCircle2, XCircle, FileDown, Files } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { useApi } from '../api/useApi';
import { useAdminAuth } from '../auth/AdminAuthContext';
import { ROLES } from '../auth/roles';
import { resolveUpload } from '../api/client';
import { mergeApplication, useAtsVersion, bulkStatus } from '../careers/careersStore';
import { downloadFile, resumeFilename } from '../careers/download';
import CareerStats from '../careers/CareerStats';
import CareerFilters from '../careers/CareerFilters';
import CareerTable from '../careers/CareerTable';
import CandidateProfile from '../careers/CandidateProfile';
import StatusChangeModal from '../careers/StatusChangeModal';

/**
 * Job Applications — an Applicant Tracking System over the live GET /api/careers list.
 *
 * The workflow (status pipeline, notes, interviews, offers, ratings, timeline) is held in a
 * browser overlay (src/admin/careers/careersStore.js) because the backend has no careers
 * write-endpoints yet; every action also fires the intended real API call, so persistence turns
 * real with no UI change once the backend ships the documented contract. HR / Super Admin manage;
 * Admin monitors read-only. The whole module is gated to those roles in auth/roles.js.
 */
const PAGE_SIZE = 12;

export default function AdminCareers() {
  const { role, user } = useAdminAuth();
  const canManage = role === ROLES.HR || role === ROLES.SUPER_ADMIN;
  const by = user?.name || 'HR';

  const { data, loading, error } = useApi('/api/careers');
  const version = useAtsVersion();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const apps = useMemo(() => (data || []).map(mergeApplication), [data, version]);

  const [filters, setFilters] = useState({ q: '', position: '', status: '', experience: '', date: '' });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const [openId, setOpenId] = useState(null);
  const [bulkReject, setBulkReject] = useState(false);

  const positions = useMemo(() => [...new Set(apps.map((a) => a.position).filter(Boolean))].sort(), [apps]);
  const experiences = useMemo(() => [...new Set(apps.map((a) => a.experience).filter(Boolean))], [apps]);

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return apps.filter((a) => {
      if (filters.status && a.status !== filters.status) return false;
      if (filters.position && a.position !== filters.position) return false;
      if (filters.experience && a.experience !== filters.experience) return false;
      if (filters.date && String(a.createdAt || '').slice(0, 10) < filters.date) return false;
      if (q && !`${a.name || ''} ${a.email || ''} ${a.phone || ''}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [apps, filters]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const openApp = apps.find((a) => a.id === openId) || null;

  const changeFilters = (updater) => { setFilters(updater); setPage(1); };
  const setStatusFilter = (key) => { setFilters((f) => ({ ...f, status: key || '' })); setPage(1); };

  const toggle = (id) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => setSelected((s) => {
    const ids = paged.map((r) => r.id);
    const allOn = ids.length > 0 && ids.every((i) => s.has(i));
    const n = new Set(s);
    ids.forEach((i) => (allOn ? n.delete(i) : n.add(i)));
    return n;
  });
  const clearSel = () => setSelected(new Set());

  const onAction = (kind, r) => {
    if (kind === 'resume') {
      if (r.resumeUrl) downloadFile(resolveUpload(r.resumeUrl), resumeFilename(r));
      else setOpenId(r.id); // no stored file: open the profile, which explains why
      return;
    }
    setOpenId(r.id); // schedule / notes / status all live inside the profile
  };

  const exportCsv = () => {
    const rows = apps.filter((a) => selected.has(a.id));
    if (!rows.length) return;
    const head = ['Name', 'Email', 'Phone', 'Position', 'Experience', 'Location', 'Status', 'Applied'];
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const body = rows.map((a) => [a.name, a.email, a.phone, a.position, a.experience, a.location, a.status, (a.createdAt || '').slice(0, 10)].map(esc).join(','));
    const url = URL.createObjectURL(new Blob([[head.join(','), ...body].join('\n')], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `applications-${rows.length}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const downloadResumes = () => {
    const withFiles = apps.filter((a) => selected.has(a.id) && a.resumeUrl);
    if (!withFiles.length) { window.alert('None of the selected applicants has a stored resume yet.'); return; }
    withFiles.forEach((a) => downloadFile(resolveUpload(a.resumeUrl), resumeFilename(a)));
  };

  return (
    <>
      <PageHeader title="Job Applications" subtitle="Applicant Tracking System, from application through to onboarding." />
      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <CareerStats apps={apps} active={filters.status || null} onPick={setStatusFilter} loading={loading && !data} />
      <CareerFilters filters={filters} setFilters={changeFilters} positions={positions} experiences={experiences} />

      {canManage && selected.size > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm">
          <span className="font-semibold text-navy-900">{selected.size} selected</span>
          <button type="button" onClick={() => { bulkStatus([...selected], 'shortlisted', { by }); clearSel(); }} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 font-semibold text-white hover:bg-emerald-700"><CheckCircle2 className="h-4 w-4" /> Shortlist</button>
          <button type="button" onClick={() => setBulkReject(true)} className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 font-semibold text-white hover:bg-red-700"><XCircle className="h-4 w-4" /> Reject</button>
          <button type="button" onClick={exportCsv} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-navy-700 hover:bg-slate-50"><FileDown className="h-4 w-4" /> Export CSV</button>
          <button type="button" onClick={downloadResumes} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-navy-700 hover:bg-slate-50"><Files className="h-4 w-4" /> Resumes</button>
          <button type="button" onClick={clearSel} className="ml-auto text-slate-500 hover:text-navy-800">Clear</button>
        </div>
      )}

      <CareerTable
        rows={paged}
        loading={loading && !data}
        selected={selected}
        onToggle={toggle}
        onToggleAll={toggleAll}
        onOpen={(r) => setOpenId(r.id)}
        canManage={canManage}
        onAction={onAction}
        page={safePage}
        pageCount={pageCount}
        onPage={(p) => setPage(Math.max(1, Math.min(pageCount, p)))}
        total={filtered.length}
      />

      <CandidateProfile app={openApp} open={Boolean(openApp)} onClose={() => setOpenId(null)} canManage={canManage} by={by} />

      {/* Bulk reject needs a reason, so it routes through the same mandatory-field modal. */}
      <StatusChangeModal
        open={bulkReject}
        target={bulkReject ? 'rejected' : null}
        onClose={() => setBulkReject(false)}
        onConfirm={(extra) => { bulkStatus([...selected], 'rejected', { by, extra, remark: extra.reason }); setBulkReject(false); clearSel(); }}
      />
    </>
  );
}
