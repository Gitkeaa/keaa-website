import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Button from './ui/Button';
import { EASE } from '../lib/motion';
import { isPrerender } from '../lib/prerender';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { useFocusTrap } from '../hooks/useFocusTrap';

/**
 * Site-wide cookie consent: a full-bleed bottom bar plus a granular preferences dialog.
 *
 * Mounted once in components/Layout.jsx, which wraps only the PUBLIC routes — the admin
 * console is outside that layout and deliberately never shows a consent gate.
 *
 * Deliberately icon-free: the bar and the dialog are pure type, so nothing competes with
 * the copy. Affordances that would normally be glyphs (the dialog's close control) are
 * text instead.
 *
 * How the consent is actually honoured
 * ------------------------------------
 * The choice is persisted to localStorage under STORAGE_KEY, broadcast on CONSENT_EVENT,
 * and READ by `useConsent()` below. It is not decorative: the Google Maps embed on the
 * Contact page is mounted only when `embeds` is true, and unmounts again if consent is
 * withdrawn. Anything third-party added later must go through the same hook:
 *
 *   import { useConsent } from '../components/CookieConsent'
 *   const allowed = useConsent('embeds')     // re-renders when the decision changes
 *   {allowed ? <iframe …/> : <ClickToLoad …/>}
 *
 * IT FAILS CLOSED. No stored decision, an expired one, or a record from an older version
 * all read as "not allowed", so a new third party can never load on the strength of an old
 * or absent answer.
 *
 * Things that CANNOT be gated here, and so were removed rather than gated: anything loaded
 * from index.html's <head> fires before this module exists. The webfonts used to sit there
 * and are now self-hosted (see the @font-face block in src/index.css).
 *
 * Bump CONSENT_VERSION whenever the categories below change: an older record is treated as
 * "no decision", so every visitor is asked again rather than silently inheriting consent
 * they never gave for a new category.
 *
 * `necessary` is always true and is not user-switchable. It covers routing, security, form
 * submission, and the two preference keys the site writes only when the visitor explicitly
 * picks them (`keaa.language`, `keaa.locale`) — user-requested settings, which are exempt
 * under ePrivacy Art. 5(3) rather than a "personalisation" category that gates nothing.
 */

const STORAGE_KEY = 'keaa:cookie-consent';
/**
 * v2: the old `analytics` / `personalization` pair was replaced by `embeds`.
 * Neither of the old two governed anything — no analytics tool exists, and the language
 * and region keys were written regardless of the toggle — so the dialog was asking about
 * processing that did not happen while the one real third party went ungated.
 */
const CONSENT_VERSION = 2;
/**
 * Consent is a decision, not a permanent grant. EU guidance converges on refreshing it at
 * least every 6-12 months; 180 days is the conservative end. An expired record reuses the
 * existing "no decision" path, so the bar simply reappears.
 */
const CONSENT_MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000;

/** Fired on window whenever a consent decision is saved. `detail` is the record. */
export const CONSENT_EVENT = 'keaa:cookie-consent-change';
/** Fired on window to reopen the preferences dialog (the footer link uses this). */
export const OPEN_PREFERENCES_EVENT = 'keaa:open-cookie-preferences';

/** Reopen the preferences dialog from anywhere (e.g. the footer's "Cookie Preferences"). */
export function openCookiePreferences() {
  window.dispatchEvent(new Event(OPEN_PREFERENCES_EVENT));
}


/**
 * A decision that is still valid, or null. Null means "ask again" and, for every gate,
 * "not allowed" — the three ways a record stops counting are handled here in one place so
 * no caller has to remember them: it does not exist, it predates the current categories,
 * or it has aged out.
 *
 * `savedAt` is parsed defensively: `Date.parse` returns NaN for a malformed value and
 * `NaN > x` is false, so a corrupt timestamp would otherwise read as "fresh forever".
 */
export function getCookieConsent() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== CONSENT_VERSION) return null;

    const savedAt = Date.parse(parsed.savedAt);
    if (Number.isNaN(savedAt)) return null;
    if (Date.now() - savedAt > CONSENT_MAX_AGE_MS) return null;

    return parsed;
  } catch {
    // Private mode / storage disabled: behave as "not decided" rather than throwing.
    return null;
  }
}

/**
 * Is `category` allowed right now? Fails closed on a missing/expired/stale record, and
 * `necessary` is always true. This is the one function gates should call.
 */
export function isAllowed(category) {
  if (category === 'necessary') return true;
  const record = getCookieConsent();
  return Boolean(record && record[category]);
}

