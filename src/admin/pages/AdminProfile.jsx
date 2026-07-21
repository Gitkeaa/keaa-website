import { useState } from 'react';
import { CircleUser, KeyRound, Check } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { useAdminAuth } from '../auth/AdminAuthContext';
import { ROLE_LABELS } from '../auth/roles';
import { api } from '../api/client';

/**
 * Profile — the signed-in user's own account. Identity is read straight from the auth
 * context (populated by /api/auth/me), so no extra fetch. The only write is a password
 * change, which POSTs to /api/auth/change-password; the backend re-checks the current
 * password before accepting the new one.
 */
export default function AdminProfile() {
  const { user, role } = useAdminAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [state, setState] = useState({ saving: false, error: '', done: false });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setState({ saving: false, error: '', done: false });
    if (form.newPassword.length < 6) {
      setState({ saving: false, error: 'New password must be at least 6 characters.', done: false });
      return;
    }
    if (form.newPassword !== form.confirm) {
      setState({ saving: false, error: 'The new passwords do not match.', done: false });
      return;
    }
    setState({ saving: true, error: '', done: false });
    try {
      await api.post('/api/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
      setState({ saving: false, error: '', done: true });
    } catch (err) {
      setState({ saving: false, error: err.message || 'Could not update password.', done: false });
    }
  };

  const initials = (user?.name || '?')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');

  const field =
    'mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20';

  return (
    <>
      <PageHeader title="Profile" subtitle="Your account and sign-in details." />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Identity card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-primary-dark font-display text-lg font-bold text-white">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-lg font-bold text-navy-900">{user?.name || '—'}</p>
              <p className="truncate text-sm text-slate-500">{user?.email}</p>
            </div>
          </div>
          <dl className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">Role</dt>
              <dd>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary-darker">
                  <CircleUser className="h-3.5 w-3.5" />
                  {ROLE_LABELS[role] || role}
                </span>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">Account ID</dt>
              <dd className="font-mono text-xs text-slate-600">#{user?.id}</dd>
            </div>
          </dl>
        </div>

        {/* Change password */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-display text-base font-bold text-navy-900">
            <KeyRound className="h-4 w-4 text-primary-darker" />
            Change Password
          </h2>
          <form onSubmit={submit} className="mt-4 space-y-4">
            <div>
              <label htmlFor="cur" className="text-sm font-medium text-navy-800">Current password</label>
              <input id="cur" type="password" autoComplete="current-password" required value={form.currentPassword} onChange={set('currentPassword')} className={field} />
            </div>
            <div>
              <label htmlFor="new" className="text-sm font-medium text-navy-800">New password</label>
              <input id="new" type="password" autoComplete="new-password" required value={form.newPassword} onChange={set('newPassword')} className={field} />
            </div>
            <div>
              <label htmlFor="cfm" className="text-sm font-medium text-navy-800">Confirm new password</label>
              <input id="cfm" type="password" autoComplete="new-password" required value={form.confirm} onChange={set('confirm')} className={field} />
            </div>

            {state.error && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
            )}
            {state.done && (
              <p className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                <Check className="h-4 w-4" /> Password updated.
              </p>
            )}

            <button
              type="submit"
              disabled={state.saving}
              className="rounded-lg bg-primary-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-darker disabled:opacity-60"
            >
              {state.saving ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
