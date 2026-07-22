import { useEffect, useMemo, useState } from 'react';
import {
  User as UserIcon, Shield, SlidersHorizontal, Activity, Plug, KeyRound, Check, X,
  LogOut, Download, Monitor, Smartphone, Fingerprint, Bell, Clock, AlertTriangle, Lock,
  Eye, EyeOff,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import PageHeader from '../components/PageHeader';
import TwoFactorCard from '../components/TwoFactorCard';
import AvatarCropModal from '../components/AvatarCropModal';
import { useAdminAuth } from '../auth/AdminAuthContext';
import { MODULES, moduleAccess, ROLE_LABELS, ROLES } from '../auth/roles';
import { api, API_BASE, resolveUpload } from '../api/client';
import { pwStrength, STRENGTH_LABEL, STRENGTH_COLOR, suggestStrongPassword, PW_HINT } from '../passwordUtils';
import { languages } from '../../i18n/languages';

/* ---------------------------------------------------------------------------------------
 * Profile / My Account — a comprehensive, role-aware account screen.
 *
 * Real, backend-backed: identity + HR fields, account meta, permissions (from the access
 * matrix), change password, preferences, notification preferences, login history + activity
 * (from the activity log), "log out of all devices" (token-version invalidation), and a
 * JSON export. Honest "coming soon" states — never fake data — for the features that need
 * infrastructure not built yet (2FA setup, per-device sessions, trusted devices, API keys,
 * webhooks). Role differences: Integrations + Delete Account are Super-Admin only, and the
 * notification alert list only offers the alerts a role actually receives.
 * ------------------------------------------------------------------------------------- */

const TIMEZONES = ['Asia/Kolkata', 'Europe/Amsterdam', 'Europe/London', 'Asia/Dubai', 'UTC', 'America/New_York'];
const DATE_FORMATS = ['DD MMM YYYY', 'YYYY-MM-DD', 'MM/DD/YYYY', 'DD/MM/YYYY'];

const NOTIFS = [
  { key: 'notifyEmail', label: 'Email Notifications', desc: 'General account and system emails' },
  { key: 'notifyRfq', label: 'RFQ Alerts', desc: 'New quotation requests', module: 'rfq' },
  { key: 'notifyJobs', label: 'Job Application Alerts', desc: 'New candidate applications', module: 'applications' },
  { key: 'notifyContact', label: 'Contact Form Alerts', desc: 'New enquiries from the site', module: 'contacts' },
  { key: 'notifySecurity', label: 'Security Alerts', desc: 'Sign-ins and password changes' },
];

const ACTIVITY_META = {
  LOGIN: { label: 'Signed in', icon: LogOut, tone: 'text-primary-darker bg-primary/10' },
  PASSWORD_CHANGED: { label: 'Changed password', icon: KeyRound, tone: 'text-amber-700 bg-amber-100' },
  PROFILE_UPDATED: { label: 'Updated profile', icon: UserIcon, tone: 'text-emerald-700 bg-emerald-100' },
  LOGOUT_ALL: { label: 'Logged out everywhere', icon: Shield, tone: 'text-red-700 bg-red-100' },
};

const fmt = (iso, withTime = true) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const opts = withTime
    ? { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { day: '2-digit', month: 'short', year: 'numeric' };
  return d.toLocaleString('en-GB', opts);
};

/* ---- small building blocks ---- */
function Card({ title, desc, action, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="font-display text-base font-bold text-navy-900">{title}</h2>}
            {desc && <p className="mt-0.5 text-sm text-slate-500">{desc}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-50 py-2.5 last:border-0">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="text-right text-sm font-medium text-navy-800">{children ?? '—'}</dd>
    </div>
  );
}

function Soon() {
  return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Coming soon</span>;
}

const inputCls =
  'mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20';

export default function AdminProfile() {
  const { user, role, refreshUser } = useAdminAuth();
  const isSuper = role === ROLES.SUPER_ADMIN;

  const [profile, setProfile] = useState(null);
  const [activity, setActivity] = useState([]);
  const [tab, setTab] = useState('overview');
  const [error, setError] = useState('');

  // Personal edit
  const [editing, setEditing] = useState(false);
  const [pForm, setPForm] = useState({ name: '', phone: '', avatarUrl: '' });
  const [pSaving, setPSaving] = useState(false);

  // Preferences / notifications (saved via the same PUT)
  const [prefSaved, setPrefSaved] = useState(false);

  // Password
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwState, setPwState] = useState({ saving: false, error: '', done: false });
  const [showNewPw, setShowNewPw] = useState(false);
  const suggestPassword = () => {
    const p = suggestStrongPassword();
    setPw((f) => ({ ...f, newPassword: p, confirm: p }));
    setShowNewPw(true);
  };

  // Logout-all
  const [loggingOut, setLoggingOut] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = () => {
    api.get('/api/profile').then((p) => {
      // Accounts created before the preference columns existed read back null for them; fall
      // back to sensible defaults so the selects are always controlled (never value={null}).
      setProfile({
        ...p,
        theme: p.theme || 'light',
        language: p.language || 'en',
        timezone: p.timezone || 'Asia/Kolkata',
        dateFormat: p.dateFormat || 'DD MMM YYYY',
      });
      setPForm({ name: p.name || '', phone: p.phone || '', avatarUrl: p.avatarUrl || '' });
    }).catch((e) => setError(e.message || 'Could not load profile.'));
    api.get('/api/profile/activity?limit=30').then(setActivity).catch(() => {});
  };
  useEffect(load, []);

  const patch = async (partial) => {
    const updated = await api.put('/api/profile', partial);
    setProfile(updated);
    return updated;
  };

  const savePersonal = async (e) => {
    e.preventDefault();
    setPSaving(true);
    try {
      await patch({ name: pForm.name, phone: pForm.phone, avatarUrl: pForm.avatarUrl });
      setEditing(false);
    } finally { setPSaving(false); }
  };

  const avatarSrc = resolveUpload;
  // Picking a file opens the crop modal; the upload happens once the crop is confirmed.
  const [cropSrc, setCropSrc] = useState(null);
  const onAvatarFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropSrc(URL.createObjectURL(file));
    e.target.value = ''; // let the same file be re-picked later
  };
  const uploadCroppedBlob = async (blob) => {
    const fd = new FormData();
    fd.append('file', blob, 'avatar.jpg');
    const res = await fetch(`${API_BASE}/api/profile/avatar`, { method: 'POST', credentials: 'include', body: fd });
    if (res.ok) {
      const p = await res.json();
      setProfile((cur) => ({ ...cur, avatarUrl: p.avatarUrl }));
      setPForm((f) => ({ ...f, avatarUrl: p.avatarUrl }));
      refreshUser?.(); // update the topbar/sidebar photo everywhere
    }
  };

  const savePref = async (partial) => {
    setProfile((p) => ({ ...p, ...partial })); // optimistic
    try { await patch(partial); setPrefSaved(true); setTimeout(() => setPrefSaved(false), 1500); }
    catch { load(); }
  };

  const changePw = async (e) => {
    e.preventDefault();
    setPwState({ saving: false, error: '', done: false });
    if (pw.newPassword.length < 6) return setPwState({ saving: false, error: 'New password must be at least 6 characters.', done: false });
    if (pw.newPassword !== pw.confirm) return setPwState({ saving: false, error: 'The new passwords do not match.', done: false });
    setPwState({ saving: true, error: '', done: false });
    try {
      await api.post('/api/auth/change-password', { currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
      setPwState({ saving: false, error: '', done: true });
      load();
    } catch (err) {
      setPwState({ saving: false, error: err.message || 'Could not update password.', done: false });
    }
  };

  const logoutAll = async () => {
    setLoggingOut(true);
    try { await api.post('/api/auth/logout-all'); load(); } finally { setLoggingOut(false); }
  };

  // ---- PDF exports (jsPDF, client-side from the loaded data) ----
  const pdfHeader = (doc, subtitle) => {
    doc.setFontSize(18); doc.setTextColor(15, 35, 66); doc.text('KEAA International', 18, 22);
    doc.setFontSize(11); doc.setTextColor(120, 120, 120); doc.text(subtitle, 18, 29);
    doc.setDrawColor(220, 220, 220); doc.line(18, 34, 192, 34);
  };

  const downloadProfilePdf = () => {
    const doc = new jsPDF();
    pdfHeader(doc, 'Profile summary');
    let y = 46;
    const section = (t) => { doc.setFontSize(12); doc.setTextColor(47, 116, 184); doc.text(t, 18, y); y += 8; };
    const row = (label, val) => {
      doc.setFontSize(8); doc.setTextColor(150, 150, 150); doc.text(String(label).toUpperCase(), 18, y);
      doc.setFontSize(11); doc.setTextColor(30, 30, 30); doc.text(String(val ?? '—'), 18, y + 5.5);
      y += 14;
    };
    section('Personal');
    row('Full name', profile.name); row('Email', profile.email); row('Phone', profile.phone);
    row('Department', profile.department); row('Designation', profile.designation);
    row('Employee ID', profile.employeeId); row('Joining date', fmt(profile.joiningDate, false));
    y += 4; section('Account');
    row('Role', ROLE_LABELS[profile.role] || profile.role);
    row('Status', profile.active ? 'Active' : 'Inactive');
    row('Account created', fmt(profile.createdAt, false));
    row('Two-factor authentication', profile.twoFactorEnabled ? 'Enabled' : 'Disabled');
    doc.setFontSize(8); doc.setTextColor(160, 160, 160);
    doc.text('Generated ' + fmt(new Date().toISOString()), 18, 287);
    doc.save('keaa-profile.pdf');
  };

  const downloadActivityLog = () => {
    const doc = new jsPDF();
    pdfHeader(doc, 'Activity log — ' + (profile.name || ''));
    let y = 46;
    doc.setFontSize(10);
    if (activity.length === 0) { doc.setTextColor(150, 150, 150); doc.text('No activity recorded.', 18, y); }
    activity.forEach((e) => {
      if (y > 280) { doc.addPage(); y = 22; }
      doc.setFontSize(11); doc.setTextColor(30, 30, 30); doc.text(e.detail || e.type, 18, y);
      doc.setFontSize(8); doc.setTextColor(150, 150, 150); doc.text(fmt(e.at) + (e.ip ? '   ·   ' + e.ip : ''), 18, y + 5);
      y += 13;
    });
    doc.save('keaa-activity-log.pdf');
  };

  const initials = (profile?.name || user?.name || '?').split(' ').map((n) => n[0]).slice(0, 2).join('');
  const loginHistory = useMemo(() => activity.filter((a) => a.type === 'LOGIN'), [activity]);
  const availableNotifs = NOTIFS.filter((n) => !n.module || moduleAccess(role, n.module));

  const TABS = [
    { key: 'overview', label: 'Overview', icon: UserIcon },
    { key: 'security', label: 'Security', icon: Shield },
    { key: 'preferences', label: 'Preferences', icon: SlidersHorizontal },
    { key: 'activity', label: 'Activity', icon: Activity },
    { key: 'permissions', label: 'Permissions', icon: Lock },
    ...(isSuper ? [{ key: 'integrations', label: 'Integrations', icon: Plug }] : []),
  ];

  // Only the modules this role can actually open (the ✗ ones are dropped).
  const allowedModules = MODULES.filter((m) => moduleAccess(role, m.key));

  if (error) return <><PageHeader title="Profile" /><p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p></>;
  if (!profile) return <><PageHeader title="Profile" /><div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white" /></>;

  return (
    <>
      <PageHeader title="My Profile" subtitle="Your account, security and preferences." />

      {/* Identity banner */}
      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        {profile.avatarUrl ? (
          <img src={avatarSrc(profile.avatarUrl)} alt="" className="h-16 w-16 flex-shrink-0 rounded-full object-cover" />
        ) : (
          <span className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-primary-dark font-display text-xl font-bold text-white">{initials}</span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-xl font-bold text-navy-900">{profile.name}</h2>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary-darker">{ROLE_LABELS[profile.role] || profile.role}</span>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${profile.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{profile.active ? 'Active' : 'Inactive'}</span>
          </div>
          <p className="mt-0.5 text-sm text-slate-500">{[profile.designation, profile.department].filter(Boolean).join(' · ') || profile.email}</p>
        </div>
        <div className="flex flex-shrink-0 gap-4 text-sm sm:flex-col sm:gap-1 sm:text-right">
          <span className="text-slate-400">Employee ID</span>
          <span className="font-mono font-semibold text-navy-800">{profile.employeeId || '—'}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-slate-200">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.key} type="button" onClick={() => setTab(t.key)}
              className={`-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                tab === t.key ? 'border-primary-dark text-primary-darker' : 'border-transparent text-slate-500 hover:text-navy-800'}`}>
              <Icon className="h-4 w-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* ---------------- OVERVIEW ---------------- */}
      {tab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Personal Information"
            action={!editing
              ? <button type="button" onClick={() => setEditing(true)} className="rounded-lg px-3 py-1.5 text-sm font-semibold text-primary-darker hover:bg-slate-100">Edit</button>
              : null}>
            {!editing ? (
              <dl>
                <Row label="Full name">{profile.name}</Row>
                <Row label="Email">{profile.email}</Row>
                <Row label="Phone">{profile.phone}</Row>
                <Row label="Department">{profile.department}</Row>
                <Row label="Designation">{profile.designation}</Row>
                <Row label="Joining date">{fmt(profile.joiningDate, false)}</Row>
                <Row label="Status">{profile.active ? 'Active' : 'Inactive'}</Row>
              </dl>
            ) : (
              <form onSubmit={savePersonal} className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-navy-800">Profile photo</label>
                  <div className="mt-1.5 flex items-center gap-3">
                    {profile.avatarUrl
                      ? <img src={avatarSrc(profile.avatarUrl)} alt="" className="h-14 w-14 rounded-full object-cover" />
                      : <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-dark text-sm font-bold text-white">{initials}</span>}
                    <label className="cursor-pointer rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-navy-700 hover:bg-slate-50">
                      Choose from device
                      <input type="file" accept="image/*" className="hidden" onChange={onAvatarFile} />
                    </label>
                  </div>
                </div>
                <div><label className="text-sm font-medium text-navy-800">Full name</label><input value={pForm.name} onChange={(e) => setPForm({ ...pForm, name: e.target.value })} className={inputCls} /></div>
                <div><label className="text-sm font-medium text-navy-800">Phone</label><input value={pForm.phone} onChange={(e) => setPForm({ ...pForm, phone: e.target.value })} className={inputCls} /></div>
                <p className="text-xs text-slate-400">Department, designation, employee ID and joining date are set by an administrator.</p>
                <div className="flex gap-2 pt-1">
                  <button type="submit" disabled={pSaving} className="rounded-lg bg-primary-dark px-4 py-2 text-sm font-semibold text-white hover:bg-primary-darker disabled:opacity-60">{pSaving ? 'Saving…' : 'Save'}</button>
                  <button type="button" onClick={() => { setEditing(false); setPForm({ name: profile.name || '', phone: profile.phone || '', avatarUrl: profile.avatarUrl || '' }); }} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
                </div>
              </form>
            )}
          </Card>

          <Card title="Account Information">
            <dl>
              <Row label="Username">{profile.email}</Row>
              <Row label="Account ID"><span className="font-mono">#{profile.id}</span></Row>
              <Row label="Role"><span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary-darker">{ROLE_LABELS[profile.role] || profile.role}</span></Row>
              <Row label="Last login">{fmt(profile.lastActive)}</Row>
              <Row label="Password last changed">{fmt(profile.lastPasswordChangedAt)}</Row>
              <Row label="Account created">{fmt(profile.createdAt, false)}</Row>
              <Row label="Created by">{profile.createdBy}</Row>
              <Row label="Login status"><span className="inline-flex items-center gap-1.5 text-emerald-600"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Online</span></Row>
            </dl>
          </Card>

        </div>
      )}

      {/* ---------------- PERMISSIONS ---------------- */}
      {tab === 'permissions' && (
        <Card title="Permissions" desc="What your role can access. Read-only — set in Roles & Permissions.">
          <ul className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {allowedModules.map((m) => {
              const acc = moduleAccess(role, m.key);
              return (
                <li key={m.key} className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex items-center gap-2 text-navy-800">
                    <Check className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                    {m.label}
                  </span>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${acc === 'view' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {acc === 'view' ? 'View' : 'Manage'}
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {/* ---------------- SECURITY ---------------- */}
      {tab === 'security' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Change Password">
            <form onSubmit={changePw} className="space-y-3">
              <div><label className="text-sm font-medium text-navy-800">Current password</label><input type="password" autoComplete="current-password" required value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} className={inputCls} /></div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-navy-800">New password</label>
                  <button type="button" onClick={suggestPassword} className="text-xs font-semibold text-primary-darker hover:underline">
                    Suggest strong
                  </button>
                </div>
                <div className="relative">
                  <input type={showNewPw ? 'text' : 'password'} autoComplete="new-password" required value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} className={`${inputCls} pr-10`} />
                  <button type="button" onClick={() => setShowNewPw((v) => !v)} aria-label={showNewPw ? 'Hide password' : 'Show password'} className="absolute right-2.5 top-1/2 mt-[3px] -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showNewPw ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
                {pw.newPassword && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex h-1.5 flex-1 gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <span key={i} className={`h-full flex-1 rounded-full ${pwStrength(pw.newPassword) > i ? STRENGTH_COLOR[pwStrength(pw.newPassword)] : 'bg-slate-200'}`} />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-slate-500">{STRENGTH_LABEL[pwStrength(pw.newPassword)]}</span>
                  </div>
                )}
                <p className="mt-1.5 text-xs text-slate-400">{PW_HINT}</p>
              </div>

              <div><label className="text-sm font-medium text-navy-800">Confirm new password</label><input type={showNewPw ? 'text' : 'password'} autoComplete="new-password" required value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} className={inputCls} /></div>
              {pwState.error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{pwState.error}</p>}
              {pwState.done && <p className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700"><Check className="h-4 w-4" /> Password updated.</p>}
              <button type="submit" disabled={pwState.saving} className="rounded-lg bg-primary-dark px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-darker disabled:opacity-60">{pwState.saving ? 'Updating…' : 'Update password'}</button>
            </form>
          </Card>

          <div className="space-y-6">
            <TwoFactorCard profile={profile} onChange={load} />

            <Card title="Sessions & Devices">
              <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-3">
                <span className="flex items-center gap-3 text-sm">
                  <Monitor className="h-5 w-5 text-primary-darker" />
                  <span><span className="block font-medium text-navy-800">This device</span><span className="block text-xs text-slate-400">Current session · signed in {fmt(profile.lastActive)}</span></span>
                </span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Active</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-3 opacity-70">
                <span className="flex items-center gap-3 text-sm text-slate-500"><Smartphone className="h-5 w-5 text-slate-400" /> Per-device sessions &amp; trusted devices</span>
                <Soon />
              </div>
              <button type="button" onClick={logoutAll} disabled={loggingOut} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60">
                <LogOut className="h-4 w-4" /> {loggingOut ? 'Signing out…' : 'Log out of all devices'}
              </button>
            </Card>

            <Card title="Login History" desc="Recent sign-ins on your account.">
              {loginHistory.length === 0 ? (
                <p className="text-sm text-slate-400">No sign-ins recorded yet.</p>
              ) : (
                <ul className="space-y-2">
                  {loginHistory.slice(0, 6).map((e, i) => (
                    <li key={i} className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex items-center gap-2 text-slate-600"><Clock className="h-4 w-4 text-slate-400" /> {fmt(e.at)}</span>
                      <span className="truncate text-xs text-slate-400">{e.ip || '—'}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* ---------------- PREFERENCES ---------------- */}
      {tab === 'preferences' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Preferences" action={prefSaved ? <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600"><Check className="h-3.5 w-3.5" /> Saved</span> : null}>
            <div className="space-y-4">
              <div><label className="text-sm font-medium text-navy-800">Theme</label>
                <select value={profile.theme} onChange={(e) => savePref({ theme: e.target.value })} className={inputCls}>
                  <option value="light">Light</option><option value="dark">Dark</option><option value="system">System</option>
                </select>
                {profile.theme !== 'light' && <p className="mt-1 text-xs text-slate-400">Saved. Dark theme rolls out to the console soon.</p>}
              </div>
              <div><label className="text-sm font-medium text-navy-800">Language</label>
                <select value={profile.language} onChange={(e) => savePref({ language: e.target.value })} className={inputCls}>
                  {languages.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
              </div>
              <div><label className="text-sm font-medium text-navy-800">Time zone</label>
                <select value={profile.timezone} onChange={(e) => savePref({ timezone: e.target.value })} className={inputCls}>
                  {TIMEZONES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div><label className="text-sm font-medium text-navy-800">Date format</label>
                <select value={profile.dateFormat} onChange={(e) => savePref({ dateFormat: e.target.value })} className={inputCls}>
                  {DATE_FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
          </Card>

          <Card title="Notification Preferences" desc="Only the alerts your role receives are shown.">
            <ul className="divide-y divide-slate-100">
              {availableNotifs.map((n) => (
                <li key={n.key} className="flex items-center justify-between gap-3 py-3">
                  <span><span className="block text-sm font-medium text-navy-800">{n.label}</span><span className="block text-xs text-slate-400">{n.desc}</span></span>
                  <button type="button" role="switch" aria-checked={profile[n.key]} onClick={() => savePref({ [n.key]: !profile[n.key] })}
                    className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${profile[n.key] ? 'bg-primary-dark' : 'bg-slate-200'}`}>
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${profile[n.key] ? 'left-[22px]' : 'left-0.5'}`} />
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          {/* Emergency actions live here for every role (Delete is Super-Admin-only, below) */}
          <Card title="Data & Account">
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={downloadProfilePdf} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-navy-700 hover:bg-slate-50"><Download className="h-4 w-4" /> Download my profile (PDF)</button>
              <button type="button" onClick={downloadActivityLog} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-navy-700 hover:bg-slate-50"><Download className="h-4 w-4" /> Download activity log (PDF)</button>
              <button type="button" onClick={logoutAll} disabled={loggingOut} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-navy-700 hover:bg-slate-50 disabled:opacity-60"><LogOut className="h-4 w-4" /> Log out everywhere</button>
            </div>
            {isSuper && (
              <div className="mt-4 rounded-lg border border-red-100 bg-red-50/50 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-red-700"><AlertTriangle className="h-4 w-4" /> Danger zone</p>
                <p className="mt-1 text-xs text-red-600/80">Deleting your own super-admin account is blocked to prevent lockout. Manage other accounts in User Management.</p>
                <button type="button" disabled className="mt-3 cursor-not-allowed rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-400" title="Blocked for your own account">Delete account</button>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ---------------- ACTIVITY ---------------- */}
      {tab === 'activity' && (
        <Card title="Activity Timeline" desc="Your recent account activity.">
          {activity.length === 0 ? (
            <p className="text-sm text-slate-400">No activity recorded yet.</p>
          ) : (
            <ol className="relative ml-2 border-l border-slate-200">
              {activity.map((e, i) => {
                const meta = ACTIVITY_META[e.type] || { label: e.type, icon: Activity, tone: 'text-slate-500 bg-slate-100' };
                const Icon = meta.icon;
                return (
                  <li key={i} className="mb-5 ml-6 last:mb-0">
                    <span className={`absolute -left-[13px] flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white ${meta.tone}`}><Icon className="h-3.5 w-3.5" /></span>
                    <p className="text-sm font-medium text-navy-800">{e.detail || meta.label}</p>
                    <p className="text-xs text-slate-400">{fmt(e.at)}{e.ip ? ` · ${e.ip}` : ''}</p>
                  </li>
                );
              })}
            </ol>
          )}
        </Card>
      )}

      {/* ---------------- INTEGRATIONS (super admin) ---------------- */}
      {tab === 'integrations' && isSuper && (
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            { icon: KeyRound, title: 'API Keys', desc: 'Programmatic access tokens for integrations.' },
            { icon: Plug, title: 'Webhooks', desc: 'Push events to external endpoints.' },
            { icon: Lock, title: 'Connected Services', desc: 'Third-party apps linked to KEAA.' },
          ].map((c) => {
            const Icon = c.icon;
            return (
              <Card key={c.title} title={c.title} action={<Soon />}>
                <div className="flex items-start gap-3 text-sm text-slate-500"><Icon className="h-5 w-5 flex-shrink-0 text-slate-400" /> {c.desc}</div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Crop/adjust the picked photo before it uploads */}
      <AvatarCropModal src={cropSrc} onClose={() => setCropSrc(null)} onSave={uploadCroppedBlob} />
    </>
  );
}
