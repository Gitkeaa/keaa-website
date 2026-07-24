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
export const languages = [
  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧', region: 'Global' },
  { code: 'nl', label: 'Dutch', native: 'Nederlands', flag: '🇳🇱', region: 'Europe' },
  { code: 'de', label: 'German', native: 'Deutsch', flag: '🇩🇪', region: 'Europe' },
  { code: 'fr', label: 'French', native: 'Français', flag: '🇫🇷', region: 'Europe' },
  { code: 'es', label: 'Spanish', native: 'Español', flag: '🇪🇸', region: 'Europe' },
  { code: 'it', label: 'Italian', native: 'Italiano', flag: '🇮🇹', region: 'Europe' },
  { code: 'pt', label: 'Portuguese', native: 'Português', flag: '🇵🇹', region: 'Europe' },
  { code: 'pl', label: 'Polish', native: 'Polski', flag: '🇵🇱', region: 'Europe' },
  { code: 'ru', label: 'Russian', native: 'Русский', flag: '🇷🇺', region: 'Europe' },
  { code: 'tr', label: 'Turkish', native: 'Türkçe', flag: '🇹🇷', region: 'Middle East' },
  { code: 'ar', label: 'Arabic', native: 'العربية', flag: '🇸🇦', region: 'Middle East', rtl: true },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳', region: 'Asia' },
];

export const DEFAULT_LANGUAGE = 'en';

/** Language metadata by code, falling back to English for an unknown tag. */
export function getLanguage(code) {
  return languages.find((l) => l.code === code) || languages[0];
}
