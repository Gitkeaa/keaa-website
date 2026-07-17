import { useState } from 'react';
import { Loader2, Pencil, Trash2, UserPlus } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import StatusPill from '../components/StatusPill';
import Modal from '../components/Modal';
import { useApi } from '../api/useApi';
import { api } from '../api/client';
import { ROLES, ROLE_LABELS } from '../auth/roles';

const EMPTY = { name: '', email: '', password: '', role: ROLES.SALES, active: true };

export default function AdminUsers() {
  const { data, loading, error, reload } = useApi('/api/users');
  const rows = data || [];

  const [editing, setEditing] = useState(undefined); // undefined = closed, null = create, object = edit
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const openCreate = () => {
    setForm(EMPTY);
    setFormError('');
    setEditing(null);
  };
  const openEdit = (u) => {
    setForm({ name: u.name, email: u.email, password: '', role: u.role, active: u.active });
    setFormError('');
    setEditing(u);
  };
  const close = () => setEditing(undefined);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      if (editing) {
        await api.put(`/api/users/${editing.id}`, { name: form.name, role: form.role, active: form.active });
      } else {
        await api.post('/api/users', {
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        });
      }
      close();
      reload();
    } catch (err) {
      setFormError(err.message || 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await api.del(`/api/users/${deleteTarget.id}`);
      setDeleteTarget(null);
      reload();
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (u) => (
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-navy-100 text-xs font-bold uppercase text-navy-700">
            {(u.name || '?').charAt(0)}
          </span>
          <span className="font-medium text-navy-900">{u.name}</span>
        </div>
      ),
    },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (u) => <span className="text-slate-600">{ROLE_LABELS[u.role] || u.role}</span> },
    { key: 'active', label: 'Status', render: (u) => <StatusPill status={u.active ? 'active' : 'inactive'} /> },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (u) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => openEdit(u)}
            aria-label={`Edit ${u.name}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-navy-700"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(u)}
            aria-label={`Delete ${u.name}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="User Management"
        subtitle="Team members with access to the admin console."
        actions={
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-primary-dark px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-darker"
          >
            <UserPlus className="h-4 w-4" /> Add User
          </button>
        }
      />

      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <DataTable columns={columns} rows={loading ? [] : rows} empty={loading ? 'Loading…' : 'No users yet.'} />

      {/* Add / Edit modal */}
      <Modal
        open={editing !== undefined}
        onClose={close}
        title={editing ? 'Edit User' : 'Add User'}
        footer={
          <>
            <button type="button" onClick={close} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
              Cancel
            </button>
            <button
              type="submit"
              form="user-form"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-primary-dark px-4 py-2 text-sm font-semibold text-white hover:bg-primary-darker disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? 'Save changes' : 'Create user'}
            </button>
          </>
        }
      >
        <form id="user-form" onSubmit={save} className="space-y-4">
          <Field label="Name">
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              required
              disabled={Boolean(editing)}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={`${inputCls} disabled:bg-slate-50 disabled:text-slate-400`}
            />
          </Field>
          {!editing && (
            <Field label="Password">
              <input
                type="text"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={inputCls}
              />
            </Field>
          )}
          <Field label="Role">
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputCls}>
              {Object.values(ROLES).map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          </Field>
          {editing && (
            <label className="flex items-center gap-2 text-sm text-navy-800">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-primary-dark focus:ring-primary/30"
              />
              Active (can sign in)
            </label>
          )}
          {formError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete user?"
        footer={
          <>
            <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={deleting}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />} Delete
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Remove <span className="font-semibold text-navy-900">{deleteTarget?.name}</span> ({deleteTarget?.email})? This can’t be undone.
        </p>
      </Modal>
    </>
  );
}

const inputCls =
  'mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-navy-800 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20';

function Field({ label, children }) {
  return (
    <label className="block text-sm font-medium text-navy-800">
      {label}
      {children}
    </label>
  );
}
