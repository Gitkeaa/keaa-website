import { useState } from 'react';
import { useLT } from '../../i18n/LocaleContext';

/*
 * Email input with domain auto-suggestions. The moment the user types the first
 * letter, it suggests the full address on common providers (Gmail first). While
 * typing the domain (after "@") the list narrows to matching providers. Click a
 * suggestion — or keep typing — to complete it.
 */
const DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'rediffmail.com'];

export default function EmailField({
  id = 'email',
  label,
  value,
  onChange,
  required = false,
  className = '',
}) {
  const lt = useLT('common');
  const [open, setOpen] = useState(false);

  const atIndex = value.indexOf('@');
  const local = atIndex === -1 ? value : value.slice(0, atIndex);
  const typedDomain = atIndex === -1 ? '' : value.slice(atIndex + 1).toLowerCase();

  const exactMatch = atIndex !== -1 && DOMAINS.includes(typedDomain);
  const matches = DOMAINS.filter((d) => d.startsWith(typedDomain));
  const suggestions =
    open && local.length >= 1 && !exactMatch ? matches.map((d) => `${local}@${d}`) : [];

  return (
    <div className={`relative ${className}`}>
      <label htmlFor={id} className="text-sm font-medium text-navy-800">
        {label ?? lt('emailField.label', 'Email Address')} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={id}
        type="email"
        required={required}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        autoComplete="email"
        placeholder={lt('emailField.placeholder', 'you@gmail.com')}
        className="mt-1.5 w-full rounded-card border border-navy-100 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary"
      />

      {suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-card border border-navy-100 bg-white py-1 shadow-cardHover">
          {suggestions.map((s) => (
            <li key={s}>
              <button
                type="button"
                // keep focus on the input so onBlur doesn't fire before the click
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(s);
                  setOpen(false);
                }}
                className="flex w-full items-center px-4 py-2 text-left text-sm text-navy-800 transition-colors hover:bg-navy-50"
              >
                <span className="text-muted">{local}@</span>
                <span className="font-medium">{s.slice(local.length + 1)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
