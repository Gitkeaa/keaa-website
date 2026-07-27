import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { MessageSquare, Star } from 'lucide-react';
import Button from './ui/Button';
import EmailField from './ui/EmailField';
import WordLimitTextarea from './ui/WordLimitTextarea';
import { submitPublicForm } from '../data/adminApi';
import { getCookieConsent, CONSENT_EVENT } from './CookieConsent';
import { EASE } from '../lib/motion';
import { isPrerender } from '../lib/prerender';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { useFocusTrap } from '../hooks/useFocusTrap';

/**
 * Site-wide visitor feedback: a permanent right-edge tab, a once-per-session nudge, and the
 * drawer both of them open.
 *
 * Mounted once in App.jsx behind the `!isAdmin` gate, alongside AiChat — the admin console
 * has its own SOP/help channel and must never show a public feedback form.
 *
 * WHY THE TRIGGER IS A RIGHT-EDGE TAB
 * -----------------------------------
 * A slim tab pinned to the middle of the right edge collides with nothing: it clears the
 * bottom corners (chat launcher, back-to-top and this widget's own nudge) and the consent bar
 * that runs across the bottom on a first visit. See HeroMediaNav.jsx for the shared-corner notes.
 *
 * WHY THE NUDGE IS BOTTOM-LEFT, AND WHY IT SITS ABOVE A BUTTON HEIGHT
 * ------------------------------------------------------------------
 * The bottom-left corner always holds a floating button: back-to-top on desktop, and the chat
 * launcher on mobile (where back-to-top is hidden and the launcher moves left). Either way the
 * nudge shares that corner, so it is lifted by roughly one button's worth of height (NUDGE_LIFT)
 * to stack cleanly ABOVE it. Drop NUDGE_LIFT back to 0 if that corner ever clears.
 *
 * PRERENDER
 * ---------
 * This portals into <body>, i.e. outside #root, so it MUST render nothing while the build-time
 * prerenderer is snapshotting — otherwise every prerendered page ships a dead, handler-less
 * copy of the tab sitting under the live one. See CookieConsent.jsx, the reference
 * implementation, and `inject` in vite.config.js.
 */

/** Where a submission goes. The backend route is specified in BACKEND_FEEDBACK.md. */
const ENDPOINT = '/api/feedback';

/**
 * Session-scoped record that the nudge has had its turn: 'dismissed' after "Not now",
 * 'engaged' once the drawer has been opened from it, 'sent' after a submission. Any value
 * silences the nudge for the rest of the tab session. sessionStorage, not localStorage —
 * "never again during the same session" is exactly what the spec asks for, and it keeps the
 * key out of the long-lived storage the cookie policy enumerates as persistent.
 */
const NUDGE_KEY = 'keaa:feedback-nudge';

/** Dwell time before the nudge offers itself, and the scroll depth that offers it sooner. */
const DWELL_MS = 150000; // 2.5 minutes
const SCROLL_TRIGGER = 0.7; // 70% of the page

/**
 * How far the nudge is lifted off the bottom edge so it clears the bottom-left button beneath
 * it (an h-12/h-14 button at bottom-6 → its top is ~5rem up; this leaves a small gap above).
 * See the note at the top of the file.
 */
const NUDGE_LIFT = '4.75rem';

const MAX_WORDS = 200;

const FEEDBACK_TYPES = [
  { value: 'suggestion', label: 'Suggestion' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'issue', label: 'Report an Issue' },
  { value: 'compliment', label: 'Compliment' },
];

