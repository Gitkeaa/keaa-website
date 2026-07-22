import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, Pencil, Trash2, UserPlus, LogOut, ChevronDown } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import StatusPill from '../components/StatusPill';
import Modal from '../components/Modal';
import { useApi } from '../api/useApi';
import { api } from '../api/client';
import { ROLES, ROLE_LABELS, moduleAccess } from '../auth/roles';
import { useAdminAuth } from '../auth/AdminAuthContext';
import { pwStrength, STRENGTH_LABEL, STRENGTH_COLOR, suggestStrongPassword, PW_HINT } from '../passwordUtils';
import { countriesData } from '../../data/countriesData';
import { getAllCategories } from '../../data/categories';

const COUNTRY_OPTS = countriesData.map((c) => c.name);
const CATEGORY_OPTS = getAllCategories().map((c) => c.name);
const isTerritoryRole = (role) => role === ROLES.BUSINESS_DEVELOPMENT;
const toList = (csv) => (csv ? csv.split(',').map((s) => s.trim()).filter(Boolean) : []);

/* Suggestions for the Designation / Department comboboxes — common titles at KEAA, but the
   fields stay free-text so any custom value can still be typed in. */
const DESIGNATIONS = [
  'Managing Director', 'General Manager', 'Sales Manager', 'Sales Executive',
  'Business Development Manager', 'Marketing Manager', 'Marketing Executive',
  'HR Manager', 'HR Executive', 'Operations Manager', 'Procurement Officer',
  'Export Manager', 'Logistics Coordinator', 'Accountant', 'Administrator', 'IT Administrator',
];
const DEPARTMENTS = [
  'Sales', 'Marketing', 'Human Resources', 'Operations', 'Procurement',
  'Finance & Accounts', 'Logistics & Shipping', 'Export', 'Administration',
  'Information Technology', 'Customer Support',
];

const EMPTY = { name: '', email: '', password: '', role: ROLES.BUSINESS_DEVELOPMENT, active: true, designation: '', department: '', employeeId: '', phone: '', joiningDate: '', assignedCountries: [], assignedCategories: [] };

