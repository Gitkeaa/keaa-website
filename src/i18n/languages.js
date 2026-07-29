/**
 * The languages KEAA ships in the switcher — Europe's main trade languages plus the
 * markets the catalogue actually exports to (Middle East, Türkiye, India).
 *
 * `code` is a BCP-47 tag and is what lands in <html lang>, so it must stay valid — it
 * feeds screen readers, Google's language detection and hreflang if that is added later.
 *
 * `rtl` marks a script that reads right-to-left. Arabic is flagged but the document is NOT
 * flipped yet: this codebase styles with Tailwind's physical utilities (ml-*, pl-*, left-*),
 * which do not mirror under `dir="rtl"`, so flipping now would half-break every layout.
 * Arabic copy still renders correctly (browsers resolve bidi inside text nodes); turning on
 * true RTL is a separate layout pass — see RTL_LAYOUT_READY in LocaleContext.jsx.
 */
/**
 * `live` is the SEO gate, and the rule behind it is: a language gets a public footprint
 * only when its translation is COMPLETE and reviewed. While `live: false` the language
 * exists solely as a header choice that translates the chrome and shows a coming-soon
 * notice — no /de/ URLs, no hreflang, no sitemap entries, no prerender. Half-translated
 * pages on their own URLs would be duplicate content in Google's eyes and rank WORSE, so
 * flipping this flag early costs ranking rather than buying it.
 *
 * Flip a language live only after `node scripts/check-translations.mjs` reports it
 * complete and the legal/spec strings have had a human review.
 */
export const languages = [
  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧', region: 'Global', live: true },
  { code: 'nl', label: 'Dutch', native: 'Nederlands', flag: '🇳🇱', region: 'Europe', live: true },
  { code: 'de', label: 'German', native: 'Deutsch', flag: '🇩🇪', region: 'Europe', live: true },
  { code: 'fr', label: 'French', native: 'Français', flag: '🇫🇷', region: 'Europe', live: true },
  { code: 'es', label: 'Spanish', native: 'Español', flag: '🇪🇸', region: 'Europe', live: true },
  { code: 'it', label: 'Italian', native: 'Italiano', flag: '🇮🇹', region: 'Europe', live: true },
  { code: 'pt', label: 'Portuguese', native: 'Português', flag: '🇵🇹', region: 'Europe', live: true },
  { code: 'pl', label: 'Polish', native: 'Polski', flag: '🇵🇱', region: 'Europe', live: true },
  { code: 'ru', label: 'Russian', native: 'Русский', flag: '🇷🇺', region: 'Europe', live: true },
  { code: 'tr', label: 'Turkish', native: 'Türkçe', flag: '🇹🇷', region: 'Middle East', live: true },
  { code: 'ar', label: 'Arabic', native: 'العربية', flag: '🇸🇦', region: 'Middle East', rtl: true, live: true },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳', region: 'Asia', live: true },
];

export const DEFAULT_LANGUAGE = 'en';

/** Language metadata by code, falling back to English for an unknown tag. */
export function getLanguage(code) {
  return languages.find((l) => l.code === code) || languages[0];
}

/** Locales with their own URL prefix, hreflang and prerender — English excluded (it owns the bare URLs). */
export function liveLocales() {
  return languages.filter((l) => l.live && l.code !== DEFAULT_LANGUAGE).map((l) => l.code);
}

/** True when `code` is a live non-English locale, i.e. `/${code}/...` is a real URL space. */
export function isLiveLocale(code) {
  return code !== DEFAULT_LANGUAGE && languages.some((l) => l.code === code && l.live);
}

/**
 * The locale prefix of a pathname — '/de' for '/de/about' — or '' when the path lives in
 * the English URL space. Checked against the LIVE set only: '/xx/about' for a not-yet-live
 * code is a 404, not a locale page, and must not be treated as one.
 */
export function localePrefixOf(pathname) {
  const seg = String(pathname || '/').split('/')[1];
  return isLiveLocale(seg) ? `/${seg}` : '';
}

export const LANGUAGE_STORAGE_KEY = 'keaa.language';

/**
 * The language the visitor is currently reading in, resolvable WITHOUT the locale context:
 * URL prefix first, stored choice second, English last. For code that lives outside
 * <LocaleProvider> — the chat widget mounts beside the public tree, not inside it.
 */
export function visitorLanguage() {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  const fromUrl = localePrefixOf(window.location.pathname).slice(1);
  if (fromUrl) return fromUrl;
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && languages.some((l) => l.code === stored)) return stored;
  } catch {
    // Storage blocked: fall through to English.
  }
  return DEFAULT_LANGUAGE;
}
