import { useMemo, useState } from 'react';
import {
  Pencil,
  Eye,
  Loader2,
  Check,
  History,
  RotateCcw,
  Search,
  Info,
  AlertTriangle,
  Link2,
} from 'lucide-react';
import DataTable from './DataTable';
import Modal from './Modal';
import { useApi } from '../api/useApi';
import { api } from '../api/client';
import { useAdminAuth } from '../auth/AdminAuthContext';
import { loadSops } from '../help/useSop';
import { FALLBACK_GUIDE_ROWS } from '../help/sopContent';
import { HELP_MODULES, moduleLabel, canEditDocs, canDoSopHelp } from '../auth/roles';

/**
 * SOP & Help Management — the single source of truth for all documentation, embedded as a tab
 * inside Roles & Responsibilities (so only the two top tiers, who can open that page, reach it).
 *
 * Every role SOP and module guide is listed, searchable and filterable by department. Editing a
 * guide opens the full editor (all eight sections plus related modules), lets you preview the
 * result before publishing, and PUTs it; the backend snapshots the version it replaces, and this
 * page then calls loadSops() so the dashboard SOP card and every open drawer refresh live. The
 * version history lists every revision, and the top tiers can restore a previous one.
 *
 * If the backend is not running or has not been seeded, it falls back to the built-in guides in
 * read-only mode, so the manager is never blank; a banner explains that editing needs the API.
 */
const linesToArr = (text) => text.split('\n').map((s) => s.trim()).filter(Boolean);
const arrToLines = (arr) => (arr || []).join('\n');
const fmt = (iso) =>
  iso
    ? new Date(iso).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '-';

const LIST_FIELDS = [
  { key: 'workflow', label: 'Workflow', hint: 'One stage per line, shown as a vertical timeline in the drawer.' },
  { key: 'responsibilities', label: 'Responsibilities', hint: 'One duty per line.' },
  { key: 'checklist', label: 'Checklist', hint: 'One action per line. The dashboard SOP card shows the first few.' },
  { key: 'bestPractices', label: 'Best Practices', hint: 'One practice per line.' },
  { key: 'important', label: 'Important Notes', hint: 'One rule per line, shown in a highlighted card.' },
  { key: 'quickTips', label: 'Quick Tips', hint: 'One tip per line.' },
];

const RELATED_OPTIONS = Array.from(HELP_MODULES);

