import { useState, useEffect } from 'react';
import { formatDateTime as fmt } from '../../lib/format';
import { Mail, Phone } from 'lucide-react';
import PageHeader from './PageHeader';
import DataTable from './DataTable';
import Modal from './Modal';
import { useApi } from '../api/useApi';
import { api } from '../api/client';
import { useAdminAuth } from '../auth/AdminAuthContext';
import { ROLES } from '../auth/roles';

/**
 * The shared inquiry workspace — the RFQ, Export and Contact screens all render this, and so
 * does the employee dashboard. The backend already scopes the list (a rep sees only their
 * assigned inquiries; a manager sees all), so the same component serves everyone. Selecting a
 * row opens the pipeline: move the status along, add remarks, and read the full activity
 * timeline. Marking Lost demands a reason; only the assignee or a manager may change anything.
 */
const STAGES = ['NEW', 'CONTACTED', 'QUOTATION_SENT', 'FOLLOW_UP', 'NEGOTIATION'];
const OUTCOMES = ['WON', 'LOST', 'CLOSED'];
const ALL_STATUS = [...STAGES, ...OUTCOMES];
const LABEL = {
  NEW: 'New', CONTACTED: 'Contacted', QUOTATION_SENT: 'Quotation Sent', FOLLOW_UP: 'Follow-up',
  NEGOTIATION: 'Negotiation', WON: 'Deal Won', LOST: 'Deal Lost', CLOSED: 'Closed',
};
const BADGE = {
  NEW: 'bg-blue-100 text-blue-700', CONTACTED: 'bg-indigo-100 text-indigo-700',
  QUOTATION_SENT: 'bg-amber-100 text-amber-700', FOLLOW_UP: 'bg-amber-100 text-amber-700',
  NEGOTIATION: 'bg-purple-100 text-purple-700', WON: 'bg-emerald-100 text-emerald-700',
  LOST: 'bg-red-100 text-red-700', CLOSED: 'bg-slate-100 text-slate-600',
};

