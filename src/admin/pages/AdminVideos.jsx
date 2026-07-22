import { useMemo, useState } from 'react';
import { Plus, Search, Pencil, Trash2, Loader2, Check, Play } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { useApi } from '../api/useApi';
import { api, API_BASE } from '../api/client';
import { useAdminAuth } from '../auth/AdminAuthContext';
import { moduleAccess } from '../auth/roles';
import { cldVideoPoster } from '../../data/cloudinary';

/**
 * Videos — the same workspace shape as Gallery, for the site's films (hero + project videos).
 * Each row is a Cloudinary VIDEO public_id; the thumbnail is a poster frame lifted from the
 * video, and the preview plays it. Uploads go straight to the hero-videos Cloudinary folder.
 */
const PAGE_SIZE = 15;
const CATEGORY_OPTIONS = ['Hero', 'Project', 'Product', 'Testimonial', 'Other'];
const EMPTY = { cloudinaryId: '', title: '', category: 'Hero', sortOrder: 0, active: true };

const CLOUD = 'keaa-assets';
const encodeId = (id) => (id || '').split('/').map(encodeURIComponent).join('/');
const videoUrl = (id) => `https://res.cloudinary.com/${CLOUD}/video/upload/${encodeId(id)}.mp4`;

export default function AdminVideos() {
  const { role } = useAdminAuth();
  const canManage = moduleAccess(role, 'videos') === 'manage';
  const { data, loading, error, setData } = useApi('/api/videos');
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

  const uploadVideo = async (file) => {
    if (!file) return;
    setUploading(true);
    setFormError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_BASE}/api/videos/video`, { method: 'POST', credentials: 'include', body: fd });
      if (!res.ok) throw new Error('Could not upload the video.');
      const { publicId } = await res.json();
      setForm((f) => ({ ...f, cloudinaryId: publicId }));
    } catch (err) {
      setFormError(err.message || 'Could not upload the video.');
    } finally {
      setUploading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter((v) => [v.title, v.category, v.cloudinaryId].filter(Boolean).some((s) => s.toLowerCase().includes(q)));
  }, [all, query]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCreate = () => { setForm(EMPTY); setFormError(''); setEditing(null); };
  const openEdit = (v) => { setForm({ ...EMPTY, ...v }); setFormError(''); setEditing(v); };
  const close = () => setEditing(undefined);

  const setField = (k) => (e) => {
    const val = k === 'active' ? e.target.checked : k === 'sortOrder' ? Number(e.target.value) : e.target.value;
    setForm((f) => ({ ...f, [k]: val }));
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.cloudinaryId.trim()) { setFormError('A video is required.'); return; }
    setSaving(true);
    setFormError('');
    try {
      const payload = { cloudinaryId: form.cloudinaryId.trim(), title: form.title || '', category: form.category, sortOrder: form.sortOrder || 0, active: form.active };
      const wasEditing = Boolean(editing);
      if (editing && editing.id) {
        const updated = await api.put(`/api/videos/${editing.id}`, payload);
        setData((cur) => (cur || []).map((v) => (v.id === updated.id ? updated : v)));
      } else {
        const created = await api.post('/api/videos', payload);
        setData((cur) => [...(cur || []), created]);
      }
      close();
      showToast(wasEditing ? 'Video updated successfully.' : 'Video added successfully.');
    } catch (err) {
      setFormError(err.message || 'Could not save the video.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const id = deleteTarget.id;
      await api.del(`/api/videos/${id}`);
      setData((cur) => (cur || []).filter((v) => v.id !== id));
      setDeleteTarget(null);
      showToast('Video deleted.');
    } finally {
      setDeleting(false);
    }
  };

  const Thumb = ({ v, className }) => (
    <span className={`relative block ${className}`}>
      <img src={cldVideoPoster(v.cloudinaryId, { w: 160 })} alt="" loading="lazy" className="h-full w-full rounded object-cover ring-1 ring-slate-200" />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/55"><Play className="h-3 w-3 fill-white text-white" /></span>
      </span>
    </span>
  );

  const columns = [
    {
      key: 'thumb',
      label: 'Video',
      render: (v) => (
        <button type="button" onClick={() => setViewItem(v)} aria-label={`Play ${v.title || v.cloudinaryId}`} className="block">
          <Thumb v={v} className="h-10 w-16 transition hover:opacity-90" />
        </button>
      ),
    },
    { key: 'title', label: 'Title', render: (v) => <span className="font-medium text-navy-900">{v.title || <span className="font-mono text-xs text-slate-500">{v.cloudinaryId}</span>}</span> },
    { key: 'category', label: 'Category', render: (v) => <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary-darker">{v.category || '—'}</span> },
    { key: 'sortOrder', label: 'Order', align: 'center', render: (v) => <span className="text-slate-500">{v.sortOrder}</span> },
    {
      key: 'active',
      label: 'Status',
      render: (v) =>
        v.active ? (
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
          render: (v) => (
            <div className="flex items-center justify-end gap-1">
              <button type="button" onClick={() => openEdit(v)} aria-label={`Edit ${v.title || v.cloudinaryId}`} className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-navy-700"><Pencil className="h-4 w-4" /></button>
              <button type="button" onClick={() => setDeleteTarget(v)} aria-label={`Delete ${v.title || v.cloudinaryId}`} className="rounded p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
            </div>
          ),
        }]
      : []),
  ];

  return (
    <>
      <PageHeader
        title="Videos"
        subtitle={`${all.length} films shown across the public site.`}
        actions={
          canManage && (
            <button type="button" onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-primary-dark px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-darker">
              <Plus className="h-4 w-4" /> Add video
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
          placeholder="Search by title, category…"
          aria-label="Search videos"
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <DataTable columns={columns} rows={loading ? [] : pageItems} empty={loading ? 'Loading…' : 'No videos found.'} />

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
        title={editing && editing.id ? 'Edit video' : 'Add video'}
        maxWidth="max-w-lg"
        footer={
          <>
            <button type="button" onClick={close} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
            <button type="submit" form="video-form" disabled={saving} className="flex items-center gap-2 rounded-lg bg-primary-dark px-4 py-2 text-sm font-semibold text-white hover:bg-primary-darker disabled:opacity-60">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing && editing.id ? 'Save changes' : 'Add video'}
            </button>
          </>
        }
      >
        <form id="video-form" onSubmit={save} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy-800">Video <span className="text-red-500" aria-hidden="true">*</span></label>
            <div className="mt-1.5 flex items-center gap-3">
              {form.cloudinaryId ? (
                <button type="button" onClick={() => setViewItem({ cloudinaryId: form.cloudinaryId, title: form.title, category: form.category })} title="Play video" className="flex-shrink-0">
                  <Thumb v={form} className="h-16 w-24 transition hover:opacity-90" />
                </button>
              ) : (
                <div className="flex h-16 w-24 flex-shrink-0 items-center justify-center rounded bg-slate-100 text-[10px] text-slate-400 ring-1 ring-slate-200">No video</div>
              )}
              <div className="flex items-center gap-3">
                <label className={`cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-navy-700 transition-colors hover:bg-slate-50 ${uploading ? 'opacity-60' : ''}`}>
                  {uploading ? 'Uploading…' : form.cloudinaryId ? 'Change video' : 'Choose from device'}
                  <input type="file" accept="video/*" className="hidden" disabled={uploading} onChange={(e) => { uploadVideo(e.target.files?.[0]); e.target.value = ''; }} />
                </label>
                {form.cloudinaryId && <button type="button" onClick={() => setForm((f) => ({ ...f, cloudinaryId: '' }))} className="text-sm font-medium text-slate-500 hover:text-red-600">Remove</button>}
              </div>
            </div>
            {uploading && <p className="mt-1.5 text-xs text-slate-400">Videos can take a little longer to upload…</p>}
          </div>
          <div>
            <label htmlFor="v-title" className="block text-sm font-medium text-navy-800">Title</label>
            <input id="v-title" value={form.title} onChange={setField('title')} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="v-cat" className="block text-sm font-medium text-navy-800">Category</label>
              <select id="v-cat" value={form.category} onChange={setField('category')} className={inputCls}>
                {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="v-order" className="block text-sm font-medium text-navy-800">Order</label>
              <input id="v-order" type="number" value={form.sortOrder} onChange={setField('sortOrder')} className={inputCls} />
            </div>
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
        title="Delete video?"
        footer={
          <>
            <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
            <button type="button" onClick={confirmDelete} disabled={deleting} className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />} Delete
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600">Remove this video? This also deletes it from Cloudinary.</p>
      </Modal>

      {/* Player lightbox */}
      <Modal open={Boolean(viewItem)} onClose={() => setViewItem(null)} title={viewItem?.title || 'Video'} maxWidth="max-w-2xl">
        {viewItem && (
          <div className="text-center">
            <video controls autoPlay playsInline poster={cldVideoPoster(viewItem.cloudinaryId, { w: 1280 })} src={videoUrl(viewItem.cloudinaryId)} className="mx-auto max-h-[70vh] w-full rounded-lg bg-black" />
            <p className="mt-3 text-sm text-slate-500">{viewItem.category}</p>
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
