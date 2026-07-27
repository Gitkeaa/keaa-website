import { useState } from 'react';
import { Plus, Search, Pencil, Trash2, Loader2, Check } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { useApi } from '../api/useApi';
import { api, API_BASE, resolveUpload } from '../api/client';
import { useAdminAuth } from '../auth/AdminAuthContext';
import { moduleAccess } from '../auth/roles';
import { inputCls } from '../adminStyles';
import { getAllCategories } from '../../data/categories';

/**
 * Products management, backed by the live catalogue in the database (GET/POST/PUT/DELETE
 * /api/products, server-side paged + searched). Roles that own catalogue content
 * (Super Admin, Admin, Marketing) can add / edit / delete; Sales sees it read-only.
 */
const PAGE_SIZE = 15;
const CATEGORY_OPTS = getAllCategories().map((c) => c.name);
const EMPTY = { itemCode: '', name: '', category: '', subcategory: '', description: '', imageUrl: '' };

export default function AdminProducts() {
  const { role } = useAdminAuth();
  const canManage = moduleAccess(role, 'products') === 'manage';

  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const url = `/api/products?page=${page - 1}&size=${PAGE_SIZE}${query ? `&q=${encodeURIComponent(query)}` : ''}`;
  const { data, loading, error, reload } = useApi(url);
  const rows = data?.content || [];
  const totalPages = Math.max(1, data?.totalPages || 1);
  const total = data?.totalElements ?? 0;

  const [editing, setEditing] = useState(undefined); // undefined = closed, null = create, object = edit
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [viewImage, setViewImage] = useState(null); // product whose image is shown in the lightbox
  const [toast, setToast] = useState('');

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
      if (form.name?.trim()) fd.append('name', form.name.trim()); // gives the Cloudinary asset a readable name
      const res = await fetch(`${API_BASE}/api/products/image`, { method: 'POST', credentials: 'include', body: fd });
      if (!res.ok) throw new Error('Could not upload the image.');
      const { url } = await res.json();
      setForm((f) => ({ ...f, imageUrl: url }));
    } catch (err) {
      setFormError(err.message || 'Could not upload the image.');
    } finally {
      setUploading(false);
    }
  };

  const openCreate = () => { setForm(EMPTY); setFormError(''); setEditing(null); };
  const openEdit = (p) => {
    setForm({ itemCode: p.itemCode || '', name: p.name || '', category: p.category || '', subcategory: p.subcategory || '', description: p.description || '', imageUrl: p.imageUrl || '' });
    setFormError('');
    setEditing(p);
  };
  const close = () => setEditing(undefined);

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setFormError('Product name is required.'); return; }
    setSaving(true);
    setFormError('');
    try {
      const wasEditing = Boolean(editing);
      if (editing) await api.put(`/api/products/${editing.id}`, form);
      else await api.post('/api/products', form);
      close();
      reload();
      showToast(wasEditing ? 'Product updated successfully.' : 'Product added successfully.');
    } catch (err) {
      setFormError(err.message || 'Could not save the product.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await api.del(`/api/products/${deleteTarget.id}`);
      setDeleteTarget(null);
      reload();
      showToast('Product deleted.');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: 'itemCode', label: 'Item Code', render: (p) => <span className="font-mono text-xs text-slate-600">{p.itemCode || 'N/A'}</span> },
    { key: 'name', label: 'Product', render: (p) => <span className="font-medium text-navy-900">{p.name}</span> },
    { key: 'category', label: 'Category', render: (p) => <span className="text-slate-600">{p.category}</span> },
    { key: 'subcategory', label: 'Subcategory', render: (p) => <span className="text-slate-500">{p.subcategory}</span> },
    {
      key: 'image',
      label: 'Image',
      align: 'center',
      render: (p) =>
        p.imageUrl ? (
          <button type="button" onClick={() => setViewImage(p)} aria-label={`View image of ${p.name}`} className="mx-auto block">
            <img src={resolveUpload(p.imageUrl)} alt="" loading="lazy" className="mx-auto h-9 w-9 rounded object-cover ring-1 ring-slate-200 transition hover:ring-2 hover:ring-primary" />
          </button>
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },
    ...(canManage
      ? [{
          key: 'actions',
          label: '',
          align: 'right',
          render: (p) => (
            <div className="flex items-center justify-end gap-1">
              <button type="button" onClick={() => openEdit(p)} aria-label={`Edit ${p.name}`} className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-navy-700"><Pencil className="h-4 w-4" /></button>
              <button type="button" onClick={() => setDeleteTarget(p)} aria-label={`Delete ${p.name}`} className="rounded p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
            </div>
          ),
        }]
      : []),
  ];

  return (
    <>
      <PageHeader
        title="Products"
        subtitle={`${total} products in the catalogue.`}
        actions={
          canManage && (
            <button
              type="button"
              onClick={openCreate}
              className="flex items-center gap-2 rounded-lg bg-primary-dark px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-darker"
            >
              <Plus className="h-4 w-4" /> Add Product
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
          placeholder="Search by name or item code…"
          aria-label="Search products"
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <DataTable columns={columns} rows={loading ? [] : rows} empty={loading ? 'Loading…' : 'No products found.'} />

      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
        <span>{total} total</span>
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
        title={editing ? 'Edit Product' : 'Add Product'}
        maxWidth="max-w-lg"
        footer={
          <>
            <button type="button" onClick={close} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
            <button type="submit" form="product-form" disabled={saving} className="flex items-center gap-2 rounded-lg bg-primary-dark px-4 py-2 text-sm font-semibold text-white hover:bg-primary-darker disabled:opacity-60">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? 'Save changes' : 'Add product'}
            </button>
          </>
        }
      >
        <form id="product-form" onSubmit={save} className="space-y-4">
          <div>
            <label htmlFor="p-name" className="block text-sm font-medium text-navy-800">Product name <span className="text-red-500" aria-hidden="true">*</span></label>
            <input id="p-name" type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="p-code" className="block text-sm font-medium text-navy-800">Item code</label>
              <input id="p-code" type="text" value={form.itemCode} onChange={(e) => setForm({ ...form, itemCode: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label htmlFor="p-cat" className="block text-sm font-medium text-navy-800">Category</label>
              <select id="p-cat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
                <option value="">Select a category</option>
                {CATEGORY_OPTS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="p-sub" className="block text-sm font-medium text-navy-800">Subcategory</label>
            <input id="p-sub" type="text" value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-800">Product image</label>
            <div className="mt-1.5 flex items-center gap-3">
              {form.imageUrl ? (
                <button type="button" onClick={() => setViewImage({ imageUrl: form.imageUrl, name: form.name, itemCode: form.itemCode, category: form.category, subcategory: form.subcategory })} title="View full image" className="flex-shrink-0">
                  <img src={resolveUpload(form.imageUrl)} alt="" className="h-16 w-16 rounded object-cover ring-1 ring-slate-200 transition hover:ring-2 hover:ring-primary" />
                </button>
              ) : (
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded bg-slate-100 text-[10px] text-slate-400 ring-1 ring-slate-200">No image</div>
              )}
              <div className="flex items-center gap-3">
                <label className={`cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-navy-700 transition-colors hover:bg-slate-50 ${uploading ? 'opacity-60' : ''}`}>
                  {uploading ? 'Uploading…' : form.imageUrl ? 'Change image' : 'Choose from device'}
                  <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => { uploadImage(e.target.files?.[0]); e.target.value = ''; }} />
                </label>
                {form.imageUrl && <button type="button" onClick={() => setForm({ ...form, imageUrl: '' })} className="text-sm font-medium text-slate-500 hover:text-red-600">Remove</button>}
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="p-desc" className="block text-sm font-medium text-navy-800">Description</label>
            <textarea id="p-desc" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputCls} resize-none`} />
          </div>
          {formError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete product?"
        footer={
          <>
            <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
            <button type="button" onClick={confirmDelete} disabled={deleting} className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />} Delete
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Remove <span className="font-semibold text-navy-900">{deleteTarget?.name}</span>{deleteTarget?.itemCode ? ` (${deleteTarget.itemCode})` : ''} from the catalogue? This can’t be undone.
        </p>
      </Modal>

      {/* Image lightbox — view a product's image full size (available to everyone, view-only roles too) */}
      <Modal open={Boolean(viewImage)} onClose={() => setViewImage(null)} title={viewImage?.name || 'Product image'} maxWidth="max-w-xl">
        {viewImage && (
          <div className="text-center">
            <img src={resolveUpload(viewImage.imageUrl)} alt={viewImage.name} className="mx-auto max-h-[70vh] w-auto rounded-lg object-contain" />
            <p className="mt-3 text-sm text-slate-500">
              {viewImage.itemCode ? `${viewImage.itemCode} · ` : ''}{viewImage.category}{viewImage.subcategory ? ` · ${viewImage.subcategory}` : ''}
            </p>
          </div>
        )}
      </Modal>

      {/* Success toast — auto-dismisses a couple of seconds after a save/delete */}
      {toast && (
        <div role="status" className="fixed bottom-6 right-6 z-[60] flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg">
          <Check className="h-4 w-4 flex-shrink-0" />
          {toast}
        </div>
      )}
    </>
  );
}
