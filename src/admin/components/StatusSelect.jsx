/**
 * An inline status dropdown. On change it calls onChange(newValue) — the page then PATCHes
 * the backend and updates its local copy. `busy` disables it while the request is in flight.
 */
const label = (s) => String(s).replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export default function StatusSelect({ value, options, onChange, busy }) {
  return (
    <select
      value={value}
      disabled={busy}
      onChange={(e) => onChange(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      className="cursor-pointer rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium capitalize text-navy-700 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {label(o)}
        </option>
      ))}
    </select>
  );
}
