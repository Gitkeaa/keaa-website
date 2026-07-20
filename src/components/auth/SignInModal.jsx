import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../admin/auth/AdminAuthContext';
import { useT } from '../../i18n/LocaleContext';

/**
 * Sign-in for the KEAA TEAM, opened from the header.
 *
 * There is no public account system and no registration — the backend has staff roles
 * (SUPER_ADMIN / HR / EMPLOYEE / SALES) and no customer table. So this dialog is a shortcut
 * into the admin console for someone who is already on the public site, not a storefront
 * login. The subtitle says so plainly, because a customer who clicks "Sign in" expecting an
 * order history needs to be told in one line that there is nothing here for them.
 *
 * `/admin/login` still exists and is untouched: it is where the route guard sends an
 * unauthenticated visitor who deep-links into the console. This is the other door to the
 * same room, and both go through the same AdminAuthContext.
 *
 * Follows the JobApplicationModal idiom exactly — no createPortal, the WRAPPER scrolls, the
 * backdrop is its own element. Avoiding the portal also keeps us clear of the prerender
 * trap: portalled overlays that render at snapshot time ship as dead markup in the HTML.
 * This one renders nothing unless `open`, and it is never open while snapshotting.
 */
export default function SignInModal({ open, onClose }) {
  const t = useT();
  const navigate = useNavigate();
  const { login, loading } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const cardRef = useRef(null);
  const emailRef = useRef(null);
  // Whatever had focus when we opened — usually the header trigger. Restored on close so a
  // keyboard user is put back where they were instead of at the top of the document.
  const returnFocusRef = useRef(null);

  /*
    Reset on every closed -> open transition, not on mount: the component stays mounted for
    the life of the header, so without this a failed attempt would still be on screen (with
    the typed password) the next time the dialog is opened.
  */
  useEffect(() => {
    if (!open) return;
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setError('');
    returnFocusRef.current = document.activeElement;
    // The card mounts with this effect, so wait a frame before reaching for the field.
    const id = requestAnimationFrame(() => emailRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open]);

  const close = () => {
    const target = returnFocusRef.current;
    onClose();
    // After the parent flips `open`, hand focus back. Guarded: the trigger can have been
    // unmounted in the meantime (the mobile drawer closes itself before opening this).
    if (target && typeof target.focus === 'function' && document.contains(target)) target.focus();
  };

  /*
    Escape closes, as it does for every other overlay on the site, and Tab is trapped inside
    the card — this is role="dialog" aria-modal="true", so letting focus wander out to the
    page behind it would make the modal a lie to a screen reader.
  */
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== 'Tab' || !cardRef.current) return;
      const focusable = cardRef.current.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /*
    No body-scroll lock. Neither JobApplicationModal nor HeaderSearch locks it, and
    introducing it for one dialog would make this the only overlay on the site that shifts
    the page underneath when it opens.
  */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login({ email, password });
    if (res.ok) {
      onClose();
      navigate('/admin');
    } else {
      // Map the context's CODE to our own copy rather than showing its `error` string. That
      // string is English-only and, for the non-401 case, names the backend port — fine for the
      // admin console it was written for, wrong for a public header rendered in twelve languages.
      const byCode = { invalid: 'auth.errInvalid', unreachable: 'auth.errUnreachable' };
      setError(t(byCode[res.code] || 'auth.failed'));
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="signin-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] overflow-y-auto p-4"
          role="dialog"
          aria-modal="true"
          aria-label={t('auth.title')}
        >
          <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm" onClick={close} />

          <div className="flex min-h-full items-center justify-center">
            <motion.div
              ref={cardRef}
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 w-full max-w-md rounded-card bg-white p-7 shadow-2xl"
            >
              <button
                type="button"
                onClick={close}
                aria-label={t('auth.close')}
                className="absolute right-4 top-4 text-[13px] font-bold uppercase tracking-[0.12em] text-muted transition-colors hover:text-navy-700"
              >
                {t('auth.close')}
              </button>

              <span className="eyebrow text-primary-darker">{t('auth.eyebrow')}</span>
              <h2 className="mt-1 pr-20 font-display text-xl font-bold text-text">
                {t('auth.title')}
              </h2>
              <p className="mt-2 text-body-compact text-muted">{t('auth.subtitle')}</p>

              <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
                <div>
                  <label htmlFor="signin-email" className="text-sm font-medium text-navy-800">
                    {t('auth.email')}
                  </label>
                  <input
                    ref={emailRef}
                    id="signin-email"
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 w-full rounded-card border border-navy-100 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                  />
                </div>

                <div>
                  {/* The show/hide control is a word, not an eye glyph — same rule as the
                      header's search and menu controls. It sits on the label row so it does
                      not overlap the field's own text. */}
                  <div className="flex items-baseline justify-between">
                    <label htmlFor="signin-password" className="text-sm font-medium text-navy-800">
                      {t('auth.password')}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted transition-colors hover:text-navy-900"
                    >
                      {showPassword ? t('auth.hide') : t('auth.show')}
                    </button>
                  </div>
                  <input
                    id="signin-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1.5 w-full rounded-card border border-navy-100 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                  />
                </div>

                {error && (
                  <p role="alert" className="rounded-card bg-red-50 px-3 py-2 text-body-compact text-red-700">
                    {error}
                  </p>
                )}

                {/* `primary-dark`, not `primary`: #3A86C6 is 3.89:1 and cannot carry a white
                    label. See the contrast note in tailwind.config.js. */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-1 w-full rounded-card bg-primary-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-darker disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? t('auth.submitting') : t('auth.submit')}
                </button>
              </form>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
