import { useMemo, useState } from 'react';
import { Plus, Search, Pencil, Trash2, Loader2, Check } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { useApi } from '../api/useApi';
import { api, API_BASE } from '../api/client';
import { useAdminAuth } from '../auth/AdminAuthContext';
import { moduleAccess } from '../auth/roles';
import { cldImage } from '../../data/cloudinary';
import { galleryCategories } from '../../data/gallery';

/**
 * Gallery / Media — same workspace shape as the Products screen: a searchable table with a
 * thumbnail you can click to preview, an add/edit modal, delete confirm and a success toast.
 * Each item is a Cloudinary public_id plus a category; thumbnails use the same cldImage()
 * helper the public site does. Admin is behind auth, so loading Cloudinary here is fine.
 */
const PAGE_SIZE = 15;
const CATEGORY_OPTIONS = galleryCategories.filter((c) => c !== 'All');
const EMPTY = { cloudinaryId: '', category: CATEGORY_OPTIONS[0] || '', alt: '', sortOrder: 0, active: true };

export default function AdminMedia() {
  const { role } = useAdminAuth();
  const canManage = moduleAccess(role, 'media') === 'manage';
  const { data, loading, error, setData } = useApi('/api/gallery');
  const all = data || [];

  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const [editing, setEditing] = useState(undefined); // undefined = closed, null = create, object = edit
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [toast, setToast] = useState('');
  const [uploading, setUploading] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast((m) => (m === msg ? '' : m)), 2500);
  };

  const uploadImage = async (file) => {
    if (!file) return;
    setUploading(true);
    setFormError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_BASE}/api/gallery/image`, { method: 'POST', credentials: 'include', body: fd });
      if (!res.ok) throw new Error('Could not upload the photo.');
      const { publicId } = await res.json();
      setForm((f) => ({ ...f, cloudinaryId: publicId }));
    } catch (err) {
      setFormError(err.message || 'Could not upload the photo.');
    } finally {
      setUploading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter((g) => [g.cloudinaryId, g.category, g.alt].filter(Boolean).some((v) => v.toLowerCase().includes(q)));
  }, [all, query]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCreate = () => { setForm(EMPTY); setFormError(''); setEditing(null); };
  const openEdit = (g) => { setForm({ ...EMPTY, ...g }); setFormError(''); setEditing(g); };
  const close = () => setEditing(undefined);

  const setField = (k) => (e) => {
    const v = k === 'active' ? e.target.checked : k === 'sortOrder' ? Number(e.target.value) : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.cloudinaryId.trim()) { setFormError('Cloudinary public ID is required.'); return; }
    setSaving(true);
    setFormError('');
    try {
      const payload = { cloudinaryId: form.cloudinaryId.trim(), category: form.category, alt: form.alt || '', sortOrder: form.sortOrder || 0, active: form.active };
      const wasEditing = Boolean(editing);
      if (editing && editing.id) {
        const updated = await api.put(`/api/gallery/${editing.id}`, payload);
        setData((cur) => (cur || []).map((g) => (g.id === updated.id ? updated : g)));
      } else {
        const created = await api.post('/api/gallery', payload);
        setData((cur) => [...(cur || []), created]);
      }
      close();
      showToast(wasEditing ? 'Image updated successfully.' : 'Image added successfully.');
    } catch (err) {
      setFormError(err.message || 'Could not save the image.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const id = deleteTarget.id;
      await api.del(`/api/gallery/${id}`);
      setData((cur) => (cur || []).filter((g) => g.id !== id));
      setDeleteTarget(null);
      showToast('Image deleted.');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: 'image',
      label: 'Image',
      render: (g) => (
        <button type="button" onClick={() => setViewItem(g)} aria-label={`View ${g.cloudinaryId}`} className="block">
          <img src={cldImage(g.cloudinaryId, { w: 120 })} alt={g.alt || ''} loading="lazy" className="h-10 w-14 rounded object-cover ring-1 ring-slate-200 transition hover:ring-2 hover:ring-primary" />
        </button>
      ),
    },
    { key: 'cloudinaryId', label: 'Public ID', render: (g) => <span className="font-mono text-xs text-slate-600">{g.cloudinaryId}</span> },
    { key: 'category', label: 'Category', render: (g) => <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary-darker">{g.category || '—'}</span> },
    { key: 'sortOrder', label: 'Order', align: 'center', render: (g) => <span className="text-slate-500">{g.sortOrder}</span> },
    {
      key: 'active',
      label: 'Status',
      render: (g) =>
        g.active ? (
          <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">Visible</span>
        ) : (
          <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500 ring-1 ring-inset ring-slate-500/20">Hidden</span>
        ),
    },
    ...(canManage
      ? [{
          key: 'actions',
          label: '',
          align: 'right',
          render: (g) => (
            <div className="flex items-center justify-end gap-1">
              <button type="button" onClick={() => openEdit(g)} aria-label={`Edit ${g.cloudinaryId}`} className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-navy-700"><Pencil className="h-4 w-4" /></button>
              <button type="button" onClick={() => setDeleteTarget(g)} aria-label={`Delete ${g.cloudinaryId}`} className="rounded p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
            </div>
          ),
        }]
      : []),
  ];

  return (
    <>
      <PageHeader
        title="Gallery"
        subtitle={`${all.length} images on the public Projects & Gallery page.`}
        actions={
          canManage && (
            <button type="button" onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-primary-dark px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-darker">
              <Plus className="h-4 w-4" /> Add image
            </button>
          )
        }
      />

      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          placeholder="Search by ID, category or alt…"
          aria-label="Search images"
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <DataTable columns={columns} rows={loading ? [] : pageItems} empty={loading ? 'Loading…' : 'No images found.'} />

      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
        <span>{filtered.length} total</span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-navy-700 hover:bg-slate-50 disabled:opacity-40">Prev</button>
          <span className="tabular-nums">{page} / {totalPages}</span>
          <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-navy-700 hover:bg-slate-50 disabled:opacity-40">Next</button>
        </div>
      </div>

      {/* Add / Edit modal */}
      <Modal
        open={editing !== undefined}
        onClose={close}
        title={editing && editing.id ? 'Edit image' : 'Add image'}
        maxWidth="max-w-lg"
        footer={
          <>
            <button type="button" onClick={close} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
            <button type="submit" form="gallery-form" disabled={saving} className="flex items-center gap-2 rounded-lg bg-primary-dark px-4 py-2 text-sm font-semibold text-white hover:bg-primary-darker disabled:opacity-60">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing && editing.id ? 'Save changes' : 'Add image'}
            </button>
          </>
        }
      >
        <form id="gallery-form" onSubmit={save} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy-800">Photo <span className="text-red-500" aria-hidden="true">*</span></label>
            <div className="mt-1.5 flex items-center gap-3">
              {form.cloudinaryId ? (
                <button type="button" onClick={() => setViewItem({ cloudinaryId: form.cloudinaryId, category: form.category, alt: form.alt })} title="View full image" className="flex-shrink-0">
                  <img src={cldImage(form.cloudinaryId, { w: 240 })} alt="" className="h-16 w-20 rounded object-cover ring-1 ring-slate-200 transition hover:ring-2 hover:ring-primary" />
                </button>
              ) : (
                <div className="flex h-16 w-20 flex-shrink-0 items-center justify-center rounded bg-slate-100 text-[10px] text-slate-400 ring-1 ring-slate-200">No image</div>
              )}
              <div className="flex items-center gap-3">
                <label className={`cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-navy-700 transition-colors hover:bg-slate-50 ${uploading ? 'opacity-60' : ''}`}>
                  {uploading ? 'Uploading…' : form.cloudinaryId ? 'Change photo' : 'Choose from device'}
                  <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => { uploadImage(e.target.files?.[0]); e.target.value = ''; }} />
                </label>
                {form.cloudinaryId && <button type="button" onClick={() => setForm((f) => ({ ...f, cloudinaryId: '' }))} className="text-sm font-medium text-slate-500 hover:text-red-600">Remove</button>}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="g-cat" className="block text-sm font-medium text-navy-800">Category</label>
              <select id="g-cat" value={form.category} onChange={setField('category')} className={inputCls}>
                {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="g-order" className="block text-sm font-medium text-navy-800">Order</label>
              <input id="g-order" type="number" value={form.sortOrder} onChange={setField('sortOrder')} className={inputCls} />
            </div>
          </div>
          <div>
            <label htmlFor="g-alt" className="block text-sm font-medium text-navy-800">Alt text <span className="font-normal text-slate-400">(optional)</span></label>
            <input id="g-alt" value={form.alt} onChange={setField('alt')} className={inputCls} />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-navy-800">
            <input type="checkbox" checked={form.active} onChange={setField('active')} className="h-4 w-4 rounded border-slate-300 text-primary-dark focus:ring-primary/30" />
            Visible on site
          </label>
          {formError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete image?"
        footer={
          <>
            <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
            <button type="button" onClick={confirmDelete} disabled={deleting} className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />} Delete
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600">Remove this image from the gallery? The file stays on Cloudinary.</p>
      </Modal>

      {/* Image lightbox */}
      <Modal open={Boolean(viewItem)} onClose={() => setViewItem(null)} title={viewItem?.cloudinaryId || 'Image'} maxWidth="max-w-xl">
        {viewItem && (
          <div className="text-center">
            <img src={cldImage(viewItem.cloudinaryId, { w: 1200 })} alt={viewItem.alt || ''} className="mx-auto max-h-[70vh] w-auto rounded-lg object-contain" />
            <p className="mt-3 text-sm text-slate-500">{viewItem.category}{viewItem.alt ? ` · ${viewItem.alt}` : ''}</p>
          </div>
        )}
      </Modal>

      {/* Success toast */}
      {toast && (
        <div role="status" className="fixed bottom-6 right-6 z-[60] flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg">
          <Check className="h-4 w-4 flex-shrink-0" />
          {toast}
        </div>
      )}
    </>
  );
}

const inputCls =
  'mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-navy-800 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20';
