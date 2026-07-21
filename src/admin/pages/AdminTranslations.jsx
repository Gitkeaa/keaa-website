import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { useApi } from '../api/useApi';
import { api } from '../api/client';
import { languages } from '../../i18n/languages';

/**
 * Languages / Translations — manage locale-string overrides (/api/translations).
 *
 * The site's base strings live in code and are English today; each row here is an override
 * for one key in one language. Editing them stores the translation server-side so it can
 * change without a deploy — merging these into the site's locale lookup is the follow-up.
 * (Languages are shown by name/code, not the flag emoji, which renders as bare letters on
 * Chrome/Windows.)
 */
const LANG_OPTIONS = languages.map((l) => ({ code: l.code, label: `${l.label} (${l.code})` }));
const langLabel = (code) => languages.find((l) => l.code === code)?.label || code;
const EMPTY = { transKey: '', langCode: LANG_OPTIONS[0]?.code || 'en', value: '' };

export default function AdminTranslations() {
  const { data, loading, error, setData } = useApi('/api/translations');
  const rows = data || [];

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const openNew = () => { setEditing(EMPTY); setForm(EMPTY); setFormError(''); };
  const openEdit = (t) => { setEditing(t); setForm({ ...EMPTY, ...t }); setFormError(''); };
  const close = () => setEditing(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const payload = { transKey: form.transKey.trim(), langCode: form.langCode, value: form.value };
      if (editing && editing.id) {
        const updated = await api.put(`/api/translations/${editing.id}`, payload);
        setData((cur) => (cur || []).map((t) => (t.id === updated.id ? updated : t)));
      } else {
        const created = await api.post('/api/translations', payload);
        setData((cur) => [...(cur || []), created]);
      }
      close();
    } catch (err) {
      setFormError(err.message || 'Could not save the translation.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    const id = deleteTarget.id;
    setDeleteTarget(null);
    await api.del(`/api/translations/${id}`);
    setData((cur) => (cur || []).filter((t) => t.id !== id));
  };

  const columns = [
    { key: 'transKey', label: 'Key', render: (t) => <span className="font-mono text-xs font-semibold text-navy-800">{t.transKey}</span> },
    { key: 'langCode', label: 'Language', render: (t) => <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary-darker">{langLabel(t.langCode)}</span> },
    { key: 'value', label: 'Value', render: (t) => <span className="text-slate-600">{t.value}</span> },
    {
      key: 'actions', label: '', align: 'right',
      render: (t) => (
        <div className="flex items-center justify-end gap-1">
          <button type="button" onClick={() => openEdit(t)} aria-label="Edit" className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary-darker">
            <Pencil className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setDeleteTarget(t)} aria-label="Delete" className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const field =
    'mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20';

  return (
    <>
      <PageHeader
        title="Languages / Translations"
        subtitle="Overrides for the site's locale strings, per language."
        actions={
          <button type="button" onClick={openNew} className="inline-flex items-center gap-2 rounded-lg bg-primary-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-darker">
            <Plus className="h-4 w-4" /> Add translation
          </button>
        }
      />

      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <DataTable columns={columns} rows={loading ? [] : rows} empty={loading ? 'Loading…' : 'No translation overrides yet.'} />

      {/* Create / edit */}
      <Modal open={editing !== null} onClose={close} title={editing && editing.id ? 'Edit translation' : 'New translation'}>
        <form onSubmit={save} className="px-5 py-5">
          <div className="space-y-4">
            <div>
              <label htmlFor="t-key" className="text-sm font-medium text-navy-800">Locale key</label>
              <input id="t-key" required value={form.transKey} onChange={set('transKey')} placeholder="nav.home" className={`${field} font-mono`} />
            </div>
            <div>
              <label htmlFor="t-lang" className="text-sm font-medium text-navy-800">Language</label>
              <select id="t-lang" value={form.langCode} onChange={set('langCode')} className={field}>
                {LANG_OPTIONS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="t-val" className="text-sm font-medium text-navy-800">Translated value</label>
              <textarea id="t-val" rows={3} value={form.value} onChange={set('value')} className={field} />
            </div>
            {formError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={close} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-primary-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-darker disabled:opacity-60">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal open={deleteTarget !== null} onClose={() => setDeleteTarget(null)} title="Delete translation">
        <div className="px-5 py-5">
          <p className="text-sm text-slate-600">
            Delete the <span className="font-mono font-semibold text-navy-900">{deleteTarget?.transKey}</span> override for {langLabel(deleteTarget?.langCode)}?
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100">Cancel</button>
            <button type="button" onClick={remove} className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700">Delete</button>
          </div>
        </div>
      </Modal>
    </>
  );
}
