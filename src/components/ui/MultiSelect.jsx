import { useEffect, useRef, useState } from 'react';

/**
 * A dropdown that lets the visitor pick MORE THAN ONE option — a checklist behind a select-
 * style trigger, with the chosen items shown as removable chips below it. Styled to match the
 * plain `<input>`/`<select>` fields around it (navy-100 border, rounded-card, primary focus).
 *
 * Controlled: `value` is an array of the selected option values; `onChange` receives the next
 * array. `options` is [{ value, label }].
 */
export default function MultiSelect({
  label,
  options = [],
  value = [],
  onChange,
  placeholder = 'Select…',
  required = false,
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = (v) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  const labelOf = (v) => options.find((o) => o.value === v)?.label || v;
  const summary =
    value.length === 0 ? placeholder : value.length === 1 ? labelOf(value[0]) : `${value.length} selected`;

  return (
    <div className={`relative ${className}`} ref={ref}>
      <span className="text-sm font-medium text-navy-800">
        {label} {required && <span className="text-red-500">*</span>}
      </span>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`mt-1.5 flex w-full items-center justify-between gap-2 rounded-card border px-3.5 py-2.5 text-left text-sm outline-none transition-colors ${
          open ? 'border-primary' : 'border-navy-100 hover:border-navy-300'
        }`}
      >
        <span className={value.length ? 'text-text' : 'text-muted'}>{summary}</span>
        <span aria-hidden className={`text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          &#9662;
        </span>
      </button>

      {value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {value.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 rounded-full bg-navy-50 px-2.5 py-1 text-xs font-medium text-text"
            >
              {labelOf(v)}
              <button
                type="button"
                onClick={() => toggle(v)}
                aria-label={`Remove ${labelOf(v)}`}
                className="text-muted transition-colors hover:text-text"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}

      {open && (
        <ul
          role="listbox"
          aria-multiselectable="true"
          className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-card border border-navy-100 bg-white py-1 shadow-lg"
        >
          {options.map((o) => {
            const sel = value.includes(o.value);
            return (
              <li key={o.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={sel}
                  onClick={() => toggle(o.value)}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm transition-colors hover:bg-navy-50"
                >
                  <span
                    aria-hidden
                    className={`flex h-4 w-4 flex-none items-center justify-center rounded border ${
                      sel ? 'border-primary bg-primary text-white' : 'border-navy-200'
                    }`}
                  >
                    {sel && (
                      <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2.5 6.5l2.5 2.5 4.5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span className="text-text">{o.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
