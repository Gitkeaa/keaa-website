import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY as STORAGE_KEY,
  getLanguage,
  isLiveLocale,
  languages,
  localePrefixOf,
} from './languages';
import { strings } from './locales';

/**
 * True RTL is not enabled yet. Flipping `dir` mirrors text direction but this codebase
 * styles with Tailwind's PHYSICAL utilities (ml-*, pl-*, left-*, text-left), which do not
 * mirror — so `dir="rtl"` today produces a layout with the text flowing one way and the
 * furniture the other. Arabic still renders correctly as text (browsers resolve bidi inside
 * text nodes); enabling this flag is the last step of a dedicated RTL pass that swaps those
 * utilities for their logical equivalents (ms-*, ps-*, start-*, text-start).
 */
const RTL_LAYOUT_READY = false;

/**
 * Content dictionaries, one file per LIVE language, lazy so a visitor downloads only the
 * language they are reading. Each exports a flat map of namespaced keys:
 *   export default { 'home.hero.title': 'Wir bauen…', 'about.story.p1': '…' }
 * English has no file here on purpose — the English copy lives inline in the components as
 * the fallback argument of lt(), so the English render path never depends on this folder.
 */
const contentModules = import.meta.glob('./content/*.js');

function loadContent(code) {
  const loader = contentModules[`./content/${code}.js`];
  return loader ? loader().then((m) => m.default || {}) : Promise.resolve({});
}

const LocaleContext = createContext(null);

/**
 * The URL is the strongest signal: /de/about IS the German site, whatever is stored.
 * Read once — the prefix cannot change without a full navigation (see App.jsx basename).
 */
const URL_LOCALE = typeof window === 'undefined' ? '' : localePrefixOf(window.location.pathname).slice(1);

/** The stored choice, or the closest match to the browser's language, or English. */
function resolveInitialLanguage() {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  if (URL_LOCALE) return URL_LOCALE;

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

const persistLanguage = (code) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // Private-mode / storage-disabled browsers: the choice still applies for this
    // session, it just will not survive a reload. Not worth surfacing to the user.
  }
};

/** '/de/about?x#y' with prefix '/de' → '/about?x#y'; already-bare paths pass through. */
function swapLocaleUrl(targetCode) {
  const { pathname, search, hash } = window.location;
  const base = pathname.slice(localePrefixOf(pathname).length) || '/';
  const prefix = targetCode === DEFAULT_LANGUAGE ? '' : `/${targetCode}`;
  return `${prefix}${base}${search}${hash}`;
}

export function LocaleProvider({ children }) {
  // Lazy initialiser: reading localStorage/navigator once on mount, not on every render.
  const [language, setLanguageState] = useState(resolveInitialLanguage);

  /**
   * The active language's content dictionary. Loaded only when the URL carries a live
   * locale — a coming-soon language deliberately does NOT load one, its body stays English
   * with the notice strip explaining why (see LanguageNotice).
   *
   * On a locale URL the children are held back until the dictionary is in (see the return
   * below): rendering them early would paint one English frame and, worse, let a page fire
   * the prerender-ready event before its translations exist, baking English into the
   * prerendered German HTML.
   */
  const [content, setContent] = useState(() => (URL_LOCALE ? null : {}));

  useEffect(() => {
    if (!URL_LOCALE) return;
    let alive = true;
    loadContent(URL_LOCALE).then((dict) => {
      if (alive) setContent(dict);
    });
    return () => {
      alive = false;
    };
  }, []);

  /**
   * A visitor with a stored live-language choice who lands on a bare English URL (a shared
   * link, a Google result) is moved to their language's URL space once, on first load.
   * `replace` keeps the English URL out of their history. Crawlers and first-time visitors
   * carry no stored choice, so they are never redirected — Google always sees /about and
   * /de/about as two stable, separate pages.
   */
  useEffect(() => {
    if (URL_LOCALE || typeof window === 'undefined') return;
    let stored = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      return;
    }
    if (stored && isLiveLocale(stored)) window.location.replace(swapLocaleUrl(stored));
  }, []);

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
    persistLanguage(code);

    /**
     * A live language owns a URL space, so entering or leaving one is a full navigation:
     * the router's basename is fixed at load (see App.jsx), and the navigation also lands
     * the visitor on the same page in the other language — which is what "switch language"
     * means. Everything else (coming-soon languages, and en chosen while already on bare
     * URLs) stays the in-place chrome switch it always was.
     */
    const needsUrlMove = isLiveLocale(code) || (URL_LOCALE && code === DEFAULT_LANGUAGE);
    if (needsUrlMove) {
      window.location.assign(swapLocaleUrl(code));
      return;
    }

    // Load translations for non-live languages on demand
    if (code !== DEFAULT_LANGUAGE && !isLiveLocale(code)) {
      loadContent(code).then((dict) => {
        setContent(dict);
        setLanguageState(code);
      });
    } else {
      // For English, no translations needed
      setContent({});
      setLanguageState(code);
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
    () => ({ language, setLanguage, t, meta, languages, content, urlLocale: URL_LOCALE }),
    [language, setLanguage, t, meta, content]
  );

  // Locale URL, dictionary still loading — hold the tree (see the `content` note above).
  if (content === null) return null;

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

/**
 * The content translator: `const lt = useLT('about')` then `lt('hero.title', 'Our Story')`.
 *
 * The English copy STAYS INLINE in the component as the second argument — it is the
 * fallback and the source of truth, so the English site renders the exact same strings it
 * always did whether or not any dictionary exists. A translation wins only when the active
 * locale's content file carries the namespaced key ('about.hero.title').
 *
 * `{name}`-style placeholders are interpolated from the optional third argument, so
 * translated sentences can reorder them freely.
 */
export function useLT(ns) {
  const { content } = useLocale();
  return useCallback(
    (key, english, vars) => {
      /**
       * Build-tooling hook, inert for visitors: scripts/harvest-lt-keys.mjs drives the
       * built site with this flag set and collects every key the pages actually call —
       * including the template-literal keys (faq.items.3.q) a static scan cannot see.
       */
      if (typeof window !== 'undefined' && window.__LT_HARVEST) {
        (window.__LT_KEYS ||= {})[`${ns}.${key}`] = english;
      }
      let out = (content && content[`${ns}.${key}`]) ?? english;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) out = out.split(`{${k}}`).join(String(v));
      }
      return out;
    },
    [content, ns]
  );
}
