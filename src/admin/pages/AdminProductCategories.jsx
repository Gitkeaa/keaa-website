import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { useApi } from '../api/useApi';
import { api } from '../api/client';

/**
 * Product Categories — CRUD for the top-level catalogue categories (/api/categories).
 * Marketing / Admin / Super Admin manage them. The public nav still derives its categories
 * from the catalogue; pointing it at this endpoint is the follow-up integration.
 */
const EMPTY = { name: '', slug: '', description: '', sortOrder: 0, active: true };

export default function AdminProductCategories() {
  const { data, loading, error, setData } = useApi('/api/categories');
  const rows = data || [];

  const [editing, setEditing] = useState(null); // the category being edited, or EMPTY for new
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const openNew = () => { setEditing(EMPTY); setForm(EMPTY); setFormError(''); };
  const openEdit = (c) => { setEditing(c); setForm({ ...EMPTY, ...c }); setFormError(''); };
  const close = () => setEditing(null);

  const set = (k) => (e) => {
    const v = k === 'active' ? e.target.checked : k === 'sortOrder' ? Number(e.target.value) : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description || '',
        sortOrder: form.sortOrder || 0,
        active: form.active,
      };
      if (editing && editing.id) {
        const updated = await api.put(`/api/categories/${editing.id}`, payload);
        setData((cur) => (cur || []).map((c) => (c.id === updated.id ? updated : c)));
      } else {
        const created = await api.post('/api/categories', payload);
        setData((cur) => [...(cur || []), created]);
      }
      close();
    } catch (err) {
      setFormError(err.message || 'Could not save the category.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    const id = deleteTarget.id;
    setDeleteTarget(null);
    await api.del(`/api/categories/${id}`);
    setData((cur) => (cur || []).filter((c) => c.id !== id));
  };

  const columns = [
    { key: 'sortOrder', label: '#', render: (c) => <span className="text-slate-400">{c.sortOrder}</span> },
    { key: 'name', label: 'Category', render: (c) => <span className="font-medium text-navy-900">{c.name}</span> },
    { key: 'slug', label: 'Slug', render: (c) => <span className="font-mono text-xs text-slate-500">{c.slug}</span> },
    {
      key: 'active', label: 'Status',
      render: (c) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${c.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
          {c.active ? 'Visible' : 'Hidden'}
        </span>
      ),
    },
    {
      key: 'actions', label: '', align: 'right',
      render: (c) => (
        <div className="flex items-center justify-end gap-1">
          <button type="button" onClick={() => openEdit(c)} aria-label={`Edit ${c.name}`} className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary-darker">
            <Pencil className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setDeleteTarget(c)} aria-label={`Delete ${c.name}`} className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600">
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
        title="Product Categories"
        subtitle="Top-level categories that organise the catalogue."
        actions={
          <button type="button" onClick={openNew} className="inline-flex items-center gap-2 rounded-lg bg-primary-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-darker">
            <Plus className="h-4 w-4" /> Add category
          </button>
        }
      />

      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <DataTable columns={columns} rows={loading ? [] : rows} empty={loading ? 'Loading…' : 'No categories yet.'} />

      {/* Create / edit */}
      <Modal open={editing !== null} onClose={close} title={editing && editing.id ? 'Edit category' : 'New category'}>
        <form onSubmit={save} className="px-5 py-5">
          <div className="space-y-4">
            <div>
              <label htmlFor="cat-name" className="text-sm font-medium text-navy-800">Name</label>
              <input id="cat-name" required value={form.name} onChange={set('name')} className={field} />
            </div>
            <div>
              <label htmlFor="cat-slug" className="text-sm font-medium text-navy-800">Slug <span className="font-normal text-slate-400">(blank = from name)</span></label>
              <input id="cat-slug" value={form.slug} onChange={set('slug')} placeholder="scaffolding-formworks" className={`${field} font-mono`} />
            </div>
            <div>
              <label htmlFor="cat-desc" className="text-sm font-medium text-navy-800">Description</label>
              <textarea id="cat-desc" rows={3} value={form.description} onChange={set('description')} className={field} />
            </div>
            <div className="flex items-center gap-4">
              <div className="w-28">
                <label htmlFor="cat-order" className="text-sm font-medium text-navy-800">Order</label>
                <input id="cat-order" type="number" value={form.sortOrder} onChange={set('sortOrder')} className={field} />
              </div>
              <label className="mt-6 flex items-center gap-2 text-sm font-medium text-navy-800">
                <input type="checkbox" checked={form.active} onChange={set('active')} className="h-4 w-4 rounded border-slate-300 text-primary-dark focus:ring-primary/30" />
                Visible on site
              </label>
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
      <Modal open={deleteTarget !== null} onClose={() => setDeleteTarget(null)} title="Delete category">
        <div className="px-5 py-5">
          <p className="text-sm text-slate-600">
            Delete <span className="font-semibold text-navy-900">{deleteTarget?.name}</span>? This cannot be undone.
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
