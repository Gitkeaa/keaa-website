/**
 * Sales regions and the KEAA office that actually serves each one.
 *
 * KEAA runs two real places of business (see `company` in ./company.js): the manufacturing
 * plant and export desk in Ludhiana, India, and Runi Industries B.V. — the group's sales
 * office and warehouse — in Eindhoven, the Netherlands. Europe is served out of Eindhoven;
 * every other market is served direct from Ludhiana.
 *
 * Contact details are READ FROM `company`, never retyped here, so a number changed in one
 * place changes everywhere. If a third office opens, add it to `offices` and point the
 * relevant regions at its key — no component needs editing.
 */
import { company } from './company';

export const offices = {
  europe: {
    key: 'europe',
    name: company.name,
    role: 'Sales Office & Warehouse, Europe',
    lines: [company.salesOffice.line1, company.salesOffice.line2],
    country: company.salesOffice.country,
    phones: [company.salesOffice.phone],
    emails: [],
  },
  hq: {
    key: 'hq',
    name: company.name,
    role: 'Head Office & Manufacturing, Global Export Desk',
    lines: [company.manufacturing.line1, company.manufacturing.line2],
    country: company.manufacturing.country,
    phones: company.phones,
    // The three sales addresses are a lot for a compact panel — the first is the
    // published general enquiry route, so the panel shows that one.
    emails: [company.emails[0]],
  },
};

/**
 * `match` is the ISO-3166 alpha-2 list used to auto-suggest a region from the visitor's
 * locale (see RegionSelector). It is deliberately partial — it only needs the markets
 * KEAA actually sells into, and anything unmatched falls back to the global desk.
 */
/**
 * `locales` is what the header's region picker drills into: the country/language pairs a
 * visitor actually chooses from, in the shape enterprise sites use ("Canada - French").
 * Picking one sets BOTH the sales region (which office answers) and the site language, so
 * the two settings can never contradict each other.
 *
 * `lang` must be a code that exists in src/i18n/languages.js. A country appears more than
 * once when it genuinely has more than one business language (Canada, UAE, India).
 */
