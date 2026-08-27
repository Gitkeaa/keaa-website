import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Lock, Mail, Loader2, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAdminAuth } from '../auth/AdminAuthContext';

/**
 * KEAA admin portal login page: renders the email/password sign-in form and the two-factor code step.
 *
 * Rendered at the /portal/login route (lazy-loaded in App.jsx); redirects to the requested page once authed.
 * Sign-in and 2FA logic live in AdminAuthContext (login, loginTwoFactor); this file owns only the form UI.
 */

/** The KEAA cube mark — same three faces the public Logo uses. */
function CubeMark({ className = 'h-11 w-11' }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <defs>
        <mask id="login-cube">
          <rect x="0" y="0" width="100" height="100" fill="white" />
          <line x1="50" y1="50" x2="5" y2="50" stroke="black" strokeWidth="5.5" />
          <line x1="50" y1="50" x2="73" y2="10" stroke="black" strokeWidth="5.5" />
          <line x1="50" y1="50" x2="73" y2="90" stroke="black" strokeWidth="5.5" />
        </mask>
      </defs>
      <g mask="url(#login-cube)">
        <polygon points="10,50 30,15.36 70,15.36 50,50" fill="#79c7f9" />
        <polygon points="10,50 50,50 70,84.64 30,84.64" fill="#2b84da" />
        <polygon points="50,50 70,15.36 90,50 70,84.64" fill="#2065be" />
      </g>
    </svg>
  );
}

export default function AdminLogin() {
  const { login, loginTwoFactor, loading, isAuthed, checking } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/portal';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [challenge, setChallenge] = useState(null); // 2FA challenge token, once the password passes
  const [otp, setOtp] = useState('');
  const [showEmailSuggest, setShowEmailSuggest] = useState(false);

  // When only a username is typed (no "@"), offer "<username>@keaa-international.net" to pick.
  const emailSuggestion = email && !email.includes('@') ? `${email}@keaa-international.net` : null;

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-primary-dark" />
      </div>
    );
  }
  if (isAuthed) return <Navigate to={from} replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login({ email, password });
    if (res.ok) navigate(from, { replace: true });
    else if (res.twoFactor) setChallenge(res.challengeToken);
    else setError(res.error || 'Login failed.');
  };

  const onVerify = async (e) => {
    e.preventDefault();
    setError('');
    const res = await loginTwoFactor({ challengeToken: challenge, code: otp });
    if (res.ok) navigate(from, { replace: true });
    else setError(res.error || 'Invalid code.');
  };

  const inputCls =
    'w-full rounded-lg border border-navy-100 bg-white py-2.5 pl-10 pr-3 text-sm text-text placeholder-muted outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20';

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white px-4 py-10">
      {/* Depth on white: a soft light-blue wash and two faint blue glows, with a very faint
          KEAA cube behind it all. No dark ground, no gold. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-navy-50/60 via-white to-white" />
      <div aria-hidden className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-primary/[0.07] blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.04]">
        <CubeMark className="h-[36rem] w-[36rem]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo + heading */}
        <div className="mb-7 flex flex-col items-center text-center">
          <CubeMark />
          <h1 className="mt-3 font-display text-2xl font-bold tracking-tight">
            <span className="text-primary-dark">KEAA</span> <span className="text-text">Portal</span>
          </h1>
          <p className="mt-1.5 text-sm text-muted">Secure access to your KEAA account and business services.</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-card sm:p-7">
          <div className="mb-6 flex items-center gap-3 border-b border-navy-100 pb-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary-dark">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-text">Welcome Back!</h2>
              <p className="text-sm text-muted">{challenge ? 'Enter your authentication code.' : 'Please sign in to continue.'}</p>
            </div>
          </div>

          {!challenge ? (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label htmlFor="admin-email" className="mb-1.5 block text-sm font-medium text-navy-800">Email Address</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    id="admin-email"
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setShowEmailSuggest(true); }}
                    onFocus={() => setShowEmailSuggest(true)}
                    onBlur={() => setShowEmailSuggest(false)}
                    className={inputCls}
                  />
                  {showEmailSuggest && emailSuggestion && (
                    <ul className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-navy-100 bg-white shadow-cardHover">
                      <li>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => { setEmail(emailSuggestion); setShowEmailSuggest(false); }}
                          className="flex w-full items-center px-3.5 py-2.5 text-left text-sm text-text transition-colors hover:bg-navy-50"
                        >
                          {emailSuggestion}
                        </button>
                      </li>
                    </ul>
                  )}
                </div>
              </div>
              <div>
                <label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium text-navy-800">Password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input id="admin-password" type={showPw ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
                  <button type="button" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-navy-800">
                    {showPw ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

              <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-dark py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-darker disabled:opacity-60">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={onVerify} className="space-y-4">
              <div>
                <label htmlFor="admin-otp" className="mb-1.5 block text-sm font-medium text-navy-800">Authentication code</label>
                <input id="admin-otp" autoFocus inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456"
                  className="w-full rounded-lg border border-navy-100 bg-white px-3 py-2.5 text-center text-lg tracking-[0.3em] text-text placeholder-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                <p className="mt-1.5 text-xs text-muted">From your authenticator app, or a backup code.</p>
              </div>
              {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
              <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-dark py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-darker disabled:opacity-60">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                {loading ? 'Verifying…' : 'Verify & sign in'}
              </button>
              <button type="button" onClick={() => { setChallenge(null); setOtp(''); setError(''); }} className="w-full text-center text-xs text-muted hover:text-navy-800">Back to login</button>
            </form>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted">© {new Date().getFullYear()} KEAA International. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
