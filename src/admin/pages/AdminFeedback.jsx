import { useMemo, useState } from 'react';
import { formatDateTime as fmt } from '../../lib/format';
import { Search, Star, Loader2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import StatusPill from '../components/StatusPill';
import { useApi } from '../api/useApi';
import { api } from '../api/client';
import { useAdminAuth } from '../auth/AdminAuthContext';
import { moduleAccess } from '../auth/roles';

/**
 * Site Feedback — what the public feedback drawer (components/FeedbackWidget.jsx) collects.
 *
 * Deliberately NOT rendered through InquiryManager, unlike RFQ / Contact / Export / Catalogue.
 * Those are all one entity (Inquiry) and share the sales pipeline: territory assignment, a
 * WON/LOST workflow, an activity trail. Feedback is a different thing — usually anonymous, rated
 * rather than qualified, and mostly never replied to — so it has its own table, its own light
 * status set, and this screen. See BACKEND_FEEDBACK.md for the full reasoning.
 *
 * Super Admin and Senior Admin are view-only here (roles.js), matching Contact Messages: the
 * top tiers observe the stream, Admin and Business Development triage it.
 */
const PAGE_SIZE = 15;

const STATUSES = ['new', 'reviewed', 'actioned', 'closed'];
const STATUS_TONE = { new: 'blue', reviewed: 'amber', actioned: 'green', closed: 'slate' };

const TYPE_LABELS = {
  suggestion: 'Suggestion',
  feedback: 'Feedback',
  issue: 'Issue',
  compliment: 'Compliment',
};
/* Issues are the ones that cost the business something, so they carry the only warm colour on
   the screen. Everything else stays quiet. */
const TYPE_TONE = {
  issue: 'bg-red-50 text-red-700 ring-red-600/20',
  compliment: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  suggestion: 'bg-primary/10 text-primary-darker ring-primary/25',
  feedback: 'bg-slate-100 text-slate-600 ring-slate-500/20',
};

function Stars({ value, className = 'h-3.5 w-3.5' }) {
  return (
    <span className="inline-flex items-center gap-0.5" title={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          aria-hidden
          className={`${className} ${
            n <= value ? 'fill-primary-dark text-primary-dark' : 'fill-transparent text-slate-300'
          }`}
        />
      ))}
      <span className="sr-only">{value} out of 5</span>
    </span>
  );
}