/**
 * React binding for `isAllowed`, re-rendering when the decision changes so an embed
 * appears the moment consent is given and disappears the moment it is withdrawn.
 */
export function useConsent(category) {
  const [allowed, setAllowed] = useState(() => isAllowed(category));

  useEffect(() => {
    const sync = () => setAllowed(isAllowed(category));
    sync(); // the record may have been written before this component mounted
    window.addEventListener(CONSENT_EVENT, sync);
    // A decision made in another tab should apply here too.
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CONSENT_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [category]);

  return allowed;
}

function persistConsent(choices) {
  const record = {
    version: CONSENT_VERSION,
    necessary: true,
    embeds: !!choices.embeds,
    savedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Storage unavailable — still broadcast so this page session honours the choice.
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: record }));
  return record;
}

/**
 * The categories describe what this site ACTUALLY does — nothing aspirational.
 *
 * There is no "Analytics" entry because the site runs no analytics, tag manager or pixel;
 * offering the toggle implied processing that does not happen. There is no
 * "Personalization" entry because the only preferences stored are the language and region
 * the visitor explicitly picks, which belong under Strictly Necessary. Add a category in
 * the same change that adds the tool it governs, and bump CONSENT_VERSION with it.
 */
const CATEGORIES = [
  {
    key: 'necessary',
    title: 'Strictly Necessary',
    desc: 'Required for the site to work: navigation, security, form submission, and remembering the language and region you choose. These cannot be switched off and involve no third party.',
    locked: true,
  },
  {
    key: 'embeds',
    title: 'External Content',
    desc: 'Lets us show content hosted by others, currently the Google Map on our Contact page. Turning this on shares your IP address with Google. With it off, we show the address and a plain link instead.',
  },
];

/**
 * Accessible on/off switch. `role="switch"` so screen readers announce the state.
 *
 * The locked "Strictly Necessary" switch uses `aria-disabled`, NOT the native `disabled`
 * attribute. A natively disabled button is removed from the tab order entirely, so a
 * keyboard user tabbing the dialog would never encounter the row and would have no way to
 * learn that the category exists and is always on. `aria-disabled` keeps it focusable and
 * announced as dimmed; the handler is what actually refuses the change.
 */