/** Spoken form of each star count, announced to screen readers and shown beside the row. */
const RATING_LABELS = ['Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

const readNudgeState = () => {
  try {
    return window.sessionStorage.getItem(NUDGE_KEY);
  } catch {
    // Private mode / storage disabled. Treat as "not yet shown"; the worst case is that the
    // nudge returns on a later page view, which is better than throwing.
    return null;
  }
};

const silenceNudge = (reason) => {
  try {
    window.sessionStorage.setItem(NUDGE_KEY, reason);
  } catch {
    /* storage unavailable — the in-memory flag below still holds for this page view */
  }
};

/** Good enough to catch a typo, deliberately not an RFC 5322 parser. */
const looksLikeEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

const EMPTY_FORM = {
  rating: 0,
  type: 'feedback',
  message: '',
  name: '',
  email: '',
  contact: 'no',
};

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [nudgeArmed, setNudgeArmed] = useState(false);
  const [nudgeSilenced, setNudgeSilenced] = useState(true);
  const [consentDecided, setConsentDecided] = useState(false);

  const [form, setForm] = useState(EMPTY_FORM);
  const [hovered, setHovered] = useState(0);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [sent, setSent] = useState(false);

  const panelRef = useRef(null);
  const openerRef = useRef(null);
  const reduce = useReducedMotion();

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  /* Read the session record once on mount. It cannot be the useState initialiser: this
     component is lazy-loaded into a client render, but keeping storage access inside an
     effect matches the rest of the site and stays safe if it is ever rendered earlier. */
  useEffect(() => {
    setNudgeSilenced(Boolean(readNudgeState()));
  }, []);

  /* The nudge must not stack on top of the cookie bar. A first-time visitor already has one
     decision in front of them; asking for feedback in the same corner of the same screen is
     how a site earns two dismissals instead of one answer. Once a decision exists (or is made
     in another tab) the nudge becomes eligible. */
  useEffect(() => {
    const sync = () => setConsentDecided(Boolean(getCookieConsent()));
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CONSENT_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  /* Arm the nudge on whichever comes first: 2.5 minutes on the site, or 70% down a page.
     Both listeners are torn down the moment it arms, so a long session costs one timer and
     nothing else. */
  useEffect(() => {
    if (isPrerender() || nudgeSilenced || nudgeArmed) return undefined;

    const timer = setTimeout(() => setNudgeArmed(true), DWELL_MS);
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      // Guard the divide: a viewport-height page has max === 0 and would arm instantly.
      if (max > 0 && window.scrollY / max >= SCROLL_TRIGGER) setNudgeArmed(true);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, [nudgeSilenced, nudgeArmed]);

  const dismissNudge = useCallback((reason) => {
    silenceNudge(reason);
    setNudgeSilenced(true);
    setNudgeArmed(false);
  }, []);

  const openDrawer = useCallback(
    (opener) => {
      // Remember what to hand focus back to on close. The nudge unmounts as it opens the
      // drawer, so its button would be detached by then; the tab is always in the document.
      openerRef.current = opener === 'nudge' ? null : document.activeElement;
      if (opener === 'nudge') dismissNudge('engaged');
      setOpen(true);
    },
    [dismissNudge]
  );

  /* Close, and put focus back where it came from. `isConnected` matters: the opener may have
     unmounted while the drawer was up, and focusing a detached node silently drops focus to
     <body>, stranding a keyboard user at the top of the document. */
  const closeDrawer = useCallback(() => {
    setOpen(false);
    setSendError('');
    const el = openerRef.current;
    if (el?.isConnected && typeof el.focus === 'function') el.focus();
    else document.getElementById('main-content')?.focus();
  }, []);

  /* Escape closes, Tab cycles within the panel, and the page behind is scroll-locked — what
     makes the panel's aria-modal="true" actually true. Layout also owns body.overflow (mobile
     drawer), so the lock restores the previous value rather than clearing it. */
  useBodyScrollLock(open);
  useFocusTrap(panelRef, { active: open, onEscape: closeDrawer });

  /** Where to send focus for each thing that can be wrong, in the order the form asks for it. */
  const ERROR_TARGETS = [
    ['rating', 'input[name="feedback-rating"]'],
    ['message', '#feedback-message'],
    ['email', '#feedback-email'],
  ];

  const validate = () => {
    const next = {};
    if (!form.rating) next.rating = 'Please choose a rating.';
    if (!form.message.trim()) next.message = 'Please tell us a little more.';
    // Asking us to reply without leaving an address is the one combination that cannot work,
    // so the address is required only in that case. Everything else stays optional.
    if (form.contact === 'yes' && !form.email.trim()) {
      next.email = 'We need an email address to reply to you.';
    } else if (form.email.trim() && !looksLikeEmail(form.email)) {
      next.email = 'That email address does not look right.';
    }
    setErrors(next);

    /* Take the visitor to the first problem. The form is taller than the drawer and the submit
       button is pinned to the bottom, so an error on a field that happens to be scrolled out of
       sight reads as "the button does nothing" — which is how a filled-in form gets abandoned. */
    const first = ERROR_TARGETS.find(([key]) => next[key]);
    if (first) {
      const el = panelRef.current?.querySelector(first[1]);
      // The rating inputs are `sr-only`, so scroll the labelled group rather than the input
      // itself, and focus the input separately so keyboard users land on the control.
      (el?.closest('fieldset') || el)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      el?.focus({ preventScroll: true });
    }

    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSending(true);
    setSendError('');
    try {
      await submitPublicForm(ENDPOINT, {
        rating: form.rating,
        type: form.type,
        message: form.message.trim(),
        name: form.name.trim(),
        email: form.email.trim(),
        // Whether they asked to be contacted back, kept as its own field so the desk that
        // picks this up knows whether a reply was invited.
        contactConsent: form.contact === 'yes',
        // Which page prompted it. Without this, "the download link is broken" is unactionable.
        pageUrl: `${window.location.pathname}${window.location.search}`,
      });
      silenceNudge('sent');
      setNudgeSilenced(true);
      setSent(true);
    } catch {
      setSendError('Could not send your feedback. Please try again in a moment.');
    } finally {
      setSending(false);
    }
  };

  const startAnother = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setSent(false);
  };

  // Every hook has run; only now is it safe to bail out of rendering.
  if (isPrerender()) return null;

  const shownRating = hovered || form.rating;
  const showNudge = nudgeArmed && !nudgeSilenced && !open && consentDecided;

  /* ---------------------------------------------------------------- *
   * The permanent trigger: a slim tab on the right edge.
   * ---------------------------------------------------------------- */
  const tab = (
    <AnimatePresence>
      {!open && (
        <motion.button
          type="button"
          key="feedback-tab"
          initial={reduce ? { opacity: 0 } : { opacity: 0, x: 24 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, x: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, x: 24 }}
          transition={{ duration: 0.3, ease: EASE }}
          onClick={() => openDrawer('tab')}
          aria-haspopup="dialog"
          className="group fixed right-0 top-1/2 z-40 flex -translate-y-1/2 flex-col items-center gap-2.5 rounded-l-card border border-r-0 border-primary/50 bg-navy-800 py-4 pl-2.5 pr-2 shadow-lg transition-colors hover:bg-navy-900"
        >
          <MessageSquare aria-hidden className="h-4 w-4 shrink-0 text-primary-light" />
          <span className="text-[13px] font-bold uppercase tracking-[0.12em] text-white [writing-mode:vertical-rl]">
            Feedback
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );

  /* ---------------------------------------------------------------- *
   * The nudge. Bottom-LEFT, above the consent bar while it is showing.
   * ---------------------------------------------------------------- */
  const nudge = (
    <AnimatePresence>
      {showNudge && (
        <motion.div
          key="feedback-nudge"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.35, ease: EASE }}
          role="status"
          aria-live="polite"
          /* Lifted by NUDGE_LIFT so it stacks above the bottom-left button. And
             `--consent-bar-h` is published by CookieConsent while the bar is up and removed
             once a decision is stored, so the 0px fallback is the normal case. */
          style={{ bottom: `calc(1.5rem + ${NUDGE_LIFT} + var(--consent-bar-h, 0px))` }}
          className="fixed left-4 z-40 w-[320px] max-w-[calc(100vw-2rem)] rounded-card border border-border bg-white p-5 shadow-cardHover transition-[bottom] duration-300 sm:left-6"
        >
          <p className="font-display text-body-compact font-bold leading-snug text-text">
            Enjoying your experience?
          </p>
          <p className="mt-1 text-sm text-muted">Help us improve.</p>

          <div className="mt-4 flex items-center gap-2">
            <Button size="sm" onClick={() => openDrawer('nudge')} className="flex-1">
              Share Feedback
            </Button>
            <button
              type="button"
              onClick={() => dismissNudge('dismissed')}
              className="rounded-card px-3 py-2 text-sm font-semibold text-muted transition-colors hover:bg-navy-50 hover:text-navy-700"
            >
              Not now
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  /* ---------------------------------------------------------------- *
   * The drawer.
   * ---------------------------------------------------------------- */
  const drawer = (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeDrawer}
            className="absolute inset-0 bg-navy-950/60"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-title"
            tabIndex={-1}
            initial={reduce ? { opacity: 0 } : { x: '100%' }}
            animate={reduce ? { opacity: 1 } : { x: 0 }}
            exit={reduce ? { opacity: 0 } : { x: '100%' }}
            transition={{ duration: 0.32, ease: EASE }}
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl focus:outline-none"
          >
            <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
              <div>
                <h2 id="feedback-title" className="font-display text-lg font-bold text-text">
                  Share Your Feedback
                </h2>
                <p className="mt-1 text-sm text-muted">Help us improve your experience.</p>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="flex h-9 shrink-0 items-center justify-center rounded-card border border-border px-3 text-[13px] font-bold uppercase tracking-[0.12em] text-navy-700 transition-colors hover:border-primary/40 hover:bg-navy-50"
              >
                Close
              </button>
            </div>

            {sent ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <p className="font-display text-xl font-bold text-text">Thank you.</p>
                <p className="mt-2 text-sm text-ink">
                  Your feedback has reached our team. If you asked us to get back to you, we
                  will be in touch.
                </p>
                <div className="mt-7 flex items-center gap-3">
                  <Button onClick={closeDrawer}>Done</Button>
                  <button
                    type="button"
                    onClick={startAnother}
                    className="rounded-card px-3 py-2 text-sm font-semibold text-primary-dark transition-colors hover:bg-navy-50"
                  >
                    Send another
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="flex flex-1 flex-col overflow-hidden">
                <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
                  {/* Rating. Real radio inputs, visually replaced by stars: the native control
                      brings arrow-key selection, form semantics and screen-reader announcement
                      for free, none of which a row of <button>s would have. */}
                  <fieldset>
                    <legend className="text-sm font-medium text-navy-800">
                      Overall Experience <span className="text-red-500">*</span>
                    </legend>
                    <div
                      className="mt-2 flex items-center gap-1"
                      onMouseLeave={() => setHovered(0)}
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <label
                          key={n}
                          onMouseEnter={() => setHovered(n)}
                          className="cursor-pointer p-1"
                        >
                          <input
                            type="radio"
                            name="feedback-rating"
                            value={n}
                            checked={form.rating === n}
                            onChange={() => {
                              set('rating', n);
                              setErrors((e) => ({ ...e, rating: undefined }));
                            }}
                            className="peer sr-only"
                          />
                          <Star
                            aria-hidden
                            className={`h-7 w-7 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 ${
                              n <= shownRating
                                ? 'fill-primary-dark text-primary-dark'
                                : 'fill-transparent text-navy-200'
                            }`}
                          />
                          <span className="sr-only">
                            {n} out of 5, {RATING_LABELS[n - 1]}
                          </span>
                        </label>
                      ))}
                      {shownRating > 0 && (
                        <span className="ml-2 text-sm font-medium text-muted">
                          {RATING_LABELS[shownRating - 1]}
                        </span>
                      )}
                    </div>
                    {errors.rating && (
                      <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.rating}</p>
                    )}
                  </fieldset>

                  <fieldset>
                    <legend className="text-sm font-medium text-navy-800">
                      What would you like to share?
                    </legend>
                    <div className="mt-2 space-y-1">
                      {FEEDBACK_TYPES.map((t) => (
                        <label
                          key={t.value}
                          className={`flex cursor-pointer items-center gap-3 rounded-card px-3 py-2.5 text-sm transition-colors ${
                            form.type === t.value
                              ? 'bg-primary/[0.06] font-semibold text-navy-900'
                              : 'text-ink hover:bg-navy-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="feedback-type"
                            value={t.value}
                            checked={form.type === t.value}
                            onChange={() => set('type', t.value)}
                            className="h-4 w-4 shrink-0 accent-primary-dark"
                          />
                          {t.label}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <div>
                    <WordLimitTextarea
                      id="feedback-message"
                      label="Message"
                      required
                      rows={5}
                      maxWords={MAX_WORDS}
                      value={form.message}
                      onChange={(v) => {
                        set('message', v);
                        if (v.trim()) setErrors((e) => ({ ...e, message: undefined }));
                      }}
                      placeholder="Tell us what worked well, or what got in your way."
                    />
                    {errors.message && (
                      <p className="mt-0.5 text-xs font-semibold text-red-600">{errors.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="feedback-name" className="text-sm font-medium text-navy-800">
                      Your Name <span className="text-muted">(optional)</span>
                    </label>
                    <input
                      id="feedback-name"
                      type="text"
                      autoComplete="name"
                      value={form.name}
                      onChange={(e) => set('name', e.target.value)}
                      className="mt-1.5 w-full rounded-card border border-navy-100 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                    />
                  </div>

                  <div>
                    <EmailField
                      id="feedback-email"
                      label={
                        form.contact === 'yes' ? 'Email Address' : 'Email Address (optional)'
                      }
                      required={form.contact === 'yes'}
                      value={form.email}
                      onChange={(v) => {
                        set('email', v);
                        setErrors((e) => ({ ...e, email: undefined }));
                      }}
                    />
                    {errors.email && (
                      <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.email}</p>
                    )}
                  </div>

                  {/* One question, two answers, so radios rather than the pair of checkboxes
                      the sketch showed: two checkboxes let a visitor tick both Yes and No. */}
                  <fieldset>
                    <legend className="text-sm font-medium text-navy-800">
                      Would you like us to contact you?
                    </legend>
                    <div className="mt-2 flex items-center gap-6">
                      {[
                        { value: 'yes', label: 'Yes' },
                        { value: 'no', label: 'No' },
                      ].map((opt) => (
                        <label
                          key={opt.value}
                          className="flex cursor-pointer items-center gap-2.5 text-sm text-ink"
                        >
                          <input
                            type="radio"
                            name="feedback-contact"
                            value={opt.value}
                            checked={form.contact === opt.value}
                            onChange={() => {
                              set('contact', opt.value);
                              setErrors((e) => ({ ...e, email: undefined }));
                            }}
                            className="h-4 w-4 accent-primary-dark"
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                    {form.contact === 'yes' && (
                      <p className="mt-2 text-xs text-muted">
                        We will use your address only to reply to this feedback.
                      </p>
                    )}
                  </fieldset>
                </div>

                <div className="border-t border-border px-6 py-5">
                  {sendError && (
                    <p role="alert" className="mb-3 text-sm font-semibold text-red-600">
                      {sendError}
                    </p>
                  )}
                  <Button type="submit" disabled={sending} className="w-full">
                    {sending ? 'Sending…' : 'Submit Feedback'}
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // Portalled to <body> so nothing here can be clipped by a transformed or
  // overflow-hidden ancestor in the page tree.
  return createPortal(
    <>
      {tab}
      {nudge}
      {drawer}
    </>,
    document.body
  );
}
