import { useEffect, useRef, useState } from 'react';
import { countriesData } from '../../data/countriesData';

/*
 * Accessible, searchable country picker. Type to filter by country name or
 * dialling code, click to select. Returns the full country object (with `dial`)
 * so the parent can auto-fill the phone STD/ISD code.
 */
export default function CountrySelect({ value, onChange, id = 'country', label = 'Country', required = false }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef = useRef(null);
  const searchRef = useRef(null);

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
  const filtered = q
    ? countriesData.filter(
        (c) => c.name.toLowerCase().includes(q) || c.dial.replace('+', '').includes(q.replace('+', '')),
      )
    : countriesData;

  const pick = (c) => {
    onChange?.(c);
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={wrapRef} className="relative">
      <label htmlFor={id} className="text-sm font-medium text-navy-800">
        {label} {required && <span className="text-red-500">*</span>}
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
          {value ? value.name : 'Select your country'}
        </span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-card border border-navy-100 bg-white shadow-cardHover">
          <div className="border-b border-navy-100 p-2">
            <label
              htmlFor={`${id}-search`}
              className="block px-1 pb-1.5 text-[13px] font-bold uppercase tracking-[0.12em] text-primary-darker"
            >
              Search
            </label>
            <input
              ref={searchRef}
              id={`${id}-search`}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country or code…"
              className="w-full rounded-card border border-navy-100 bg-navy-50/40 px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <ul role="listbox" className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="px-4 py-3 text-body-compact text-muted">No country found</li>
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
                    <span className={`flex-1 truncate text-navy-800 ${selected ? 'font-semibold' : ''}`}>{c.name}</span>
                    <span className="text-xs text-muted">{c.dial}</span>
                    {selected && (
                      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-darker">
                        Selected
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