function StatusBadge({ status }) {
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${BADGE[status] || BADGE.CLOSED}`}>{LABEL[status] || status}</span>;
}

export default function InquiryManager({ type, title, subtitle }) {
  const { role, user } = useAdminAuth();
  const isManager = role === ROLES.SUPER_ADMIN || role === ROLES.SENIOR_ADMIN || role === ROLES.ADMIN;
  const { data, loading, error, reload } = useApi(type ? `/api/inquiries?type=${type}` : '/api/inquiries');
  const rows = data || [];

  const [detail, setDetail] = useState(null);        // { inquiry, timeline }
  const [form, setForm] = useState({ status: '', remark: '', lostReason: '' });
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [reps, setReps] = useState([]);       // Business Development members, for the Admin assign picker
  const [assignTo, setAssignTo] = useState('');
  const canAssign = role === ROLES.ADMIN;      // only Admin assigns leads; Super/Senior are view-only

  useEffect(() => {
    if (!canAssign) return;
    api.get('/api/users')
      .then((us) => setReps((us || []).filter((u) => u.role === ROLES.BUSINESS_DEVELOPMENT && u.active)))
      .catch(() => {});
  }, [canAssign]);

  const open = async (id) => {
    setErr('');
    const d = await api.get(`/api/inquiries/${id}`);
    setDetail(d);
    setForm({ status: d.inquiry.status, remark: '', lostReason: '' });
    setNote('');
  };
  const close = () => setDetail(null);
  const refresh = async () => {
    if (detail) setDetail(await api.get(`/api/inquiries/${detail.inquiry.id}`));
    reload();
  };

  const updateStatus = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      await api.patch(`/api/inquiries/${detail.inquiry.id}/status`, { status: form.status, remark: form.remark, lostReason: form.lostReason });
      setForm((f) => ({ ...f, remark: '', lostReason: '' }));
      await refresh();
    } catch (e2) { setErr(e2.message || 'Could not update status.'); }
    finally { setBusy(false); }
  };
  const addRemark = async () => {
    if (!note.trim()) return;
    setBusy(true); setErr('');
    try { await api.post(`/api/inquiries/${detail.inquiry.id}/remark`, { remark: note }); setNote(''); await refresh(); }
    catch (e2) { setErr(e2.message || 'Could not add remark.'); }
    finally { setBusy(false); }
  };
  const assign = async () => {
    if (!assignTo) return;
    setBusy(true); setErr('');
    try { await api.patch(`/api/inquiries/${detail.inquiry.id}/assign`, { userId: Number(assignTo) }); setAssignTo(''); await refresh(); }
    catch (e2) { setErr(e2.message || 'Could not assign.'); }
    finally { setBusy(false); }
  };

  const columns = [
    { key: 'id', label: 'Ref', render: (r) => <span className="font-mono text-xs font-semibold text-navy-800">#{r.id}</span> },
    { key: 'name', label: 'Contact', render: (r) => <span><span className="block font-medium text-navy-900">{r.name}</span><span className="block text-xs text-slate-400">{r.company || r.email}</span></span> },
    ...(!type ? [{ key: 'type', label: 'Type', render: (r) => <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">{r.type}</span> }] : []),
    { key: 'country', label: 'Country', render: (r) => <span className="text-slate-600">{r.country || '—'}</span> },
    { key: 'category', label: 'Category', render: (r) => <span className="text-slate-600">{r.category || '—'}</span> },
    ...(isManager ? [{ key: 'assigned', label: 'Assigned to', render: (r) => r.assignedUserName ? <span className="text-slate-700">{r.assignedUserName}</span> : <span className="text-amber-600">Unassigned</span> }] : []),
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  const inq = detail?.inquiry;
  // Only the member the inquiry is assigned to may change it; managers (and anyone else) are view-only.
  const isAssignee = Boolean(inq && user && inq.assignedUserId === user.id);

  return (
    <>
      {(title || subtitle) && <PageHeader title={title} subtitle={subtitle} />}
      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <DataTable
        columns={columns}
        rows={loading ? [] : rows}
        onRowClick={(r) => open(r.id)}
        empty={loading ? 'Loading…' : 'No inquiries assigned yet'}
        emptyHint={loading ? undefined : 'New inquiries matching your assigned countries and product categories appear here automatically.'}
      />

      <Modal open={Boolean(detail)} onClose={close} title={inq ? `${inq.type} #${inq.id}` : ''} maxWidth="max-w-2xl">
        {inq && (
          <div className="max-h-[75vh] overflow-y-auto px-5 py-5">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-lg font-bold text-navy-900">{inq.name}{inq.company ? ` · ${inq.company}` : ''}</p>
                <p className="text-sm text-slate-500">{inq.email}{inq.phone ? ` · ${inq.phone}` : ''}</p>
                <ContactActions email={inq.email} phone={inq.phone} name={inq.name} />
              </div>
              <StatusBadge status={inq.status} />
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 border-y border-slate-100 py-4 text-sm sm:grid-cols-3">
              <div><dt className="text-xs text-slate-400">Country</dt><dd className="font-medium text-navy-800">{inq.country || '—'}</dd></div>
              <div><dt className="text-xs text-slate-400">Category</dt><dd className="font-medium text-navy-800">{inq.category || '—'}</dd></div>
              <div><dt className="text-xs text-slate-400">Assigned to</dt><dd className="font-medium text-navy-800">{inq.assignedUserName || <span className="text-amber-600">Unassigned</span>}</dd></div>
              <div><dt className="text-xs text-slate-400">Received</dt><dd className="font-medium text-navy-800">{fmt(inq.createdAt)}</dd></div>
              {inq.subject && <div className="col-span-2"><dt className="text-xs text-slate-400">Subject</dt><dd className="font-medium text-navy-800">{inq.subject}</dd></div>}
            </dl>
            {inq.message && <p className="mt-3 whitespace-pre-line rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{inq.message}</p>}

            {/* Pipeline */}
            <div className="mt-5 flex flex-wrap gap-1">
              {STAGES.map((s) => (
                <span key={s} className={`rounded px-2 py-1 text-[11px] font-semibold ${inq.status === s ? BADGE[s] : STAGES.indexOf(s) <= STAGES.indexOf(inq.status) ? 'bg-slate-100 text-slate-500' : 'bg-slate-50 text-slate-300'}`}>{LABEL[s]}</span>
              ))}
            </div>

            {/* Update status + remarks — only the assigned member can change anything. */}
            {isAssignee ? (
              <>
                <form onSubmit={updateStatus} className="mt-4 rounded-lg border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-navy-900">Update status</p>
                  <div className="mt-2 flex flex-wrap items-end gap-2">
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary">
                      {ALL_STATUS.map((s) => <option key={s} value={s}>{LABEL[s]}</option>)}
                    </select>
                    <button type="submit" disabled={busy} className="rounded-lg bg-primary-dark px-4 py-2 text-sm font-semibold text-white hover:bg-primary-darker disabled:opacity-60">
                      {busy ? 'Saving…' : 'Update'}
                    </button>
                  </div>
                  {form.status === 'LOST' && (
                    <input value={form.lostReason} onChange={(e) => setForm({ ...form, lostReason: e.target.value })} placeholder="Reason the deal was lost (required)"
                      className="mt-2 w-full rounded-lg border border-red-200 px-3 py-2 text-sm outline-none focus:border-red-400" />
                  )}
                  <input value={form.remark} onChange={(e) => setForm({ ...form, remark: e.target.value })} placeholder="Remarks (optional)"
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary" />
                  {err && <p role="alert" className="mt-2 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}
                </form>

                {/* Quick remark */}
                <div className="mt-3 flex items-center gap-2">
                  <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Record a discussion / note…" className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary" />
                  <button type="button" onClick={addRemark} disabled={busy || !note.trim()} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-navy-700 hover:bg-slate-50 disabled:opacity-60">Add note</button>
                </div>
              </>
            ) : (
              <>
                {canAssign && (
                  <div className="mt-4 rounded-lg border border-slate-200 p-4">
                    <p className="text-sm font-semibold text-navy-900">Assign to a Business Development member</p>
                    <div className="mt-2 flex flex-wrap items-end gap-2">
                      <select value={assignTo} onChange={(e) => setAssignTo(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary">
                        <option value="">{inq.assignedUserName ? `Reassign (now: ${inq.assignedUserName})` : 'Select a member'}</option>
                        {reps.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                      <button type="button" onClick={assign} disabled={busy || !assignTo} className="rounded-lg bg-primary-dark px-4 py-2 text-sm font-semibold text-white hover:bg-primary-darker disabled:opacity-60">
                        {busy ? 'Assigning…' : 'Assign'}
                      </button>
                    </div>
                    {err && <p role="alert" className="mt-2 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}
                  </div>
                )}
                <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  {canAssign
                    ? <>Status updates are made by the assigned member{inq.assignedUserName ? <> (<span className="font-semibold text-navy-800">{inq.assignedUserName}</span>)</> : ''}.</>
                    : <>View only. This inquiry is managed by <span className="font-semibold text-navy-800">{inq.assignedUserName || 'the assigned member'}</span>; only they can update its status.</>}
                </p>
              </>
            )}

            {/* Timeline */}
            <div className="mt-5">
              <p className="text-sm font-semibold text-navy-900">Activity timeline</p>
              <ol className="mt-3 space-y-3 border-l border-slate-200 pl-4">
                {(detail.timeline || []).map((a, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary-dark ring-4 ring-white" />
                    <p className="text-sm text-navy-800">
                      {a.action === 'STATUS_CHANGE' ? <>Moved {a.fromStatus ? `${LABEL[a.fromStatus] || a.fromStatus} → ` : ''}<strong>{LABEL[a.toStatus] || a.toStatus}</strong></>
                        : a.action === 'ASSIGNED' ? (a.remark || 'Assigned')
                        : a.action === 'CREATED' ? 'Inquiry received'
                        : (a.remark || 'Note')}
                    </p>
                    {a.remark && a.action !== 'ASSIGNED' && a.action !== 'CREATED' && <p className="text-xs text-slate-500">{a.remark}</p>}
                    <p className="text-xs text-slate-400">{fmt(a.at)} · {a.updatedBy || 'System'}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

/* Brand marks for the reach-out actions (lucide has no WhatsApp / Outlook glyph). */
function WhatsAppIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.47-2.4-1.48-.89-.8-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.6.13-.14.3-.35.44-.53.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.56-.35zM12.02 21.5h-.01c-1.68 0-3.33-.45-4.77-1.3l-.34-.2-3.55.93.95-3.46-.22-.36a9.4 9.4 0 01-1.44-5.02c0-5.2 4.24-9.44 9.46-9.44 2.53 0 4.9.99 6.68 2.78a9.36 9.36 0 012.76 6.67c-.01 5.2-4.24 9.45-9.46 9.45zM20.48 3.5A11.28 11.28 0 0012.02 0C5.75 0 .64 5.1.64 11.39c0 2 .53 3.96 1.53 5.69L.5 24l7.09-1.86a11.36 11.36 0 005.43 1.39h.01c6.27 0 11.38-5.11 11.38-11.4 0-3.04-1.19-5.9-3.34-8.03z"/>
    </svg>
  );
}
function OutlookIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="2.5" y="4.5" width="19" height="15" rx="3" fill="#0F6CBD" />
      <ellipse cx="11.6" cy="12" rx="3.9" ry="4.5" fill="none" stroke="#fff" strokeWidth="2.1" />
    </svg>
  );
}

/**
 * Reach-out shortcuts wired to the very details the lead arrived with: email opens the default
 * mail app, Outlook opens a web compose, WhatsApp / Call use the phone number. Each only shows
 * when the underlying value exists.
 */
function ContactActions({ email, phone }) {
  const digits = (phone || '').replace(/[^\d]/g, '');
  const items = [
    email && { key: 'mail', title: `Email ${email}`, href: `mailto:${email}`, external: false, cls: 'text-slate-600', icon: <Mail className="h-4 w-4" /> },
    email && { key: 'outlook', title: `Compose in Outlook`, href: `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(email)}`, external: true, cls: '', icon: <OutlookIcon className="h-4 w-4" /> },
    digits && { key: 'whatsapp', title: `WhatsApp ${phone}`, href: `https://wa.me/${digits}`, external: true, cls: 'text-[#25D366]', icon: <WhatsAppIcon className="h-4 w-4" /> },
    phone && { key: 'call', title: `Call ${phone}`, href: `tel:${phone}`, external: false, cls: 'text-slate-600', icon: <Phone className="h-4 w-4" /> },
  ].filter(Boolean);
  if (!items.length) return null;
  return (
    <div className="mt-2 flex items-center gap-1.5">
      {items.map((a) => (
        <a
          key={a.key}
          href={a.href}
          title={a.title}
          aria-label={a.title}
          {...(a.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className={`flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 transition-colors hover:border-slate-300 hover:bg-slate-50 ${a.cls}`}
        >
          {a.icon}
        </a>
      ))}
    </div>
  );
}
