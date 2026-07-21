import { useState } from 'react';
import { Plus, Pencil, Trash2, ImageOff } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import { useApi } from '../api/useApi';
import { api } from '../api/client';
import { cldImage } from '../../data/cloudinary';
import { galleryCategories } from '../../data/gallery';

/**
 * Gallery / Media — curate the images shown on the public Projects & Gallery page. Each item
 * is a Cloudinary public_id plus a category; the thumbnail is rendered with the same
 * cldImage() helper the public site uses. Admin is behind auth, so loading Cloudinary here is
 * fine (the public consent gate only governs first-visit fetches on the marketing site).
 */
const CATEGORY_OPTIONS = galleryCategories.filter((c) => c !== 'All');
const EMPTY = { cloudinaryId: '', category: CATEGORY_OPTIONS[0] || '', alt: '', sortOrder: 0, active: true };

export default function AdminMedia() {
  const { data, loading, error, setData } = useApi('/api/gallery');
  const rows = data || [];

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const openNew = () => { setEditing(EMPTY); setForm(EMPTY); setFormError(''); };
  const openEdit = (g) => { setEditing(g); setForm({ ...EMPTY, ...g }); setFormError(''); };
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
        cloudinaryId: form.cloudinaryId.trim(),
        category: form.category,
        alt: form.alt || '',
        sortOrder: form.sortOrder || 0,
        active: form.active,
      };
      if (editing && editing.id) {
        const updated = await api.put(`/api/gallery/${editing.id}`, payload);
        setData((cur) => (cur || []).map((g) => (g.id === updated.id ? updated : g)));
      } else {
        const created = await api.post('/api/gallery', payload);
        setData((cur) => [...(cur || []), created]);
      }
      close();
    } catch (err) {
      setFormError(err.message || 'Could not save the image.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    const id = deleteTarget.id;
    setDeleteTarget(null);
    await api.del(`/api/gallery/${id}`);
    setData((cur) => (cur || []).filter((g) => g.id !== id));
  };

  const field =
    'mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20';

  return (
    <>
      <PageHeader
        title="Gallery / Media"
        subtitle="Curate the images on the public Projects & Gallery page."
        actions={
          <button type="button" onClick={openNew} className="inline-flex items-center gap-2 rounded-lg bg-primary-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-darker">
            <Plus className="h-4 w-4" /> Add image
          </button>
        }
      />

      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[4/3] animate-pulse rounded-xl bg-slate-100" />)}
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-16 text-center">
          <ImageOff className="h-8 w-8 text-slate-300" />
          <p className="text-sm text-slate-500">No images yet. Add a Cloudinary image to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rows.map((g) => (
            <div key={g.id} className={`group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${!g.active ? 'opacity-60' : ''}`}>
              <div className="relative aspect-[4/3] bg-slate-100">
                <img src={cldImage(g.cloudinaryId, { w: 480 })} alt={g.alt || g.cloudinaryId} loading="lazy" className="h-full w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-navy-950/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <button type="button" onClick={() => openEdit(g)} aria-label="Edit" className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-navy-800 hover:bg-white">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => setDeleteTarget(g)} aria-label="Delete" className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-red-600 hover:bg-white">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {!g.active && <span className="absolute left-2 top-2 rounded bg-slate-900/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">Hidden</span>}
              </div>
              <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                <span className="truncate font-mono text-xs text-slate-500">{g.cloudinaryId}</span>
                <span className="flex-shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary-darker">{g.category || '—'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / edit */}
      <Modal open={editing !== null} onClose={close} title={editing && editing.id ? 'Edit image' : 'Add image'}>
        <form onSubmit={save} className="px-5 py-5">
          <div className="space-y-4">
            <div>
              <label htmlFor="g-id" className="text-sm font-medium text-navy-800">Cloudinary public ID</label>
              <input id="g-id" required value={form.cloudinaryId} onChange={set('cloudinaryId')} placeholder="DJI_0082_p2qmld" className={`${field} font-mono`} />
            </div>
            {form.cloudinaryId.trim() && (
              <img src={cldImage(form.cloudinaryId.trim(), { w: 480 })} alt="" className="aspect-[4/3] w-full rounded-lg object-cover" />
            )}
            <div>
              <label htmlFor="g-cat" className="text-sm font-medium text-navy-800">Category</label>
              <select id="g-cat" value={form.category} onChange={set('category')} className={field}>
                {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="g-alt" className="text-sm font-medium text-navy-800">Alt text <span className="font-normal text-slate-400">(optional)</span></label>
              <input id="g-alt" value={form.alt} onChange={set('alt')} className={field} />
            </div>
            <div className="flex items-center gap-4">
              <div className="w-28">
                <label htmlFor="g-order" className="text-sm font-medium text-navy-800">Order</label>
                <input id="g-order" type="number" value={form.sortOrder} onChange={set('sortOrder')} className={field} />
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
      <Modal open={deleteTarget !== null} onClose={() => setDeleteTarget(null)} title="Delete image">
        <div className="px-5 py-5">
          <p className="text-sm text-slate-600">Remove this image from the gallery? The file stays on Cloudinary.</p>
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100">Cancel</button>
            <button type="button" onClick={remove} className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700">Delete</button>
          </div>
        </div>
      </Modal>
    </>
  );
}
