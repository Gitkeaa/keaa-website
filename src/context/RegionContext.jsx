import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  DEFAULT_REGION,
  findLocaleById,
  getOfficeForRegion,
  getRegion,
  localeId,
  regionFromLocale,
  regions,
} from '../data/regions';

const STORAGE_KEY = 'keaa.locale';

const RegionContext = createContext(null);

/**
 * The visitor's market — one setting covering BOTH which sales region serves them and
 * which country/language row they picked in the header.
 *
 * It lives in context rather than component state because three surfaces read it: the
 * header picker, the mobile drawer, and the RFQ form (which routes an enquiry to the
 * office that owns the region).
 *
 * `confirmed` distinguishes a GUESS from a CHOICE. On a first visit the region is inferred
 * from the browser locale — right often enough to be useful, wrong often enough that the UI
 * must not present it as settled. Only a real pick is written to storage.
 */
export function RegionProvider({ children }) {
  const [state, setState] = useState(() => {
    if (typeof window === 'undefined') return { id: null, region: DEFAULT_REGION, confirmed: false };

    let stored = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      stored = null;
    }
    const hit = stored && findLocaleById(stored);
    if (hit) return { id: stored, region: hit.region.key, confirmed: true };

    // No stored choice — infer the region from the browser's country subtag. No `id` is
    // set, so the picker shows a region without claiming a specific country was chosen.
    const navLangs = window.navigator.languages || [window.navigator.language];
    for (const tag of navLangs) {
      const guess = regionFromLocale(tag);
      if (guess) return { id: null, region: guess, confirmed: false };
    }
    return { id: null, region: DEFAULT_REGION, confirmed: false };
  });

  /**
   * Pick a country/language row. `entry` comes straight from a region's `locales` array.
   * Returns the language code so the caller can hand it to the locale provider — the two
   * providers stay independent, and this is the one place they are coordinated.
   */
  const setLocaleChoice = useCallback((regionKey, entry) => {
    if (!regions.some((r) => r.key === regionKey)) return null;
    const id = localeId(regionKey, entry);
    setState({ id, region: regionKey, confirmed: true });
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // Storage unavailable — the choice still holds for this session.
    }
    return entry.lang;
  }, []);

  /** Region-only change, for surfaces that do not offer a country (e.g. a bare fallback). */
  const setRegion = useCallback((key) => {
    if (!regions.some((r) => r.key === key)) return;
    setState((s) => ({ ...s, region: key, id: null, confirmed: true }));
  }, []);

  const value = useMemo(() => {
    const hit = state.id ? findLocaleById(state.id) : null;
    return {
      region: state.region,
      confirmed: state.confirmed,
      /** The chosen country/language row, or null while the region is only a guess. */
      entry: hit ? hit.entry : null,
      localeId: state.id,
      setLocaleChoice,
      setRegion,
      regions,
      meta: getRegion(state.region),
      office: getOfficeForRegion(state.region),
    };
  }, [state, setLocaleChoice, setRegion]);

  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
}

export function useRegion() {
  const ctx = useContext(RegionContext);
  if (!ctx) throw new Error('useRegion must be used inside <RegionProvider>');
  return ctx;
}