export const regions = [
  {
    key: 'europe',
    label: 'Europe & UK',
    blurb: 'Served from our Eindhoven warehouse',
    office: 'europe',
    match: ['NL', 'BE', 'DE', 'FR', 'ES', 'IT', 'PT', 'PL', 'GB', 'IE', 'AT', 'CH', 'SE', 'NO', 'DK', 'FI', 'CZ', 'SK', 'HU', 'RO', 'BG', 'GR', 'HR', 'SI', 'LT', 'LV', 'EE', 'LU', 'RS', 'UA'],
    locales: [
      { country: 'United Kingdom', short: 'UK', code: 'GB', lang: 'en' },
      { country: 'Netherlands', code: 'NL', lang: 'nl' },
      { country: 'Germany', code: 'DE', lang: 'de' },
      { country: 'France', code: 'FR', lang: 'fr' },
      { country: 'Spain', code: 'ES', lang: 'es' },
      { country: 'Italy', code: 'IT', lang: 'it' },
      { country: 'Portugal', code: 'PT', lang: 'pt' },
      { country: 'Poland', code: 'PL', lang: 'pl' },
      { country: 'Russia', code: 'RU', lang: 'ru' },
    ],
  },
  {
    key: 'middle-east',
    label: 'Middle East',
    blurb: 'UAE, Saudi Arabia, Qatar, Oman & the Gulf',
    office: 'hq',
    match: ['AE', 'SA', 'QA', 'OM', 'KW', 'BH', 'JO', 'IQ', 'LB', 'TR', 'IL', 'YE'],
    locales: [
      { country: 'United Arab Emirates', short: 'UAE', code: 'AE', lang: 'en' },
      { country: 'United Arab Emirates', short: 'UAE', code: 'AE', lang: 'ar' },
      { country: 'Saudi Arabia', code: 'SA', lang: 'ar' },
      { country: 'Qatar', code: 'QA', lang: 'en' },
      { country: 'Oman', code: 'OM', lang: 'en' },
      { country: 'Türkiye', code: 'TR', lang: 'tr' },
    ],
  },
  {
    key: 'africa',
    label: 'Africa',
    blurb: 'North, West & East African markets',
    office: 'hq',
    match: ['EG', 'MA', 'DZ', 'TN', 'LY', 'NG', 'GH', 'KE', 'TZ', 'UG', 'ET', 'ZA', 'SN', 'CI'],
    locales: [
      { country: 'Egypt', code: 'EG', lang: 'ar' },
      { country: 'Morocco', code: 'MA', lang: 'fr' },
      { country: 'Nigeria', code: 'NG', lang: 'en' },
      { country: 'Kenya', code: 'KE', lang: 'en' },
      { country: 'South Africa', code: 'ZA', lang: 'en' },
    ],
  },
  {
    key: 'asia-pacific',
    label: 'Asia-Pacific',
    blurb: 'South-East Asia, Australia & the Far East',
    office: 'hq',
    match: ['SG', 'MY', 'ID', 'TH', 'VN', 'PH', 'AU', 'NZ', 'JP', 'KR', 'CN', 'HK', 'TW', 'BD', 'LK', 'NP'],
    locales: [
      { country: 'Singapore', code: 'SG', lang: 'en' },
      { country: 'Malaysia', code: 'MY', lang: 'en' },
      { country: 'Australia', code: 'AU', lang: 'en' },
      { country: 'Japan', code: 'JP', lang: 'en' },
      { country: 'Vietnam', code: 'VN', lang: 'en' },
    ],
  },
  {
    key: 'americas',
    label: 'Americas',
    blurb: 'North, Central & South America',
    office: 'hq',
    match: ['US', 'CA', 'MX', 'BR', 'AR', 'CL', 'CO', 'PE', 'PA', 'CR'],
    locales: [
      { country: 'United States', short: 'USA', code: 'US', lang: 'en' },
      { country: 'Canada', code: 'CA', lang: 'en' },
      { country: 'Canada', code: 'CA', lang: 'fr' },
      { country: 'Mexico', code: 'MX', lang: 'es' },
      { country: 'Brazil', code: 'BR', lang: 'pt' },
    ],
  },
  {
    key: 'india',
    label: 'India',
    blurb: 'Domestic sales & factory pickup',
    office: 'hq',
    match: ['IN'],
    locales: [
      { country: 'India', code: 'IN', lang: 'en' },
      { country: 'India', code: 'IN', lang: 'hi' },
    ],
  },
];

/** Stable identity for a country/language row — a country can appear twice per region. */
export const localeId = (regionKey, entry) => `${regionKey}:${entry.code}:${entry.lang}`;

/** Look a row back up from its id, so a stored choice can be restored on reload. */
export function findLocaleById(id) {
  for (const r of regions) {
    for (const e of r.locales || []) {
      if (localeId(r.key, e) === id) return { region: r, entry: e };
    }
  }
  return null;
}

export const DEFAULT_REGION = 'europe';

export function getRegion(key) {
  return regions.find((r) => r.key === key) || regions.find((r) => r.key === DEFAULT_REGION);
}

/** The office serving a region key. */
export function getOfficeForRegion(key) {
  return offices[getRegion(key).office];
}

/**
 * Best-guess region from a BCP-47 locale such as `en-AE` or `nl-NL`. Returns null when the
 * locale carries no country subtag or names a country KEAA has no region for — the caller
 * then leaves the choice to the visitor rather than guessing wrong.
 */
export function regionFromLocale(locale) {
  const parts = String(locale || '').split('-');
  const country = parts.length > 1 ? parts[parts.length - 1].toUpperCase() : null;
  if (!country || country.length !== 2) return null;
  const hit = regions.find((r) => r.match.includes(country));
  return hit ? hit.key : null;
}
