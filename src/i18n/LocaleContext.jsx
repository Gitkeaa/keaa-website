import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_LANGUAGE, getLanguage, languages } from './languages';
import { strings } from './locales';

const STORAGE_KEY = 'keaa.language';

/**
 * True RTL is not enabled yet. Flipping `dir` mirrors text direction but this codebase
 * styles with Tailwind's PHYSICAL utilities (ml-*, pl-*, left-*, text-left), which do not
 * mirror — so `dir="rtl"` today produces a layout with the text flowing one way and the
 * furniture the other. Arabic still renders correctly as text (browsers resolve bidi inside
 * text nodes); enabling this flag is the last step of a dedicated RTL pass that swaps those
 * utilities for their logical equivalents (ms-*, ps-*, start-*, text-start).
 */
const RTL_LAYOUT_READY = false;

const LocaleContext = createContext(null);

/** The stored choice, or the closest match to the browser's language, or English. */
function resolveInitialLanguage() {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;

  /**
   * Guarded. `localStorage.getItem` THROWS — it does not return null — when storage is
   * blocked: Safari private browsing, and any browser where the user has disabled
   * third-party/site data. This runs inside the provider's lazy state initialiser at the
   * very top of the public tree, so an unguarded throw took the whole site down with a
   * blank page for those visitors. `setLanguage` already had this guard; the read did not.
   */
  let stored = null;
  try {
    stored = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    stored = null;
  }
  if (stored && languages.some((l) => l.code === stored)) return stored;

  // `navigator.languages` is ordered by preference; match on the base subtag so `de-AT`
  // and `pt-BR` still resolve to the German and Portuguese dictionaries.
  const preferred = window.navigator.languages || [window.navigator.language];
  for (const tag of preferred) {
    if (!tag) continue;
    const base = String(tag).toLowerCase().split('-')[0];
    const hit = languages.find((l) => l.code === base);
    if (hit) return hit.code;
  }
  return DEFAULT_LANGUAGE;
}

export function LocaleProvider({ children }) {
  // Lazy initialiser: reading localStorage/navigator once on mount, not on every render.
  const [language, setLanguageState] = useState(resolveInitialLanguage);

  const meta = getLanguage(language);

  /**
   * The <html> attributes are the functional payload of this provider: `lang` is what
   * screen readers switch voice on and what Google reads for language targeting, so it has
   * to track the choice even while body copy is still English.
   */
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('lang', language);
    root.setAttribute('dir', RTL_LAYOUT_READY && meta.rtl ? 'rtl' : 'ltr');
  }, [language, meta.rtl]);

  const setLanguage = useCallback((code) => {
    if (!languages.some((l) => l.code === code)) return;
    setLanguageState(code);
    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // Private-mode / storage-disabled browsers: the choice still applies for this
      // session, it just will not survive a reload. Not worth surfacing to the user.
    }
  }, []);

  /**
   * Look up a key in the active locale, falling back to English, then to the key itself.
   * The English fallback is what lets a partially-translated locale ship safely — an
   * untranslated key renders real English copy rather than a missing-string placeholder.
   */
  const t = useCallback(
    (key) => {
      const active = strings[language];
      if (active && active[key] != null) return active[key];
      const base = strings[DEFAULT_LANGUAGE];
      if (base && base[key] != null) return base[key];
      return key;
    },
    [language]
  );

  const value = useMemo(
    () => ({ language, setLanguage, t, meta, languages }),
    [language, setLanguage, t, meta]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used inside <LocaleProvider>');
  return ctx;
}

/** Sugar for the common case — `const t = useT()` then `t('nav.home')`. */
export function useT() {
  return useLocale().t;
}
