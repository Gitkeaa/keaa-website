import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { countriesData } from '../../data/countriesData';
import { useLocale, useLT } from '../../i18n/LocaleContext';

/**
 * Country names in the reader's language, from the browser itself: Intl.DisplayNames knows
 * every ISO region in every locale, so no dictionary has to carry 250 country names per
 * language. Returns `(country) => name`. The English `name` in countriesData stays what the
 * forms SUBMIT (the sales team reads English) and what a browser without the API shows.
 */
export function useCountryName() {
  const { language } = useLocale();
  const displayNames = useMemo(() => {
    if (language === 'en' || typeof Intl === 'undefined' || !Intl.DisplayNames) return null;
    try {
      return new Intl.DisplayNames([language], { type: 'region' });
    } catch {
      return null;
    }
  }, [language]);
  return useCallback(
    (c) => {
      if (!c) return '';
      if (!displayNames) return c.name;
      try {
        return displayNames.of(c.iso) || c.name;
      } catch {
        return c.name;
      }
    },
    [displayNames]
  );
}

/*
 * Accessible, searchable country picker. Type to filter by country name or
 * dialling code, click to select. Returns the full country object (with `dial`)
 * so the parent can auto-fill the phone STD/ISD code.
 */
export default function CountrySelect({ value, onChange, id = 'country', label, required = false }) {
  const lt = useLT('common');
  const { language } = useLocale();
  const nameOf = useCountryName();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef = useRef(null);
  const searchRef = useRef(null);

  // The list is sorted by the names the reader sees, so a German reader finds "Indien"
  // under I rather than where "India" sits in the English order.
  const options = useMemo(
    () => (language === 'en' ? countriesData : [...countriesData].sort((a, b) => nameOf(a).localeCompare(nameOf(b), language))),
    [language, nameOf]
  );

  useEffect(() => {
    if (!open) return undefined;
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    // focus the search box when the panel opens
    setTimeout(() => searchRef.current?.focus(), 0);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const q = query.trim().toLowerCase();
  // Matches the English name too, so a buyer who types what their supplier calls the
  // country still finds it.
  const filtered = q
    ? options.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          nameOf(c).toLowerCase().includes(q) ||
          c.dial.replace('+', '').includes(q.replace('+', '')),
      )
    : options;

  const pick = (c) => {
    onChange?.(c);
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={wrapRef} className="relative">
      <label htmlFor={id} className="text-sm font-medium text-navy-800">
        {label ?? lt('countrySelect.label', 'Country')} {required && <span className="text-red-500">*</span>}
      </label>

      <button
        type="button"
        id={id}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="mt-1.5 flex w-full items-center justify-between gap-2 rounded-card border border-navy-100 bg-white px-3.5 py-2.5 text-left text-sm outline-none transition-colors hover:border-navy-200 focus:border-primary"
      >
        <span className={value ? 'truncate text-navy-800' : 'text-muted'}>
          {value ? nameOf(value) : lt('countrySelect.placeholder', 'Select your country')}
        </span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-card border border-navy-100 bg-white shadow-cardHover">
          <div className="border-b border-navy-100 p-2">
            <label
              htmlFor={`${id}-search`}
              className="block px-1 pb-1.5 text-[13px] font-bold uppercase tracking-[0.12em] text-primary-darker"
            >
              {lt('countrySelect.search', 'Search')}
            </label>
            <input
              ref={searchRef}
              id={`${id}-search`}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={lt('countrySelect.searchPlaceholder', 'Search country or code…')}
              className="w-full rounded-card border border-navy-100 bg-navy-50/40 px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <ul role="listbox" className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="px-4 py-3 text-body-compact text-muted">{lt('countrySelect.noResults', 'No country found')}</li>
            )}
            {filtered.map((c) => {
              const selected = value?.iso === c.iso;
              return (
                <li key={c.iso}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => pick(c)}
                    className={`flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm transition-colors hover:bg-navy-50 ${
                      selected ? 'bg-primary/[0.08]' : ''
                    }`}
                  >
                    <span className={`flex-1 truncate text-navy-800 ${selected ? 'font-semibold' : ''}`}>{nameOf(c)}</span>
                    <span className="text-xs text-muted">{c.dial}</span>
                    {selected && (
                      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-darker">
                        {lt('countrySelect.selected', 'Selected')}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