export default function AdminUsers() {
  const { role } = useAdminAuth();
  const canManage = moduleAccess(role, 'users') === 'manage'; // Admin is view-only; Super/Senior manage
  const { data, loading, error, reload } = useApi('/api/users');
  const rows = data || [];

  const [editing, setEditing] = useState(undefined); // undefined = closed, null = create, object = edit
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [logoutTarget, setLogoutTarget] = useState(null); // force-logout confirm
  const [loggingOut, setLoggingOut] = useState(false);

  const forceLogout = async () => {
    setLoggingOut(true);
    try {
      await api.post(`/api/users/${logoutTarget.id}/logout-all`);
      setLogoutTarget(null);
    } finally { setLoggingOut(false); }
  };

  const openCreate = () => {
    setForm(EMPTY);
    setFormError('');
    setEditing(null);
  };
  const openEdit = (u) => {
    setForm({ name: u.name, email: u.email, password: '', role: u.role, active: u.active,
      designation: u.designation || '', department: u.department || '', employeeId: u.employeeId || '', phone: u.phone || '', joiningDate: u.joiningDate || '',
      assignedCountries: toList(u.assignedCountries), assignedCategories: toList(u.assignedCategories) });
    setFormError('');
    setEditing(u);
  };
  const close = () => setEditing(undefined);

  // Deep-link from the Roles & Permissions matrix: /admin/users?edit=<id> opens that user's edit.
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (!editId) return;
    const u = (data || []).find((x) => String(x.id) === editId);
    if (u) {
      openEdit(u);
      setSearchParams((p) => { p.delete('edit'); return p; }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, data]);

  const save = async (e) => {
    e.preventDefault();
    setFormError('');

    // Role, Designation, Department are required for everyone; Sales/Marketing must also have a
    // territory (at least one country AND one category) or nothing would ever auto-assign to them.
    const missing = [];
    if (!form.designation.trim()) missing.push('Designation');
    if (!form.department.trim()) missing.push('Department');
    if (isTerritoryRole(form.role)) {
      if (!form.assignedCountries.length) missing.push('Assigned Countries / Regions');
      if (!form.assignedCategories.length) missing.push('Assigned Product Categories');
    }
    if (missing.length) {
      setFormError(`Please complete: ${missing.join(', ')}.`);
      return;
    }

    setSaving(true);
    try {
      const hr = {
        phone: form.phone, department: form.department, designation: form.designation,
        employeeId: form.employeeId, joiningDate: form.joiningDate || null,
        assignedCountries: isTerritoryRole(form.role) ? form.assignedCountries.join(',') : '',
        assignedCategories: isTerritoryRole(form.role) ? form.assignedCategories.join(',') : '',
      };
      if (editing) {
        await api.put(`/api/users/${editing.id}`, { name: form.name, role: form.role, active: form.active, ...hr });
      } else {
        await api.post('/api/users', { name: form.name, email: form.email, password: form.password, role: form.role, ...hr });
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
    { key: 'designation', label: 'Designation', render: (u) => <span className="text-slate-600">{u.designation || '—'}</span> },
    { key: 'role', label: 'Role', render: (u) => <span className="text-slate-600">{ROLE_LABELS[u.role] || u.role}</span> },
    {
      key: '2fa', label: '2FA',
      render: (u) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${u.twoFactorEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
          {u.twoFactorEnabled ? 'On' : 'Off'}
        </span>
      ),
    },
    { key: 'active', label: 'Status', render: (u) => <StatusPill status={u.active ? 'active' : 'inactive'} /> },
    ...(canManage
      ? [{
          key: 'actions',
          label: '',
          align: 'right',
          render: (u) => (
            <div className="flex items-center justify-end gap-1">
              <button type="button" onClick={() => openEdit(u)} aria-label={`Edit ${u.name}`} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-navy-700">
                <Pencil className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setLogoutTarget(u)} aria-label={`Force logout ${u.name}`} title="Log out of all devices" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-amber-50 hover:text-amber-600">
                <LogOut className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setDeleteTarget(u)} aria-label={`Delete ${u.name}`} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ),
        }]
      : []),
  ];

  return (
    <>
      <PageHeader
        title="User Management"
        subtitle="Team members with access to the admin console."
        actions={
          canManage && (
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-primary-dark px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-darker"
          >
            <UserPlus className="h-4 w-4" /> Add User
          </button>
          )
        }
      />

      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <DataTable columns={columns} rows={loading ? [] : rows} empty={loading ? 'Loading…' : 'No users yet.'} />

      {/* Add / Edit modal */}
      <Modal
        open={editing !== undefined}
        onClose={close}
        title={editing ? 'Edit User' : 'Add User'}
        maxWidth="max-w-lg"
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
              list="user-email-domain"
              disabled={Boolean(editing)}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="name@keaa-international.net"
              className={`${inputCls} disabled:bg-slate-50 disabled:text-slate-400`}
            />
            {/* As soon as a name is typed, offer "<name>@keaa-international.net" to pick. */}
            <datalist id="user-email-domain">
              {form.email && !form.email.includes('@') && (
                <option value={`${form.email}@keaa-international.net`} />
              )}
            </datalist>
          </Field>
          {!editing && (
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-navy-800">Password</label>
                <button type="button" onClick={() => setForm({ ...form, password: suggestStrongPassword() })} className="text-xs font-semibold text-primary-darker hover:underline">
                  Suggest strong
                </button>
              </div>
              <input
                type="text"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={inputCls}
              />
              {form.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex h-1.5 flex-1 gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <span key={i} className={`h-full flex-1 rounded-full ${pwStrength(form.password) > i ? STRENGTH_COLOR[pwStrength(form.password)] : 'bg-slate-200'}`} />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-slate-500">{STRENGTH_LABEL[pwStrength(form.password)]}</span>
                </div>
              )}
              <p className="mt-1.5 text-xs text-slate-400">{PW_HINT}</p>
            </div>
          )}
          <Field label={<>Role <span className="text-red-500" aria-hidden="true">*</span></>}>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputCls}>
              {Object.values(ROLES).map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="user-designation" className="block text-sm font-medium text-navy-800">Designation <span className="text-red-500" aria-hidden="true">*</span></label>
              <SuggestInput id="user-designation" value={form.designation} onChange={(v) => setForm({ ...form, designation: v })} options={DESIGNATIONS} placeholder="e.g. Sales Manager" />
            </div>
            <div>
              <label htmlFor="user-department" className="block text-sm font-medium text-navy-800">Department <span className="text-red-500" aria-hidden="true">*</span></label>
              <SuggestInput id="user-department" value={form.department} onChange={(v) => setForm({ ...form, department: v })} options={DEPARTMENTS} placeholder="e.g. Sales" />
            </div>
          </div>

          {/* Territory — only Sales/Marketing get one, and it decides which inquiries auto-assign
              to them. Responsibilities are system-defined (see the dashboard SOP), so there is no
              free-text task field here. */}
          {isTerritoryRole(form.role) && (
            <div className="rounded-lg border border-primary/20 bg-primary/[0.03] p-3">
              <p className="text-sm font-semibold text-navy-900">Territory</p>
              <p className="mb-2 text-xs text-slate-500">Inquiries matching both a country and a category below are auto-assigned to this member.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label id="lbl-countries" className="text-sm font-medium text-navy-800">Assigned Countries / Regions <span className="text-red-500" aria-hidden="true">*</span></label>
                  <MultiSelect labelId="lbl-countries" options={COUNTRY_OPTS} selected={form.assignedCountries} onChange={(v) => setForm({ ...form, assignedCountries: v })} placeholder="Select countries" searchPlaceholder="Search country…" />
                </div>
                <div>
                  <label id="lbl-categories" className="text-sm font-medium text-navy-800">Assigned Product Categories <span className="text-red-500" aria-hidden="true">*</span></label>
                  <MultiSelect labelId="lbl-categories" options={CATEGORY_OPTS} selected={form.assignedCategories} onChange={(v) => setForm({ ...form, assignedCategories: v })} placeholder="Select categories" searchPlaceholder="Search category…" />
                </div>
              </div>
            </div>
          )}
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

      {/* Force-logout confirm */}
      <Modal
        open={Boolean(logoutTarget)}
        onClose={() => setLogoutTarget(null)}
        title="Log out of all devices?"
        footer={
          <>
            <button type="button" onClick={() => setLogoutTarget(null)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
            <button type="button" onClick={forceLogout} disabled={loggingOut} className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60">
              {loggingOut && <Loader2 className="h-4 w-4 animate-spin" />} Force logout
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Sign <span className="font-semibold text-navy-900">{logoutTarget?.name}</span> out of every device? They’ll need to log in again everywhere.
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

/**
 * A closed, searchable multi-select dropdown — the same interaction as the public
 * country-code picker: click to open, type to filter, tick to (de)select. Picks show as
 * removable chips below the control, and the selection is stored as an array of strings.
 */
function MultiSelect({ options, selected, onChange, placeholder = 'Select…', searchPlaceholder = 'Search…', labelId }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const wrapRef = useRef(null);
  const searchRef = useRef(null);
  const btnRef = useRef(null);
  const set = new Set(selected);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); btnRef.current?.focus(); } };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    setTimeout(() => searchRef.current?.focus(), 0);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const query = q.trim().toLowerCase();
  const shown = query ? options.filter((o) => o.toLowerCase().includes(query)) : options;
  const toggle = (v) => { const n = new Set(set); n.has(v) ? n.delete(v) : n.add(v); onChange([...n]); };
  const remove = (v) => { const n = new Set(set); n.delete(v); onChange([...n]); };

  return (
    <div ref={wrapRef} className="relative mt-1.5">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-required={true}
        aria-labelledby={labelId}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm outline-none transition-colors hover:border-slate-300 focus:border-primary"
      >
        <span className={selected.length ? 'text-navy-800' : 'text-slate-400'}>
          {selected.length ? `${selected.length} selected` : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 flex-shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-100 p-2">
            <input ref={searchRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder={searchPlaceholder}
              className="w-full rounded-md border border-slate-200 bg-slate-50/60 px-3 py-1.5 text-sm outline-none focus:border-primary" />
          </div>
          <ul className="max-h-52 overflow-y-auto py-1">
            {shown.length === 0 && <li className="px-3 py-2 text-xs text-slate-400">No matches.</li>}
            {shown.map((o) => {
              const on = set.has(o);
              return (
                <li key={o}>
                  <label className={`flex w-full cursor-pointer items-center gap-2.5 px-3 py-1.5 text-sm transition-colors hover:bg-slate-50 ${on ? 'bg-primary/[0.06]' : ''}`}>
                    <input type="checkbox" checked={on} onChange={() => toggle(o)} className="h-4 w-4 rounded border-slate-300 text-primary-dark focus:ring-primary/30" />
                    <span className={`flex-1 text-navy-800 ${on ? 'font-medium' : ''}`}>{o}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {selected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selected.map((v) => (
            <span key={v} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary-darker">
              {v}
              <button type="button" onClick={() => remove(v)} aria-label={`Remove ${v}`} className="text-base leading-none text-primary-darker/60 hover:text-primary-darker">×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * A free-text field with a suggestion dropdown (combobox). Typing filters the suggestions and
 * still keeps whatever custom value is entered; clicking a suggestion fills it in.
 */
function SuggestInput({ id, value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const listId = id ? `${id}-list` : undefined;

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const query = (value || '').trim().toLowerCase();
  const shown = query ? options.filter((o) => o.toLowerCase().includes(query) && o.toLowerCase() !== query) : options;
  const listOpen = open && shown.length > 0;

  return (
    <div ref={wrapRef} className="relative mt-1.5">
      <div className="flex items-center rounded-lg border border-slate-200 bg-white transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={listOpen}
          aria-controls={listId}
          aria-autocomplete="list"
          value={value}
          placeholder={placeholder}
          onChange={(e) => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          className="w-full bg-transparent px-3 py-2 text-sm text-navy-800 outline-none"
        />
        <button type="button" tabIndex={-1} aria-hidden="true" onClick={() => setOpen((o) => !o)} className="px-2 text-slate-400 hover:text-slate-600">
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>
      {listOpen && (
        <ul id={listId} role="listbox" className="absolute z-50 mt-1.5 max-h-52 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {shown.map((o) => (
            <li key={o}>
              <button type="button" role="option" aria-selected={o === value} onClick={() => { onChange(o); setOpen(false); }}
                className="flex w-full items-center px-3 py-1.5 text-left text-sm text-navy-800 transition-colors hover:bg-slate-50">
                {o}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