export default function SopHelpManager() {
  const { role } = useAdminAuth();
  const canEdit = canEditDocs(role);
  const canRestore = canDoSopHelp(role, 'restore');

  const { data, loading, error, reload } = useApi('/api/sops');

  // Live rows when the API answers with content; otherwise the built-in guides, read-only.
  const apiRows = Array.isArray(data) ? data : [];
  const offline = apiRows.length === 0;
  const rows = offline ? FALLBACK_GUIDE_ROWS : apiRows;

  const [query, setQuery] = useState('');
  const [dept, setDept] = useState('all');

  const departments = useMemo(
    () => Array.from(new Set(rows.map((r) => r.department).filter(Boolean))).sort(),
    [rows],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (dept !== 'all' && r.department !== dept) return false;
      if (!q) return true;
      return (
        (r.title || '').toLowerCase().includes(q) ||
        (r.refKey || '').toLowerCase().includes(q) ||
        (r.purpose || '').toLowerCase().includes(q)
      );
    });
  }, [rows, query, dept]);

  const roleSops = filtered.filter((g) => g.scope === 'role');
  const pageGuides = filtered.filter((g) => g.scope === 'page');

  /* ---------------- editor state ---------------- */
  const [editing, setEditing] = useState(null); // the guide row being edited/viewed
  const [form, setForm] = useState(null);
  const [mode, setMode] = useState('edit'); // 'edit' | 'preview'
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [revisions, setRevisions] = useState([]);
  const [toast, setToast] = useState('');

  const readOnly = offline || !canEdit;

  const showToast = (m) => {
    setToast(m);
    setTimeout(() => setToast((x) => (x === m ? '' : x)), 2800);
  };

  const openGuide = async (g) => {
    setForm({
      title: g.title || '',
      department: g.department || '',
      purpose: g.purpose || '',
      workflow: arrToLines(g.workflow),
      responsibilities: arrToLines(g.responsibilities),
      checklist: arrToLines(g.checklist),
      bestPractices: arrToLines(g.bestPractices),
      important: arrToLines(g.important),
      quickTips: arrToLines(g.quickTips),
      related: (g.related || []).filter(Boolean),
      changeSummary: '',
    });
    setFormError('');
    setRevisions([]);
    setMode(readOnly ? 'preview' : 'edit');
    setEditing(g);
    if (!offline) {
      try {
        const rev = await api.get(`/api/sops/${g.id}/revisions`);
        setRevisions(Array.isArray(rev) ? rev : []);
      } catch {
        /* history is best-effort — never blocks editing */
      }
    }
  };

  const close = () => {
    setEditing(null);
    setForm(null);
  };

  const buildPayload = () => ({
    title: form.title.trim(),
    department: form.department.trim() || null,
    purpose: form.purpose.trim() || null,
    workflow: linesToArr(form.workflow),
    responsibilities: linesToArr(form.responsibilities),
    checklist: linesToArr(form.checklist),
    bestPractices: linesToArr(form.bestPractices),
    important: linesToArr(form.important),
    quickTips: linesToArr(form.quickTips),
    related: form.related,
    changeSummary: form.changeSummary.trim() || null,
  });

  const save = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setFormError('Title is required.');
      setMode('edit');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      await api.put(`/api/sops/${editing.id}`, buildPayload());
      close();
      reload();
      loadSops();
      showToast('Guide published. It is now live across the console.');
    } catch (err) {
      setFormError(err.message || 'Could not save. Only Super Admin and Senior Admin may edit guides.');
    } finally {
      setSaving(false);
    }
  };

  const restore = async (rev) => {
    if (!canRestore || offline) return;
    // Restore re-publishes the snapshot's content as the new current version; the backend
    // snapshots the version being replaced, so the restore itself is captured in history too.
    setSaving(true);
    try {
      await api.put(`/api/sops/${editing.id}`, {
        title: rev.title,
        department: rev.department ?? form.department.trim() ?? null,
        purpose: rev.purpose ?? null,
        workflow: rev.workflow || [],
        responsibilities: rev.responsibilities || [],
        checklist: rev.checklist || [],
        bestPractices: rev.bestPractices || [],
        important: rev.important || [],
        quickTips: rev.quickTips || [],
        related: rev.related || [],
        changeSummary: `Restored the version from ${fmt(rev.createdAt)}`,
      });
      close();
      reload();
      loadSops();
      showToast('Previous version restored and published.');
    } catch (err) {
      showToast(err.message || 'Restore failed.');
    } finally {
      setSaving(false);
    }
  };

  const toggleRelated = (key) =>
    setForm((f) => ({
      ...f,
      related: f.related.includes(key) ? f.related.filter((k) => k !== key) : [...f.related, key],
    }));

  const columns = [
    { key: 'title', label: 'Guide', render: (g) => <span className="font-medium text-navy-900">{g.title}</span> },
    {
      key: 'department',
      label: 'Department',
      render: (g) =>
        g.department ? (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{g.department}</span>
        ) : (
          <span className="text-slate-300">-</span>
        ),
    },
    { key: 'refKey', label: 'Applies to', render: (g) => <span className="text-slate-500">{g.refKey}</span> },
    {
      key: 'updatedAt',
      label: 'Last updated',
      render: (g) => (
        <span className="text-slate-500">
          {g.updatedAt ? fmt(g.updatedAt) : '-'}
          {g.updatedBy ? <span className="text-slate-400"> · {g.updatedBy}</span> : ''}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (g) => (
        <button
          type="button"
          onClick={() => openGuide(g)}
          aria-label={`${readOnly ? 'View' : 'Edit'} ${g.title}`}
          className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-navy-700"
        >
          {readOnly ? <Eye className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
        </button>
      ),
    },
  ];

  return (
    <>
      {error && !offline && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {offline && !loading && (
        <p className="mb-4 flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-navy-700">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-dark" />
          Showing the built-in documentation. Start the admin backend to edit guides, publish
          changes and keep version history.
        </p>
      )}

      {/* Toolbar: search + department filter */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documentation…"
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm text-navy-800 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={dept}
          onChange={(e) => setDept(e.target.value)}
          aria-label="Filter by department"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-navy-800 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <h3 className="mb-3 font-display text-base font-bold text-navy-900">Role SOPs</h3>
      <DataTable
        columns={columns}
        rows={loading ? [] : roleSops}
        empty={loading ? 'Loading…' : 'No role SOPs match your filter'}
      />

      <h3 className="mb-3 mt-8 font-display text-base font-bold text-navy-900">Module Help</h3>
      <DataTable
        columns={columns}
        rows={loading ? [] : pageGuides}
        empty={loading ? 'Loading…' : 'No module guides match your filter'}
      />

      {/* Editor / viewer modal */}
      <Modal
        open={Boolean(editing)}
        onClose={close}
        title={editing ? `${readOnly ? 'View' : 'Edit'}: ${editing.title}` : ''}
        maxWidth="max-w-2xl"
        footer={
          form && (
            <>
              <button
                type="button"
                onClick={close}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                {readOnly ? 'Close' : 'Cancel'}
              </button>
              {!readOnly && (
                <button
                  type="submit"
                  form="guide-form"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-primary-dark px-4 py-2 text-sm font-semibold text-white hover:bg-primary-darker disabled:opacity-60"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />} Publish changes
                </button>
              )}
            </>
          )
        }
      >
        {form && (
          <div className="space-y-4">
            {/* Edit / Preview toggle */}
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 text-sm">
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => setMode('edit')}
                  className={`rounded-md px-3 py-1 font-medium transition-colors ${
                    mode === 'edit' ? 'bg-primary-dark text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Edit
                </button>
              )}
              <button
                type="button"
                onClick={() => setMode('preview')}
                className={`rounded-md px-3 py-1 font-medium transition-colors ${
                  mode === 'preview' ? 'bg-primary-dark text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Preview
              </button>
            </div>

            {/* The form stays mounted in both modes so the footer "Publish changes" submit button
                (associated by form="guide-form") always has an owner — publishing straight from the
                Preview tab must work, not silently no-op. */}
            <form id="guide-form" onSubmit={save} className="space-y-4">
              {mode === 'preview' ? (
                <GuidePreview form={form} />
              ) : (
                <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="g-title" className="block text-sm font-medium text-navy-800">
                      Title <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="g-title"
                      type="text"
                      required
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label htmlFor="g-department" className="block text-sm font-medium text-navy-800">
                      Department
                    </label>
                    <input
                      id="g-department"
                      type="text"
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="g-purpose" className="block text-sm font-medium text-navy-800">
                    Purpose
                  </label>
                  <textarea
                    id="g-purpose"
                    rows={2}
                    value={form.purpose}
                    onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                    className={`${inputCls} resize-none`}
                  />
                </div>

                {LIST_FIELDS.map((f) => (
                  <ListField
                    key={f.key}
                    id={`g-${f.key}`}
                    label={f.label}
                    hint={f.hint}
                    value={form[f.key]}
                    onChange={(v) => setForm({ ...form, [f.key]: v })}
                  />
                ))}

                {/* Related modules */}
                <div>
                  <span className="block text-sm font-medium text-navy-800">Related Modules</span>
                  <p className="mb-2 mt-1 text-xs text-slate-400">
                    Shown as jump-to chips at the foot of the guide.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {RELATED_OPTIONS.filter((k) => k !== editing.refKey).map((key) => {
                      const on = form.related.includes(key);
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => toggleRelated(key)}
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                            on
                              ? 'border-primary/40 bg-primary/10 text-primary-darker'
                              : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          {on && <Check className="h-3.5 w-3.5" />}
                          {moduleLabel(key)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Change summary */}
                <div>
                  <label htmlFor="g-summary" className="block text-sm font-medium text-navy-800">
                    Change summary
                  </label>
                  <input
                    id="g-summary"
                    type="text"
                    value={form.changeSummary}
                    onChange={(e) => setForm({ ...form, changeSummary: e.target.value })}
                    placeholder="What changed and why (saved to the version history)"
                    className={inputCls}
                  />
                </div>

                {formError && (
                  <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                    {formError}
                  </p>
                )}
                </>
              )}
            </form>

            {/* Version history */}
            {revisions.length > 0 && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <History className="h-3.5 w-3.5" /> Version history
                </p>
                <ul className="mt-2 space-y-2">
                  {revisions.map((r) => (
                    <li key={r.id} className="flex items-start justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <p className="text-slate-600">
                          {fmt(r.createdAt)} · {r.editedBy || 'System'}
                        </p>
                        {r.changeSummary && <p className="truncate text-slate-400">{r.changeSummary}</p>}
                      </div>
                      {canRestore && !offline && (
                        <button
                          type="button"
                          onClick={() => restore(r)}
                          disabled={saving}
                          className="inline-flex flex-shrink-0 items-center gap-1 rounded px-1.5 py-1 font-medium text-primary-darker transition-colors hover:bg-primary/10 disabled:opacity-60"
                        >
                          <RotateCcw className="h-3.5 w-3.5" /> Restore
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-[60] flex items-center gap-2 rounded-lg bg-primary-dark px-4 py-3 text-sm font-semibold text-white shadow-lg"
        >
          <Check className="h-4 w-4 flex-shrink-0" />
          {toast}
        </div>
      )}
    </>
  );
}

/* ---------------- editor sub-parts ---------------- */

function ListField({ id, label, hint, value, onChange }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-navy-800">
        {label}
      </label>
      <textarea
        id={id}
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} resize-none font-mono text-xs`}
      />
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
    </div>
  );
}

/** A compact rendering of the guide from the current form state, so an editor can see how it
 *  will read before publishing. Mirrors the drawer's section order and brand styling. */
function GuidePreview({ form }) {
  const lists = {
    workflow: linesToArr(form.workflow),
    responsibilities: linesToArr(form.responsibilities),
    checklist: linesToArr(form.checklist),
    bestPractices: linesToArr(form.bestPractices),
    important: linesToArr(form.important),
    quickTips: linesToArr(form.quickTips),
  };

  return (
    <div className="max-h-[60vh] space-y-4 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-5">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary-darker">Guide</span>
          {form.department && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {form.department}
            </span>
          )}
        </div>
        <h4 className="mt-1 font-display text-lg font-bold text-navy-900">{form.title || 'Untitled guide'}</h4>
      </div>

      {form.purpose && <p className="text-sm font-medium leading-relaxed text-navy-800">{form.purpose}</p>}

      {lists.workflow.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <PreviewHeading>Workflow</PreviewHeading>
          <ol className="relative mt-3">
            {lists.workflow.map((stage, i) => (
              <li key={`${i}-${stage}`} className="relative flex gap-3 pb-4 last:pb-0">
                {i < lists.workflow.length - 1 && (
                  <span aria-hidden className="absolute left-[11px] top-6 h-[calc(100%-1.5rem)] w-px bg-slate-200" />
                )}
                <span className="relative z-10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary-darker ring-1 ring-primary/30">
                  {i + 1}
                </span>
                <span className="pt-0.5 text-sm font-medium text-navy-800">{stage}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {[
        ['responsibilities', 'Responsibilities'],
        ['checklist', 'Checklist'],
        ['bestPractices', 'Best Practices'],
      ].map(
        ([key, label]) =>
          lists[key].length > 0 && (
            <div key={key} className="rounded-lg border border-slate-200 bg-white p-4">
              <PreviewHeading>{label}</PreviewHeading>
              <ul className="mt-2.5 space-y-2">
                {lists[key].map((item, i) => (
                  <li key={`${key}-${i}-${item}`} className="flex gap-2.5 text-sm text-navy-800">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-dark" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ),
      )}

      {lists.important.length > 0 && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h5 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary-darker">
            <AlertTriangle className="h-3.5 w-3.5 text-primary-dark" /> Important Notes
          </h5>
          <ul className="mt-2.5 space-y-2">
            {lists.important.map((item, i) => (
              <li key={`imp-${i}-${item}`} className="flex gap-2 text-sm text-navy-800">
                <span aria-hidden className="text-primary-dark">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {lists.quickTips.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white/60 p-4">
          <PreviewHeading>Quick Tips</PreviewHeading>
          <ul className="mt-2.5 space-y-2">
            {lists.quickTips.map((item, i) => (
              <li key={`tip-${i}-${item}`} className="flex gap-2.5 text-sm text-navy-800">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-dark" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {form.related.length > 0 && (
        <div className="border-t border-slate-200 pt-4">
          <PreviewHeading>Related Modules</PreviewHeading>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {form.related.map((key) => (
              <span
                key={key}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-navy-700"
              >
                <Link2 className="h-3.5 w-3.5 text-slate-400" />
                {moduleLabel(key)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PreviewHeading({ children }) {
  return (
    <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{children}</h5>
  );
}

const inputCls =
  'mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-navy-800 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20';
