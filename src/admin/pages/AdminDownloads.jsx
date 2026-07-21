import { useRef, useState } from 'react';
import { Plus, Trash2, Download as DownloadIcon, FileText } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { useApi } from '../api/useApi';
import { api, API_BASE } from '../api/client';

/**
 * Downloads / Certificates — upload and manage the files offered on the public site.
 *
 * The file is sent as multipart/form-data straight to the backend (NOT through the JSON api
 * client, which would force a JSON content-type); the browser sets the multipart boundary
 * when we hand fetch a FormData with no explicit Content-Type. Downloading is a plain link to
 * the file endpoint — a top-level GET that carries the admin cookie.
 */
const CATEGORIES = ['Catalogue', 'Certificate', 'Datasheet', 'Brochure'];

function fmtSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function AdminDownloads() {
  const { data, loading, error, setData } = useApi('/api/downloads');
  const rows = data || [];

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const fileRef = useRef(null);

  const openNew = () => { setTitle(''); setCategory(CATEGORIES[0]); setFormError(''); setOpen(true); };

  const upload = async (e) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) { setFormError('Choose a file to upload.'); return; }
    setSaving(true);
    setFormError('');
    try {
      const fd = new FormData();
      fd.append('title', title.trim() || file.name);
      fd.append('category', category);
      fd.append('file', file);
      const res = await fetch(`${API_BASE}/api/downloads`, { method: 'POST', credentials: 'include', body: fd });
      if (!res.ok) throw new Error(`Upload failed (${res.status})`);
      const created = await res.json();
      setData((cur) => [created, ...(cur || [])]);
      setOpen(false);
    } catch (err) {
      setFormError(err.message || 'Could not upload the file.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    const id = deleteTarget.id;
    setDeleteTarget(null);
    await api.del(`/api/downloads/${id}`);
    setData((cur) => (cur || []).filter((d) => d.id !== id));
  };

  const columns = [
    {
      key: 'title', label: 'File',
      render: (d) => (
        <span className="flex items-center gap-2.5">
          <FileText className="h-4 w-4 flex-shrink-0 text-primary-darker" />
          <span className="min-w-0">
            <span className="block font-medium text-navy-900">{d.title}</span>
            <span className="block truncate text-xs text-slate-400">{d.fileName}</span>
          </span>
        </span>
      ),
    },
    { key: 'category', label: 'Category', render: (d) => <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary-darker">{d.category || '—'}</span> },
    { key: 'size', label: 'Size', render: (d) => <span className="text-slate-500">{fmtSize(d.size)}</span> },
    { key: 'uploadedAt', label: 'Uploaded', render: (d) => <span className="text-slate-500">{(d.uploadedAt || '').slice(0, 10)}</span> },
    {
      key: 'actions', label: '', align: 'right',
      render: (d) => (
        <div className="flex items-center justify-end gap-1">
          <a href={`${API_BASE}/api/downloads/${d.id}/file`} target="_blank" rel="noopener noreferrer" aria-label={`Download ${d.title}`} className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary-darker">
            <DownloadIcon className="h-4 w-4" />
          </a>
          <button type="button" onClick={() => setDeleteTarget(d)} aria-label={`Delete ${d.title}`} className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600">
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
        title="Downloads / Certificates"
        subtitle="Catalogues, datasheets and certificates available on the public site."
        actions={
          <button type="button" onClick={openNew} className="inline-flex items-center gap-2 rounded-lg bg-primary-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-darker">
            <Plus className="h-4 w-4" /> Upload file
          </button>
        }
      />

      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <DataTable columns={columns} rows={loading ? [] : rows} empty={loading ? 'Loading…' : 'No files uploaded yet.'} />

      {/* Upload */}
      <Modal open={open} onClose={() => setOpen(false)} title="Upload file">
        <form onSubmit={upload} className="px-5 py-5">
          <div className="space-y-4">
            <div>
              <label htmlFor="d-title" className="text-sm font-medium text-navy-800">Title</label>
              <input id="d-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Product Catalogue 2026" className={field} />
            </div>
            <div>
              <label htmlFor="d-cat" className="text-sm font-medium text-navy-800">Category</label>
              <select id="d-cat" value={category} onChange={(e) => setCategory(e.target.value)} className={field}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="d-file" className="text-sm font-medium text-navy-800">File</label>
              <input id="d-file" ref={fileRef} type="file" className="mt-1.5 w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-navy-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-navy-700 hover:file:bg-navy-200" />
            </div>
            {formError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-primary-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-darker disabled:opacity-60">
              {saving ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal open={deleteTarget !== null} onClose={() => setDeleteTarget(null)} title="Delete file">
        <div className="px-5 py-5">
          <p className="text-sm text-slate-600">
            Delete <span className="font-semibold text-navy-900">{deleteTarget?.title}</span>? The file is removed from the server.
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
