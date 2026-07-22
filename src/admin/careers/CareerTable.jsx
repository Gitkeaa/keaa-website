import { useState } from 'react';
import { FileText, MoreVertical, Eye, CalendarClock, StickyNote, ArrowRightLeft, Download } from 'lucide-react';
import { initials, fmtDate, fmtDateTime } from './atsConfig';
import StatusBadge from './StatusBadge';

/**
 * The applicant table: sticky header, select-all / row checkboxes (manage roles only), avatar +
 * name + email, position, experience, location, resume marker, applied + last-updated dates, a
 * status badge, and a per-row Actions menu. Rows open the candidate profile on click. Loading,
 * empty and paginated states included.
 */
export default function CareerTable({ rows, loading, selected, onToggle, onToggleAll, onOpen, canManage, onAction, page, pageCount, onPage, total }) {
  const cols = canManage ? 10 : 9;
  const allOn = rows.length > 0 && rows.every((r) => selected.has(r.id));

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="max-h-[65vh] overflow-auto">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur">
            <tr className="border-b border-slate-200 text-slate-600">
              {canManage && <th className="w-10 px-3 py-3"><input type="checkbox" checked={allOn} onChange={onToggleAll} aria-label="Select all on this page" className="h-4 w-4 rounded border-slate-300" /></th>}
              <th className="px-4 py-3 font-semibold">Candidate</th>
              <th className="px-4 py-3 font-semibold">Applied Position</th>
              <th className="px-4 py-3 font-semibold">Experience</th>
              <th className="px-4 py-3 font-semibold">Location</th>
              <th className="px-4 py-3 font-semibold">Resume</th>
              <th className="px-4 py-3 font-semibold">Applied</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Last Updated</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}><td colSpan={cols} className="px-4 py-4"><div className="h-6 animate-pulse rounded bg-slate-100" /></td></tr>
              ))
            ) : rows.length === 0 ? (
              <tr><td colSpan={cols} className="px-4 py-16 text-center text-slate-400">No applications match your filters.</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-slate-50/60">
                  {canManage && (
                    <td className="px-3 py-3">
                      <input type="checkbox" checked={selected.has(r.id)} onChange={() => onToggle(r.id)} onClick={(e) => e.stopPropagation()} aria-label={`Select ${r.name}`} className="h-4 w-4 rounded border-slate-300" />
                    </td>
                  )}
                  <td className="cursor-pointer px-4 py-3" onClick={() => onOpen(r)}>
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary-darker">{initials(r.name)}</span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-navy-900">{r.name || 'Unnamed'}</p>
                        <p className="truncate text-xs text-slate-400">{r.email || 'no email on file'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="cursor-pointer px-4 py-3 text-slate-700" onClick={() => onOpen(r)}>{r.position || '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{r.experience || '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{r.location || '—'}</td>
                  <td className="px-4 py-3">{r.resumeUrl ? <FileText className="h-4 w-4 text-primary-dark" /> : <span className="text-xs text-slate-300">—</span>}</td>
                  <td className="px-4 py-3 text-slate-500">{fmtDate(r.createdAt)}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3 text-xs text-slate-400">{fmtDateTime(r.lastUpdated) || '—'}</td>
                  <td className="px-4 py-3 text-right"><RowMenu r={r} canManage={canManage} onOpen={onOpen} onAction={onAction} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm">
          <span className="text-slate-500">{total} applications</span>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => onPage(page - 1)} disabled={page <= 1} className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40">Prev</button>
            <span className="px-2 text-slate-500">Page {page} of {pageCount}</span>
            <button type="button" onClick={() => onPage(page + 1)} disabled={page >= pageCount} className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

function RowMenu({ r, canManage, onOpen, onAction }) {
  const [open, setOpen] = useState(false);
  const item = 'flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-navy-700 hover:bg-slate-50';
  const pick = (fn) => (e) => { e.stopPropagation(); setOpen(false); fn(); };
  return (
    <div className="relative inline-block text-left">
      <button type="button" onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Actions" aria-haspopup="menu" aria-expanded={open}>
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={(e) => { e.stopPropagation(); setOpen(false); }} />
          <div className="absolute right-0 z-30 mt-1 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg" role="menu">
            <button type="button" className={item} onClick={pick(() => onOpen(r))}><Eye className="h-4 w-4" /> View Profile</button>
            <button type="button" className={item} onClick={pick(() => onAction('resume', r))}><Download className="h-4 w-4" /> Download Resume</button>
            {canManage && <button type="button" className={item} onClick={pick(() => onAction('schedule', r))}><CalendarClock className="h-4 w-4" /> Schedule Interview</button>}
            {canManage && <button type="button" className={item} onClick={pick(() => onAction('notes', r))}><StickyNote className="h-4 w-4" /> Add Notes</button>}
            {canManage && <button type="button" className={item} onClick={pick(() => onAction('status', r))}><ArrowRightLeft className="h-4 w-4" /> Change Status</button>}
          </div>
        </>
      )}
    </div>
  );
}
