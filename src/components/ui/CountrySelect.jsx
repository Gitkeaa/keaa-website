import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
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
        className="mt-1.5 flex w-full items-center justify-between gap-2 rounded-md border border-navy-100 bg-white px-3.5 py-2.5 text-left text-sm outline-none transition-colors hover:border-navy-200 focus:border-primary"
      >
        <span className={value ? 'truncate text-navy-800' : 'text-ink/40'}>
          {value ? value.name : 'Select your country'}
        </span>
        <ChevronDown className={`h-4 w-4 flex-shrink-0 text-ink/40 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-black bg-white shadow-cardHover">
          <div className="relative border-b border-navy-100 p-2">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country or code…"
              className="w-full rounded-md border border-navy-100 bg-navy-50/40 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <ul role="listbox" className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="px-4 py-3 text-sm text-ink/50">No country found</li>
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
                    <span className="flex-1 truncate text-navy-800">{c.name}</span>
                    <span className="text-xs text-ink/45">{c.dial}</span>
                    {selected && <Check className="h-4 w-4 text-primary-darker" />}
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