function Toggle({ checked, onChange, disabled = false, label, describedBy }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-disabled={disabled || undefined}
      aria-describedby={describedBy}
      onClick={() => {
        if (!disabled) onChange(!checked);
      }}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 ${
        checked ? 'bg-primary-dark' : 'bg-navy-200'
      } ${disabled ? 'cursor-not-allowed opacity-55' : 'cursor-pointer'}`}
    >
      <span
        aria-hidden
        className={`inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-[23px]' : 'translate-x-[3px]'
        }`}
      />
    </button>
  );
}

export default function CookieConsent() {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [draft, setDraft] = useState({ embeds: false });

  const panelRef = useRef(null);
  const barRef = useRef(null);
  const restoreFocusRef = useRef(null);
  // Mirrors prefsOpen for the OPEN_PREFERENCES listener, which must not re-register on
  // every open/close just to read the current state.
  const prefsOpenRef = useRef(false);
  useEffect(() => {
    prefsOpenRef.current = prefsOpen;
  }, [prefsOpen]);

  // Read storage after mount so the first paint is never blocked by it.
  useEffect(() => {
    if (isPrerender()) return;
    setMounted(true);
    const saved = getCookieConsent();
    if (saved) {
      setDraft({ embeds: !!saved.embeds });
    } else {
      setBannerOpen(true);
    }
  }, []);

  const openPreferences = useCallback(() => {
    // Only capture the restore target on a REAL open. Re-firing the event while the dialog
    // is already open would otherwise overwrite it with a node inside the dialog, which is
    // about to unmount — and focus would land nowhere on close.
    if (!prefsOpenRef.current) restoreFocusRef.current = document.activeElement;
    // Seed the toggles from the saved decision so reopening shows the real state.
    const saved = getCookieConsent();
    if (saved) setDraft({ embeds: !!saved.embeds });
    setPrefsOpen(true);
  }, []);

  // The footer's "Cookie Preferences" link reaches us through this event, so no shared
  // state or context is needed between two unrelated corners of the tree.
  useEffect(() => {
    window.addEventListener(OPEN_PREFERENCES_EVENT, openPreferences);
    return () => window.removeEventListener(OPEN_PREFERENCES_EVENT, openPreferences);
  }, [openPreferences]);

  /**
   * Close and put focus back where it came from. `isConnected` matters: the element that
   * opened the dialog is often a banner button, and accepting/rejecting unmounts the banner
   * in the same tick — focusing a detached node silently drops focus to <body>, stranding
   * keyboard and screen-reader users at the top of the document. `#main-content` is the
   * fallback and already carries tabIndex={-1} (see components/A11y.jsx).
   */
  const closePreferences = useCallback(() => {
    setPrefsOpen(false);
    const el = restoreFocusRef.current;
    if (el?.isConnected && typeof el.focus === 'function') el.focus();
    else document.getElementById('main-content')?.focus();
  }, []);

  /** Every exit path saves, closes the dialog AND the bar, and restores focus. */
  const decide = useCallback(
    (choices) => {
      persistConsent(choices);
      setDraft({ embeds: !!choices.embeds });
      setBannerOpen(false);
      closePreferences();
    },
    [closePreferences]
  );

  const acceptAll = useCallback(() => decide({ embeds: true }), [decide]);

  /**
   * Refusing has to be one click, exactly like accepting.
   *
   * The reference design this bar is modelled on offers only "Accept" and "Settings" —
   * burying refusal one dialog deeper. Under GDPR/ePrivacy that is a recognised dark
   * pattern (the EDPB and CNIL have both ruled on it, and CNIL has fined for it), and it
   * matters here specifically: KEAA sells into the EU through the Eindhoven office, so EU
   * visitors are squarely in scope. Hence the third button.
   */
  const rejectAll = useCallback(() => decide({ embeds: false }), [decide]);

  const saveDraft = useCallback(() => decide(draft), [decide, draft]);

  /* Escape closes, Tab cycles within the panel, and the page behind is scroll-locked — what
     makes the panel's aria-modal="true" actually true. This dialog counts disabled inputs as
     focusable (plain `input`), so it passes its own selector. Layout also owns body.overflow
     (mega-menu, mobile drawer), so the lock restores the previous value rather than clearing it. */
  useBodyScrollLock(prefsOpen);
  useFocusTrap(panelRef, {
    active: prefsOpen,
    onEscape: closePreferences,
    selector: 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
  });

  /**
   * Publish the bar's height as `--consent-bar-h` so the fixed bottom-right widgets can sit
   * above it. The bar is `fixed` at the bottom and the chat launcher and back-to-top button
   * are `fixed bottom-6 right-6`, so the bar covered them — on a first visit the chat
   * button was unclickable, which is exactly when a visitor is most likely to want it.
   * Measured rather than hard-coded because the copy wraps to different heights by width.
   */
  useEffect(() => {
    const root = document.documentElement;
    if (!bannerOpen || !barRef.current) {
      root.style.removeProperty('--consent-bar-h');
      return undefined;
    }
    const el = barRef.current;
    const sync = () => root.style.setProperty('--consent-bar-h', `${el.offsetHeight}px`);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.removeProperty('--consent-bar-h');
    };
  }, [bannerOpen]);

  if (!mounted) return null;

  const banner = (
    <AnimatePresence>
      {bannerOpen && (
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.45, ease: EASE }}
          /* Full-bleed: spans the viewport edge to edge and pins to the bottom. The inner
             `container-page` keeps the copy on the site's shared gutter.

             Flat by design — a hairline top rule and no drop shadow. The bar is a notice,
             not a floating card, and the reference it is modelled on sits flush against
             the page the same way. */
          ref={barRef}
          className="fixed inset-x-0 bottom-0 z-[90] border-t border-border bg-white"
          role="region"
          aria-label="Cookie notice"
          /* Announced when it appears. Without this the bar is silent to a screen reader
             AND, being portalled after #root, is the very last thing in the tab order —
             so it could be neither heard nor easily reached. */
          aria-live="polite"
        >
          {/*
            Copy left, actions right — the reference's layout. There is no heading: the
            first sentence says what the bar is, and a "We Value Your Privacy" headline
            above it only pushed the actual information further down the bar.

            The button row wraps under the copy below `lg`, where a side-by-side split
            would leave the text about twelve characters wide on a phone.
          */}
          {/*
            `container-full`, not `container-page`: the notice runs edge to edge on the
            shared gutter instead of being centred inside the 1760px content column, which
            on a wide monitor left ~140px of dead margin on each side and squeezed the copy
            into four lines. No `max-w-*` on the paragraphs either — they take whatever the
            flex row leaves after the buttons, so the text sets in two lines.
          */}
          <div className="container-full flex flex-col gap-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
            <div className="min-w-0 flex-1 space-y-2.5">
              {/* The copy names the two REAL categories. It previously claimed "functional,
                  performance and targeting cookies" — three labels that matched neither the
                  dialog nor anything the site does, and "targeting" in particular described
                  advertising trackers that have never existed here. */}
              <p className="text-body-compact leading-[1.6] text-ink">
                This site uses local storage to work and to remember the language and region you
                choose. We also embed a Google Map on our Contact page, which shares your IP
                address with Google (that one is optional and off unless you allow it).
              </p>
              <p className="text-body-compact leading-[1.6] text-ink">
                Choose &ldquo;Cookie Settings&rdquo; to decide, or change your mind at any time
                via Cookie Preferences at the bottom of any page. See our{' '}
                <Link
                  to="/privacy-policy"
                  className="font-semibold text-primary-dark underline underline-offset-2 transition-colors hover:text-primary-darker"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>

            {/*
              Three actions, all one click. "Reject All" is not in the reference design —
              see the note on `rejectAll` for why it is here anyway. All three share a size
              and sit in one row, so refusing is visually no harder than accepting.
            */}
            <div className="flex flex-shrink-0 flex-wrap items-center gap-3">
              <Button variant="outlineNavy" onClick={openPreferences} className="justify-center">
                Cookie Settings
              </Button>
              <Button variant="outlineNavy" onClick={rejectAll} className="justify-center">
                Reject All
              </Button>
              <Button variant="primary" onClick={acceptAll} className="justify-center">
                I Accept
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const dialog = (
    <AnimatePresence>
      {prefsOpen && (
        <div className="fixed inset-0 z-[95] flex items-end justify-center p-4 sm:items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closePreferences}
            className="absolute inset-0 bg-surface-deep/60 backdrop-blur-sm"
            aria-hidden
          />

          <motion.div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-prefs-title"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-card bg-surface-raised shadow-[0_32px_80px_-24px_rgb(var(--color-text)_/_0.55)] ring-1 ring-border focus:outline-none"
          >
            <div className="flex items-start justify-between gap-4 border-b border-border p-6">
              <div>
                <h2
                  id="cookie-prefs-title"
                  className="font-display text-xl font-bold leading-tight text-text"
                >
                  Cookie Preferences
                </h2>
                <p className="mt-2 text-body-compact font-light leading-[1.7] text-text-muted">
                  Choose which cookies you allow. Strictly necessary cookies are always active.
                </p>
              </div>
              {/* Text, not a glyph — this dialog is deliberately icon-free. */}
              <button
                type="button"
                onClick={closePreferences}
                className="flex-shrink-0 rounded-card px-2 py-1 text-sm font-semibold text-text-muted transition-colors hover:text-text"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <ul className="space-y-4">
                {CATEGORIES.map(({ key, title, desc, locked }) => (
                  <li
                    key={key}
                    className="flex items-start gap-4 rounded-card bg-surface p-4 ring-1 ring-border"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-base font-bold text-text">{title}</h3>
                        {locked && (
                          <span className="rounded-full bg-navy-50 px-2 py-0.5 text-[11px] font-semibold text-navy-700">
                            Always on
                          </span>
                        )}
                      </div>
                      <p
                        id={`cookie-cat-${key}`}
                        className="mt-1 text-body-compact font-light leading-[1.7] text-text-muted"
                      >
                        {desc}
                      </p>
                    </div>
                    {/* The switch is labelled with the "(always on)" state folded in, and
                        described by the paragraph above, so a screen-reader user gets the
                        same information sighted users read from the badge and blurb. */}
                    <Toggle
                      label={locked ? `${title} (always on)` : title}
                      describedBy={`cookie-cat-${key}`}
                      checked={locked ? true : !!draft[key]}
                      disabled={locked}
                      onChange={(next) => setDraft((d) => ({ ...d, [key]: next }))}
                    />
                  </li>
                ))}
              </ul>
            </div>

            {/* Reject is offered here too, so the dialog cannot become a place where the
                only way out is to accept something. */}
            <div className="flex flex-col gap-3 border-t border-border p-6 sm:flex-row sm:justify-end">
              <Button variant="outlineNavy" onClick={rejectAll} className="justify-center">
                Reject All
              </Button>
              <Button variant="outlineNavy" onClick={saveDraft} className="justify-center">
                Save Preferences
              </Button>
              <Button variant="primary" onClick={acceptAll} className="justify-center">
                Accept All
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // Portalled to <body> so neither the bar nor the dialog can be trapped by a
  // transformed/overflow-hidden ancestor in the page tree.
  return createPortal(
    <>
      {banner}
      {dialog}
    </>,
    document.body,
  );
}