export default function AdminFeedback() {
  const { role } = useAdminAuth();
  const canManage = moduleAccess(role, 'feedback') === 'manage';
  const { data, loading, error, setData } = useApi('/api/feedback');
  const all = useMemo(() => data || [], [data]);

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast((m) => (m === msg ? '' : m)), 2500);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((f) => {
      if (status !== 'all' && (f.status || 'new') !== status) return false;
      if (type !== 'all' && (f.type || 'feedback') !== type) return false;
      if (!q) return true;
      return [f.message, f.name, f.email, f.pageUrl].some((v) => (v || '').toLowerCase().includes(q));
    });
  }, [all, query, status, type]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const newCount = all.filter((f) => (f.status || 'new') === 'new').length;
  const avg = all.length
    ? Math.round((all.reduce((sum, f) => sum + (f.rating || 0), 0) / all.length) * 10) / 10
    : null;

  const changeStatus = async (id, next) => {
    setSaving(true);
    try {
      const updated = await api.patch(`/api/feedback/${id}/status`, { status: next });
      setData((cur) => (cur || []).map((f) => (f.id === id ? updated : f)));
      setDetail((d) => (d && d.id === id ? updated : d));
      showToast(`Marked as ${next}.`);
    } catch (err) {
      showToast(err.message || 'Could not update the status.');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'rating', label: 'Rating', render: (f) => <Stars value={f.rating || 0} /> },
    {
      key: 'type',
      label: 'Type',
      render: (f) => (
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
            TYPE_TONE[f.type] || TYPE_TONE.feedback
          }`}
        >
          {TYPE_LABELS[f.type] || f.type}
        </span>
      ),
    },
    {
      key: 'message',
      label: 'Message',
      className: 'max-w-md',
      render: (f) => <span className="line-clamp-2 text-slate-700">{f.message}</span>,
    },
    {
      key: 'from',
      label: 'From',
      render: (f) =>
        f.name || f.email ? (
          <div className="min-w-0">
            <p className="truncate font-medium text-navy-800">{f.name || '—'}</p>
            <p className="truncate text-xs text-slate-400">{f.email || 'No email'}</p>
          </div>
        ) : (
          <span className="text-slate-400">Anonymous</span>
        ),
    },
    {
      key: 'pageUrl',
      label: 'Page',
      render: (f) => <span className="font-mono text-xs text-slate-500">{f.pageUrl || '—'}</span>,
    },
    { key: 'createdAt', label: 'Received', render: (f) => <span className="whitespace-nowrap text-xs text-slate-500">{fmt(f.createdAt)}</span> },
    {
      key: 'status',
      label: 'Status',
      render: (f) => <StatusPill status={f.status || 'new'} tone={STATUS_TONE[f.status || 'new']} />,
    },
  ];

  return (
    <>
      <PageHeader
        title="Site Feedback"
        subtitle={
          all.length
            ? `${all.length} submitted, ${newCount} not yet reviewed. Average rating ${avg} out of 5.`
            : 'Ratings and comments left through the feedback panel on the public website.'
        }
      />

      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search message, name, email, page…"
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary"
          />
        </div>

        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          aria-label="Filter by status"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm capitalize outline-none transition-colors focus:border-primary"
        >
          <option value="all">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <select
          value={type}
          onChange={(e) => { setType(e.target.value); setPage(1); }}
          aria-label="Filter by type"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
        >
          <option value="all">All types</option>
          {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {loading && !data ? (
        <div className="flex h-40 items-center justify-center rounded-xl border border-slate-200 bg-white">
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          onRowClick={setDetail}
          empty={all.length ? 'No feedback matches these filters.' : 'No feedback yet.'}
          emptyHint={
            all.length
              ? 'Clear the search or switch the filters back to "All".'
              : 'Visitors leave this through the Feedback tab on the right edge of the public website. Submissions appear here immediately.'
          }
        />
      )}

      {pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-slate-500">
            Showing {(current - 1) * PAGE_SIZE + 1} to {Math.min(current * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setPage(current - 1)} disabled={current === 1} className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-navy-700 transition-colors hover:bg-slate-50 disabled:opacity-40">Previous</button>
            <span className="text-slate-500">Page {current} of {pages}</span>
            <button type="button" onClick={() => setPage(current + 1)} disabled={current === pages} className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-navy-700 transition-colors hover:bg-slate-50 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}

      <Modal open={Boolean(detail)} onClose={() => setDetail(null)} title="Feedback" maxWidth="max-w-xl">
        {detail && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <Stars value={detail.rating || 0} className="h-5 w-5" />
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${TYPE_TONE[detail.type] || TYPE_TONE.feedback}`}>
                {TYPE_LABELS[detail.type] || detail.type}
              </span>
              <StatusPill status={detail.status || 'new'} tone={STATUS_TONE[detail.status || 'new']} />
            </div>

            <p className="whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
              {detail.message}
            </p>

            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">From</dt>
                <dd className="mt-0.5 text-navy-800">{detail.name || <span className="text-slate-400">Anonymous</span>}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Email</dt>
                <dd className="mt-0.5 break-all text-navy-800">
                  {detail.email ? <a href={`mailto:${detail.email}`} className="text-primary-darker hover:underline">{detail.email}</a> : <span className="text-slate-400">Not given</span>}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Sent from page</dt>
                <dd className="mt-0.5 font-mono text-xs text-navy-800">{detail.pageUrl || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Received</dt>
                <dd className="mt-0.5 text-navy-800">{fmt(detail.createdAt)}</dd>
              </div>
            </dl>

            {/* Not decoration. The privacy policy tells visitors their address is used ONLY to
                reply to this feedback, so replying to someone who did not ask to be contacted is
                a breach of what they were told, not merely poor manners. */}
            {detail.contactConsent ? (
              <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800 ring-1 ring-inset ring-emerald-600/20">
                <strong className="font-semibold">A reply was invited.</strong> This person asked to be
                contacted about this feedback.
              </p>
            ) : (
              <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-inset ring-amber-600/20">
                <strong className="font-semibold">Do not contact.</strong> This person did not ask to be
                contacted{detail.email ? ', even though they left an address' : ''}. Our privacy policy
                commits us to using it only for a reply they asked for.
              </p>
            )}

            {canManage && (
              <div className="border-t border-slate-200 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Move to</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={saving || (detail.status || 'new') === s}
                      onClick={() => changeStatus(detail.id, s)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium capitalize text-navy-700 transition-colors hover:border-primary/40 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
}
