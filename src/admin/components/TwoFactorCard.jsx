import { useState } from 'react';
import { ShieldCheck, ShieldOff, Smartphone, Copy, Check } from 'lucide-react';
import Modal from './Modal';
import { api } from '../api/client';

/**
 * Two-Factor Authentication card for the Profile screen. Drives the whole TOTP flow against
 * /api/profile/2fa: setup (fetch QR + secret) → confirm with a 6-digit code → show one-time
 * backup codes; plus disable and regenerate-backup-codes, each re-confirmed with a code.
 *
 * `profile` supplies the current status; `onChange` reloads it after any change.
 */
const fmt = (iso) => (iso ? new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');

function CodesList({ codes }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard?.writeText(codes.join('\n')); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  return (
    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 font-mono text-sm text-navy-800">
        {codes.map((c) => <span key={c}>{c}</span>)}
      </div>
      <button type="button" onClick={copy} className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary-darker hover:underline">
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? 'Copied' : 'Copy codes'}
      </button>
    </div>
  );
}

export default function TwoFactorCard({ profile, onChange }) {
  const enabled = profile.twoFactorEnabled;

  const [mode, setMode] = useState(null); // 'setup' | 'disable' | 'regen'
  const [setup, setSetup] = useState(null); // { secret, qr }
  const [codes, setCodes] = useState(null); // backup codes to show once
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const close = () => { setMode(null); setSetup(null); setCodes(null); setOtp(''); setError(''); };

  const openSetup = async () => {
    setMode('setup'); setError(''); setCodes(null); setOtp(''); setSetup(null);
    try { setSetup(await api.get('/api/profile/2fa/setup')); }
    catch (e) { setError(e.message || 'Could not start setup.'); }
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      if (mode === 'setup') {
        const res = await api.post('/api/profile/2fa/enable', { code: otp });
        setCodes(res.backupCodes); setOtp(''); onChange?.();
      } else if (mode === 'disable') {
        await api.post('/api/profile/2fa/disable', { code: otp }); onChange?.(); close();
      } else if (mode === 'regen') {
        const res = await api.post('/api/profile/2fa/backup-codes', { code: otp });
        setCodes(res.backupCodes); setOtp(''); onChange?.();
      }
    } catch (err) {
      setError(err.message || 'That code is not valid.');
    } finally { setBusy(false); }
  };

  const otpInput = (
    <input autoFocus inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456"
      className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-center text-lg tracking-[0.3em] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-bold text-navy-900">Two-Factor Authentication</h2>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm">
            {enabled
              ? <><span className="h-2 w-2 rounded-full bg-emerald-500" /> <span className="font-semibold text-emerald-700">Enabled</span></>
              : <><span className="h-2 w-2 rounded-full bg-slate-300" /> <span className="font-semibold text-slate-500">Disabled</span></>}
          </p>
        </div>
        {enabled ? <ShieldCheck className="h-6 w-6 text-emerald-500" /> : <ShieldOff className="h-6 w-6 text-slate-300" />}
      </div>

      {enabled ? (
        <dl className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-slate-500">Method</dt><dd className="font-medium text-navy-800">Authenticator app</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500">Last verified</dt><dd className="font-medium text-navy-800">{fmt(profile.lastTwoFactorAt)}</dd></div>
          <div className="flex flex-wrap gap-2 pt-2">
            <button type="button" onClick={() => { setMode('regen'); setOtp(''); setError(''); setCodes(null); }} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-navy-700 hover:bg-slate-50">Regenerate backup codes</button>
            <button type="button" onClick={() => { setMode('disable'); setOtp(''); setError(''); }} className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50">Disable 2FA</button>
          </div>
        </dl>
      ) : (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <p className="flex items-center gap-2 text-sm text-slate-500"><Smartphone className="h-5 w-5 text-slate-400" /> Add a second step at sign-in using Google or Microsoft Authenticator.</p>
          <button type="button" onClick={openSetup} className="mt-3 rounded-lg bg-primary-dark px-4 py-2 text-sm font-semibold text-white hover:bg-primary-darker">Enable 2FA</button>
        </div>
      )}

      {/* Setup / disable / regenerate modal */}
      <Modal open={mode !== null} onClose={close}
        title={mode === 'setup' ? 'Enable two-factor authentication' : mode === 'disable' ? 'Disable two-factor authentication' : 'Regenerate backup codes'}>
        <div className="px-5 py-5">
          {codes ? (
            <>
              <p className="text-sm text-slate-600">Save these backup codes somewhere safe. Each works once if you lose your device. They won’t be shown again.</p>
              <CodesList codes={codes} />
              <div className="mt-6 flex justify-end"><button type="button" onClick={close} className="rounded-lg bg-primary-dark px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-darker">Done</button></div>
            </>
          ) : (
            <form onSubmit={submit}>
              {mode === 'setup' && (
                setup ? (
                  <div className="text-center">
                    <p className="text-sm text-slate-600">Scan this with Google / Microsoft Authenticator, then enter the 6-digit code.</p>
                    <img src={setup.qr} alt="2FA QR code" className="mx-auto my-4 h-44 w-44 rounded-lg border border-slate-200" />
                    <p className="text-xs text-slate-400">Can’t scan? Enter this key: <span className="break-all font-mono text-slate-600">{setup.secret}</span></p>
                  </div>
                ) : <p className="py-8 text-center text-sm text-slate-400">Preparing…</p>
              )}
              {mode !== 'setup' && (
                <p className="text-sm text-slate-600">Enter a current 6-digit code {mode === 'disable' ? 'to turn 2FA off' : 'to generate new codes'}, or a backup code.</p>
              )}
              <label className="mt-4 block text-sm font-medium text-navy-800">Verification code</label>
              {otpInput}
              {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
              <div className="mt-6 flex justify-end gap-2">
                <button type="button" onClick={close} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
                <button type="submit" disabled={busy || (mode === 'setup' && !setup)} className="rounded-lg bg-primary-dark px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-darker disabled:opacity-60">
                  {busy ? 'Verifying…' : mode === 'disable' ? 'Disable' : 'Verify'}
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
}
